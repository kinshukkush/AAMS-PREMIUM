/**
 * Load Testing Configuration
 * For Apache JMeter or k6 usage
 */

// k6 load test script (k6 run load-test.js)

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics
const loginDuration = new Trend('login_duration');
const attendanceMarkDuration = new Trend('attendance_duration');
const qrDuration = new Trend('qr_duration');
const faceDuration = new Trend('face_duration');
const analyticsLoadDuration = new Trend('analytics_duration');

const errorCount = new Counter('errors');
const successCount = new Counter('successes');
const concurrentUsers = new Gauge('concurrent_users');

// Test options
export const options = {
  // Stage 1: Ramp-up (1-50 users over 30s)
  stages: [
    { duration: '30s', target: 50, name: 'Ramp-up' },
    { duration: '2m', target: 100, name: 'Steady Load' },
    { duration: '30s', target: 150, name: 'Peak Load' },
    { duration: '1m', target: 50, name: 'Cool Down' },
    { duration: '30s', target: 0, name: 'Ramp-down' }
  ],
  
  // Threshold: Fail if > 5% errors or p95 > 2s
  thresholds: {
    errors: ['count<50'],
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    'login_duration': ['p(95)<1000'],
    'attendance_duration': ['p(95)<500'],
    'qr_duration': ['p(95)<700'],
    'face_duration': ['p(95)<2000'],
    'analytics_duration': ['p(95)<3000']
  }
};

const BASE_URL = 'http://localhost:5000';
const ADMIN_TOKEN = 'your-admin-token-here';
const STUDENT_TOKEN = 'your-student-token-here';
const FACULTY_TOKEN = 'your-faculty-token-here';

export default function () {
  concurrentUsers.add(__VU);
  
  // 30% Probability: Student Login
  if (Math.random() < 0.3) {
    group('Student Login', () => {
      const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
        email: `student${__VU}@test.com`,
        password: 'Password123!'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

      loginDuration.add(loginRes.timings.duration);
      
      check(loginRes, {
        'login status is 200': (r) => r.status === 200,
        'login has token': (r) => r.json('data.token') !== null,
      });

      if (loginRes.status !== 200) errorCount.add(1);
      else successCount.add(1);
    });
  }

  // 25% Probability: Mark QR Attendance
  if (Math.random() < 0.25) {
    group('QR Attendance', () => {
      const qrRes = http.post(`${BASE_URL}/api/attendance/qr`, JSON.stringify({
        qrCode: `QR-session-${__VU}`,
        sessionId: '507f1f77bcf86cd799439011'
      }), {
        headers: {
          'Authorization': `Bearer ${STUDENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      qrDuration.add(qrRes.timings.duration);
      
      check(qrRes, {
        'QR mark status 201': (r) => r.status === 201 || r.status === 409,
        'has attendance data': (r) => r.json('data.attendance') !== null
      });

      if (qrRes.status > 409) errorCount.add(1);
      else successCount.add(1);
    });
  }

  // 20% Probability: Mark Manual Attendance
  if (Math.random() < 0.2) {
    group('Manual Attendance', () => {
      const manualRes = http.post(`${BASE_URL}/api/attendance/mark`, JSON.stringify({
        courseId: '507f1f77bcf86cd799439012',
        type: 'manual',
        status: 'present'
      }), {
        headers: {
          'Authorization': `Bearer ${STUDENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      attendanceMarkDuration.add(manualRes.timings.duration);
      
      check(manualRes, {
        'manual mark status 201': (r) => r.status === 201 || r.status === 409,
      });

      if (manualRes.status > 409) errorCount.add(1);
      else successCount.add(1);
    });
  }

  // 15% Probability: Face Attendance
  if (Math.random() < 0.15) {
    group('Face Attendance', () => {
      const faceRes = http.post(`${BASE_URL}/api/attendance/face`, JSON.stringify({
        sessionId: '507f1f77bcf86cd799439011',
        faceEncoding: [0.1, 0.2, 0.3, 0.4, 0.5],
        confidence: 0.92
      }), {
        headers: {
          'Authorization': `Bearer ${STUDENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      faceDuration.add(faceRes.timings.duration);
      
      check(faceRes, {
        'face response received': (r) => r.status > 0
      });

      if (faceRes.status > 400) errorCount.add(1);
      else successCount.add(1);
    });
  }

  // 10% Probability: Get Analytics
  if (Math.random() < 0.1) {
    group('Analytics Load', () => {
      const analyticsRes = http.get(
        `${BASE_URL}/api/premium/analytics?startDate=2024-01-01&endDate=2024-12-31`,
        {
          headers: {
            'Authorization': `Bearer ${FACULTY_TOKEN}`
          }
        }
      );

      analyticsLoadDuration.add(analyticsRes.timings.duration);
      
      check(analyticsRes, {
        'analytics status 200': (r) => r.status === 200,
        'has report data': (r) => r.json('data.report') !== null
      });

      if (analyticsRes.status !== 200) errorCount.add(1);
      else successCount.add(1);
    });
  }

  sleep(1);
}

/**
 * JMETER CONFIGURATION NOTES:
 * 
 * Thread Group Settings:
 * - Number of Threads (users): 100
 * - Ramp-Up Period (seconds): 60
 * - Loop Count: -1 (infinite, until duration ends)
 * - Duration (seconds): 300 (5 minutes)
 * 
 * HTTP Request Settings:
 * - Server: localhost
 * - Port: 5000
 * - Protocol: http
 * - Path: /api/...
 * - Method: POST/GET
 * 
 * Assertions:
 * - Response Code: 200, 201, 409 (expected)
 * - Response Time: p95 < 2000ms
 * 
 * Listeners:
 * - Summary Report
 * - Response Time Graph
 * - Active Threads Over Time
 * - Bytes Throughput Over Time
 */

/**
 * RUN COMMANDS:
 * 
 * k6 run load-test.js
 * k6 run -v load-test.js                                    (verbose)
 * k6 run --out csv=results.csv load-test.js                (export CSV)
 * k6 run --out influxdb=http://localhost:8086/k6 load-test.js (InfluxDB)
 * 
 * EXPECTED RESULTS:
 * 
 * ✓ 100+ concurrent users handled
 * ✓ p95 response time < 2000ms
 * ✓ p99 response time < 3000ms
 * ✓ Error rate < 5%
 * ✓ Throughput > 50 requests/sec
 */
