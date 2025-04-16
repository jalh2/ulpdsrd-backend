/**
 * User Schema
 * Handles authentication and authorization for the UL Physics Department system
 * User types: instructor, chairman, admin
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config/config');

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  password: {
    hash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    salt: {
      type: String,
      required: [true, 'Password salt is required']
    }
  },
  userType: {
    type: String,
    required: [true, 'User type is required'],
    enum: [
      config.userRoles.INSTRUCTOR,
      config.userRoles.CHAIRMAN,
      config.userRoles.ADMIN
    ],
    default: config.userRoles.INSTRUCTOR
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create index for faster queries
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ userType: 1 });

// Method to check if user is admin
UserSchema.methods.isAdmin = function() {
  return this.userType === config.userRoles.ADMIN;
};

// Method to check if user is chairman
UserSchema.methods.isChairman = function() {
  return this.userType === config.userRoles.CHAIRMAN;
};

// Method to check if user is instructor
UserSchema.methods.isInstructor = function() {
  return this.userType === config.userRoles.INSTRUCTOR;
};

// Method to check if user can edit records (chairman or admin)
UserSchema.methods.canEdit = function() {
  return this.userType === config.userRoles.CHAIRMAN || this.userType === config.userRoles.ADMIN;
};

// Method to update last login time
UserSchema.methods.updateLoginTime = function() {
  this.lastLogin = Date.now();
  return this.save();
};

// Static method to find by username
UserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

// Static method to find by email
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// Static method to find by user type
UserSchema.statics.findByUserType = function(userType) {
  return this.find({ userType });
};

// Hide sensitive information when converting to JSON
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
