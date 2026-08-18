const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/prix-vie-chere — dernier relevé par produit (alimente le ticker de l'accueil)
const ticker = asyncHandler(async (req, res) => {
  const releves = await prisma.prixVieChere.findMany({
    orderBy: { dateReleve: 'desc' },
    take: 200,
  });

  // On ne garde que le relevé le plus récent par produit, dans l'ordre
  // d'apparition (le plus récent en tête grâce au tri ci-dessus).
  const dernierParProduit = new Map();
  for (const releve of releves) {
    if (!dernierParProduit.has(releve.produit)) dernierParProduit.set(releve.produit, releve);
  }

  res.json({ prix: Array.from(dernierParProduit.values()) });
});

// POST /api/prix-vie-chere — nouveau relevé (CMS 2, rubrique Vie chère)
const create = asyncHandler(async (req, res) => {
  const { produit, unite, prix, variationPct } = req.body;
  if (!produit || !unite || prix === undefined) {
    return res.status(422).json({ error: 'Produit, unité et prix sont requis.' });
  }
  const releve = await prisma.prixVieChere.create({
    data: { produit, unite, prix: Number(prix), variationPct: variationPct !== undefined ? Number(variationPct) : undefined },
  });
  res.status(201).json({ releve });
});

module.exports = { ticker, create };
