const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/editions.controller');
const { authStaff } = require('../middleware/auth');

router.get('/', ctrl.list);
router.post('/', authStaff, ctrl.create);

module.exports = router;
