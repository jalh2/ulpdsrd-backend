/**
 * Error Handler Middleware
 * Provides consistent error handling across the application
 */

const logger = require('../utils/logger');

/**
 * Not Found Error Handler
 * Handles 404 errors when a route is not found
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * General Error Handler
 * Handles all other errors in the application
 */
const errorHandler = (err, req, res, next) => {
  // Set default status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  logger.error(message, {
    url: req.originalUrl,
    method: req.method,
    statusCode,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

/**
 * MongoDB Validation Error Handler
 * Handles validation errors from MongoDB/Mongoose
 */
const mongooseErrorHandler = (err, req, res, next) => {
  // Check if it's a Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    
    logger.warning('Validation Error', {
      url: req.originalUrl,
      method: req.method,
      errors
    });

    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Check if it's a MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate value: ${field} with value '${value}' already exists`;
    
    logger.warning(message, {
      url: req.originalUrl,
      method: req.method
    });

    return res.status(400).json({
      success: false,
      message
    });
  }

  // Pass to next error handler if not handled here
  next(err);
};

module.exports = {
  notFound,
  errorHandler,
  mongooseErrorHandler
};
