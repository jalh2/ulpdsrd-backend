/**
 * User Management Routes
 * Handles API endpoints for user management with appropriate permissions
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

// All routes require admin access
router.use(authMiddleware.isAdmin);

// Get all users
router.get('/', userController.getAllUsers);

// Get a specific user by ID
router.get('/:id', userController.getUserById);

// Create a new user
router.post('/', validationMiddleware.validateUser, userController.createUser);

// Update a user
router.put('/:id', validationMiddleware.validateUser, userController.updateUser);

// Change user password
router.put('/:id/password', validationMiddleware.validatePasswordChange, userController.changePassword);

// Reset user password (generate a temporary password)
router.post('/:id/reset-password', userController.resetPassword);

// Delete a user
router.delete('/:id', userController.deleteUser);

module.exports = router;
