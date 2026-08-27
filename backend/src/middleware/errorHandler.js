/**
 * Global error handler — catches all unhandled errors.
 * Returns structured JSON { error, message, status }.
 */
function errorHandler(err, req, res, _next) {
  console.error('🔴 Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: status >= 500 ? 'Internal Server Error' : 'Request Error',
    message: process.env.NODE_ENV === 'production' && status >= 500
      ? 'Something went wrong'
      : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
