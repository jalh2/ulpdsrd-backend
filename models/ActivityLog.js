/**
 * Activity Log Schema
 * Stores user activity logs for the UL Physics Department
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivityLogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create index for faster queries
ActivityLogSchema.index({ user: 1, timestamp: -1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
