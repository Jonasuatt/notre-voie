const express = require('express');
const multer = require('multer');
const router = express.Router();
const ctrl = require('../controllers/media.controller');
const { authStaff } = require('../middleware/auth');

// Mémoire uniquement (pas d'écriture disque) : le fichier part directement
// vers Cloudinary. 60 Mo couvre les photos et les audios/vidéos courtes
// (Flash vidéo < 90s, journal parlé) — un reportage vidéo long doit plutôt
// être hébergé ailleurs (YouTube…) et intégré par URL sur l'article.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 60 * 1024 * 1024 } });

router.get('/', authStaff, ctrl.list);
router.post('/upload', authStaff, upload.single('file'), ctrl.upload);
router.post('/', authStaff, ctrl.create);
router.patch('/reorder', authStaff, ctrl.reorder);
router.patch('/:id', authStaff, ctrl.update);
router.delete('/:id', authStaff, ctrl.remove);

module.exports = router;
