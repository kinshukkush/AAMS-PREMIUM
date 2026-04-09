const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const User = require('../models/User');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendLowAttendanceAlert } = require('../utils/email');
const axios = require('axios');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// ===== SESSION MANAGEMENT =====

// @desc    Start attendance session
// @route   POST /api/attendance/sessions/start
// @access  Faculty
const startSession = asyncHandler(async (req, res) => {
  const { courseId, batch, section, method, room, timetableId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  // Generate QR code for QR method
  let qrCode = null;
  let qrExpiry = null;
  const sessionCode = uuidv4();

  if (method === 'qr' || method === 'mixed') {
    const qrData = JSON.stringify({
      sessionCode,
      courseId,
      date: new Date().toISOString().split('T')[0],
      expiry: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min
    });
    qrCode = await QRCode.toDataURL(qrData);
    qrExpiry = new Date(Date.now() + 15 * 60 * 1000);
  }

  const session = await AttendanceSession.create({
    sessionCode,
    course: courseId,
    faculty: req.user._id,
    timetable: timetableId || null,
    department: req.user.department,
    batch,
    section,
    date: new Date(),
    startTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    method: method || 'manual',
    room,
    qrCode,
    qrExpiry,
    status: 'active'
  });

  // Emit real-time event via socket (handled in server.js)
  req.app.get('io')?.to(`faculty_${req.user._id}`).emit('session_started', {
    sessionId: session._id,
    sessionCode: session.sessionCode
  });

  await session.populate('course', 'name code');

  res.status(201).json({
    success: true,
    message: 'Attendance session started.',
    data: { session }
  });
});

// @desc    End attendance session
// @route   PUT /api/attendance/sessions/:sessionId/end
// @access  Faculty
const endSession = asyncHandler(async (req, res) => {
  const session = await AttendanceSession.findById(req.params.sessionId);
  if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

  if (session.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const presentCount = await AttendanceRecord.countDocuments({
    session: session._id,
    status: 'present'
  });

  session.status = 'completed';
  session.endTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  session.presentCount = presentCount;
  await session.save();

  // Check for low attendance students and send alerts
  checkAndAlertLowAttendance(session).catch(console.error);

  res.json({
    success: true,
    message: 'Session ended.',
    data: { session, presentCount }
  });
});

// @desc    Get active session for a faculty member
// @route   GET /api/attendance/sessions/active
// @access  Faculty
const getActiveSession = asyncHandler(async (req, res) => {
  const session = await AttendanceSession.findOne({
    faculty: req.user._id,
    status: 'active'
  }).populate('course', 'name code');

  res.json({ success: true, data: { session } });
});

// @desc    Get sessions (faculty: own, admin: all)
// @route   GET /api/attendance/sessions
// @access  Faculty / Admin
const getSessions = asyncHandler(async (req, res) => {
  const { courseId, date } = req.query;
  const { getPaginationParams } = require('../utils/validation');
  const { page, limit, skip } = getPaginationParams(req.query); // SECURITY FIX: Validate pagination

  const filter = {};
  if (req.user.role === 'faculty') filter.faculty = req.user._id;
  if (courseId) filter.course = courseId;
  if (date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  const total = await AttendanceSession.countDocuments(filter);
  const sessions = await AttendanceSession.find(filter)
    .populate('course', 'name code')
    .populate('faculty', 'name')
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ success: true, data: { sessions, total, page, limit } });
});

// ===== ATTENDANCE RECORDS =====

// @desc    Mark attendance for a single student (manual/override)
// @route   POST /api/attendance/mark
// @access  Faculty
const markAttendance = asyncHandler(async (req, res) => {
  const { sessionId, studentId, status, method = 'manual', isOverride = false, overrideReason } = req.body;

  const session = await AttendanceSession.findById(sessionId).populate('course');
  if (!session || session.status !== 'active') {
    return res.status(400).json({ success: false, message: 'No active session found.' });
  }

  const existing = await AttendanceRecord.findOne({ session: sessionId, student: studentId });

  let record;
  if (existing) {
    existing.status = status;
    existing.method = isOverride ? 'manual' : method;
    existing.isManualOverride = isOverride;
    existing.overrideBy = req.user._id;
    existing.overrideReason = overrideReason;
    existing.checkInTime = status !== 'absent' ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;
    record = await existing.save();
  } else {
    record = await AttendanceRecord.create({
      session: sessionId,
      student: studentId,
      course: session.course._id,
      faculty: req.user._id,
      date: session.date,
      status,
      checkInTime: status !== 'absent' ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
      method,
      markedBy: isOverride ? 'faculty' : 'system',
      isManualOverride: isOverride,
      overrideBy: isOverride ? req.user._id : null,
      overrideReason
    });
  }

  // Emit real-time update
  req.app.get('io')?.to(`session_${sessionId}`).emit('attendance_marked', {
    studentId,
    status,
    method
  });

  res.status(201).json({ success: true, message: 'Attendance marked.', data: { record } });
});

// @desc    Bulk mark attendance (submit full session)
// @route   POST /api/attendance/bulk-mark
// @access  Faculty
const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { sessionId, records } = req.body;
  // records = [{ studentId, status, method }]

  const session = await AttendanceSession.findById(sessionId).populate('course');
  if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

  const ops = records.map(r => ({
    updateOne: {
      filter: { session: sessionId, student: r.studentId },
      update: {
        $set: {
          session: sessionId,
          student: r.studentId,
          course: session.course._id,
          faculty: req.user._id,
          date: session.date,
          status: r.status,
          method: r.method || 'manual',
          checkInTime: r.status !== 'absent' ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
          markedBy: 'faculty'
        }
      },
      upsert: true
    }
  }));

  const result = await AttendanceRecord.bulkWrite(ops);

  res.json({
    success: true,
    message: `Attendance saved for ${records.length} students.`,
    data: { modified: result.modifiedCount, created: result.upsertedCount }
  });
});

