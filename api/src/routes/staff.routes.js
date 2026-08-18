const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/staff.controller');
const { authStaff, requireRole } = require('../middleware/auth');

const ADMIN = requireRole('ADMIN');

router.get('/', authStaff, ADMIN, ctrl.list);
router.post('/', authStaff, ADMIN, ctrl.create);
router.patch('/:id', authStaff, ADMIN, ctrl.update);

module.exports = router;
