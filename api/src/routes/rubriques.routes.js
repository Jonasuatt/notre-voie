const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rubriques.controller');
const { authStaff, requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.post('/', authStaff, requireRole('ADMIN'), ctrl.create);
router.patch('/:id', authStaff, requireRole('ADMIN', 'SECRETAIRE_GENERAL'), ctrl.update);

module.exports = router;
