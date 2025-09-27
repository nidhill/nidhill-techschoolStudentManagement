const express = require('express');
const router = express.Router();
const ShoController = require('../controllers/ShoController');
const { auth, shoAuth } = require('../middleware/auth');

// All routes are protected with authentication and SHO authorization
router.use(auth);
router.use(shoAuth);

// Student management routes
router.post('/students', ShoController.createStudent);
router.get('/students', ShoController.getMyStudents);
router.get('/students/:id', ShoController.getStudentDetails);
router.put('/students/:id', ShoController.updateStudent);
router.put('/students/:id/details', ShoController.updateStudentDetails);
router.delete('/students/:id', ShoController.deleteStudent);

// Attendance routes
router.get('/attendance', ShoController.getAttendance);
router.post('/attendance', ShoController.saveAttendance);
router.get('/students/:id/attendance', ShoController.getAttendanceHistory);

module.exports = router;
