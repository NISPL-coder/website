export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error.';

  if (err.code === 11000) {
    status = 409;
    message = 'An account with this email or customer ID already exists.';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid resource identifier.';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error.' : message,
    ...(err.details ? { details: err.details } : {})
  });
}
