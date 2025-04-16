/**
 * Student Record Routes
 * Handles API endpoints for student records with appropriate permissions
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

// Get all student records (all authenticated users)
router.get('/', authMiddleware.isAuthenticated, studentController.getAllRecords);

// Get student records by course (all authenticated users)
router.get('/course/:courseCode', authMiddleware.isAuthenticated, studentController.getRecordsByCourse);

// Get student records by student ID (all authenticated users)
router.get('/student/:studentId', authMiddleware.isAuthenticated, studentController.getRecordsByStudent);

// Create a new student record (all authenticated users)
router.post('/', 
  authMiddleware.isAuthenticated, 
  validationMiddleware.validateStudentRecord, 
  studentController.createRecord
);

// Update a student record (chairman and admin only)
router.put('/:id', 
  authMiddleware.canEditRecords, 
  validationMiddleware.validateStudentRecord, 
  studentController.updateRecord
);

// Delete a student record (admin only)
router.delete('/:id', authMiddleware.isAdmin, studentController.deleteRecord);

module.exports = router;
