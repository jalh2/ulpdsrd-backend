/**
 * Session Middleware
 * Configures and manages user sessions for authentication
 */

const session = require('express-session');
const config = require('../config/config');

// Configure session middleware
const sessionMiddleware = session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only use secure in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax', // Allows cookies to be sent in cross-origin requests
  }
});

module.exports = sessionMiddleware;
