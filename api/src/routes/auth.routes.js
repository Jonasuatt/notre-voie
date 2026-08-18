const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const { authStaff, authReader } = require('../middleware/auth');

router.post('/staff/login', ctrl.staffLoginValidators, ctrl.staffLogin);
router.get('/staff/me', authStaff, ctrl.staffMe);

router.post('/reader/register', ctrl.readerRegisterValidators, ctrl.readerRegister);
router.post('/reader/login', ctrl.readerLogin);
router.get('/reader/me', authReader, ctrl.readerMe);
router.patch('/reader/me', authReader, ctrl.readerUpdateMe);

module.exports = router;
