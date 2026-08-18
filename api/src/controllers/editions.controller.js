const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/editions — kiosque numérique (public)
const list = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  const take = Math.min(Number(pageSize) || 20, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [editions, total] = await Promise.all([
    prisma.edition.findMany({ orderBy: { dateParution: 'desc' }, take, skip }),
    prisma.edition.count(),
  ]);
  res.json({ editions, total, page: Number(page), pageSize: take });
});

// POST /api/editions — CMS 2, mise en ligne du PDF de l'édition papier
const create = asyncHandler(async (req, res) => {
  const { numero, dateParution, pdfUrl, couvertureUrl, prix } = req.body;
  if (!numero || !dateParution || !pdfUrl) {
    return res.status(422).json({ error: 'Numéro, date de parution et PDF sont requis.' });
  }
  const edition = await prisma.edition.create({
    data: { numero: Number(numero), dateParution: new Date(dateParution), pdfUrl, couvertureUrl, prix: prix ? Number(prix) : undefined },
  });
  res.status(201).json({ edition });
});

module.exports = { list, create };
