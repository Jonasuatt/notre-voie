const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// Grille tarifaire de la régie et simulateur de devis.
//
// Le calcul est fait ici et non dans le CMS : c'est le prix que la régie
// annonce à un annonceur, il ne peut pas dépendre de la version de l'écran
// ouverte dans le navigateur du commercial.

// GET /api/tarifs — grille complète, calibres et options.
const lister = asyncHandler(async (req, res) => {
  const [tarifs, options] = await Promise.all([
    prisma.tarifPublicitaire.findMany({ where: { actif: true }, orderBy: { ordre: 'asc' } }),
    prisma.optionTarifaire.findMany({ where: { actif: true }, orderBy: { ordre: 'asc' } }),
  ]);
  res.json({ tarifs, options });
});

// POST /api/tarifs/devis — { code, options: [codes], publiReportage, quantite }
//
// Les majorations en pourcentage portent toutes sur le montant hors taxes de
// départ, jamais en cascade : c'est la lecture du tarif papier (« +50 % MHT »),
// et l'ordre dans lequel le commercial coche les options ne change donc rien
// au total.
const devis = asyncHandler(async (req, res) => {
  const { code, options = [], publiReportage = false, quantite = 1 } = req.body;
  if (!code) return res.status(422).json({ error: 'Calibre manquant.' });

  const tarif = await prisma.tarifPublicitaire.findUnique({ where: { code } });
  if (!tarif) return res.status(404).json({ error: 'Calibre inconnu.' });

  if (publiReportage && !tarif.tarifPubliReportageHT) {
    return res.status(422).json({
      error: `Le calibre ${tarif.code} n'a pas de tarif publi-reportage. Calibres concernés : C60, C62, C41, C32.`,
    });
  }

  const base = (publiReportage ? tarif.tarifPubliReportageHT : tarif.tarifHT) * Math.max(Number(quantite) || 1, 1);

  const retenues = options.length
    ? await prisma.optionTarifaire.findMany({ where: { code: { in: options }, actif: true } })
    : [];

  const lignes = retenues.map((o) => {
    const signe = o.type === 'REMISE' ? -1 : 1;
    const montant = o.estForfait ? signe * o.valeur : Math.round((signe * base * o.valeur) / 100);
    return {
      code: o.code,
      libelle: o.libelle,
      type: o.type,
      detail: o.estForfait ? `${o.valeur.toLocaleString('fr-FR')} F` : `${signe < 0 ? '-' : '+'}${o.valeur} %`,
      montant,
    };
  });

  const totalHT = lignes.reduce((somme, l) => somme + l.montant, base);

  res.json({
    calibre: {
      code: tarif.code,
      libelle: tarif.libelle,
      dimensions: tarif.largeurMm ? `${tarif.largeurMm} × ${tarif.hauteurMm} mm` : null,
      support: tarif.support,
    },
    publiReportage,
    quantite: Math.max(Number(quantite) || 1, 1),
    base,
    lignes,
    totalHT: Math.max(totalHT, 0),
  });
});

// POST /api/tarifs — création ou mise à jour d'une ligne de grille (régie).
const enregistrer = asyncHandler(async (req, res) => {
  const { code, libelle, support, largeurMm, hauteurMm, tarifHT, tarifPubliReportageHT, actif } = req.body;
  if (!code || tarifHT == null) return res.status(422).json({ error: 'Code et tarif hors taxes requis.' });

  const donnees = {
    libelle: libelle || null,
    support: support || 'PRESSE',
    largeurMm: largeurMm ? Number(largeurMm) : null,
    hauteurMm: hauteurMm ? Number(hauteurMm) : null,
    tarifHT: Number(tarifHT),
    tarifPubliReportageHT: tarifPubliReportageHT ? Number(tarifPubliReportageHT) : null,
    ...(actif !== undefined ? { actif: Boolean(actif) } : {}),
  };

  const tarif = await prisma.tarifPublicitaire.upsert({
    where: { code },
    update: donnees,
    create: { code, ...donnees },
  });
  res.json({ tarif });
});

// PATCH /api/tarifs/options/:id — ajuster un taux sans toucher au code.
const majOption = asyncHandler(async (req, res) => {
  const { valeur, actif, note } = req.body;
  const option = await prisma.optionTarifaire.update({
    where: { id: req.params.id },
    data: {
      ...(valeur !== undefined ? { valeur: Number(valeur) } : {}),
      ...(actif !== undefined ? { actif: Boolean(actif) } : {}),
      ...(note !== undefined ? { note } : {}),
    },
  });
  res.json({ option });
});

module.exports = { lister, devis, enregistrer, majOption };
