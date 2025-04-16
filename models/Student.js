/**
 * Student Record Schema
 * Stores student grade records for the UL Physics Department
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentRecordSchema = new Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true,
    index: true
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    index: true
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    trim: true
  },
  instructor: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true
  },
  yearCompleted: {
    type: Number,
    required: [true, 'Year completed is required'],
    min: [1950, 'Year must be after 1950'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['First', 'Second', 'Third'],
    trim: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create compound index for faster queries
StudentRecordSchema.index({ studentId: 1, courseCode: 1 }, { unique: true });

// Create index for searching by year and semester
StudentRecordSchema.index({ yearCompleted: 1, semester: 1 });

// Static method to find records by course
StudentRecordSchema.statics.findByCourse = function(courseCode) {
  return this.find({ courseCode: courseCode }).sort({ yearCompleted: -1, semester: 1 });
};

// Static method to find records by student
StudentRecordSchema.statics.findByStudent = function(studentId) {
  return this.find({ studentId: studentId }).sort({ yearCompleted: -1, semester: 1 });
};

// Static method to find records by instructor
StudentRecordSchema.statics.findByInstructor = function(instructor) {
  return this.find({ instructor: instructor }).sort({ yearCompleted: -1, semester: 1 });
};

// Pre-save middleware to validate data
StudentRecordSchema.pre('save', function(next) {
  // Additional validation can be added here
  next();
});

module.exports = mongoose.model('StudentRecord', StudentRecordSchema);
