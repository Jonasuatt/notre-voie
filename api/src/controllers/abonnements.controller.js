const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

const PRIX = { MENSUEL: 2000, ANNUEL: 18000 }; // FCFA — indicatif, à valider avec la Régie

function dateFinPour(type, depuis = new Date()) {
  const dateFin = new Date(depuis);
  if (type === 'ANNUEL') dateFin.setFullYear(dateFin.getFullYear() + 1);
  else dateFin.setMonth(dateFin.getMonth() + 1);
  return dateFin;
}

// GET /api/abonnements/moi — statut d'abonnement du lecteur connecté
const monAbonnement = asyncHandler(async (req, res) => {
  const abonnement = await prisma.abonnement.findFirst({
    where: { readerId: req.reader.id, statut: 'ACTIF', dateFin: { gte: new Date() } },
    orderBy: { dateFin: 'desc' },
  });
  res.json({ abonnement });
});

// POST /api/abonnements — souscription (crée l'abonnement + la transaction associée)
// L'intégration mobile money/carte réelle (Orange Money en priorité, cf.
// cahier des charges §5) se branche ici : ce endpoint initie la transaction
// en statut EN_ATTENTE, le webhook du fournisseur de paiement la fait
// ensuite basculer à REUSSI via confirmerTransaction.
const souscrire = asyncHandler(async (req, res) => {
  const { type, moyenPaiement } = req.body;
  if (!['MENSUEL', 'ANNUEL'].includes(type)) return res.status(422).json({ error: 'Type d\'abonnement invalide.' });

  const abonnement = await prisma.abonnement.create({
    data: {
      readerId: req.reader.id,
      type,
      prix: PRIX[type],
      dateFin: dateFinPour(type),
      statut: 'IMPAYE',
    },
  });

  const transaction = await prisma.transaction.create({
    data: {
      readerId: req.reader.id,
      type: 'ABONNEMENT',
      montant: PRIX[type],
      moyenPaiement,
      abonnementId: abonnement.id,
      statut: 'EN_ATTENTE',
    },
  });

  res.status(201).json({ abonnement, transaction });
});

// POST /api/paiements/article — paiement à l'unité pour un article payant
const payerArticle = asyncHandler(async (req, res) => {
  const { articleId, moyenPaiement, montant } = req.body;
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });

  const transaction = await prisma.transaction.create({
    data: {
      readerId: req.reader.id,
      type: 'PAIEMENT_ARTICLE',
      montant: Number(montant) || 200, // micro-paiement indicatif — à valider avec la Régie
      moyenPaiement,
      articleId: article.id,
      statut: 'EN_ATTENTE',
    },
  });

  res.status(201).json({ transaction });
});

// POST /api/transactions/:id/confirmer — appelé par le webhook du fournisseur de paiement
const confirmerTransaction = asyncHandler(async (req, res) => {
  const { statut, referenceExterne } = req.body; // statut attendu : REUSSI | ECHEC
  const transaction = await prisma.transaction.update({
    where: { id: req.params.id },
    data: { statut, referenceExterne },
  });

  if (transaction.statut === 'REUSSI' && transaction.abonnementId) {
    await prisma.abonnement.update({ where: { id: transaction.abonnementId }, data: { statut: 'ACTIF' } });
  }

  res.json({ transaction });
});

module.exports = { monAbonnement, souscrire, payerArticle, confirmerTransaction };
