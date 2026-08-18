const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notifications.controller');
const { authStaff } = require('../middleware/auth');

router.get('/', ctrl.list);
router.post('/:id/envoyer', authStaff, ctrl.envoyer);

module.exports = router;
