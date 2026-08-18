const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { signStaffToken, signReaderToken } = require('../utils/jwt');

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array()[0].msg);
    err.status = 422;
    throw err;
  }
}

const staffLoginValidators = [
  body('email').isEmail().withMessage('Email invalide.'),
  body('motDePasse').isLength({ min: 1 }).withMessage('Mot de passe requis.'),
];

// POST /api/auth/staff/login — CMS 1 & CMS 2
const staffLogin = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { email, motDePasse } = req.body;

  const staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff || !staff.isActive) return res.status(401).json({ error: 'Identifiants incorrects.' });

  const valid = await bcrypt.compare(motDePasse, staff.motDePasseHash);
  if (!valid) return res.status(401).json({ error: 'Identifiants incorrects.' });

  await prisma.staff.update({ where: { id: staff.id }, data: { lastActiveAt: new Date() } });

  const token = signStaffToken(staff);
  const { motDePasseHash, ...safeStaff } = staff;
  res.json({ token, staff: safeStaff });
});

// GET /api/auth/staff/me
const staffMe = asyncHandler(async (req, res) => {
  const { motDePasseHash, ...safeStaff } = req.staff;
  res.json({ staff: safeStaff });
});

const readerRegisterValidators = [
  body('telephone').optional({ nullable: true }).isString(),
  body('email').optional({ nullable: true }).isEmail().withMessage('Email invalide.'),
  body('motDePasse').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
];

// POST /api/auth/reader/register — inscription grand public (email ou téléphone)
const readerRegister = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { nom, prenom, email, telephone, motDePasse, region } = req.body;

  if (!email && !telephone) {
    return res.status(422).json({ error: 'Email ou téléphone requis.' });
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  const reader = await prisma.reader.create({
    data: { nom, prenom, email, telephone, motDePasseHash, region },
  });

  const token = signReaderToken(reader);
  const { motDePasseHash: _omit, ...safeReader } = reader;
  res.status(201).json({ token, reader: safeReader });
});

// POST /api/auth/reader/login
const readerLogin = asyncHandler(async (req, res) => {
  const { identifiant, motDePasse } = req.body; // identifiant = email OU téléphone
  if (!identifiant || !motDePasse) {
    return res.status(422).json({ error: 'Identifiant et mot de passe requis.' });
  }

  const reader = await prisma.reader.findFirst({
    where: { OR: [{ email: identifiant }, { telephone: identifiant }] },
  });
  if (!reader || !reader.motDePasseHash || !reader.isActive) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  const valid = await bcrypt.compare(motDePasse, reader.motDePasseHash);
  if (!valid) return res.status(401).json({ error: 'Identifiants incorrects.' });

  await prisma.reader.update({ where: { id: reader.id }, data: { lastActiveAt: new Date() } });

  const token = signReaderToken(reader);
  const { motDePasseHash, ...safeReader } = reader;
  res.json({ token, reader: safeReader });
});

// GET /api/auth/reader/me
const readerMe = asyncHandler(async (req, res) => {
  const { motDePasseHash, ...safeReader } = req.reader;
  res.json({ reader: safeReader });
});

// PATCH /api/auth/reader/me — enregistrement du token push (app mobile) et
// préférences de notification (fil quotidien / fil flash).
const readerUpdateMe = asyncHandler(async (req, res) => {
  const { pushToken, notifQuotidien, notifFlash, region, nom, prenom } = req.body;
  const reader = await prisma.reader.update({
    where: { id: req.reader.id },
    data: { pushToken, notifQuotidien, notifFlash, region, nom, prenom },
  });
  const { motDePasseHash, ...safeReader } = reader;
  res.json({ reader: safeReader });
});

module.exports = {
  staffLoginValidators,
  staffLogin,
  staffMe,
  readerRegisterValidators,
  readerRegister,
  readerLogin,
  readerMe,
  readerUpdateMe,
};
