export const errorHandler = (err, req, res, next) => {
  console.error('[ServerError]', err.stack || err.message || err);

  const statusCode = err.statusCode || res.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
    error: err.name || 'ServerError',
    message: err.message || 'An unexpected error occurred on the server.',
    ...(isProd ? {} : { details: err.details || undefined })
  });
};
