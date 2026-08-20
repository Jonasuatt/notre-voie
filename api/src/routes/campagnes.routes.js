const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/campagnes.controller');
const { authStaff, requireRole } = require('../middleware/auth');

const REGIE = requireRole('REGIE', 'ADMIN');

router.get('/annonceurs', authStaff, REGIE, ctrl.listAnnonceurs);
router.post('/annonceurs', authStaff, REGIE, ctrl.creerAnnonceur);

// Public — routes fixes avant /:id pour ne pas être capturées par la route paramétrée.
router.get('/actives', ctrl.listActivesPubliques);

router.get('/', authStaff, REGIE, ctrl.list);
router.post('/', authStaff, REGIE, ctrl.create);
router.get('/:id', authStaff, REGIE, ctrl.getOne);
router.patch('/:id/statut', authStaff, REGIE, ctrl.changerStatut);
router.post('/:id/factures', authStaff, REGIE, ctrl.facturer);
router.patch('/:campagneId/factures/:factureId', authStaff, REGIE, ctrl.changerStatutFacture);

// Comptage d'impressions/clics : appelé par le site/l'app public, pas par la régie.
router.post('/:id/impression', ctrl.enregistrerImpression);
router.post('/:id/clic', ctrl.enregistrerClic);

module.exports = router;
