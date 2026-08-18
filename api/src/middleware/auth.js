const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

function extractToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// Authentifie un membre du staff (CMS 1 Administration/Régie, CMS 2 Rédaction).
// Rejette explicitement un token émis pour un Reader (aud différent).
const authStaff = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Authentification requise.' });

    const payload = verifyToken(token);
    if (payload.aud !== 'staff') return res.status(403).json({ error: 'Jeton invalide pour cette ressource.' });

    const staff = await prisma.staff.findUnique({ where: { id: payload.sub } });
    if (!staff || !staff.isActive) return res.status(401).json({ error: 'Compte introuvable ou désactivé.' });

    req.staff = staff;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Jeton invalide ou expiré.' });
  }
};

// Authentifie un lecteur grand public (site / app).
const authReader = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Authentification requise.' });

    const payload = verifyToken(token);
    if (payload.aud !== 'reader') return res.status(403).json({ error: 'Jeton invalide pour cette ressource.' });

    const reader = await prisma.reader.findUnique({ where: { id: payload.sub } });
    if (!reader || !reader.isActive) return res.status(401).json({ error: 'Compte introuvable ou désactivé.' });

    req.reader = reader;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Jeton invalide ou expiré.' });
  }
};

// Authentifie un lecteur si un jeton est fourni, sans bloquer sinon
// (utile pour les routes publiques qui adaptent l'accès paywall).
const optionalReader = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    if (payload.aud === 'reader') {
      const reader = await prisma.reader.findUnique({ where: { id: payload.sub } });
      if (reader && reader.isActive) req.reader = reader;
    }
  } catch (err) {
    // token absent/invalide : on continue en anonyme
  }
  next();
};

// Restreint l'accès à une liste de StaffRole.
const requireRole = (...roles) => (req, res, next) => {
  if (!req.staff || !roles.includes(req.staff.role)) {
    return res.status(403).json({ error: 'Accès non autorisé pour ce rôle.' });
  }
  next();
};

module.exports = { authStaff, authReader, optionalReader, requireRole };
