/**
 * Student Record Controller
 * Handles CRUD operations for student records
 */

const StudentRecord = require('../models/Student');
const User = require('../models/User');
const config = require('../config/config');

/**
 * Get all student records
 * @route GET /api/students
 */
exports.getAllRecords = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.courseCode) filter.courseCode = req.query.courseCode;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.instructor) filter.instructor = req.query.instructor;
    if (req.query.yearCompleted) filter.yearCompleted = parseInt(req.query.yearCompleted);
    if (req.query.semester) filter.semester = req.query.semester;

    // Execute query with pagination
    const records = await StudentRecord.find(filter)
      .sort({ yearCompleted: -1, semester: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await StudentRecord.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student records',
      error: error.message
    });
  }
};

/**
 * Get student records by course
 * @route GET /api/students/course/:courseCode
 */
exports.getRecordsByCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;
    
    const records = await StudentRecord.findByCourse(courseCode);
    
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student records by course',
      error: error.message
    });
  }
};

/**
 * Get student records by student ID
 * @route GET /api/students/student/:studentId
 */
exports.getRecordsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const records = await StudentRecord.findByStudent(studentId);
    
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student records by student ID',
      error: error.message
    });
  }
};

/**
 * Get a specific student record by ID
 * @route GET /api/students/:id
 */
exports.getRecordById = async (req, res) => {
  try {
    const recordId = req.params.id;
    
    const record = await StudentRecord.findById(recordId);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving student record',
      error: error.message
    });
  }
};

/**
 * Create a new student record
 * @route POST /api/students
 */
exports.createRecord = async (req, res) => {
  try {
    const { 
      studentId, 
      studentName, 
      courseCode, 
      grade, 
      numericGrade,
      instructor, 
      yearCompleted, 
      semester 
    } = req.body;

    // Check for existing record with same student and course
    const existingRecord = await StudentRecord.findOne({
      studentId,
      courseCode
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'A record for this student and course already exists'
      });
    }

    // Create new record with default values for missing fields
    const record = new StudentRecord({
      studentId: studentId || '',
      studentName: studentName || '',
      courseCode: courseCode || '',
      grade: grade || '',
      numericGrade: numericGrade !== undefined ? numericGrade : 70, // Default to 70 if missing
      instructor: instructor || 'Unknown',
      yearCompleted: yearCompleted || new Date().getFullYear(),
      semester: semester || 'First'
    });

    await record.save();

    res.status(201).json({
      success: true,
      message: 'Student record created successfully',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating student record',
      error: error.message
    });
  }
};

/**
 * Update a student record
 * @route PUT /api/students/:id
 * @access Chairman and Admin only
 */
exports.updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      studentId, 
      studentName, 
      courseCode, 
      grade,
      numericGrade,
      instructor, 
      yearCompleted, 
      semester,
      updatedBy
    } = req.body;

    // Find record
    let record = await StudentRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Check if updating studentId and courseCode would create a duplicate
    if (studentId && courseCode && 
        (studentId !== record.studentId || courseCode !== record.courseCode)) {
      const duplicateCheck = await StudentRecord.findOne({
        studentId,
        courseCode,
        _id: { $ne: id } // Exclude current record from check
      });

      if (duplicateCheck) {
        return res.status(400).json({
          success: false,
          message: 'A record for this student and course already exists'
        });
      }
    }

    // Update record
    record.studentId = studentId || record.studentId;
    record.studentName = studentName || record.studentName;
    record.courseCode = courseCode || record.courseCode;
    record.grade = grade || record.grade;
    record.numericGrade = numericGrade !== undefined ? numericGrade : record.numericGrade;
    record.instructor = instructor || record.instructor;
    record.yearCompleted = yearCompleted || record.yearCompleted;
    record.semester = semester || record.semester;
    
    // Don't update the updatedBy field, it will be handled by the timestamps

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating student record',
      error: error.message
    });
  }
};

/**
 * Delete a student record
 * @route DELETE /api/students/:id
 * @access Admin only
 */
exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await StudentRecord.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student record',
      error: error.message
    });
  }
};
