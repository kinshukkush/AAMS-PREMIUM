/**
 * Rate Limiting Middleware
 * Prevents API abuse and DDoS attacks
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter (100 requests per 15 minutes)
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.user && req.user.role === 'admin';
  }
});

/**
 * Attendance marking rate limiter (10 requests per minute)
 */
const attendanceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: 'Too many attendance requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Authentication rate limiter (5 attempts per 15 minutes)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

/**
 * API key requests rate limiter (50 per 10 minutes)
 */
const apiKeyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  message: 'API key rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * File upload rate limiter (5 uploads per hour)
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  attendanceLimiter,
  authLimiter,
  apiKeyLimiter,
  uploadLimiter
};
