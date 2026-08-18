const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-moi';

// Deux espaces de jetons distincts (audience "staff" / "reader") pour
// qu'un token CMS ne puisse jamais être rejoué côté grand public et
// inversement — même secret, claim `aud` différent.
function signStaffToken(staff) {
  return jwt.sign(
    { sub: staff.id, role: staff.role, aud: 'staff' },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function signReaderToken(reader) {
  return jwt.sign(
    { sub: reader.id, aud: 'reader' },
    JWT_SECRET,
    { expiresIn: process.env.JWT_READER_EXPIRES_IN || '30d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signStaffToken, signReaderToken, verifyToken };
