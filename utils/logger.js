/**
 * Logger Utility
 * Provides consistent logging throughout the application
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log file paths
const accessLogPath = path.join(logsDir, 'access.log');
const errorLogPath = path.join(logsDir, 'error.log');
const auditLogPath = path.join(logsDir, 'audit.log');

// Log levels
const LOG_LEVELS = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  AUDIT: 'AUDIT'
};

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 * @returns {string} - Formatted log message
 */
const formatLogMessage = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
};

/**
 * Write to log file
 * @param {string} filePath - Path to log file
 * @param {string} message - Message to log
 */
const writeToLog = (filePath, message) => {
  fs.appendFile(filePath, message, (err) => {
    if (err) {
      console.error(`Error writing to log file: ${err.message}`);
    }
  });
};

/**
 * Log information message
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
const info = (message, data = {}) => {
  const logMessage = formatLogMessage(LOG_LEVELS.INFO, message, data);
  console.log(logMessage);
  writeToLog(accessLogPath, logMessage);
};

/**
 * Log warning message
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
const warning = (message, data = {}) => {
  const logMessage = formatLogMessage(LOG_LEVELS.WARNING, message, data);
  console.warn(logMessage);
  writeToLog(accessLogPath, logMessage);
};

/**
 * Log error message
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
const error = (message, data = {}) => {
  const logMessage = formatLogMessage(LOG_LEVELS.ERROR, message, data);
  console.error(logMessage);
  writeToLog(errorLogPath, logMessage);
};

/**
 * Log audit message (for important operations)
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
const audit = (message, data = {}) => {
  const logMessage = formatLogMessage(LOG_LEVELS.AUDIT, message, data);
  console.log(logMessage);
  writeToLog(auditLogPath, logMessage);
};

module.exports = {
  info,
  warning,
  error,
  audit
};
