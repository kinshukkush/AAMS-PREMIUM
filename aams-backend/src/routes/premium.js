/**
 * Premium Features Routes
 * Late detection, analytics, heatmaps, etc.
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const premiumFeaturesService = require('../services/premiumFeaturesService');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');

/**
 * Get student's attendance heatmap (heat calendar)
 * GET /api/premium/heatmap
 */
router.get('/heatmap', protect, async (req, res) => {
  try {
    const { weeks = 4 } = req.query;
    const userId = req.user._id;

    const heatmap = await premiumFeaturesService.getAttendanceHeatmap(userId, parseInt(weeks));
    res.json({ success: true, heatmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get advanced analytics report
 * GET /api/premium/analytics
 */
router.get('/analytics', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    const start = new Date(startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const end = new Date(endDate || new Date());

    const report = await premiumFeaturesService.generateAnalyticsReport(userId, start, end);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Detect anomalies in attendance pattern
 * GET /api/premium/anomalies
 */
router.get('/anomalies', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const anomalies = await premiumFeaturesService.detectAnomalies(userId);
    res.json({ success: true, anomalies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get engagement metrics (consistency, punctuality scores)
 * GET /api/premium/engagement
 */
router.get('/engagement', protect, async (req, res) => {
  try {
    const { courseId } = req.query;
    const userId = req.user._id;
    const metrics = await premiumFeaturesService.getEngagementMetrics(
      userId,
      courseId || null
    );
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get class-level analytics (for faculty)
 * GET /api/premium/class-analytics/:sessionId
 */
router.get('/class-analytics/:sessionId', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const analytics = await premiumFeaturesService.getClassAnalytics(sessionId);
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get late arrival statistics
 * GET /api/premium/late-stats
 */
router.get('/late-stats', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    const start = new Date(startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const end = new Date(endDate || new Date());

    const lateAttendances = await AttendanceRecord.find({
      student: userId,
      status: 'late',
      timestamp: { $gte: start, $lte: end }
    }).populate('session', 'name course startTime');

    const stats = {
      totalLateArrivals: lateAttendances.length,
      averageLateMinutes: lateAttendances.length
        ? (
            lateAttendances.reduce((sum, a) => {
              return sum + (new Date(a.timestamp) - new Date(a.sessionId.startTime)) / 60000;
            }, 0) / lateAttendances.length
          ).toFixed(2)
        : 0,
      latestArrivals: lateAttendances.slice(0, 5)
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get comparative analytics (vs class average)
 * GET /api/premium/comparative-analytics
 */
router.get('/comparative-analytics', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.query;

    const userAttendance = await AttendanceRecord.find({
      student: userId,
      course: courseId
    });

    const classAttendance = await AttendanceRecord.find({
      course: courseId
    });

    const userPercentage =
      userAttendance.length > 0
        ? (
            userAttendance.filter((a) => a.status !== 'absent').length /
            userAttendance.length
          ) * 100
        : 0;

    const classPercentage =
      classAttendance.length > 0
        ? (
            classAttendance.filter((a) => a.status !== 'absent').length /
            classAttendance.length
          ) * 100
        : 0;

    res.json({
      success: true,
      analytics: {
        userAttendancePercentage: userPercentage.toFixed(2),
        classAveragePercentage: classPercentage.toFixed(2),
        difference: (userPercentage - classPercentage).toFixed(2),
        userRank: 'calculating...'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Validate geolocation for attendance
 * POST /api/premium/validate-location
 */
router.post('/validate-location', protect, async (req, res) => {
  try {
    const { userLocation, sessionId } = req.body;

    if (!userLocation || !sessionId) {
      return res.status(400).json({ error: 'Missing userLocation or sessionId' });
    }

    const session = await AttendanceSession.findById(sessionId);
    if (!session || !session.location) {
      return res.status(404).json({ error: 'Session not found or location not set' });
    }

    const isValid = premiumFeaturesService.validateGeolocation(userLocation, session.location);

    if (!isValid) {
      const distance = premiumFeaturesService.calculateDistance(
        userLocation,
        session.location
      );
      return res.json({
        success: false,
        valid: false,
        message: 'Outside attendance location',
        distance: distance.toFixed(3)
      });
    }

    res.json({
      success: true,
      valid: true,
      message: 'Location validated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
