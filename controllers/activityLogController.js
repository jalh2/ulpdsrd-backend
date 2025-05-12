/**
 * Activity Log Controller
 * Handles CRUD operations for activity logs
 */

const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const config = require('../config/config');

/**
 * Create a new activity log
 * @route POST /api/logs
 * @access Private
 */
exports.createLog = async (req, res) => {
  try {
    const { user, username, userType, action, details, ipAddress } = req.body;
    
    // Create log data object
    const logData = {
      username,
      userType,
      action,
      details: details || {},
      ipAddress
    };
    
    // Only include user ID if it's a valid MongoDB ObjectId
    if (user && user !== 'unknown' && mongoose.Types.ObjectId.isValid(user)) {
      logData.user = user;
    } else {
      console.log('Invalid or missing user ID in activity log, continuing without user reference');
    }
    
    // Create and save the log
    const log = new ActivityLog(logData);
    await log.save();
    
    // Return success status
    res.status(201).json({
      success: true,
      message: 'Activity log created successfully'
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    // Don't send error response to client for logging failures
    // Just log it on the server
    res.status(500).json({
      success: false,
      message: 'Error creating activity log'
    });
  }
};

/**
 * Get all activity logs with pagination and filtering
 * @route GET /api/logs
 * @access Admin only
 */
exports.getLogs = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = {};
    
    if (req.query.user) {
      filter.user = req.query.user;
    }
    
    if (req.query.username) {
      filter.username = { $regex: new RegExp(req.query.username, 'i') };
    }
    
    if (req.query.userType) {
      filter.userType = req.query.userType;
    }
    
    if (req.query.action) {
      filter.action = { $regex: new RegExp(req.query.action, 'i') };
    }
    
    if (req.query.startDate && req.query.endDate) {
      filter.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      filter.timestamp = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      filter.timestamp = { $lte: new Date(req.query.endDate) };
    }
    
    // Sorting
    const sortOptions = {};
    if (req.query.sortField) {
      sortOptions[req.query.sortField] = req.query.sortDirection === 'desc' ? -1 : 1;
    } else {
      sortOptions.timestamp = -1; // Default sort by timestamp descending
    }
    
    // Execute query with pagination and sorting
    const logs = await ActivityLog.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name userType'); // Populate user data
    
    // Get total count for pagination
    const total = await ActivityLog.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message
    });
  }
};

/**
 * Get activity log statistics
 * @route GET /api/logs/stats
 * @access Admin only
 */
exports.getLogStats = async (req, res) => {
  try {
    // Get total count of logs
    const totalLogs = await ActivityLog.countDocuments();
    
    // Get count of logs by action type
    const actionStats = await ActivityLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get count of logs by user type
    const userTypeStats = await ActivityLog.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get count of logs by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await ActivityLog.aggregate([
      { 
        $match: { 
          timestamp: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        actionStats,
        userTypeStats,
        dailyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity log statistics',
      error: error.message
    });
  }
};

/**
 * Delete old activity logs (older than specified days)
 * @route DELETE /api/logs/cleanup
 * @access Admin only
 */
exports.cleanupLogs = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30; // Default to 30 days
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} old activity logs`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cleaning up activity logs',
      error: error.message
    });
  }
};
