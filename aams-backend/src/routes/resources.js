const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { exportStudentPDF, exportExcel } = require('../controllers/reportController');
const { body, validationResult } = require('express-validator');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const Device = require('../models/DeviceNotification');
const Notification = require('../models/Notification');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

// Department validators
const validateDepartment = [
  body('name').trim().notEmpty().withMessage('Department name required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('code').trim().notEmpty().withMessage('Department code required').isLength({ min: 2, max: 20 }).withMessage('Code must be 2-20 characters'),
  body('head').optional().isMongoId().withMessage('Invalid head ID'),
  handleValidationErrors
];

// Course validators
const validateCourse = [
  body('code').trim().notEmpty().withMessage('Course code required').isLength({ min: 2, max: 20 }).withMessage('Code must be 2-20 characters'),
  body('name').trim().notEmpty().withMessage('Course name required').isLength({ min: 5, max: 100 }).withMessage('Name must be 5-100 characters'),
  body('credits').isInt({ min: 0, max: 6 }).withMessage('Credits must be 0-6'),
  body('department').isMongoId().withMessage('Valid department ID required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be 1-8'),
  handleValidationErrors
];

// Timetable validators
const validateTimetable = [
  body('course').isMongoId().withMessage('Valid course ID required'),
  body('faculty').isMongoId().withMessage('Valid faculty ID required'),
  body('room').trim().notEmpty().withMessage('Room number required'),
  body('dayOfWeek').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']).withMessage('Invalid day'),
  body('startTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format (HH:mm)'),
  body('endTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format (HH:mm)'),
  handleValidationErrors
];

// ===== DEPARTMENTS =====
const deptRouter = express.Router();
deptRouter.use(protect);

deptRouter.get('/', asyncHandler(async (req, res) => {
  const depts = await Department.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, data: { departments: depts } });
}));

deptRouter.post('/', authorize('admin'), validateDepartment, asyncHandler(async (req, res) => {
  const dept = await Department.create(req.body);
  res.status(201).json({ success: true, data: { department: dept } });
}));

deptRouter.put('/:id', authorize('admin'), validateDepartment, asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: { department: dept } });
}));

deptRouter.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  await Department.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Department deactivated.' });
}));

// ===== COURSES =====
const courseRouter = express.Router();
courseRouter.use(protect);

courseRouter.get('/', asyncHandler(async (req, res) => {
  const { department, semester } = req.query;
  const filter = { isActive: true };
  if (department) filter.department = department;
  if (semester) filter.semester = semester;
  const courses = await Course.find(filter).populate('department', 'name code').sort({ code: 1 });
  res.json({ success: true, data: { courses } });
}));

courseRouter.post('/', authorize('admin'), validateCourse, asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ success: true, data: { course } });
}));

courseRouter.put('/:id', authorize('admin'), validateCourse, asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: { course } });
}));

courseRouter.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  await Course.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Course deactivated.' });
}));

// ===== TIMETABLE =====
const timetableRouter = express.Router();
timetableRouter.use(protect);

timetableRouter.get('/', asyncHandler(async (req, res) => {
  const { faculty, department, batch, section, day } = req.query;
  const filter = { isActive: true };
  if (faculty) filter.faculty = faculty;
  if (department) filter.department = department;
  if (batch) filter.batch = batch;
  if (section) filter.section = section;
  if (day) filter.dayOfWeek = day;

  // Faculty sees their own timetable by default
  if (req.user.role === 'faculty' && !faculty) filter.faculty = req.user._id;

  const slots = await Timetable.find(filter)
    .populate('course', 'name code credits')
    .populate('faculty', 'name email')
    .populate('department', 'name code')
    .sort({ dayOfWeek: 1, startTime: 1 });

  res.json({ success: true, data: { timetable: slots } });
}));

timetableRouter.post('/', authorize('admin'), validateTimetable, asyncHandler(async (req, res) => {
  const slot = await Timetable.create(req.body);
  await slot.populate([
    { path: 'course', select: 'name code' },
    { path: 'faculty', select: 'name' },
    { path: 'department', select: 'name code' }
  ]);
  res.status(201).json({ success: true, data: { slot } });
}));

timetableRouter.put('/:id', authorize('admin'), validateTimetable, asyncHandler(async (req, res) => {
  const slot = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('course', 'name code')
    .populate('faculty', 'name');
  res.json({ success: true, data: { slot } });
}));

timetableRouter.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  await Timetable.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Slot removed.' });
}));

// ===== DEVICES =====
const deviceRouter = express.Router();
deviceRouter.use(protect, authorize('admin'));

deviceRouter.get('/', asyncHandler(async (req, res) => {
  const devices = await Device.find().populate('department', 'name').sort({ createdAt: -1 });
  res.json({ success: true, data: { devices } });
}));

deviceRouter.post('/', asyncHandler(async (req, res) => {
  const device = await Device.create({ ...req.body, registeredBy: req.user._id });
  res.status(201).json({ success: true, data: { device } });
}));

deviceRouter.put('/:id', asyncHandler(async (req, res) => {
  const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: { device } });
}));

deviceRouter.post('/:id/ping', asyncHandler(async (req, res) => {
  const device = await Device.findByIdAndUpdate(
    req.params.id, { lastPing: new Date() }, { new: true }
  );
  res.json({ success: true, message: 'Pong!', data: { device } });
}));

deviceRouter.delete('/:id', asyncHandler(async (req, res) => {
  await Device.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Device removed.' });
}));

// ===== NOTIFICATIONS (admin send) =====
const notifRouter = express.Router();
notifRouter.use(protect);

notifRouter.post('/send', authorize('admin', 'faculty'), asyncHandler(async (req, res) => {
  const { recipients, type, title, message } = req.body;
  // recipients = array of user IDs
  const notifications = recipients.map(recipientId => ({
    recipient: recipientId,
    type,
    title,
    message,
    sentBy: req.user._id,
    sentVia: ['app']
  }));
  await Notification.insertMany(notifications);
  res.json({ success: true, message: `Sent to ${recipients.length} users.` });
}));

// ===== REPORTS =====
const reportRouter = express.Router();
reportRouter.use(protect);

reportRouter.get('/student/:studentId/pdf', exportStudentPDF);
reportRouter.get('/excel', authorize('admin', 'faculty'), exportExcel);

// Summary report
reportRouter.get('/summary', authorize('admin', 'faculty'), asyncHandler(async (req, res) => {
  const AttendanceRecord = require('../models/AttendanceRecord');
  const { startDate, endDate } = req.query;

  const match = {};
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const [overall] = await AttendanceRecord.aggregate([
    { $match: match },
    { $group: {
      _id: null,
      total: { $sum: 1 },
      present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
      absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
      late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
    }},
    { $project: {
      _id: 0, total: 1, present: 1, absent: 1, late: 1,
      // SECURITY FIX: Handle division by zero
      percentage: { $cond: [{ $eq: ['$total', 0] }, 0, { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] }] }
    }}
  ]);

  res.json({ success: true, data: { summary: overall || { total: 0, present: 0, absent: 0, late: 0, percentage: 0 } } });
}));

module.exports = { deptRouter, courseRouter, timetableRouter, deviceRouter, notifRouter, reportRouter };
