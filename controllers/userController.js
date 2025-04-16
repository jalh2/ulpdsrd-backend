/**
 * User Controller
 * Handles CRUD operations for user management
 */

const User = require('../models/User');
const cryptoUtil = require('../utils/crypto');
const config = require('../config/config');

/**
 * Get all users
 * @route GET /api/users
 * @access Admin only
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.userType) filter.userType = req.query.userType;
    if (req.query.active !== undefined) filter.active = req.query.active === 'true';

    // Execute query with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * Get a specific user by ID
 * @route GET /api/users/:id
 * @access Admin only
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * Create a new user
 * @route POST /api/users
 * @access Admin only
 */
exports.createUser = async (req, res) => {
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
      message: 'User created successfully',
      data: {
        _id: user._id,
        username: user.username,
        userType: user.userType,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

/**
 * Update a user
 * @route PUT /api/users/:id
 * @access Admin only
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, userType, name, email, active } = req.body;

    // Find user
    let user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if updating username or email would create a duplicate
    if (username && username !== user.username) {
      const duplicateUsername = await User.findOne({
        username,
        _id: { $ne: id }
      });

      if (duplicateUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already in use'
        });
      }
    }

    if (email && email !== user.email) {
      const duplicateEmail = await User.findOne({
        email,
        _id: { $ne: id }
      });

      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update user
    if (username) user.username = username;
    if (userType) user.userType = userType;
    if (name) user.name = name;
    if (email) user.email = email;
    if (active !== undefined) user.active = active;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        username: user.username,
        userType: user.userType,
        name: user.name,
        email: user.email,
        active: user.active
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * Change user password
 * @route PUT /api/users/:id/password
 * @access Admin only
 */
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Find user
    let user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Encrypt new password
    const { salt, hash } = cryptoUtil.encryptPassword(password);
    user.password = { salt, hash };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

/**
 * Reset user password (generate a temporary password)
 * @route POST /api/users/:id/reset-password
 * @access Admin only
 */
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    let user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Encrypt new password
    const { salt, hash } = cryptoUtil.encryptPassword(tempPassword);
    user.password = { salt, hash };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        temporaryPassword: tempPassword
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

/**
 * Delete a user
 * @route DELETE /api/users/:id
 * @access Admin only
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};
