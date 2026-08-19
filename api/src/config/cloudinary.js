const cloudinary = require('cloudinary').v2;

// Configuré via les 3 variables CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET
// (mêmes noms que sur le projet Langues Ivoire — un compte Cloudinary existant
// peut être réutilisé). Voir docs/DECISIONS.md pour l'étape de configuration
// Railway associée à la médiathèque/photothèque.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isConfigured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

module.exports = { cloudinary, isConfigured };
