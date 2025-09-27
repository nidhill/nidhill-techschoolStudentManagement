const express = require('express');
const AdminController = require('../controllers/AdminController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, adminAuth, AdminController.getDashboardStats);

// Get all SHOs
router.get('/shos', auth, adminAuth, AdminController.getAllShos);

// Get SHO monitoring data - Must be before parameterized routes
router.get('/shos/monitoring', auth, adminAuth, AdminController.getShoMonitoringData);

// Get most active SHO - Must be before parameterized routes
router.get('/shos/most-active', auth, adminAuth, AdminController.getMostActiveSho);

// Get single SHO by ID
router.get('/shos/:id', auth, adminAuth, AdminController.getShoById);

// Create new SHO
router.post('/shos', auth, adminAuth, upload.single('photo'), AdminController.createSho);

// Update SHO
router.put('/shos/:id', auth, adminAuth, upload.single('photo'), AdminController.updateSho);

// Delete SHO
router.delete('/shos/:id', auth, adminAuth, AdminController.deleteSho);

// Get students by SHO
router.get('/shos/:shoId/students', auth, adminAuth, AdminController.getStudentsBySho);

// Get all students
router.get('/students/all', auth, adminAuth, AdminController.getAllStudents);

// Delete all students
router.delete('/students', auth, adminAuth, AdminController.deleteAllStudents);

// Create single student for a selected SHO (admin)
router.post('/students', auth, adminAuth, AdminController.createStudentForSho);

// Batch create students for a selected SHO (admin)
router.post('/students/batch', auth, adminAuth, AdminController.createStudentsBatchForSho);

module.exports = router;
