/**
 * Authentication Middleware
 * Provides route protection based on authentication and user roles
 */

const config = require('../config/config');

// Check if user can edit records (chairman or admin)
exports.canEditRecords = (req, res, next) => {
  // First check if we have a user in the session
  if (req.session && req.session.user && 
      (req.session.user.userType === 'chairman' || req.session.user.userType === 'admin')) {
    return next();
  }
  
  // If no session, try to get user info from request body or query
  const userType = req.body.userType || req.query.userType || (req.body.updatedBy ? 'chairman' : null);
  
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
  try {
    // First check if we have a user in the session
    if (req.session && req.session.user && req.session.user.userType === 'admin') {
      return next();
    }
    
    // If no session, try to get user info from request headers, body, or query
    const userType = req.headers['user-type'] || req.body.userType || req.query.userType;
    
    console.log('Auth middleware - userType from headers:', req.headers['user-type']);
    console.log('Auth middleware - all headers:', req.headers);
    
    // Allow only admin
    if (userType === 'admin') {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in authentication',
      error: error.message
    });
  }
};
