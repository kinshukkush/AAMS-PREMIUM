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
    return res.status(400).json({ success: false, message: 'Username/Enrollment ID and password are required.' });
  }

  // Look up by enrollmentId (numeric) or by email (for backward compat)
  let user = await User.findOne({
    $or: [{ enrollmentId: identifier }, { email: identifier.toLowerCase() }]
  }).select('+password');

  // Auto-registration: if user doesn't exist, create them as a student
  if (!user) {
    const defaultDepartment = await require('../models/Department').findOne();
    user = await User.create({
      name: `Student ${identifier}`,
      enrollmentId: identifier,
      password: password,
      role: 'student',
      isDefaultPassword: true,
      department: defaultDepartment ? defaultDepartment._id : null,
      studentProfile: {
        rollNo: identifier,
        batch: "2024",
        semester: 1,
      }
    });

    // Fetch the newly created user with required selections
    user = await User.findById(user._id).select('+password');
  }

  // Verify password
  if (!(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your password.' });
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
    studentProfile, facultyProfile, parentProfile, enrollmentId
  } = req.body;

  const existing = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      ...(enrollmentId ? [{ enrollmentId }] : [])
    ]
  });
  if (existing) {
    return res.status(409).json({ success: false, message: 'User with this email or enrollment ID already exists.' });
  }

  const user = await User.create({
    name, email, password, role, phone, department,
    studentProfile, facultyProfile, parentProfile, enrollmentId
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

// @desc    Update current user's profile (name & email)
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ success: false, message: 'At least one field (name or email) is required.' });
  }

  // If changing email, check it's not already taken
  if (email) {
    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This email is already in use by another account.' });
    }
  }

  const updates = {};
  if (name) updates.name = name.trim();
  if (email) updates.email = email.toLowerCase().trim();

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).populate('department', 'name code');

  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  res.json({ success: true, message: 'Profile updated successfully.', data: { user } });
});

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

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

module.exports = { login, register, getMe, updateProfile, changePassword, completeProfile, refreshToken, logout };
