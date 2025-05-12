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
    
    // Log the incoming query parameters for debugging
    console.log('Search parameters:', req.query);
    
    // Helper function to create safe regex patterns
    const createSafeRegex = (term) => {
      const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      return new RegExp(escapedTerm, 'i');
    };
    
    // Handle text-based searches with consistent regex approach
    if (req.query.courseCode) {
      filter.courseCode = { $regex: createSafeRegex(req.query.courseCode) };
      console.log('Searching for course code:', req.query.courseCode);
    }
    
    if (req.query.studentId) {
      filter.studentId = { $regex: createSafeRegex(req.query.studentId) };
      console.log('Searching for student ID:', req.query.studentId);
    }
    
    if (req.query.studentName) {
      filter.studentName = { $regex: createSafeRegex(req.query.studentName) };
      console.log('Searching for student name:', req.query.studentName);
    }
    
    if (req.query.instructor) {
      filter.instructor = { $regex: createSafeRegex(req.query.instructor) };
      console.log('Searching for instructor:', req.query.instructor);
    }
    
    // For grade, year, and semester, use exact matching as these are typically dropdown selections
    if (req.query.grade) filter.grade = req.query.grade;
    if (req.query.yearCompleted) filter.yearCompleted = parseInt(req.query.yearCompleted);
    if (req.query.semester) filter.semester = req.query.semester;
    
    // Log the constructed filter for debugging
    console.log('MongoDB filter:', JSON.stringify(filter, null, 2));

    // Sorting
    const sortOptions = {};
    if (req.query.sortField) {
      sortOptions[req.query.sortField] = req.query.sortDirection === 'desc' ? -1 : 1;
    } else {
      sortOptions.yearCompleted = -1;
      sortOptions.semester = 1;
    }

    // Execute query with pagination and sorting
    const records = await StudentRecord.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
      
    // Log the records found for debugging
    console.log(`Found ${records.length} records matching the filter`);
    if (req.query.studentName) {
      console.log('Records with matching names:');
      records.forEach(record => console.log(`- ${record.studentName}`));
    }

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
      courseName,
      grade, 
      numericGrade,
      instructor, 
      yearCompleted, 
      semester,
      session 
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
      courseName: courseName || '',
      grade: grade || '',
      numericGrade: numericGrade !== undefined ? numericGrade : 70, // Default to 70 if missing
      instructor: instructor || 'Unknown',
      yearCompleted: yearCompleted || new Date().getFullYear(),
      semester: semester || 'First',
      session: session || ''
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
      courseName,
      grade,
      numericGrade,
      instructor, 
      yearCompleted, 
      semester,
      session,
      updatedBy,
      editedBy
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
    record.courseName = courseName || record.courseName;
    record.grade = grade || record.grade;
    record.numericGrade = numericGrade !== undefined ? numericGrade : record.numericGrade;
    record.instructor = instructor || record.instructor;
    record.yearCompleted = yearCompleted || record.yearCompleted;
    record.semester = semester || record.semester;
    record.session = session || record.session;
    
    // Update the updatedBy field with the current user's information
    if (updatedBy) {
      record.updatedBy = updatedBy;
    }
    
    // Update the editedBy field with the current user's name
    if (editedBy) {
      record.editedBy = editedBy;
    }

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
