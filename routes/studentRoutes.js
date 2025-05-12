/**
 * Student Record Routes
 * Handles API endpoints for student records with appropriate permissions
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const bulkUploadController = require('../controllers/bulkUploadController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

// Get all student records (no authentication required)
router.get('/', studentController.getAllRecords);

// Get student records by course (no authentication required)
router.get('/course/:courseCode', studentController.getRecordsByCourse);

// Get student records by student ID (no authentication required)
router.get('/student/:studentId', studentController.getRecordsByStudent);

// Get a specific student record by ID (no authentication required)
router.get('/:id', studentController.getRecordById);

// Create a new student record (no authentication or validation required)
router.post('/', studentController.createRecord);

// Bulk upload student records
router.post('/bulk-upload', bulkUploadController.bulkUploadRecords);

// Update a student record (no authentication required, only validation)
router.put('/:id', 
  validationMiddleware.validateStudentRecord, 
  studentController.updateRecord
);

// Delete a student record (temporarily no auth for testing)
router.delete('/:id', studentController.deleteRecord);

// Delete all student records (admin only)
router.delete('/all', authMiddleware.isAdmin, bulkUploadController.deleteAllRecords);

module.exports = router;
