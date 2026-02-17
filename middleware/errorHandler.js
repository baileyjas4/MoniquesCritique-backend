/**
 * Global error handling middleware
 * Catches all errors and formats them consistently
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // Default error status and message
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    status = 400;
    message = 'Validation failed';
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(status).json({ error: message, details });
  }

  if (err.name === 'CastError') {
    // Invalid ObjectId
    status = 400;
    message = 'Invalid ID format';
  }

  if (err.code === 11000) {
    // Duplicate key error (MongoDB)
    status = 400;
    message = 'Duplicate entry';
    const field = Object.keys(err.keyPattern)[0];
    return res.status(status).json({ 
      error: message,
      details: [`${field} already exists`]
    });
  }

  if (err.name === 'JsonWebTokenError') {
    // JWT error
    status = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    // JWT expired
    status = 401;
    message = 'Token expired';
  }

  // Send error response
  res.status(status).json({
    error: message
  });
};

module.exports = errorHandler;
