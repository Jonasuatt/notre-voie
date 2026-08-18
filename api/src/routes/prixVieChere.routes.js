const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/prixVieChere.controller');
const { authStaff } = require('../middleware/auth');

router.get('/', ctrl.ticker);
router.post('/', authStaff, ctrl.create);

module.exports = router;
