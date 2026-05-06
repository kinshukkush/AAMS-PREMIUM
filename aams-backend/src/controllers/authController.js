const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendTokenResponse, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');
const { sendWelcomeEmailWithResetLink } = require('../utils/email');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Identifier (email or enrollment ID) and password are required.' });
  }

  let user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { enrollmentId: identifier }]
  }).select('+password');

  // Auto-registration logic for students who log in for the first time
  if (!user && password === `${identifier}@` && /^\d+$/.test(identifier)) {
    user = await User.create({
      name: "Pending Registration",
      email: `${identifier}@student.aams.edu`,
      enrollmentId: identifier,
      password: password,
      role: 'student',
      isDefaultPassword: true
    });
  }

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact admin.' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Register user (Admin only via this route)
// @route   POST /api/auth/register
// @access  Admin
const register = asyncHandler(async (req, res) => {
  const {
    name, email, password, role, phone, department,
    studentProfile, facultyProfile, parentProfile
  } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: 'User with this email already exists.' });
  }

  const user = await User.create({
    name, email, password, role, phone, department,
    studentProfile, facultyProfile, parentProfile
  });

  // Generate temporary reset token for password setup (secure approach)
  const resetToken = jwt.sign(
    { id: user._id, type: 'setup' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/setup-password/${resetToken}`;

  // Send welcome email with secure reset link (non-blocking)
  sendWelcomeEmailWithResetLink(user.email, user.name, user.role, resetUrl).catch(console.error);

  res.status(201).json({
    success: true,
    message: 'User created successfully. Check email for setup instructions.',
    data: { user }
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('department', 'name code')
    .populate('parentProfile.linkedStudent', 'name email studentProfile');

  res.json({ success: true, data: { user } });
});

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8 || !/\d/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long, contain at least 1 number, and 1 special character.' });
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  user.isDefaultPassword = false;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully.' });
});

// @desc    Complete student profile (update name)
// @route   POST /api/auth/complete-profile
// @access  Private
const completeProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  
  const user = await User.findById(req.user._id);
  user.name = name;
  await user.save();
  
  res.json({ success: true, message: 'Profile updated successfully', data: { user } });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (with refresh token)
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(401).json({ success: false, message: 'Refresh token required.' });

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }
    const accessToken = generateAccessToken(user._id);
    res.json({ success: true, data: { accessToken } });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('accessToken');
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = { login, register, getMe, changePassword, completeProfile, refreshToken, logout };
