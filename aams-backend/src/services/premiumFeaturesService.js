/**
 * Premium Features Service
 * Late detection, geolocation validation, analytics, etc.
 */

const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');
const User = require('../models/User');

class PremiumFeaturesService {
  /**
   * Check if attendance is late
   */
  isLateAttendance(sessionStartTime, attendanceTime) {
    const start = new Date(sessionStartTime);
    const arrival = new Date(attendanceTime);
    const lateThresholdMinutes = parseInt(process.env.LATE_THRESHOLD_MINUTES) || 5;
    const diffMinutes = (arrival - start) / 60000;
    return diffMinutes > lateThresholdMinutes;
  }

  /**
   * Get attendance status based on time
   */
  getAttendanceStatus(sessionStartTime, attendanceTime) {
    const start = new Date(sessionStartTime);
    const arrival = new Date(attendanceTime);
    const lateThreshold = (process.env.LATE_THRESHOLD_MINUTES || 5) * 60000;
    const diff = arrival - start;

    if (diff < 0) return 'early';
    if (diff <= lateThreshold) return 'present';
    return 'late';
  }

  /**
   * Validate geolocation (if enabled)
   */
  validateGeolocation(userLocation, sessionLocation) {
    if (!process.env.ENABLE_GEOLOCATION || process.env.ENABLE_GEOLOCATION === 'false') {
      return true; // Disabled, always valid
    }

    if (!userLocation || !sessionLocation) {
      return false;
    }

    const maxDistance = parseFloat(process.env.GEOLOCATION_RADIUS_KM) || 0.5; // 500 meters default
    const distance = this.calculateDistance(userLocation, sessionLocation);
    return distance <= maxDistance;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(location1, location2) {
    const toRad = (deg) => deg * (Math.PI / 180);
    const R = 6371; // Earth's radius in km

    const lat1 = location1.latitude || location1.lat;
    const lon1 = location1.longitude || location1.lng;
    const lat2 = location2.latitude || location2.lat;
    const lon2 = location2.longitude || location2.lng;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get daily attendance statistics
   */
  async getDailyStats(sessionId) {
    const attendance = await AttendanceRecord.find({
      sessionId,
      status: { $in: ['present', 'late'] }
    });

    const stats = {
      totalPresent: attendance.length,
      lateCount: attendance.filter((a) => a.status === 'late').length,
      presentOnTime: attendance.filter((a) => a.status === 'present').length,
      averageArrivalTime: this.calculateAverageArrival(attendance)
    };

    return stats;
  }

  /**
   * Calculate average arrival time relative to session start
   */
  calculateAverageArrival(attendances) {
    if (!attendances.length) return 0;
    const totalMinutes = attendances.reduce((sum, a) => {
      return sum + (new Date(a.timestamp) - new Date(a.session.startTime)) / 60000;
    }, 0);
    return Math.round(totalMinutes / attendances.length);
  }

  /**
   * Get attendance heatmap data (weekly pattern)
   */
  async getAttendanceHeatmap(userId, weeks = 4) {
    const now = new Date();
    const startDate = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

    const attendance = await AttendanceRecord.find({
      studentId: userId,
      timestamp: { $gte: startDate }
    }).populate('sessionId');

    const heatmapData = {};
    for (let i = 0; i < weeks * 7; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      heatmapData[dateStr] = 0;
    }

    attendance.forEach((record) => {
      const dateStr = new Date(record.timestamp).toISOString().split('T')[0];
      if (heatmapData[dateStr] !== undefined) {
        heatmapData[dateStr]++;
      }
    });

    return heatmapData;
  }

  /**
   * Generate advanced analytics report
   */
  async generateAnalyticsReport(userId, startDate, endDate) {
    const attendance = await AttendanceRecord.find({
      studentId: userId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).populate('sessionId');

    const report = {
      totalSessions: attendance.length,
      presentCount: attendance.filter((a) => a.status === 'present').length,
      lateCount: attendance.filter((a) => a.status === 'late').length,
      absentCount: 0,
      attendancePercentage: 0,
      trends: {}
    };

    if (attendance.length > 0) {
      report.attendancePercentage = (
        ((report.presentCount + report.lateCount) / attendance.length) *
        100
      ).toFixed(2);
    }

    // Weekly trends
    const weeks = {};
    attendance.forEach((record) => {
      const date = new Date(record.timestamp);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = { present: 0, late: 0, total: 0 };
      }
      if (record.status === 'present') weeks[weekKey].present++;
      if (record.status === 'late') weeks[weekKey].late++;
      weeks[weekKey].total++;
    });

    report.trends = weeks;
    return report;
  }

  /**
   * Detect and flag abnormal patterns
   */
  async detectAnomalies(userId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const attendance = await AttendanceRecord.find({
      studentId: userId,
      timestamp: { $gte: thirtyDaysAgo }
    });

    const anomalies = [];

    // Check for sudden increase in late arrivals
    const recentLate = attendance.filter((a) => a.status === 'late').length;
    if (recentLate > 10) {
      anomalies.push({
        type: 'excessive_late_arrivals',
        severity: 'warning',
        message: `${recentLate} late arrivals in last 30 days`,
        value: recentLate
      });
    }

    // Check for attendance drop
    const week1 = attendance.filter((a) => {
      const date = new Date(a.timestamp);
      return date > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    }).length;

    const week2 = attendance.filter((a) => {
      const date = new Date(a.timestamp);
      return date <= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    }).length;

    if (week2 > 0 && week1 / week2 < 0.5) {
      anomalies.push({
        type: 'attendance_drop',
        severity: 'critical',
        message: 'Significant drop in attendance',
        value: (week1 / week2).toFixed(2)
      });
    }

    return anomalies;
  }

  /**
   * Get student engagement metrics
   */
  async getEngagementMetrics(userId, courseId = null) {
    const query = { studentId: userId };
    if (courseId) {
      query.courseId = courseId;
    }

    const attendance = await AttendanceRecord.find(query).populate('sessionId');

    const metrics = {
      consistencyScore: 0,
      punctualityScore: 0,
      engagementScore: 0
    };

    if (attendance.length === 0) {
      return metrics;
    }

    // Consistency: frequency of attendance
    metrics.consistencyScore = Math.min(
      100,
      (attendance.filter((a) => a.status !== 'absent').length / attendance.length) * 100
    );

    // Punctuality: percentage of on-time arrivals
    metrics.punctualityScore = Math.min(
      100,
      (attendance.filter((a) => a.status === 'present').length / attendance.length) * 100
    );

    // Engagement: weighted score combining both
    metrics.engagementScore = (
      metrics.consistencyScore * 0.6 +
      metrics.punctualityScore * 0.4
    ).toFixed(2);

    return metrics;
  }

  /**
   * Generate class-level analytics
   */
  async getClassAnalytics(sessionId) {
    const attendance = await AttendanceRecord.find({
      sessionId
    }).populate('studentId');

    const total = attendance.length;
    const present = attendance.filter((a) => a.status === 'present').length;
    const late = attendance.filter((a) => a.status === 'late').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;

    const topStudents = attendance
      .filter((a) => a.status === 'present')
      .slice(0, 5)
      .map((a) => ({
        id: a.studentId._id,
        name: a.studentId.name,
        time: new Date(a.timestamp)
      }));

    return {
      total,
      present,
      late,
      absent,
      presentPercentage: ((present / total) * 100).toFixed(2),
      latePercentage: ((late / total) * 100).toFixed(2),
      absentPercentage: ((absent / total) * 100).toFixed(2),
      topStudents
    };
  }
}

module.exports = new PremiumFeaturesService();
