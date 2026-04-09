const express = require('express');
const router = express.Router();
const {
  startSession, endSession, getActiveSession, getSessions,
  markAttendance, bulkMarkAttendance, qrScan, processFaceResult,
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
router.post('/sessions/start', authorize('faculty', 'admin'), startSession);
router.get('/sessions/active', authorize('faculty', 'admin'), getActiveSession);
router.get('/sessions', authorize('faculty', 'admin'), validatePagination, getSessions);
router.put('/sessions/:sessionId/end', authorize('faculty', 'admin'), validateSessionIdParam, endSession);
router.get('/sessions/:sessionId/records', authorize('faculty', 'admin'), validateSessionIdParam, getSessionRecords);

// ---- Marking routes ----
router.post('/mark', authorize('faculty', 'admin'), validateMarkAttendance, markAttendance);
router.post('/bulk-mark', authorize('faculty', 'admin'), validateMarkAttendance, bulkMarkAttendance);
router.post('/qr-scan', authorize('student'), validateQRScan, qrScan);
router.post('/face-result', authorize('faculty', 'admin'), validateFaceResult, processFaceResult);

// ---- Student records ----
router.get('/student/:studentId', validateStudentIdParam, getStudentAttendance);
router.get('/student/:studentId/summary', validateStudentIdParam, validatePagination, getStudentSummary);

// ---- Analytics ----
router.get('/analytics/department', authorize('admin'), getDeptAnalytics);
router.get('/analytics/at-risk', authorize('admin', 'faculty'), getAtRiskStudents);

module.exports = router;
