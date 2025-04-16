/**
 * Student Record Schema
 * Stores student grade records for the UL Physics Department
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentRecordSchema = new Schema({
  studentId: {
    type: String,
    trim: true,
    index: true
  },
  studentName: {
    type: String,
    trim: true
  },
  courseCode: {
    type: String,
    trim: true,
    index: true
  },
  grade: {
    type: String,
    trim: true
  },
  numericGrade: {
    type: Number,
    min: [0, 'Numeric grade cannot be less than 0'],
    max: [100, 'Numeric grade cannot be more than 100'],
    default: 70
  },
  instructor: {
    type: String,
    trim: true
  },
  yearCompleted: {
    type: Number,
    min: [1950, 'Year must be after 1950'],
    max: [new Date().getFullYear(), 'Year cannot be in the future'],
    default: () => new Date().getFullYear()
  },
  semester: {
    type: String,
    enum: ['First', 'Second', 'Third'],
    trim: true,
    default: 'First'
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
