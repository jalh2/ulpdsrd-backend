/**
 * Activity Log Routes
 * Handles API endpoints for activity logs
 */

const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');

// Create a new activity log
router.post('/', activityLogController.createLog);

// Get all activity logs
router.get('/', activityLogController.getLogs);

// Get activity log statistics
router.get('/stats', activityLogController.getLogStats);

// Delete old activity logs
router.delete('/cleanup', activityLogController.cleanupLogs);

module.exports = router;
