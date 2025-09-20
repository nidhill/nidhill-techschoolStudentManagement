const express = require('express');
const AdminController = require('../controllers/AdminController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all SHOs
router.get('/shos', auth, adminAuth, AdminController.getAllShos);

// Create new SHO
router.post('/shos', auth, adminAuth, upload.single('photo'), AdminController.createSho);

// Update SHO
router.put('/shos/:id', auth, adminAuth, upload.single('photo'), AdminController.updateSho);

// Delete SHO
router.delete('/shos/:id', auth, adminAuth, AdminController.deleteSho);

module.exports = router;
