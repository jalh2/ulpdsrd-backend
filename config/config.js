/**
 * Configuration file for the UL Physics Department Student Record API
 * Contains all environment variables and constants used throughout the application
 */

// Load environment variables
require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  
  // Database configuration
  mongoURI: process.env.MONGODB_URI,
  
  // Encryption key for password hashing
  encryptionKey: process.env.ENCRYPTION_KEY,
  
  // API configuration
  apiBaseUrl: '/api',
  
  // CORS configuration
  cors: {
    // Allow requests from these origins (comma-separated list in .env)
    // In development, default to localhost:3000 if not specified
    // For production, include the deployed frontend URL
    origin: process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : 
      ['http://localhost:3000', 'https://ulpdsrd.web.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'user-type']
  },
  
  // User roles
  userRoles: {
    INSTRUCTOR: 'instructor',
    CHAIRMAN: 'chairman',
    ADMIN: 'admin'
  },
  
  // Session configuration
  sessionSecret: process.env.SESSION_SECRET || 'ul-physics-dept-secret',
  
  // Other constants
  semesters: ['First', 'Second', 'Third'],
  
  // API endpoints (for reference in both backend and frontend)
  endpoints: {
    students: '/api/students',
    users: '/api/users',
    auth: '/api/auth'
  }
};
