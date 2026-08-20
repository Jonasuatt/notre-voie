const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/campagnes — CMS 1 Régie, vue consolidée
const list = asyncHandler(async (req, res) => {
  const { statut, annonceurId } = req.query;
  const campagnes = await prisma.campagnePub.findMany({
    where: { ...(statut ? { statut } : {}), ...(annonceurId ? { annonceurId } : {}) },
    orderBy: { createdAt: 'desc' },
    include: { annonceur: true, rubriquesCiblees: true, factures: true },
  });
  res.json({ campagnes });
});

// POST /api/campagnes — création d'une campagne (ciblage rubrique/région/format)
const create = asyncHandler(async (req, res) => {
  const { nom, formatPub, annonceurId, rubriqueIds, regionsCiblees, dateDebut, dateFin, budget, titre, imageUrl, lienUrl, texteCTA } = req.body;
  if (!nom || !formatPub || !annonceurId || !dateDebut || !dateFin || !budget) {
    return res.status(422).json({ error: 'Champs requis manquants pour créer la campagne.' });
  }

  const campagne = await prisma.campagnePub.create({
    data: {
      nom,
      formatPub,
      annonceurId,
      regionsCiblees: regionsCiblees || [],
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      budget: Number(budget),
      gereParId: req.staff.id,
      titre: titre || null,
      imageUrl: imageUrl || null,
      lienUrl: lienUrl || null,
      ...(texteCTA ? { texteCTA } : {}),
      ...(rubriqueIds && rubriqueIds.length ? { rubriquesCiblees: { connect: rubriqueIds.map((id) => ({ id })) } } : {}),
    },
    include: { annonceur: true, rubriquesCiblees: true },
  });

  res.status(201).json({ campagne });
});

// GET /api/campagnes/actives — public, sans authentification. Consommé par
// le site/l'app pour afficher un encart natif. `?rubrique=slug` restreint
// aux campagnes ciblant cette rubrique (ou sans ciblage, donc diffusées
// partout) ; `?format=NATIVE_CARTE|BANNIERE|TICKER_SPONSOR` filtre le format.
const listActivesPubliques = asyncHandler(async (req, res) => {
  const { rubrique, format } = req.query;
  const maintenant = new Date();
  const campagnes = await prisma.campagnePub.findMany({
    where: {
      statut: 'ACTIVE',
      dateDebut: { lte: maintenant },
      dateFin: { gte: maintenant },
      ...(format ? { formatPub: format } : {}),
      ...(rubrique ? { OR: [{ rubriquesCiblees: { none: {} } }, { rubriquesCiblees: { some: { slug: rubrique } } }] } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true, formatPub: true, titre: true, imageUrl: true, lienUrl: true, texteCTA: true,
      annonceur: { select: { nom: true } },
    },
  });
  res.json({ campagnes });
});

// GET /api/campagnes/:id — détail complet (fiche campagne)
const getOne = asyncHandler(async (req, res) => {
  const campagne = await prisma.campagnePub.findUnique({
    where: { id: req.params.id },
    include: { annonceur: true, rubriquesCiblees: true, factures: { orderBy: { dateEmission: 'desc' } }, gerePar: { select: { id: true, nom: true, prenom: true } } },
  });
  if (!campagne) return res.status(404).json({ error: 'Campagne introuvable.' });
  res.json({ campagne });
});

// PATCH /api/campagnes/:id/statut — activer/mettre en pause/terminer
const changerStatut = asyncHandler(async (req, res) => {
  const { statut } = req.body;
  const campagne = await prisma.campagnePub.update({ where: { id: req.params.id }, data: { statut } });
  res.json({ campagne });
});

// POST /api/campagnes/:id/impression — incrément atomique, appelé à chaque affichage du format natif
const enregistrerImpression = asyncHandler(async (req, res) => {
  await prisma.campagnePub.update({ where: { id: req.params.id }, data: { impressions: { increment: 1 } } });
  res.status(204).end();
});

// POST /api/campagnes/:id/clic
const enregistrerClic = asyncHandler(async (req, res) => {
  await prisma.campagnePub.update({ where: { id: req.params.id }, data: { clics: { increment: 1 } } });
  res.status(204).end();
});

// POST /api/campagnes/:id/factures — facturation depuis le CMS 1
const facturer = asyncHandler(async (req, res) => {
  const { montant, dateEcheance } = req.body;
  const facture = await prisma.factureCampagne.create({
    data: { campagneId: req.params.id, montant: Number(montant), dateEcheance: new Date(dateEcheance) },
  });
  res.status(201).json({ facture });
});

// PATCH /api/campagnes/:campagneId/factures/:factureId — marquer une facture payée/en retard/annulée
const changerStatutFacture = asyncHandler(async (req, res) => {
  const { statut } = req.body;
  const facture = await prisma.factureCampagne.update({ where: { id: req.params.factureId }, data: { statut } });
  res.json({ facture });
});

// POST /api/annonceurs
const creerAnnonceur = asyncHandler(async (req, res) => {
  const { nom, contact, email, telephone } = req.body;
  const annonceur = await prisma.annonceur.create({ data: { nom, contact, email, telephone } });
  res.status(201).json({ annonceur });
});

// GET /api/annonceurs
const listAnnonceurs = asyncHandler(async (req, res) => {
  const annonceurs = await prisma.annonceur.findMany({ orderBy: { nom: 'asc' } });
  res.json({ annonceurs });
});

module.exports = {
  list,
  getOne,
  create,
  listActivesPubliques,
  changerStatut,
  enregistrerImpression,
  enregistrerClic,
  facturer,
  changerStatutFacture,
  creerAnnonceur,
  listAnnonceurs,
};