// @desc    Mark attendance via QR scan (student self-mark)
// @route   POST /api/attendance/qr-scan
// @access  Student
const qrScan = asyncHandler(async (req, res) => {
  const { sessionCode } = req.body;

  const session = await AttendanceSession.findOne({ sessionCode, status: 'active' }).populate('course');
  if (!session) return res.status(404).json({ success: false, message: 'Session not found or expired.' });

  // Check QR expiry
  if (session.qrExpiry && new Date() > session.qrExpiry) {
    return res.status(400).json({ success: false, message: 'QR code has expired.' });
  }

  // SECURITY FIX: Use upsert with unique compound index to prevent race condition
  // This is atomic at MongoDB level
  const record = await AttendanceRecord.findOneAndUpdate(
    {
      session: session._id,
      student: req.user._id
    },
    {
      $setOnInsert: {
        session: session._id,
        student: req.user._id,
        course: session.course._id,
        faculty: session.faculty,
        date: session.date,
        status: 'present',
        checkInTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        method: 'qr',
        markedBy: 'self',
        ipAddress: req.ip
      }
    },
    {
      upsert: true,
      new: true,
      runValidators: false
    }
  );

  // If record already existed (not newly inserted)
  if (record.method === 'qr' && new Date().getTime() - new Date(record.createdAt).getTime() < 1000) {
    // Record was just created (within last second)
  } else if (record.method === 'qr') {
    // Record already existed
    return res.status(409).json({ success: false, message: 'Attendance already marked.' });
  }

  req.app.get('io')?.to(`session_${session._id}`).emit('attendance_marked', {
    studentId: req.user._id,
    status: 'present',
    method: 'qr'
  });

  res.status(201).json({
    success: true,
    message: 'Attendance marked via QR. You are marked present!',
    data: { record }
  });
});

// @desc    Process face recognition result from AI service
// @route   POST /api/attendance/face-result
// @access  System (from AI service, internal)
const processFaceResult = asyncHandler(async (req, res) => {
  const { sessionId, studentId, confidence, status = 'present' } = req.body;

  const session = await AttendanceSession.findById(sessionId).populate('course');
  if (!session || session.status !== 'active') {
    return res.status(400).json({ success: false, message: 'No active session.' });
  }

  const existing = await AttendanceRecord.findOne({ session: sessionId, student: studentId });
  if (existing) return res.json({ success: true, message: 'Already marked.', data: { record: existing } });

  const record = await AttendanceRecord.create({
    session: sessionId,
    student: studentId,
    course: session.course._id,
    faculty: session.faculty,
    date: session.date,
    status,
    checkInTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    method: 'face',
    confidence,
    markedBy: 'system'
  });

  req.app.get('io')?.to(`session_${sessionId}`).emit('attendance_marked', {
    studentId, status, method: 'face', confidence
  });

  res.status(201).json({ success: true, data: { record } });
});

// ===== REPORTS & ANALYTICS =====

// @desc    Get attendance for a student
// @route   GET /api/attendance/student/:studentId
// @access  Student (own) / Faculty / Admin / Parent (linked student)
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { courseId, startDate, endDate, page = 1, limit = 50 } = req.query;
  const studentId = req.params.studentId;

  // Auth check
  if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const filter = { student: studentId };
  if (courseId) filter.course = courseId;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const records = await AttendanceRecord.find(filter)
    .populate('course', 'name code')
    .populate('session', 'method room')
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await AttendanceRecord.countDocuments(filter);

  res.json({ success: true, data: { records, total } });
});

