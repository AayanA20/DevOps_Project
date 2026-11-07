export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  error.code = 'NOT_FOUND';
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? (err.statusCode || 500) : res.statusCode;

  let message = err.message || 'An unexpected error occurred';
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    if (field === 'username') {
      errorCode = 'USERNAME_TAKEN';
      message = 'Username already exists';
    } else if (field === 'email') {
      errorCode = 'EMAIL_TAKEN';
      message = 'Email is already registered';
    } else {
      errorCode = 'DUPLICATE_KEY';
      message = `An account with this ${field} already exists.`;
    }
  }

  // Handle Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    errorCode = 'RESOURCE_NOT_FOUND';
    message = 'Resource not found or invalid identifier format';
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    errorCode = 'VALIDATION_ERROR';
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Map HTTP Status to standard design error codes if not set
  if (!err.code && statusCode === 400) errorCode = 'BAD_REQUEST';
  if (!err.code && statusCode === 401) errorCode = 'UNAUTHORIZED';
  if (!err.code && statusCode === 403) errorCode = 'FORBIDDEN';
  if (!err.code && statusCode === 404) errorCode = 'NOT_FOUND';
  if (!err.code && statusCode === 409) errorCode = 'CONFLICT';
  if (!err.code && statusCode === 429) errorCode = 'RATE_LIMIT_EXCEEDED';

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      message,
    },
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
