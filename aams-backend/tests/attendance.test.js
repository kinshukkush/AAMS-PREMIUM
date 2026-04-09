/**
 * Attendance Tests
 * Tests for marking and retrieving attendance records
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { createAttendanceRecord, createAttendanceSession, createMultipleAttendanceRecords } = require('../factories/attendanceFactory');
const { createUser, createFacultyUser } = require('../factories/userFactory');

const app = express();
app.use(express.json());

describe('Attendance Routes', () => {
  let studentToken, facultyToken, adminToken;
  let studentId, facultyId, courseId, sessionId;

  beforeEach(() => {
    studentId = new mongoose.Types.ObjectId();
    facultyId = new mongoose.Types.ObjectId();
    courseId = new mongoose.Types.ObjectId();
    sessionId = new mongoose.Types.ObjectId();

    studentToken = jwt.sign(
      { _id: studentId, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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
  });

  describe('POST /api/attendance/mark', () => {
    test('should mark manual attendance with valid data', async () => {
      const response = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
          type: 'manual',
          status: 'present'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('attendance');
      expect(response.body.data.attendance.type).toBe('manual');
      expect(response.body.data.attendance.status).toBe('present');
    });

    test('should fail to mark attendance without authentication', async () => {
      const response = await request(app)
        .post('/api/attendance/mark')
        .send({
          courseId,
          type: 'manual',
          status: 'present'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Not authorized');
    });

    test('should prevent duplicate attendance marking within 5 minutes', async () => {
      // First marking
      await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
          type: 'manual',
          status: 'present'
        });

      // Attempt duplicate within 5 minutes
      const response = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
          type: 'manual',
          status: 'present'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already marked');
    });

    test('should fail with invalid course ID', async () => {
      const response = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 'invalid-id',
          type: 'manual',
          status: 'present'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should rate limit attendance marking', async () => {
      // Attempt 100+ markings within 1 minute
      for (let i = 0; i < 100; i++) {
        await request(app)
          .post('/api/attendance/mark')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            courseId: new mongoose.Types.ObjectId(),
            type: 'manual',
            status: 'present'
          });
      }

      // 101st attempt should be rate limited
      const response = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: new mongoose.Types.ObjectId(),
          type: 'manual',
          status: 'present'
        });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Too many');
    });
  });

  describe('POST /api/attendance/qr', () => {
    test('should mark QR attendance with valid QR code', async () => {
      const response = await request(app)
        .post('/api/attendance/qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'QR-abc123xyz789',
          sessionId
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.attendance.type).toBe('qr');
      expect(response.body.message).toContain('marked');
    });

    test('should fail with invalid QR code', async () => {
      const response = await request(app)
        .post('/api/attendance/qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'INVALID-QR',
          sessionId
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('QR code not found');
    });

    test('should fail with expired session', async () => {
      const response = await request(app)
        .post('/api/attendance/qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'QR-expired',
          sessionId
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Session ended');
    });

    test('should prevent duplicate QR marking', async () => {
      // First marking
      await request(app)
        .post('/api/attendance/qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'QR-abc123xyz789',
          sessionId
        });

      // Attempt duplicate
      const response = await request(app)
        .post('/api/attendance/qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'QR-abc123xyz789',
          sessionId
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already marked');
    });
  });

  describe('POST /api/attendance/face', () => {
    test('should mark face attendance with recognized face', async () => {
      const response = await request(app)
        .post('/api/attendance/face')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sessionId,
          faceEncoding: [0.1, 0.2, 0.3, 0.4, 0.5],
          confidence: 0.92
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.attendance.type).toBe('face');
    });

    test('should fall back to manual with low confidence', async () => {
      const response = await request(app)
        .post('/api/attendance/face')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sessionId,
          faceEncoding: [0.1, 0.2, 0.3],
          confidence: 0.65  // Below 80% threshold
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('mark manually');
    });

    test('should fail with missing face encoding', async () => {
      const response = await request(app)
        .post('/api/attendance/face')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sessionId
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Face encoding required');
    });

    test('should rate limit face operations', async () => {
      // Attempt 30+ face recognitions within 1 minute
      for (let i = 0; i < 30; i++) {
        await request(app)
          .post('/api/attendance/face')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            sessionId,
            faceEncoding: [0.1, 0.2, 0.3, 0.4, 0.5],
            confidence: 0.92
          });
      }

      // 31st attempt should be rate limited
      const response = await request(app)
        .post('/api/attendance/face')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sessionId,
          faceEncoding: [0.1, 0.2, 0.3, 0.4, 0.5],
          confidence: 0.92
        });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Too many');
    });
  });

  describe('GET /api/attendance', () => {
    test('should get attendance records for date range', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.attendance)).toBe(true);
    });

    test('should get attendance by course', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ courseId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({
          page: 1,
          limit: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('limit');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/attendance');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/attendance/stats', () => {
    test('should get attendance statistics for student', async () => {
      const response = await request(app)
        .get('/api/attendance/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalClasses');
      expect(response.body.data).toHaveProperty('present');
      expect(response.body.data).toHaveProperty('absent');
      expect(response.body.data).toHaveProperty('percentage');
    });

    test('should get course-specific statistics', async () => {
      const response = await request(app)
        .get('/api/attendance/stats')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ courseId });

      expect(response.status).toBe(200);
      expect(response.body.data.course).toBe(courseId.toString());
    });

    test('should calculate attendance percentage correctly', async () => {
      const response = await request(app)
        .get('/api/attendance/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      const { present, totalClasses, percentage } = response.body.data;
      const expectedPercentage = (present / totalClasses) * 100;
      expect(percentage).toBe(expectedPercentage);
    });

    test('should alert if attendance below 75%', async () => {
      const response = await request(app)
        .get('/api/attendance/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      if (response.body.data.percentage < 75) {
        expect(response.body.data).toHaveProperty('alert');
        expect(response.body.data.alert).toBe(true);
      }
    });
  });

  describe('PUT /api/attendance/:id', () => {
    test('should allow faculty to update attendance status', async () => {
      // Create attendance first
      const attendanceId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ status: 'absent' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.attendance.status).toBe('absent');
    });

    test('should not allow student to update attendance', async () => {
      const attendanceId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'absent' });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Forbidden');
    });

    test('should fail with invalid attendance ID', async () => {
      const response = await request(app)
        .put('/api/attendance/invalid-id')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ status: 'absent' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/attendance/bulk-import', () => {
    test('should bulk import attendance records', async () => {
      const records = createMultipleAttendanceRecords(10, { course: courseId });

      const response = await request(app)
        .post('/api/attendance/bulk-import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ records });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.imported).toBe(10);
    });

    test('should validate attendance data during bulk import', async () => {
      const invalidRecords = [
        { student: '', course: courseId },
        { student: studentId, course: '' }
      ];

      const response = await request(app)
        .post('/api/attendance/bulk-import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ records: invalidRecords });

      expect(response.status).toBe(400);
      expect(response.body.data.errors.length).toBeGreaterThan(0);
    });

    test('should require admin role', async () => {
      const records = createMultipleAttendanceRecords(5);

      const response = await request(app)
        .post('/api/attendance/bulk-import')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ records });

      expect(response.status).toBe(403);
    });
  });
});
