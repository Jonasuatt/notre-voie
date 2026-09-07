const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cerveau.controller');
const { authStaff } = require('../middleware/auth');

// Outil interne : le Cerveau donne accès aux brouillons et aux articles
// dépubliés, donc il reste derrière l'authentification de la rédaction.
router.get('/apercu', authStaff, ctrl.apercu);
router.get('/recherche', authStaff, ctrl.recherche);
router.get('/similaires/:id', authStaff, ctrl.similaires);

module.exports = router;
