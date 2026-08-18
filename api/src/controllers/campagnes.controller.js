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
  const { nom, formatPub, annonceurId, rubriqueIds, regionsCiblees, dateDebut, dateFin, budget } = req.body;
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
      ...(rubriqueIds && rubriqueIds.length ? { rubriquesCiblees: { connect: rubriqueIds.map((id) => ({ id })) } } : {}),
    },
    include: { annonceur: true, rubriquesCiblees: true },
  });

  res.status(201).json({ campagne });
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
  changerStatut,
  enregistrerImpression,
  enregistrerClic,
  facturer,
  changerStatutFacture,
  creerAnnonceur,
  listAnnonceurs,
};
