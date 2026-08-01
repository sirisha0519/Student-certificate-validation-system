/**
 * Centralized error handler middleware.
 * Catches all errors passed to next() and formats the JSON response.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error Handler] ${req.method} ${req.url} - Status: ${statusCode} - Error:`, err);

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
