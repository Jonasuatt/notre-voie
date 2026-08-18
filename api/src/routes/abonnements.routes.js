const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/abonnements.controller');
const { authReader } = require('../middleware/auth');

router.get('/moi', authReader, ctrl.monAbonnement);
router.post('/', authReader, ctrl.souscrire);

module.exports = router;
