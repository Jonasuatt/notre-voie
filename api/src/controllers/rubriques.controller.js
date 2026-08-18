const slugify = require('slugify');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/rubriques — liste publique (utilisée par les tabs de la maquette)
const list = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const rubriques = await prisma.rubrique.findMany({
    where: { actif: true, ...(type ? { type } : {}) },
    orderBy: { ordre: 'asc' },
  });
  res.json({ rubriques });
});

// POST /api/rubriques — CMS 1, création (rare, catalogue quasi figé)
const create = asyncHandler(async (req, res) => {
  const { nom, type, angleEditorial, ordre, couleur } = req.body;
  const rubrique = await prisma.rubrique.create({
    data: { nom, slug: slugify(nom, { lower: true, strict: true }), type, angleEditorial, ordre, couleur },
  });
  res.status(201).json({ rubrique });
});

// PATCH /api/rubriques/:id
const update = asyncHandler(async (req, res) => {
  const { nom, angleEditorial, ordre, couleur, actif } = req.body;
  const rubrique = await prisma.rubrique.update({
    where: { id: req.params.id },
    data: {
      ...(nom ? { nom, slug: slugify(nom, { lower: true, strict: true }) } : {}),
      angleEditorial,
      ordre,
      couleur,
      actif,
    },
  });
  res.json({ rubrique });
});

module.exports = { list, create, update };
