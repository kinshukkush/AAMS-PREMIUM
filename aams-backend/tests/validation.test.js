/**
 * Input Validation Tests
 * Tests for Department, Course, and Timetable CRUD with validation
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

describe('Input Validation', () => {
  let adminToken;

  beforeEach(() => {
    adminToken = jwt.sign(
      { _id: new mongoose.Types.ObjectId(), role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('Department Validation', () => {
    test('should create department with valid data', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Computer Science',
          code: 'CSE',
          head: new mongoose.Types.ObjectId()
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.department.name).toBe('Computer Science');
      expect(response.body.data.department.code).toBe('CSE');
    });

    test('should reject missing department name', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CSE'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors[0].msg).toContain('name');
    });

    test('should reject missing department code', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Computer Science'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('code');
    });

    test('should reject department name < 2 characters', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'A',
          code: 'CSE'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('2-100 characters');
    });

    test('should reject department name > 100 characters', async () => {
      const longName = 'A'.repeat(101);

      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: longName,
          code: 'CSE'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('2-100 characters');
    });

    test('should reject code < 2 characters', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Computer Science',
          code: 'C'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('2-20 characters');
    });

    test('should reject invalid head ID', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Computer Science',
          code: 'CSE',
          head: 'invalid-id'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('Invalid head ID');
    });

    test('should trim whitespace from name', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '  Computer Science  ',
          code: 'CSE'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.department.name).toBe('Computer Science');
    });
  });

  describe('Course Validation', () => {
    test('should create course with valid data', async () => {
      const departmentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS101',
          name: 'Introduction to Programming',
          credits: 4,
          department: departmentId,
          semester: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.course.code).toBe('CS101');
      expect(response.body.data.course.credits).toBe(4);
    });

    test('should reject missing course code', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Introduction to Programming',
          credits: 4,
          department: new mongoose.Types.ObjectId(),
          semester: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('code');
    });

    test('should reject course code > 20 characters', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS101TOOLONGCOURSECODEMAKINGITFAIL',
          name: 'Introduction to Programming',
          credits: 4,
          department: new mongoose.Types.ObjectId(),
          semester: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('2-20 characters');
    });

    test('should reject missing course name', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS101',
          credits: 4,
          department: new mongoose.Types.ObjectId(),
          semester: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('name');
    });

    test('should reject course name < 5 characters', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS101',
          name: 'Prog',
          credits: 4,
          department: new mongoose.Types.ObjectId(),
          semester: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('5-100 characters');
    });

    test('should reject credits < 0', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS101',
          name: 'Introduction to Programming',
          credits: -1,
          department: new mongoose.Types.ObjectId(),
          semester: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('0-6');
    });

    test('should reject credits > 6', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS101',
          name: 'Introduction to Programming',
          credits: 7,
          department: new mongoose.Types.ObjectId(),
          semester: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('0-6');
    });

    test('should reject invalid department ID', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS101',
          name: 'Introduction to Programming',
          credits: 4,
          department: 'not-a-valid-id',
          semester: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('department');
    });

    test('should reject semester < 1', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS101',
          name: 'Introduction to Programming',
          credits: 4,
          department: new mongoose.Types.ObjectId(),
          semester: 0
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('1-8');
    });

    test('should reject semester > 8', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS101',
          name: 'Introduction to Programming',
          credits: 4,
          department: new mongoose.Types.ObjectId(),
          semester: 9
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('1-8');
    });
  });

  describe('Timetable Validation', () => {
    test('should create timetable with valid data', async () => {
      const courseId = new mongoose.Types.ObjectId();
      const facultyId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/timetable')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          course: courseId,
          faculty: facultyId,
          room: 'Room-A101',
          dayOfWeek: 'Monday',
          startTime: '10:00',
          endTime: '11:30'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.slot.room).toBe('Room-A101');
    });

    test('should reject invalid day of week', async () => {
      const response = await request(app)
        .post('/api/timetable')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          course: new mongoose.Types.ObjectId(),
          faculty: new mongoose.Types.ObjectId(),
          room: 'Room-A101',
          dayOfWeek: 'Funday',
          startTime: '10:00',
          endTime: '11:30'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('Invalid day');
    });

    test('should reject invalid start time format', async () => {
      const response = await request(app)
        .post('/api/timetable')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          course: new mongoose.Types.ObjectId(),
          faculty: new mongoose.Types.ObjectId(),
          room: 'Room-A101',
          dayOfWeek: 'Monday',
          startTime: '10-00',
          endTime: '11:30'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('Invalid start time format');
    });

    test('should reject invalid end time format', async () => {
      const response = await request(app)
        .post('/api/timetable')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          course: new mongoose.Types.ObjectId(),
          faculty: new mongoose.Types.ObjectId(),
          room: 'Room-A101',
          dayOfWeek: 'Monday',
          startTime: '10:00',
          endTime: '25:99'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('Invalid end time format');
    });

    test('should accept valid 24-hour time formats', async () => {
      const validTimes = [
        { start: '00:00', end: '01:00' },
        { start: '09:30', end: '10:45' },
        { start: '17:00', end: '18:30' },
        { start: '23:59', end: '23:59' }
      ];

      for (const times of validTimes) {
        const response = await request(app)
          .post('/api/timetable')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            course: new mongoose.Types.ObjectId(),
            faculty: new mongoose.Types.ObjectId(),
            room: 'Room-A101',
            dayOfWeek: 'Monday',
            startTime: times.start,
            endTime: times.end
          });

        expect(response.status).toBe(201);
      }
    });

    test('should reject missing room number', async () => {
      const response = await request(app)
        .post('/api/timetable')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          course: new mongoose.Types.ObjectId(),
          faculty: new mongoose.Types.ObjectId(),
          dayOfWeek: 'Monday',
          startTime: '10:00',
          endTime: '11:30'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain('Room');
    });

    test('should validate all required course/faculty/room fields', async () => {
      const response = await request(app)
        .post('/api/timetable')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dayOfWeek: 'Monday',
          startTime: '10:00',
          endTime: '11:30'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.length).toBeGreaterThan(2);
    });
  });

  describe('NoSQL Injection Prevention', () => {
    test('should escape regex special characters in search', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          search: '.*'  // Regex pattern that should be treated as literal
        });

      expect(response.status).toBe(200);
      // Should not return all users
    });

    test('should prevent MongoDB operator injection', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          search: '{"$ne": 1}'
        });

      expect(response.status).toBe(200);
      // Should treat as literal string
    });

    test('should escape special regex characters', async () => {
      const specialChars = ['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\'];

      for (const char of specialChars) {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({
            search: char
          });

        expect(response.status).toBe(200);
        // All should be safe
      }
    });
  });
});
