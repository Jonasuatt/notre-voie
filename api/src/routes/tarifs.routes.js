const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tarifs.controller');
const { authStaff } = require('../middleware/auth');

// La grille est publique : un annonceur doit pouvoir la consulter, et le
// tarif papier est de toute façon un document diffusé.
router.get('/', ctrl.lister);
router.post('/devis', ctrl.devis);

// Sa modification reste réservée à la régie.
router.post('/', authStaff, ctrl.enregistrer);
router.patch('/options/:id', authStaff, ctrl.majOption);

module.exports = router;
