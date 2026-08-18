const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/staff — CMS 1, gestion des comptes (ADMIN)
const list = asyncHandler(async (req, res) => {
  const staff = await prisma.staff.findMany({
    orderBy: [{ role: 'asc' }, { nom: 'asc' }],
    select: { id: true, nom: true, prenom: true, email: true, telephone: true, role: true, service: true, isActive: true, lastActiveAt: true, createdAt: true },
  });
  res.json({ staff });
});

// POST /api/staff — création d'un compte rédaction/régie/admin
const create = asyncHandler(async (req, res) => {
  const { nom, prenom, email, motDePasse, role, service, telephone } = req.body;
  if (!nom || !prenom || !email || !motDePasse || !role) {
    return res.status(422).json({ error: 'Nom, prénom, email, mot de passe et rôle sont requis.' });
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  const staff = await prisma.staff.create({
    data: { nom, prenom, email, motDePasseHash, role, service, telephone },
    select: { id: true, nom: true, prenom: true, email: true, telephone: true, role: true, service: true, isActive: true, createdAt: true },
  });
  res.status(201).json({ staff });
});

// PATCH /api/staff/:id — modification (rôle, service, activation, mot de passe)
const update = asyncHandler(async (req, res) => {
  const { nom, prenom, role, service, telephone, isActive, motDePasse } = req.body;

  const staff = await prisma.staff.update({
    where: { id: req.params.id },
    data: {
      nom,
      prenom,
      role,
      service,
      telephone,
      isActive,
      ...(motDePasse ? { motDePasseHash: await bcrypt.hash(motDePasse, 10) } : {}),
    },
    select: { id: true, nom: true, prenom: true, email: true, telephone: true, role: true, service: true, isActive: true, createdAt: true },
  });
  res.json({ staff });
});

module.exports = { list, create, update };
