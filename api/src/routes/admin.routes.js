const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const { authStaff, requireRole } = require('../middleware/auth');

router.get('/stats', authStaff, requireRole('ADMIN', 'REGIE'), ctrl.stats);

module.exports = router;
