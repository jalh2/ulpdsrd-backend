/**
 * Validation Middleware
 * Provides request validation for API endpoints
 */

// Validation helper functions
const validateStudentRecord = (req, res, next) => {
  const { studentId, studentName, courseCode, grade, numericGrade, instructor, yearCompleted, semester } = req.body;
  const errors = [];

  // Required fields validation
  if (!studentId) errors.push('Student ID is required');
  if (!studentName) errors.push('Student name is required');
  if (!courseCode) errors.push('Course code is required');
  if (!grade) errors.push('Grade is required');
  if (numericGrade === undefined || numericGrade === null) errors.push('Numeric grade is required');
  if (!instructor) errors.push('Instructor is required');
  if (!yearCompleted) errors.push('Year completed is required');
  if (!semester) errors.push('Semester is required');

  // Format validation
  if (yearCompleted && isNaN(yearCompleted)) {
    errors.push('Year completed must be a number');
  }

  if (yearCompleted && (yearCompleted < 1950 || yearCompleted > new Date().getFullYear())) {
    errors.push(`Year completed must be between 1950 and ${new Date().getFullYear()}`);
  }

  if (numericGrade !== undefined && numericGrade !== null) {
    if (isNaN(numericGrade)) {
      errors.push('Numeric grade must be a number');
    } else if (numericGrade < 0 || numericGrade > 100) {
      errors.push('Numeric grade must be between 0 and 100');
    }
  }

  // Accept both string and numeric semester values
  if (semester) {
    const semesterStr = semester.toString();
    // Check if semester is a valid value (First, Second, Third, 1, 2, 3)
    if (!['First', 'Second', 'Third', '1', '2', '3', 1, 2, 3].includes(semesterStr)) {
      errors.push('Semester must be one of: First, Second, Third, 1, 2, 3');
    }
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  next();
};

const validateUser = (req, res, next) => {
  const { username, password, userType, name, email } = req.body;
  const errors = [];

  // Required fields validation for new user creation
  if (req.method === 'POST') {
    if (!username) errors.push('Username is required');
    if (!password) errors.push('Password is required');
    if (!userType) errors.push('User type is required');
    if (!name) errors.push('Name is required');
    if (!email) errors.push('Email is required');
  }

  // Format validation
  if (username && username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (userType && !['instructor', 'chairman', 'admin'].includes(userType)) {
    errors.push('User type must be one of: instructor, chairman, admin');
  }

  if (email && !(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
    errors.push('Please provide a valid email address');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { username, password, userType } = req.body;
  const errors = [];

  // Required fields validation
  if (!username) errors.push('Username is required');
  if (!password) errors.push('Password is required');
  if (!userType) errors.push('User type is required');

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  next();
};

const validatePasswordChange = (req, res, next) => {
  const { password } = req.body;
  const errors = [];

  // Required fields validation
  if (!password) errors.push('Password is required');
  
  // Format validation
  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  next();
};

module.exports = {
  validateStudentRecord,
  validateUser,
  validateLogin,
  validatePasswordChange
};
