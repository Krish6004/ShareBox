/**
 * Centralized error handling middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error("❌ Centralized Error Handler Caught:", err);

  let statusCode = err.statusCode || res.statusCode;
  if (!statusCode || statusCode === 200) {
    statusCode = 500;
  }

  let message = err.message || "An unexpected internal server error occurred.";

  // Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `An account with this ${field} already exists. Please sign in instead.`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Mongoose CastError (invalid ObjectId or format)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
