/**
 * Authentication Middleware
 * Provides route protection based on authentication and user roles
 */

const config = require('../config/config');

// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (!req.session || !req.session.user || req.session.user.userType !== config.userRoles.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Check if user is a chairman or admin
exports.isChairmanOrAdmin = (req, res, next) => {
  if (!req.session || !req.session.user || 
      (req.session.user.userType !== config.userRoles.CHAIRMAN && 
       req.session.user.userType !== config.userRoles.ADMIN)) {
    return res.status(403).json({
      success: false,
      message: 'Chairman or admin access required'
    });
  }
  next();
};

// Check if user can edit records (chairman or admin)
exports.canEditRecords = (req, res, next) => {
  if (!req.session || !req.session.user || 
      (req.session.user.userType !== config.userRoles.CHAIRMAN && 
       req.session.user.userType !== config.userRoles.ADMIN)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to edit records'
    });
  }
  next();
};
