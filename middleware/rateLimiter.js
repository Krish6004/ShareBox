const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for sensitive authentication endpoints (prevent brute-force)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  },
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down.",
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
