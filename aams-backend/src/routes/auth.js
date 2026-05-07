const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, register, getMe, updateProfile, changePassword, completeProfile, refreshToken, logout } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

// Public routes
router.post('/login', [
  body('identifier').notEmpty().withMessage('Username or Enrollment ID required'),
  body('password').notEmpty().withMessage('Password required'),
  validate
], login);

router.post('/refresh', refreshToken);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.post('/logout', logout);
router.post('/complete-profile', completeProfile);

// Update name & email
router.put('/update-profile', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  validate
], updateProfile);

router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate
], changePassword);

// Admin only
router.post('/register', authorize('admin'), [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('role').isIn(['admin', 'teacher', 'student', 'parent']).withMessage('Invalid role'),
  validate
], register);

module.exports = router;
