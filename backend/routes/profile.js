const express = require('express');
const ProfileController = require('../controllers/ProfileController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Update logged-in user's profile
router.put('/', auth, ProfileController.updateMyProfile);

// Change logged-in user's password
router.put('/change-password', auth, ProfileController.changeMyPassword);

module.exports = router;
