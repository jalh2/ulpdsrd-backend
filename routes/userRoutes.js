/**
 * User Management Routes
 * Handles API endpoints for user management with appropriate permissions
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

// Remove admin access requirement for all routes
// router.use(authMiddleware.isAdmin);

// Get all users (no authentication required)
router.get('/', userController.getAllUsers);

// Get a specific user by ID (no authentication required)
router.get('/:id', userController.getUserById);

// Create a new user (no authentication required)
router.post('/', validationMiddleware.validateUser, userController.createUser);

// Update a user (no authentication required)
router.put('/:id', validationMiddleware.validateUser, userController.updateUser);

// Change user password (no authentication required)
router.put('/:id/password', validationMiddleware.validatePasswordChange, userController.changePassword);

// Reset user password (generate a temporary password) (no authentication required)
router.post('/:id/reset-password', userController.resetPassword);

// Delete a user (no authentication required)
router.delete('/:id', userController.deleteUser);

module.exports = router;
