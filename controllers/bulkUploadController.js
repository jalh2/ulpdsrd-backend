/**
 * Bulk Upload Controller
 * Handles bulk upload operations for student records
 */

const StudentRecord = require('../models/Student');

/**
 * Bulk upload student records
 * @route POST /api/students/bulk-upload
 */
exports.bulkUploadRecords = async (req, res) => {
  try {
    const { records } = req.body;
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or empty records array'
      });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: 0,
      details: []
    };

    for (const item of records) {
      try {
        // Check if the record already exists (by studentId and courseCode)
        const existingRecord = await StudentRecord.findOne({
          studentId: item.studentId,
          courseCode: item.courseCode
        });

        if (existingRecord) {
          // Update existing record
          existingRecord.studentName = item.studentName || existingRecord.studentName;
          existingRecord.grade = item.grade || existingRecord.grade;
          existingRecord.numericGrade = item.numericGrade !== undefined ? item.numericGrade : existingRecord.numericGrade;
          existingRecord.instructor = item.instructor || existingRecord.instructor;
          existingRecord.yearCompleted = item.yearCompleted || existingRecord.yearCompleted;
          existingRecord.semester = item.semester || existingRecord.semester;
          existingRecord.updatedBy = item.updatedBy || existingRecord.updatedBy;

          await existingRecord.save();

          results.updated++;
          results.details.push({
            studentId: item.studentId,
            courseCode: item.courseCode,
            status: 'updated',
            id: existingRecord._id
          });
        } else {
          // Create new record
          const newRecord = new StudentRecord({
            studentId: item.studentId || '',
            studentName: item.studentName || '',
            courseCode: item.courseCode || '',
            grade: item.grade || '',
            numericGrade: item.numericGrade !== undefined ? item.numericGrade : 70,
            instructor: item.instructor || 'Unknown',
            yearCompleted: item.yearCompleted || new Date().getFullYear(),
            semester: item.semester || 'First',
            updatedBy: item.updatedBy
          });

          await newRecord.save();

          results.created++;
          results.details.push({
            studentId: item.studentId,
            courseCode: item.courseCode,
            status: 'created',
            id: newRecord._id
          });
        }
      } catch (error) {
        results.errors++;
        results.details.push({
          studentId: item.studentId || 'Unknown',
          courseCode: item.courseCode || 'Unknown',
          status: 'error',
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${records.length} records: ${results.created} created, ${results.updated} updated, ${results.errors} errors`,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing bulk upload',
      error: error.message
    });
  }
};

/**
 * Delete all student records
 * @route DELETE /api/students/all
 * @access Admin only
 */
exports.deleteAllRecords = async (req, res) => {
  try {
    // Delete all student records
    const result = await StudentRecord.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: 'All student records deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting all student records',
      error: error.message
    });
  }
};
