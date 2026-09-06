const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// Codes de lecture — la clé remise par mail à un abonné, qui ouvre tous les
// articles payants pendant sa durée de validité. Même principe que le code
// déjà en place pour télécharger un PDF du kiosque, étendu à la lecture du
// site : pas de compte à créer côté lecteur, ce qui lève l'obstacle
// principal à l'abonnement dans le contexte ivoirien (paiement mobile,
// lecture partagée).

// POST /api/codes-lecture/verifier — appelé par le site quand le lecteur
// saisit son code. Ne renvoie jamais autre chose qu'un verdict : ni la liste
// des codes, ni leur libellé commercial.
const verifier = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) return res.status(422).json({ error: 'Code manquant.' });

  const trouve = await prisma.codeLecture.findUnique({ where: { code } });
  if (!trouve || !trouve.actif) {
    return res.status(404).json({ valide: false, error: "Ce code n'est pas reconnu." });
  }
  if (trouve.expireLe < new Date()) {
    return res.status(410).json({ valide: false, expireLe: trouve.expireLe, error: 'Ce code a expiré.' });
  }
  res.json({ valide: true, code: trouve.code, expireLe: trouve.expireLe });
});

// GET /api/codes-lecture — suivi régie : quels codes courent, leur échéance
// et leur usage.
const lister = asyncHandler(async (req, res) => {
  const codes = await prisma.codeLecture.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ codes });
});

// POST /api/codes-lecture — création d'un code par la régie.
const creer = asyncHandler(async (req, res) => {
  const { code, libelle, expireLe } = req.body;
  if (!code || !expireLe) return res.status(422).json({ error: 'Code et date d\'expiration requis.' });
  const cree = await prisma.codeLecture.create({
    data: { code: String(code).trim().toUpperCase(), libelle: libelle || null, expireLe: new Date(expireLe) },
  });
  res.status(201).json({ code: cree });
});

// PATCH /api/codes-lecture/:id — révoquer ou prolonger.
const modifier = asyncHandler(async (req, res) => {
  const { actif, expireLe } = req.body;
  const maj = await prisma.codeLecture.update({
    where: { id: req.params.id },
    data: { ...(actif !== undefined ? { actif: Boolean(actif) } : {}), ...(expireLe ? { expireLe: new Date(expireLe) } : {}) },
  });
  res.json({ code: maj });
});

module.exports = { verifier, lister, creer, modifier };
