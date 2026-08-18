const { PrismaClient } = require('@prisma/client');

// Instance unique partagée par toute l'application (évite l'épuisement
// du pool de connexions en dev avec le rechargement à chaud de nodemon).
const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

module.exports = prisma;
