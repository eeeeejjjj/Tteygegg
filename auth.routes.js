const express = require('express');
const router = express.Router();
const { signup, verifyOtp, login } = require('../controllers/auth.controller');

router.post('/signup', signup);
router.post('/verify', verifyOtp);
router.post('/login', login);

module.exports = router;