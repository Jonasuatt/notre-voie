const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/abonnements.controller');
const { authReader } = require('../middleware/auth');

router.post('/article', authReader, ctrl.payerArticle);

// Webhook fournisseur mobile money/carte — non authentifié par JWT (chaque
// fournisseur a son propre mécanisme de signature à vérifier ici avant
// activation en production : Orange Money en premier, cf. cahier des charges §5).
router.post('/transactions/:id/confirmer', ctrl.confirmerTransaction);

module.exports = router;
