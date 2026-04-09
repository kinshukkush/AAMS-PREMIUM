const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const Notification = require('../models/Notification');

// Escape regex special characters
const escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Get all users (with filters)
// @route   GET /api/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const { role, department, search, page = 1, limit = 20, isActive } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    const escapedSearch = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } },
      { 'studentProfile.rollNo': { $regex: escapedSearch, $options: 'i' } },
      { 'facultyProfile.employeeCode': { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .populate('department', 'name code')
    .populate('parentProfile.linkedStudent', 'name studentProfile')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .select('-password');

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin / Self
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('department', 'name code')
    .populate('parentProfile.linkedStudent', 'name email studentProfile');

  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  // Students/parents can only view their own profile
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
  }

  res.json({ success: true, data: { user } });
});

// @desc    Create user
// @route   POST /api/users
// @access  Admin
const createUser = asyncHandler(async (req, res) => {
  const {
    name, email, password, role, phone, department,
    studentProfile, facultyProfile, parentProfile
  } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ success: false, message: 'Email already in use.' });

  const user = await User.create({
    name, email, password: password || 'LPU@123',
    role, phone, department,
    studentProfile, facultyProfile, parentProfile
  });

  res.status(201).json({ success: true, message: 'User created.', data: { user } });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin / Self (limited fields)
const updateUser = asyncHandler(async (req, res) => {
  const { password, role, ...updateData } = req.body;

  // Only admins can change roles
  if (role && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only admins can change roles.' });
  }
  if (role) updateData.role = role;

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true, runValidators: true
  }).populate('department', 'name code');

  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  res.json({ success: true, message: 'User updated.', data: { user } });
});

// @desc    Delete (deactivate) user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  res.json({ success: true, message: 'User deactivated successfully.' });
});

// @desc    Get students for faculty (their enrolled students)
// @route   GET /api/users/students/my-class
// @access  Faculty
const getMyStudents = asyncHandler(async (req, res) => {
  const { batch, section } = req.query;

  const filter = { role: 'student', isActive: true };
  if (req.user.department) filter.department = req.user.department;
  if (batch) filter['studentProfile.batch'] = batch;
  if (section) filter['studentProfile.section'] = section;

  const students = await User.find(filter)
    .populate('department', 'name code')
    .sort({ 'studentProfile.rollNo': 1 });

  res.json({ success: true, data: { students, count: students.length } });
});

// @desc    Update profile photo
// @route   PUT /api/users/:id/photo
// @access  Private (self)
const updatePhoto = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { profilePhoto: `/uploads/profiles/${req.file.filename}` },
    { new: true }
  );

  res.json({ success: true, message: 'Profile photo updated.', data: { profilePhoto: user.profilePhoto } });
});

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  res.json({ success: true, data: { notifications, unreadCount } });
});

// @desc    Mark notifications as read
// @route   PUT /api/users/notifications/read
// @access  Private
const markNotificationsRead = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (ids && ids.length > 0) {
    await Notification.updateMany(
      { _id: { $in: ids }, recipient: req.user._id },
      { isRead: true, readAt: new Date() }
    );
  } else {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  res.json({ success: true, message: 'Notifications marked as read.' });
});

module.exports = {
  getUsers, getUser, createUser, updateUser, deleteUser,
  getMyStudents, updatePhoto, getMyNotifications, markNotificationsRead
};
