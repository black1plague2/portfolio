const { AppError } = require('../utils/apiResponse');

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new AppError(`${field} already exists.`, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message).join('. ');
    err = new AppError(messages, 400);
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(err.statusCode).json({
    success: false,
    status: err.isOperational ? err.status : 'error',
    message: err.isOperational ? err.message : 'Something went wrong. Please try again.',
  });
};

module.exports = { globalErrorHandler };
