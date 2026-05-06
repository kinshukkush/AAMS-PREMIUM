const express = require('express');
const router = express.Router();
const {
  startSession, closeSession, getSessionStudents, refreshQrToken, getActiveSession, getSessions,
  markAttendance, bulkMarkAttendance, markQr, markFace,
  getStudentAttendance, getStudentSummary, getSessionRecords,
  getDeptAnalytics, getAtRiskStudents
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateFaceResult,
  validateMarkAttendance,
  validateQRScan,
  validatePagination,
  validateStudentIdParam,
  validateSessionIdParam
} = require('../validators/attendance');

router.use(protect);

// ---- Session routes ----
router.post('/sessions/start', authorize('teacher', 'admin'), startSession);
router.get('/sessions/active', authorize('teacher', 'admin'), getActiveSession);
router.get('/sessions', authorize('teacher', 'admin'), validatePagination, getSessions);
router.post('/sessions/:sessionId/close', authorize('teacher', 'admin'), validateSessionIdParam, closeSession);
router.get('/sessions/:sessionId/records', authorize('teacher', 'admin'), validateSessionIdParam, getSessionRecords);
router.get('/sessions/:sessionId/students', authorize('teacher', 'admin'), validateSessionIdParam, getSessionStudents);
router.post('/sessions/:sessionId/qr/refresh', authorize('teacher', 'admin'), validateSessionIdParam, refreshQrToken);

// ---- Marking routes ----
router.post('/mark', authorize('teacher', 'admin'), validateMarkAttendance, markAttendance);
router.post('/bulk-mark', authorize('teacher', 'admin'), validateMarkAttendance, bulkMarkAttendance);
router.post('/mark-qr', authorize('student'), validateQRScan, markQr);
router.post('/mark-face', authorize('teacher', 'admin', 'student'), validateFaceResult, markFace);

// ---- Student records ----
router.get('/student/:studentId', validateStudentIdParam, getStudentAttendance);
router.get('/student/:studentId/summary', validateStudentIdParam, validatePagination, getStudentSummary);

// ---- Analytics ----
router.get('/analytics/department', authorize('admin'), getDeptAnalytics);
router.get('/analytics/at-risk', authorize('admin', 'teacher'), getAtRiskStudents);

module.exports = router;
