/**
 * Attendance validators - Input validation for attendance endpoints
 * SECURITY FIX: Validates all inputs to prevent injection and invalid data
 */

const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation for processFaceResult endpoint
const validateFaceResult = [
  body('sessionId')
    .trim()
    .isMongoId()
    .withMessage('Invalid session ID format'),
  body('studentId')
    .trim()
    .isMongoId()
    .withMessage('Invalid student ID format'),
  body('confidence')
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence must be between 0 and 1'),
  body('status')
    .optional()
    .isIn(['present', 'absent', 'late'])
    .withMessage('Invalid status value'),
  handleValidationErrors
];

// Validation for marking attendance
const validateMarkAttendance = [
  body('sessionId')
    .trim()
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('studentIds')
    .isArray({ min: 1 })
    .withMessage('Student IDs must be a non-empty array'),
  body('studentIds.*')
    .trim()
    .isMongoId()
    .withMessage('Each student ID must be valid'),
  body('status')
    .isIn(['present', 'absent', 'late'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

// Validation for QR scan
const validateQRScan = [
  body('sessionId')
    .trim()
    .isMongoId()
    .withMessage('Invalid session ID'),
  handleValidationErrors
];

// Validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Validation for student ID parameter
const validateStudentIdParam = [
  param('studentId')
    .trim()
    .isMongoId()
    .withMessage('Invalid student ID format'),
  handleValidationErrors
];

// Validation for session ID parameter
const validateSessionIdParam = [
  param('sessionId')
    .trim()
    .isMongoId()
    .withMessage('Invalid session ID format'),
  handleValidationErrors
];

module.exports = {
  validateFaceResult,
  validateMarkAttendance,
  validateQRScan,
  validatePagination,
  validateStudentIdParam,
  validateSessionIdParam,
  handleValidationErrors
};
