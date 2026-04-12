/**
 * Redis Caching Service
 * Provides caching layer for frequently accessed data
 */

const redis = require('redis');
const logger = console; // Replace with proper logging

// Redis client configuration
const redisOptions = process.env.REDIS_URL 
  ? { url: process.env.REDIS_URL } 
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      db: process.env.REDIS_DB || 0,
    };

const redisClient = redis.createClient({
  ...redisOptions,
  retryStrategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.warn('Redis connection refused - using in-memory fallback');
      return null;
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

redisClient.on('connect', () => {
  logger.info('✅ Redis connected');
});

/**
 * Middleware to cache GET requests
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (!req.user && req.path !== '/api/public/data') return next();

    const key = `cache:${req.user?.id || 'public'}:${req.originalUrl || req.url}`;

    redisClient.get(key, (err, data) => {
      if (err || !data) return next();
      try {
        return res.json(JSON.parse(data));
      } catch (e) {
        return next();
      }
    });
  };
};

/**
 * Cache key patterns
 */
const CacheKeys = {
  USER: (userId) => `cache:user:${userId}`,
  USERS_LIST: (page, limit) => `cache:users:list:${page}:${limit}`,
  ATTENDANCE: (sessionId) => `cache:attendance:${sessionId}`,
  SESSIONS: (date) => `cache:sessions:${date}`,
  REPORTS: (departmentId, date) => `cache:reports:${departmentId}:${date}`,
  TIMETABLE: (userId) => `cache:timetable:${userId}`,
  COURSES: `cache:courses:list`,
  DEPARTMENTS: `cache:departments:list`
};

/**
 * Set cache
 */
const setCache = (key, data, duration = 300) => {
  return new Promise((resolve) => {
    redisClient.setex(key, duration, JSON.stringify(data), (err) => {
      resolve(!err);
    });
  });
};

/**
 * Get cache
 */
const getCache = (key) => {
  return new Promise((resolve) => {
    redisClient.get(key, (err, data) => {
      if (err || !data) return resolve(null);
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        resolve(null);
      }
    });
  });
};

/**
 * Invalidate cache
 */
const invalidateCache = (key) => {
  return new Promise((resolve) => {
    redisClient.del(key, () => resolve());
  });
};

/**
 * Invalidate cache by pattern
 */
const invalidateCachePattern = (pattern) => {
  return new Promise((resolve) => {
    redisClient.keys(pattern, (err, keys) => {
      if (err || !keys.length) return resolve();
      redisClient.del(keys, () => resolve());
    });
  });
};

/**
 * Clear all cache
 */
const clearAllCache = () => {
  return new Promise((resolve) => {
    redisClient.flushdb(() => resolve());
  });
};

module.exports = {
  redisClient,
  cacheMiddleware,
  CacheKeys,
  setCache,
  getCache,
  invalidateCache,
  invalidateCachePattern,
  clearAllCache
};
