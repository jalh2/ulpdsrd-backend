/**
 * Crypto utility for password encryption and verification
 * Uses Node.js built-in crypto module as specified
 */

const crypto = require('crypto');
const config = require('../config/config');

// Get encryption key from config
const encryptionKey = config.encryptionKey;

// Generate a random salt
const generateSalt = (length = 16) => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash password with salt
const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(
    password,
    salt,
    10000, // Number of iterations
    64,    // Key length
    'sha512'
  ).toString('hex');
};

// Encrypt password (generates salt and hash)
const encryptPassword = (password) => {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  return { salt, hash };
};

// Verify password
const verifyPassword = (password, storedHash, storedSalt) => {
  const hash = hashPassword(password, storedSalt);
  return hash === storedHash;
};

module.exports = {
  generateSalt,
  hashPassword,
  encryptPassword,
  verifyPassword
};
