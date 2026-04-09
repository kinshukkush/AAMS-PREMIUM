/**
 * Premium Features Tests
 * Tests for analytics, heatmaps, anomalies, and engagement metrics
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

describe('Premium Features Routes', () => {
  let facultyToken, adminToken, studentToken;
  let facultyId, courseId;

  beforeEach(() => {
    facultyId = new mongoose.Types.ObjectId();
    courseId = new mongoose.Types.ObjectId();

    facultyToken = jwt.sign(
      { _id: facultyId, role: 'faculty' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { _id: new mongoose.Types.ObjectId(), role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    studentToken = jwt.sign(
      { _id: new mongoose.Types.ObjectId(), role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/premium/analytics', () => {
    test('should fetch analytics report for date range', async () => {
      const response = await request(app)
        .get('/api/premium/analytics')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('report');
      expect(response.body.data.report).toHaveProperty('totalClasses');
      expect(response.body.data.report).toHaveProperty('totalPresent');
      expect(response.body.data.report).toHaveProperty('averageAttendance');
    });

    test('should require faculty or admin role', async () => {
      const response = await request(app)
        .get('/api/premium/analytics')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Forbidden');
    });

    test('should validate date range format', async () => {
      const response = await request(app)
        .get('/api/premium/analytics')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({
          startDate: 'invalid-date',
          endDate: '2024-12-31'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('date');
    });

    test('should calculate analytics for specific course', async () => {
      const response = await request(app)
        .get('/api/premium/analytics')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({
          courseId,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.report.course).toBe(courseId.toString());
    });
  });

  describe('GET /api/premium/heatmap', () => {
    test('should fetch attendance heatmap', async () => {
      const response = await request(app)
        .get('/api/premium/heatmap')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({ weeks: 4 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('heatmap');
      expect(Array.isArray(response.body.data.heatmap)).toBe(true);
    });

    test('should support different week ranges', async () => {
      const response1 = await request(app)
        .get('/api/premium/heatmap')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({ weeks: 2 });

      const response2 = await request(app)
        .get('/api/premium/heatmap')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({ weeks: 12 });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.data.heatmap.length).toBeLessThan(response2.body.data.heatmap.length);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/premium/heatmap');

      expect(response.status).toBe(401);
    });

    test('should include student insights', async () => {
      const response = await request(app)
        .get('/api/premium/heatmap')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.heatmap[0]).toHaveProperty('studentId');
      expect(response.body.data.heatmap[0]).toHaveProperty('presentDays');
      expect(response.body.data.heatmap[0]).toHaveProperty('absentDays');
      expect(response.body.data.heatmap[0]).toHaveProperty('percentage');
    });
  });

  describe('GET /api/premium/anomalies', () => {
    test('should detect low attendance anomalies', async () => {
      const response = await request(app)
        .get('/api/premium/anomalies')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('anomalies');
      expect(Array.isArray(response.body.data.anomalies)).toBe(true);
    });

    test('should identify students below 75% attendance', async () => {
      const response = await request(app)
        .get('/api/premium/anomalies')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      const anomalies = response.body.data.anomalies;
      
      anomalies.forEach(anomaly => {
        expect(anomaly).toHaveProperty('studentId');
        expect(anomaly).toHaveProperty('percentage');
        expect(anomaly.percentage).toBeLessThan(75);
        expect(anomaly).toHaveProperty('severity'); // 'low', 'medium', 'high'
      });
    });

    test('should only show anomalies for faculty courses', async () => {
      const response = await request(app)
        .get('/api/premium/anomalies')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      // All anomalies should be for faculty's courses
      const anomalies = response.body.data.anomalies;
      anomalies.forEach(a => {
        expect(a.courseId).toBeDefined();
      });
    });

    test('should include reason for anomaly', async () => {
      const response = await request(app)
        .get('/api/premium/anomalies')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      const anomalies = response.body.data.anomalies;
      anomalies.forEach(a => {
        expect(a).toHaveProperty('reason');
        expect(['low_attendance', 'repeated_absence', 'late_entries'].includes(a.reason)).toBe(true);
      });
    });
  });

  describe('GET /api/premium/engagement', () => {
    test('should fetch engagement metrics globally', async () => {
      const response = await request(app)
        .get('/api/premium/engagement')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('metrics');
      expect(response.body.data.metrics).toHaveProperty('averageAttendance');
      expect(response.body.data.metrics).toHaveProperty('engagementScore');
    });

    test('should fetch engagement for specific course', async () => {
      const response = await request(app)
        .get('/api/premium/engagement')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({ courseId });

      expect(response.status).toBe(200);
      expect(response.body.data.metrics.course).toBe(courseId.toString());
    });

    test('should include top and bottom performers', async () => {
      const response = await request(app)
        .get('/api/premium/engagement')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.metrics).toHaveProperty('topPerformers');
      expect(response.body.data.metrics).toHaveProperty('bottomPerformers');
      expect(Array.isArray(response.body.data.metrics.topPerformers)).toBe(true);
    });

    test('should calculate engagement score 0-100', async () => {
      const response = await request(app)
        .get('/api/premium/engagement')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      const score = response.body.data.metrics.engagementScore;
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /api/premium/class-analytics/:sessionId', () => {
    test('should fetch class-level analytics', async () => {
      const sessionId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/premium/class-analytics/${sessionId}`)
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('totalStudents');
      expect(response.body.data).toHaveProperty('present');
      expect(response.body.data).toHaveProperty('absent');
    });

    test('should include per-student breakdown', async () => {
      const sessionId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/premium/class-analytics/${sessionId}`)
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('students');
      expect(Array.isArray(response.body.data.students)).toBe(true);
    });

    test('should only allow faculty to view their sessions', async () => {
      const anotherFacultyToken = jwt.sign(
        { _id: new mongoose.Types.ObjectId(), role: 'faculty' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const sessionId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/premium/class-analytics/${sessionId}`)
        .set('Authorization', `Bearer ${anotherFacultyToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('not authorized');
    });

    test('should work for admin viewing any session', async () => {
      const sessionId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/premium/class-analytics/${sessionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/premium/attendance-stats', () => {
    test('should get overall attendance statistics', async () => {
      const response = await request(app)
        .get('/api/premium/attendance-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalStudents');
      expect(response.body.data).toHaveProperty('averageAttendance');
      expect(response.body.data).toHaveProperty('lowAttendanceCount');
    });

    test('should identify students needing intervention', async () => {
      const response = await request(app)
        .get('/api/premium/attendance-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('needingIntervention');
      expect(Array.isArray(response.body.data.needingIntervention)).toBe(true);
    });

    test('should show trends over time', async () => {
      const response = await request(app)
        .get('/api/premium/attendance-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('weeklyTrend');
      expect(Array.isArray(response.body.data.weeklyTrend)).toBe(true);
    });

    test('should require admin role', async () => {
      const response = await request(app)
        .get('/api/premium/attendance-stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Premium Features Security', () => {
    test('should validate date parameters prevent injection', async () => {
      const response = await request(app)
        .get('/api/premium/analytics')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({
          startDate: '2024-01-01"; db.users.drop(); //',
          endDate: '2024-12-31'
        });

      expect(response.status).toBe(400);
      // Request should be rejected, not execute malicious code
    });

    test('should sanitize course ID parameters', async () => {
      const response = await request(app)
        .get('/api/premium/heatmap')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({
          courseId: '{"$ne": null}'
        });

      expect(response.status).toBe(400);
    });

    test('should enforce rate limiting on analytics', async () => {
      // Make multiple rapid requests
      for (let i = 0; i < 200; i++) {
        await request(app)
          .get('/api/premium/analytics')
          .set('Authorization', `Bearer ${facultyToken}`)
          .query({
            startDate: '2024-01-01',
            endDate: '2024-12-31'
          });
      }

      const response = await request(app)
        .get('/api/premium/analytics')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(response.status).toBe(429);
    });
  });
});
