/**
 * Authentication Controller
 * Handles user registration, login, and session management
 */

const User = require('../models/User');
const cryptoUtil = require('../utils/crypto');
const config = require('../config/config');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { username, password, userType, name, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already in use'
      });
    }

    // TEMPORARILY REMOVED: Only admin can create chairman or admin accounts
    // This allows initial setup of admin users
    // TO BE RESTORED AFTER INITIAL SETUP
    /*
    if ((userType === config.userRoles.CHAIRMAN || userType === config.userRoles.ADMIN) && 
        (!req.session.user || req.session.user.userType !== config.userRoles.ADMIN)) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create chairman or admin accounts'
      });
    }
    */

    // Encrypt password
    const { salt, hash } = cryptoUtil.encryptPassword(password);

    // Create new user
    const user = new User({
      username,
      password: { salt, hash },
      userType,
      name,
      email
    });

    await user.save();

    // Return success without password data
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        username: user.username,
        userType: user.userType,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { username, password, userType } = req.body;

    // Find user by username
    const user = await User.findOne({ username, userType });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = cryptoUtil.verifyPassword(
      password,
      user.password.hash,
      user.password.salt
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Create session
    req.session.user = {
      id: user._id,
      username: user.username,
      userType: user.userType,
      name: user.name
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        username: user.username,
        userType: user.userType,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 */
exports.getProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const user = await User.findById(req.session.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        username: user.username,
        userType: user.userType,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error during logout',
        error: err.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });
};
