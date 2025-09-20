const express = require('express');
const AuthController = require('../controllers/AuthController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', AuthController.login);

// Get current user
router.get('/me', auth, AuthController.getCurrentUser);

module.exports = router;

