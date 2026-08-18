const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/stats — vue consolidée CMS 1 : abonnements + paiements à
// l'article + régie publicitaire, cf. cahier des charges §2.1.
const stats = asyncHandler(async (req, res) => {
  const [
    abonnementsActifs,
    revenuAbonnements,
    paiementsArticleReussis,
    revenuPaiementsArticle,
    lecteursTotal,
    campagnesActives,
    budgetCampagnesActives,
    facturesImpayees,
    articlesPublies,
    staffActif,
  ] = await Promise.all([
    prisma.abonnement.count({ where: { statut: 'ACTIF', dateFin: { gte: new Date() } } }),
    prisma.transaction.aggregate({ where: { type: 'ABONNEMENT', statut: 'REUSSI' }, _sum: { montant: true } }),
    prisma.transaction.count({ where: { type: 'PAIEMENT_ARTICLE', statut: 'REUSSI' } }),
    prisma.transaction.aggregate({ where: { type: 'PAIEMENT_ARTICLE', statut: 'REUSSI' }, _sum: { montant: true } }),
    prisma.reader.count(),
    prisma.campagnePub.count({ where: { statut: 'ACTIVE' } }),
    prisma.campagnePub.aggregate({ where: { statut: 'ACTIVE' }, _sum: { budget: true } }),
    prisma.factureCampagne.count({ where: { statut: { in: ['EMISE', 'EN_RETARD'] } } }),
    prisma.article.count({ where: { statut: 'PUBLIE' } }),
    prisma.staff.count({ where: { isActive: true } }),
  ]);

  res.json({
    lecteurs: { total: lecteursTotal },
    abonnements: {
      actifs: abonnementsActifs,
      revenuTotal: revenuAbonnements._sum.montant || 0,
    },
    paiementsArticle: {
      total: paiementsArticleReussis,
      revenuTotal: revenuPaiementsArticle._sum.montant || 0,
    },
    regie: {
      campagnesActives,
      budgetEngage: budgetCampagnesActives._sum.budget || 0,
      facturesImpayees,
    },
    redaction: {
      articlesPublies,
      staffActif,
    },
  });
});

module.exports = { stats };
