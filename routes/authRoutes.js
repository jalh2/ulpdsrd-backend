/**
 * Authentication Routes
 * Handles routes for user registration, login, and session management
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validationMiddleware = require('../middleware/validation');

// Register a new user
router.post('/register', validationMiddleware.validateUser, authController.register);

// Login user
router.post('/login', validationMiddleware.validateLogin, authController.login);

// Get current user profile
router.get('/profile', authController.getProfile);

// Logout user
router.post('/logout', authController.logout);

module.exports = router;
