const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import configuration
const config = require('./config/config');

// Import middleware
const sessionMiddleware = require('./middleware/session');
const errorHandler = require('./middleware/errorHandler');

// Import utilities
const logger = require('./utils/logger');

// Initialize Express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, { 
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  next();
});

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(() => {
    logger.info('MongoDB connected successfully');
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    logger.error('MongoDB connection error', { error: err.message });
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to UL Physics Department Student Record API');
});

// Import routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/logs', require('./routes/activityLogRoutes'));

// Error handling middleware
app.use(errorHandler.mongooseErrorHandler);
app.use(errorHandler.notFound);
app.use(errorHandler.errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});
