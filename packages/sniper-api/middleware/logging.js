const { v4: uuid } = require('uuid');
const logger = require('../lib/logger');

module.exports = function loggingMiddleware(req, res, next) {
  const requestId = req.id || uuid();
  const startTime = Date.now();

  req.id = requestId;

  logger.info('HTTP_REQUEST', {
    requestId,
    method: req.method,
    path: req.path,
    userId: req.user?.id || null,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('HTTP_RESPONSE', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id || null,
    });
  });

  res.on('close', () => {
    if (!res.writableEnded) {
      logger.warn('HTTP_ABORTED', {
        requestId,
        method: req.method,
        path: req.path,
        duration: Date.now() - startTime,
      });
    }
  });

  next();
};
