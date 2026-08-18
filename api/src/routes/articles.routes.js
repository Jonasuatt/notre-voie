const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/articles.controller');
const factCheckCtrl = require('../controllers/factCheck.controller');
const { authStaff, authReader, optionalReader, requireRole } = require('../middleware/auth');

// --- Rédaction (CMS 2) — routes fixes d'abord, pour ne pas être capturées par /:slug
router.get('/cms', authStaff, ctrl.listCms);
router.get('/cms/:id', authStaff, ctrl.getOneCms);
router.post('/', authStaff, ctrl.create);

router.patch('/:id', authStaff, ctrl.update);
router.post('/:id/soumettre', authStaff, ctrl.soumettre);
router.post('/:id/valider', authStaff, requireRole(...ctrl.ROLES_VALIDATION), ctrl.valider);
router.post('/:id/publier', authStaff, requireRole(...ctrl.ROLES_PUBLICATION), ctrl.publier);
router.post('/:id/depublier', authStaff, requireRole(...ctrl.ROLES_PUBLICATION), ctrl.depublier);
router.post('/:id/live', authStaff, ctrl.ajouterLiveUpdate);
router.patch('/:articleId/checklist/:itemId', authStaff, ctrl.cocherChecklist);
router.post('/:articleId/fact-check', authStaff, factCheckCtrl.create);

// --- Grand public
router.post('/:id/vue', optionalReader, ctrl.enregistrerVue);
router.get('/', ctrl.listPublic);
router.get('/:slug', optionalReader, ctrl.getBySlug);

module.exports = router;