// @desc    Get course-wise attendance summary for a student
// @route   GET /api/attendance/student/:studentId/summary
// @access  Student / Faculty / Admin / Parent
const getStudentSummary = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  const summary = await AttendanceRecord.aggregate([
    { $match: { student: require('mongoose').Types.ObjectId.createFromHexString(studentId) } },
    { $group: {
      _id: '$course',
      total: { $sum: 1 },
      present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
      absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
      late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
    }},
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseInfo' } },
    { $unwind: '$courseInfo' },
    { $project: {
      course: '$courseInfo',
      total: 1, present: 1, absent: 1, late: 1,
      percentage: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] }
    }},
    { $sort: { 'course.code': 1 } }
  ]);

  const overall = summary.length > 0
    ? Math.round(summary.reduce((a, s) => a + s.percentage, 0) / summary.length)
    : 0;

  res.json({ success: true, data: { summary, overall } });
});

// @desc    Get class report for a session/course
// @route   GET /api/attendance/sessions/:sessionId/records
// @access  Faculty / Admin
const getSessionRecords = asyncHandler(async (req, res) => {
  const records = await AttendanceRecord.find({ session: req.params.sessionId })
    .populate('student', 'name email studentProfile profilePhoto')
    .sort({ 'student.studentProfile.rollNo': 1 });

  res.json({ success: true, data: { records, count: records.length } });
});

// @desc    Get department-wide analytics
// @route   GET /api/attendance/analytics/department
// @access  Admin
const getDeptAnalytics = asyncHandler(async (req, res) => {
  const { deptId, startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  const stats = await AttendanceRecord.aggregate([
    { $match: matchStage },
    { $lookup: { from: 'users', localField: 'student', foreignField: '_id', as: 'studentInfo' } },
    { $unwind: '$studentInfo' },
    ...(deptId ? [{ $match: { 'studentInfo.department': require('mongoose').Types.ObjectId.createFromHexString(deptId) } }] : []),
    { $group: {
      _id: '$studentInfo.department',
      total: { $sum: 1 },
      present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } }
    }},
    { $project: {
      total: 1, present: 1,
      percentage: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] }
    }},
    { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'deptInfo' } },
    { $unwind: { path: '$deptInfo', preserveNullAndEmpty: true } }
  ]);

  res.json({ success: true, data: { stats } });
});

// @desc    Get at-risk students
// @route   GET /api/attendance/analytics/at-risk
// @access  Admin / Faculty
const getAtRiskStudents = asyncHandler(async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 75;

  const summary = await AttendanceRecord.aggregate([
    { $group: {
      _id: { student: '$student', course: '$course' },
      total: { $sum: 1 },
      present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } }
    }},
    { $project: {
      student: '$_id.student',
      course: '$_id.course',
      percentage: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] }
    }},
    { $match: { percentage: { $lt: threshold } } },
    { $lookup: { from: 'users', localField: 'student', foreignField: '_id', as: 'studentInfo' } },
    { $unwind: '$studentInfo' },
    { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseInfo' } },
    { $unwind: '$courseInfo' },
    { $project: {
      percentage: 1,
      student: { name: '$studentInfo.name', email: '$studentInfo.email', rollNo: '$studentInfo.studentProfile.rollNo' },
      course: { name: '$courseInfo.name', code: '$courseInfo.code' }
    }},
    { $sort: { percentage: 1 } }
  ]);

  res.json({ success: true, data: { students: summary, count: summary.length, threshold } });
});

// ===== HELPERS =====

async function checkAndAlertLowAttendance(session) {
  try {
    const records = await AttendanceRecord.find({ session: session._id })
      .populate('student', 'name email');

    for (const record of records) {
      if (!record.student) continue;

      // Calculate overall attendance for this student-course
      const allRecords = await AttendanceRecord.find({
        student: record.student._id,
        course: session.course
      });

      if (allRecords.length < 5) continue; // Don't alert too early

      const presentCount = allRecords.filter(r => ['present', 'late'].includes(r.status)).length;
      const percent = Math.round((presentCount / allRecords.length) * 100);

      if (percent < 75) {
        // Create in-app notification
        await Notification.create({
          recipient: record.student._id,
          type: 'low_attendance',
          title: '⚠️ Low Attendance Alert',
          message: `Your attendance has dropped below 75% in ${session.course.name || 'a course'}.`,
          sentVia: ['app']
        });

        // Send email alert (non-blocking)
        sendLowAttendanceAlert(
          record.student.email,
          record.student.name,
          session.course.name || 'Course',
          percent
        ).catch(console.error);
      }
    }
  } catch (err) {
    console.error('Low attendance check error:', err.message);
  }
}

module.exports = {
  startSession, endSession, getActiveSession, getSessions,
  markAttendance, bulkMarkAttendance, qrScan, processFaceResult,
  getStudentAttendance, getStudentSummary, getSessionRecords,
  getDeptAnalytics, getAtRiskStudents
};
