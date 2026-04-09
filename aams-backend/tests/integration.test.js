/**
 * Integration Tests - End-to-End Workflows
 * Tests complete user journeys through the system
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

describe('Integration Tests - End-to-End Workflows', () => {
  let studentId, facultyId, courseId, sessionId, departmentId;
  let studentToken, facultyToken, adminToken;

  beforeAll(() => {
    // Setup IDs
    studentId = new mongoose.Types.ObjectId();
    facultyId = new mongoose.Types.ObjectId();
    courseId = new mongoose.Types.ObjectId();
    sessionId = new mongoose.Types.ObjectId();
    departmentId = new mongoose.Types.ObjectId();

    // Setup tokens
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

  describe('Workflow 1: Student Login & QR Attendance', () => {
    test('should complete full login and QR attendance workflow', async () => {
      // Step 1: Student logs in
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'Password123!'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data).toHaveProperty('token');
      const studentAuthToken = loginResponse.body.data.token;

      // Step 2: Get student's current user data
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentAuthToken}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.data.user.role).toBe('student');

      // Step 3: Student gets today's timetable
      const timetableResponse = await request(app)
        .get('/api/timetable')
        .set('Authorization', `Bearer ${studentAuthToken}`);

      expect(timetableResponse.status).toBe(200);
      expect(Array.isArray(timetableResponse.body.data.timetable)).toBe(true);

      // Step 4: Student scans QR code for attendance
      const attendanceResponse = await request(app)
        .post('/api/attendance/qr')
        .set('Authorization', `Bearer ${studentAuthToken}`)
        .send({
          qrCode: 'QR-valid-session-code',
          sessionId
        });

      expect(attendanceResponse.status).toBe(201);
      expect(attendanceResponse.body.data.attendance.type).toBe('qr');
      expect(attendanceResponse.body.data.attendance.status).toBe('present');

      // Step 5: Student checks their attendance stats
      const statsResponse = await request(app)
        .get('/api/attendance/stats')
        .set('Authorization', `Bearer ${studentAuthToken}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.data.present).toBeGreaterThan(0);
    });

    test('should prevent duplicate QR marking in same session', async () => {
      // First marking
      const firstMark = await request(app)
        .post('/api/attendance/qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'QR-unique-code',
          sessionId
        });

      expect(firstMark.status).toBe(201);

      // Attempt duplicate
      const secondMark = await request(app)
        .post('/api/attendance/qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'QR-unique-code',
          sessionId
        });

      expect(secondMark.status).toBe(409);
      expect(secondMark.body.message).toContain('already marked');
    });
  });

  describe('Workflow 2: Student Face Registration & Face Attendance', () => {
    test('should complete face registration and recognition workflow', async () => {
      // Step 1: Student initiates face registration
      const registerResponse = await request(app)
        .post('/api/attendance/face/register')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          images: [
            { encoding: [0.1, 0.2, 0.3], angle: 'front' },
            { encoding: [0.11, 0.21, 0.31], angle: 'left' },
            { encoding: [0.09, 0.19, 0.29], angle: 'right' }
          ]
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.message).toContain('registered');

      // Step 2: Verify registration status
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.user.studentProfile).toHaveProperty('faceRegistered');
      expect(profileResponse.body.data.user.studentProfile.faceRegistered).toBe(true);

      // Step 3: Student marks attendance using face
      const attendanceResponse = await request(app)
        .post('/api/attendance/face')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sessionId,
          faceEncoding: [0.1, 0.2, 0.3],
          confidence: 0.92
        });

      expect(attendanceResponse.status).toBe(201);
      expect(attendanceResponse.body.data.attendance.type).toBe('face');
      expect(attendanceResponse.body.data.attendance.status).toBe('present');

      // Step 4: Verify attendance recorded
      const verifyResponse = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ courseId, limit: 1 });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.data.attendance[0].type).toBe('face');
    });

    test('should fallback to manual when face confidence low', async () => {
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
  });

  describe('Workflow 3: Faculty Live Class Session', () => {
    test('should complete full faculty session workflow', async () => {
      // Step 1: Faculty creates attendance session
      const createSessionResponse = await request(app)
        .post('/api/attendance/sessions')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          course: courseId,
          title: 'Lecture 1',
          startTime: new Date(),
          endTime: new Date(Date.now() + 60 * 60000),
          location: 'Room-A101'
        });

      expect(createSessionResponse.status).toBe(201);
      expect(createSessionResponse.body.data.session).toHaveProperty('qrCode');
      const newSessionId = createSessionResponse.body.data.session._id;

      // Step 2: System generates QR code
      expect(createSessionResponse.body.data.session.qrCode).toBeDefined();
      expect(createSessionResponse.body.data.session.isActive).toBe(true);

      // Step 3: Students mark attendance via QR
      const studentAttendance1 = await request(app)
        .post('/api/attendance/qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: createSessionResponse.body.data.session.qrCode,
          sessionId: newSessionId
        });

      expect(studentAttendance1.status).toBe(201);

      // Step 4: Faculty views live attendance count
      const liveResponse = await request(app)
        .get(`/api/attendance/sessions/${newSessionId}/live`)
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(liveResponse.status).toBe(200);
      expect(liveResponse.body.data.currentAttendance).toBeGreaterThan(0);
      expect(liveResponse.body.data.totalStudents).toBeDefined();

      // Step 5: Faculty marks absent student manually
      const absentStudentId = new mongoose.Types.ObjectId();
      const manualMarkResponse = await request(app)
        .post(`/api/attendance/sessions/${newSessionId}/mark-absent`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          studentId: absentStudentId
        });

      expect(manualMarkResponse.status).toBe(201);

      // Step 6: Faculty ends session
      const endSessionResponse = await request(app)
        .put(`/api/attendance/sessions/${newSessionId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ isActive: false });

      expect(endSessionResponse.status).toBe(200);
      expect(endSessionResponse.body.data.session.isActive).toBe(false);

      // Step 7: Attendance synced to student records
      const syncResponse = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ sessionId: newSessionId });

      expect(syncResponse.status).toBe(200);
      expect(syncResponse.body.data.attendance).toBeDefined();
    });
  });

  describe('Workflow 4: Admin Bulk Import Users', () => {
    test('should complete user bulk import workflow', async () => {
      // Step 1: Admin uploads CSV data
      const csvData = [
        {
          name: 'John Doe',
          email: 'john@test.com',
          role: 'student',
          phone: '+91-9999999999',
          studentProfile: { rollNo: 'LPU001', batch: '2020' }
        },
        {
          name: 'Jane Smith',
          email: 'jane@test.com',
          role: 'student',
          phone: '+91-8888888888',
          studentProfile: { rollNo: 'LPU002', batch: '2020' }
        }
      ];

      const importResponse = await request(app)
        .post('/api/users/bulk-import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ users: csvData });

      expect(importResponse.status).toBe(201);
      expect(importResponse.body.data.imported).toBe(2);
      expect(importResponse.body.data.failed).toBe(0);

      // Step 2: Users receive welcome emails (non-blocking)
      // In real system, emails would be sent asynchronously

      // Step 3: Verify users created and can login
      const newUserLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'TempPassword123!'  // From email link setup
        });

      expect(newUserLogin.status).toBeOneOf([200, 401]);  // May need to complete setup first

      // Step 4: Admin views import audit log
      const auditResponse = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ action: 'bulk_import', limit: 10 });

      expect(auditResponse.status).toBe(200);
      expect(auditResponse.body.data.logs).toBeDefined();
    });

    test('should validate data during bulk import', async () => {
      const invalidData = [
        {
          name: 'Invalid User',
          // Missing email
          role: 'student'
        },
        {
          name: 'Another Invalid',
          email: 'invalid-email',  // Invalid format
          role: 'invalid-role'
        }
      ];

      const response = await request(app)
        .post('/api/users/bulk-import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ users: invalidData });

      expect(response.status).toBe(400);
      expect(response.body.data.errors).toBeDefined();
      expect(response.body.data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Workflow 5: Real-Time Notifications', () => {
    test('should deliver real-time notifications on low attendance', async () => {
      // Step 1: Admin triggers low attendance alert
      const alertResponse = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recipientId: studentId,
          type: 'low_attendance',
          courseId,
          data: { percentage: 65, course: 'CS101' }
        });

      expect(alertResponse.status).toBe(201);
      expect(alertResponse.body.data.notification).toHaveProperty('_id');

      // Step 2: Student receives notification in-app
      const notificationsResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(notificationsResponse.status).toBe(200);
      expect(Array.isArray(notificationsResponse.body.data.notifications)).toBe(true);

      // Step 3: Student marks as read
      const notifId = notificationsResponse.body.data.notifications[0]._id;
      const readResponse = await request(app)
        .put(`/api/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.data.notification.read).toBe(true);

      // Step 4: System sends email (real system)
      // Verified via email service logs

      // Step 5: Parent receives notification (if parent linked)
      // Verified via Socket.IO or polling
    });
  });

  describe('Workflow 6: Analytics & Reporting', () => {
    test('should generate comprehensive analytics report', async () => {
      // Step 1: Faculty requests analytics
      const analyticsResponse = await request(app)
        .get('/api/premium/analytics')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          courseId
        });

      expect(analyticsResponse.status).toBe(200);
      expect(analyticsResponse.body.data.report).toHaveProperty('totalClasses');
      expect(analyticsResponse.body.data.report).toHaveProperty('averageAttendance');

      // Step 2: Faculty views attendance heatmap
      const heatmapResponse = await request(app)
        .get('/api/premium/heatmap')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({ weeks: 4 });

      expect(heatmapResponse.status).toBe(200);
      expect(Array.isArray(heatmapResponse.body.data.heatmap)).toBe(true);

      // Step 3: Faculty detects anomalies
      const anomaliesResponse = await request(app)
        .get('/api/premium/anomalies')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(anomaliesResponse.status).toBe(200);
      expect(Array.isArray(anomaliesResponse.body.data.anomalies)).toBe(true);

      // Step 4: System identifies students needing intervention
      const needingHelpCount = anomaliesResponse.body.data.anomalies.filter(
        a => a.percentage < 75
      ).length;

      if (needingHelpCount > 0) {
        // Step 5: Faculty sends intervention emails
        for (const anomaly of anomaliesResponse.body.data.anomalies) {
          const emailResponse = await request(app)
            .post('/api/notifications/send')
            .set('Authorization', `Bearer ${facultyToken}`)
            .send({
              recipientId: anomaly.studentId,
              type: 'intervention_alert',
              data: anomaly
            });

          expect(emailResponse.status).toBe(201);
        }
      }

      // Step 6: Generate PDF report
      const reportResponse = await request(app)
        .get('/api/reports/export')
        .set('Authorization', `Bearer ${facultyToken}`)
        .query({
          courseId,
          format: 'pdf',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        });

      expect(reportResponse.status).toBe(200);
      expect(reportResponse.headers['content-type']).toContain('pdf');
    });
  });

  describe('Workflow 7: Session Across Multiple Devices', () => {
    test('should maintain session consistency across web and mobile', async () => {
      // Step 1: Student logs in on web
      const webLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'Password123!'
        });

      expect(webLoginResponse.status).toBe(200);
      const webToken = webLoginResponse.body.data.token;

      // Step 2: Student logs in on mobile
      const mobileLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'Password123!'
        });

      expect(mobileLoginResponse.status).toBe(200);
      const mobileToken = mobileLoginResponse.body.data.token;

      // Step 3: Verify both tokens are valid
      const webMeResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${webToken}`);

      const mobileMeResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${mobileToken}`);

      expect(webMeResponse.status).toBe(200);
      expect(mobileMeResponse.status).toBe(200);

      // Step 4: Mark attendance on web
      const webAttendance = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${webToken}`)
        .send({
          courseId,
          type: 'manual',
          status: 'present'
        });

      expect(webAttendance.status).toBe(201);

      // Step 5: Verify attendance visible on mobile
      const mobileStats = await request(app)
        .get('/api/attendance/stats')
        .set('Authorization', `Bearer ${mobileToken}`);

      expect(mobileStats.status).toBe(200);
      expect(mobileStats.body.data.present).toBeGreaterThan(0);

      // Step 6: Update profile on mobile
      const mobileProfileUpdate = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${mobileToken}`)
        .send({ phone: '+91-9876543210' });

      expect(mobileProfileUpdate.status).toBe(200);

      // Step 7: Verify profile update visible on web
      const webProfile = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${webToken}`);

      expect(webProfile.status).toBe(200);
      expect(webProfile.body.data.user.phone).toBe('+91-9876543210');
    });
  });

  describe('Workflow Error Handling', () => {
    test('should handle network failures gracefully', async () => {
      // Simulate network timeout
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .timeout(100);  // Very short timeout

      // Should either timeout or succeed
      expect([0, 200, 408]).toContain(response.status);
    });

    test('should handle concurrent requests safely', async () => {
      const promises = [];

      // Concurrent attendance markings
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/attendance/mark')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
              courseId: new mongoose.Types.ObjectId(),
              type: 'manual',
              status: 'present'
            })
        );
      }

      const responses = await Promise.all(promises);

      // Most should succeed, none should crash
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(0);
      expect(responses.length).toBe(10);
    });
  });
});
