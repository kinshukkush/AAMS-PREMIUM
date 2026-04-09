/**
 * Test Setup - Configure testing environment
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-production';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/aams-test';
process.env.AI_SERVICE_URL = 'http://localhost:5001';
process.env.EMAIL_HOST = 'smtp.gmail.com';
process.env.EMAIL_PORT = 587;

// Suppress console logs during tests
global.console.log = jest.fn();
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Set test timeout
jest.setTimeout(10000);
