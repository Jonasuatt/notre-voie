const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/codesLecture.controller');
const { authStaff } = require('../middleware/auth');

// Public : le lecteur saisit le code reçu par mail.
router.post('/verifier', ctrl.verifier);

// Régie : cycle de vie des codes.
router.get('/', authStaff, ctrl.lister);
router.post('/', authStaff, ctrl.creer);
router.patch('/:id', authStaff, ctrl.modifier);

module.exports = router;
