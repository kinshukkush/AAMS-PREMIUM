/**
 * Authentication Tests
 * Tests for user login, registration, token management
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const { createUser, createAdminUser, createFacultyUser } = require('../factories/userFactory');

// Mock express app for testing
const app = express();
app.use(express.json());

describe('Authentication Routes', () => {
  let testUser;
  let testToken;
  
  beforeEach(() => {
    testUser = createUser();
    testToken = jwt.sign(
      { _id: '507f1f77bcf86cd799439011', role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    test('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: testUser.password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email');
    });

    test('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });

    test('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('should fail with inactive account', async () => {
      const inactiveUser = createUser({ isActive: false });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: inactiveUser.email,
          password: inactiveUser.password
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('deactivated');
    });

    test('should enforce rate limiting after 5 attempts', async () => {
      // Simulate 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword'
          });
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Too many');
    });
  });

  describe('POST /api/auth/register', () => {
    test('should register new user with valid data', async () => {
      const newUser = createUser();
      
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${testToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should fail with duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${testToken}`)
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should fail with missing required fields', async () => {
      const incompleteUser = { ...testUser };
      delete incompleteUser.email;

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${testToken}`)
        .send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(createUser());

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Not authorized');
    });

    test('should fail without admin role', async () => {
      const studentToken = jwt.sign(
        { _id: '507f1f77bcf86cd799439011', role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(createUser());

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Forbidden');
    });

    test('should send welcome email with setup link', async () => {
      const newUser = createUser();
      
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${testToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('setup instructions');
      // Email sending is non-blocking, so we can't verify directly
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return current user data', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Not authorized');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('token');
    });

    test('should populate department and linked student', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty('department');
    });
  });

  describe('PUT /api/auth/update-password', () => {
    test('should update password with valid current password', async () => {
      const response = await request(app)
        .put('/api/auth/update-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated');
    });

    test('should fail with wrong current password', async () => {
      const response = await request(app)
        .put('/api/auth/update-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/update-password')
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(401);
    });

    test('should validate new password strength', async () => {
      const response = await request(app)
        .put('/api/auth/update-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('password');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    test('should return new access token with valid refresh token', async () => {
      const refreshToken = jwt.sign(
        { _id: '507f1f77bcf86cd799439011' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    test('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail with expired refresh token', async () => {
      const expiredToken = jwt.sign(
        { _id: '507f1f77bcf86cd799439011' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: expiredToken });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('expired');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('logged out');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });
});
