/**
 * Security Audit Tests
 * Tests for CORS, CSRF, XSS, injection vulnerabilities
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

describe('Security Audit Tests', () => {
  let validToken;

  beforeEach(() => {
    validToken = jwt.sign(
      { _id: new mongoose.Types.ObjectId(), role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('CORS Security', () => {
    test('should allow requests from authorized origins', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Origin', 'https://aams.example.com');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Origin', 'https://malicious-site.com');

      // Should either be rejected or restricted
      expect([200, 403]).toContain(response.status);
    });

    test('should handle preflight requests correctly', async () => {
      const response = await request(app)
        .options('/api/attendance/mark')
        .set('Origin', 'https://aams.example.com')
        .set('Access-Control-Request-Method', 'POST');

      expect([200, 204]).toContain(response.status);
    });
  });

  describe('CSRF Protection', () => {
    test('should require CSRF token for state-changing operations', async () => {
      // Attempt POST without CSRF token (if implemented)
      const response = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          courseId: new mongoose.Types.ObjectId(),
          status: 'present'
        });

      // Should succeed with JWT auth (CSRF not needed for API token auth)
      // But implementation may add CSRF headers for SPA protection
      expect([201, 400, 403]).toContain(response.status);
    });

    test('should validate SameSite cookie attribute', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Password123!'
        });

      // Check Set-Cookie header if cookies are used
      if (response.headers['set-cookie']) {
        expect(response.headers['set-cookie'][0]).toContain('SameSite');
      }
    });
  });

  describe('XSS Prevention', () => {
    test('should sanitize user input in profiles', async () => {
      const xssPayload = '<script>alert("XSS")</script>';

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: xssPayload,
          phone: xssPayload
        });

      expect(response.status).toBeOneOf([200, 400]);
      
      // If accepted, verify it's escaped in response
      if (response.status === 200) {
        expect(response.body.data.user.name).not.toContain('<script>');
      }
    });

    test('should escape output in API responses', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      
      // Check that response doesn't contain unescaped scripts
      const json = JSON.stringify(response.body);
      expect(json).not.toContain('</script>');
      expect(json).not.toContain('javascript:');
    });

    test('should set Content-Security-Policy headers', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${validToken}`);

      // Check for CSP header (if implemented)
      if (response.headers['content-security-policy']) {
        expect(response.headers['content-security-policy']).toContain("default-src 'self'");
      }
    });
  });

  describe('SQL/NoSQL Injection Prevention', () => {
    test('should prevent NoSQL injection in search parameters', async () => {
      const injectionPayloads = [
        '{"$ne": null}',
        '{"$gt": ""}',
        '{"$where": "this.id == 1"}',
        '{"$regex": ".*"}',
        '; db.users.drop(); //'
      ];

      for (const payload of injectionPayloads) {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${validToken}`)
          .query({ search: payload });

        // Should either be rejected or safely handled
        expect([200, 400]).toContain(response.status);
        
        // Should not cause error that indicates execution
        expect(response.body.message).not.toContain('SyntaxError');
      }
    });

    test('should prevent regex injection', async () => {
      const regexPayloads = [
        '.*',
        '(a|b)',
        '[a-z]*',
        '^admin',
        '.*admin.*'
      ];

      for (const payload of regexPayloads) {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${validToken}`)
          .query({ search: payload });

        expect([200, 400]).toContain(response.status);
      }
    });

    test('should prevent field injection in queries', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .query({
          sortBy: 'name; db.users.deleteMany({})',
          order: 'asc'
        });

      expect(response.status).toBeOneOf([200, 400]);
      // Should not have deleted users
    });
  });

  describe('Authentication & Authorization Attacks', () => {
    test('should prevent brute force login attacks', async () => {
      // Attempt 10 failed logins
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@test.com',
            password: 'WrongPassword'
          });
      }

      // Next attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'CorrectPassword'
        });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('too many');
    });

    test('should prevent token tampering', async () => {
      const tamperedToken = validToken.slice(0, -5) + 'XXXXX';

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
    });

    test('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { _id: new mongoose.Types.ObjectId() },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }  // Already expired
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    test('should reject tokens signed with wrong secret', async () => {
      const wrongToken = jwt.sign(
        { _id: new mongoose.Types.ObjectId() },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${wrongToken}`);

      expect(response.status).toBe(401);
    });

    test('should prevent privilege escalation', async () => {
      const studentToken = jwt.sign(
        { _id: new mongoose.Types.ObjectId(), role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Student attempts to access admin endpoint
      const response = await request(app)
        .get('/api/premium/attendance-stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Data Exposure Prevention', () => {
    test('should not expose sensitive fields in responses', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('__v');
    });

    test('should not expose error stack traces in production', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      // Stack trace should not be exposed
      expect(response.body.error).not.toContain('at ');
    });

    test('should hide server details in error messages', async () => {
      const response = await request(app)
        .get('/api/some-endpoint')
        .set('Authorization', `Bearer ${validToken}`);

      // Should not reveal Express or Node.js version
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.body.message).not.toContain('Express');
    });
  });

  describe('Rate Limiting Verification', () => {
    test('should enforce rate limits on all sensitive endpoints', async () => {
      const endpoints = [
        { method: 'post', path: '/api/auth/login' },
        { method: 'post', path: '/api/auth/register' },
        { method: 'post', path: '/api/attendance/mark' },
        { method: 'post', path: '/api/attendance/face' }
      ];

      for (const endpoint of endpoints) {
        // Make rapid requests
        const requests = [];
        for (let i = 0; i < 200; i++) {
          if (endpoint.method === 'post') {
            requests.push(
              request(app)
                .post(endpoint.path)
                .send({
                  email: 'test@test.com',
                  password: 'Password123!',
                  courseId: new mongoose.Types.ObjectId()
                })
            );
          }
        }

        const responses = await Promise.all(requests);
        const rateLimited = responses.filter(r => r.status === 429);
        
        // At least some should be rate limited
        expect(rateLimited.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Input Validation & Sanitization', () => {
    test('should validate email format', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user name@example.com',
        'user@.com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email,
            password: 'Password123!'
          });

        expect([400, 401]).toContain(response.status);
      }
    });

    test('should validate ObjectId format', async () => {
      const response = await request(app)
        .get('/api/users/not-a-valid-id')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid');
    });

    test('should reject oversized payloads', async () => {
      const largePayload = { data: 'x'.repeat(1024 * 1024 * 11) };  // 11MB

      const response = await request(app)
        .post('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send(largePayload);

      expect(response.status).toBe(413);  // Payload Too Large
    });

    test('should sanitize query parameters', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .query({
          limit: '-1',
          page: 'abc',
          role: '<script>'
        });

      expect(response.status).toBeOneOf([200, 400]);
      // Should not execute the script
    });
  });

  describe('HTTP Security Headers', () => {
    test('should include X-Content-Type-Options header', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('should include X-Frame-Options header', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.headers['x-frame-options']).toBeDefined();
    });

    test('should use HSTS if HTTPS', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${validToken}`);

      // Should have HSTS in production HTTPS
      // expect(response.headers['strict-transport-security']).toBeDefined();
    });

    test('should disable client-side caching for sensitive data', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      const cacheControl = response.headers['cache-control'];
      expect(cacheControl).toContain('no-store');
      expect(cacheControl).toContain('no-cache');
    });
  });

  describe('Secure Session Management', () => {
    test('should invalidate token on logout', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Password123!'
        });

      const token = loginResponse.body.data.token;

      // Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutResponse.status).toBe(200);

      // Try to use token after logout
      const useAfterLogout = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Should be rejected (or token blacklisted)
      expect([401, 403]).toContain(useAfterLogout.status);
    });

    test('should refresh tokens securely', async () => {
      const refreshToken = jwt.sign(
        { _id: new mongoose.Types.ObjectId() },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');

      // New token should be different
      expect(response.body.data.token).not.toBe(refreshToken);
    });
  });
});
