const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware to prevent brute force attacks
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development or when behind a trusted proxy
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  },
});

module.exports = limiter;
