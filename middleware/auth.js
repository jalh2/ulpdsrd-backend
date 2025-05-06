/**
 * Authentication Middleware
 * Provides route protection based on authentication and user roles
 */

const config = require('../config/config');

// Check if user can edit records (chairman or admin)
exports.canEditRecords = (req, res, next) => {
  // Get user info from request body or query
  const userType = req.body.userType || req.query.userType || (req.body.updatedBy ? 'chairman' : 'instructor');
  
  // Allow chairman and admin to edit records
  if (userType === 'chairman' || userType === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'You do not have permission to edit records'
  });
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  // Get user info from request body or query
  const userType = req.body.userType || req.query.userType || req.headers['user-type'] || 'instructor';
  
  // Allow only admin
  if (userType === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
};
