/**
 * Validation utilities
 */

/**
 * SECURITY FIX: Sanitize and validate pagination parameters
 * Prevents negative values, extremely large values, and invalid types
 */
const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 20;

  // Ensure valid ranges
  page = Math.max(1, Math.min(page, 10000)); // 1 to 10000
  limit = Math.max(1, Math.min(limit, 100)); // 1 to 100

  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Parse query parameter as integer with bounds
 */
const parseIntBounded = (value, defaultVal, min, max) => {
  const parsed = parseInt(value) || defaultVal;
  return Math.max(min, Math.min(parsed, max));
};

module.exports = {
  getPaginationParams,
  parseIntBounded
};
