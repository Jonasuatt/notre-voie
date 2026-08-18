const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/verite-ou-intox — flux public de la rubrique Vérité ou Intox (mise en avant accueil)
const list = asyncHandler(async (req, res) => {
  const factChecks = await prisma.factCheck.findMany({
    where: { article: { statut: 'PUBLIE' } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { article: { include: { medias: true } } },
  });
  res.json({ factChecks });
});

// POST /api/articles/:articleId/fact-check — attache le détail fact-check à un article VERITE_OU_INTOX
const create = asyncHandler(async (req, res) => {
  const article = await prisma.article.findUnique({ where: { id: req.params.articleId } });
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });
  if (article.format !== 'VERITE_OU_INTOX') {
    return res.status(409).json({ error: 'Le fact-check ne s\'applique qu\'au format Vérité ou Intox.' });
  }

  const { verdict, rumeurOrigine, sourceRumeur, preuves } = req.body;
  if (!verdict) return res.status(422).json({ error: 'Verdict requis.' });

  const factCheck = await prisma.factCheck.upsert({
    where: { articleId: article.id },
    create: { articleId: article.id, verdict, rumeurOrigine, sourceRumeur, preuves, realiseParId: req.staff.id },
    update: { verdict, rumeurOrigine, sourceRumeur, preuves },
  });

  res.status(201).json({ factCheck });
});

module.exports = { list, create };
