// Centralized error handler — RFC 7807 format
const { ApiError } = require('../lib/api-errors');

function errorHandler(err, res, { sendJson, logEvent }) {
  let apiError = err;

  if (!(err instanceof ApiError)) {
    // Convert non-ApiError exceptions
    console.error('[error-handler] Unhandled exception:', err);
    apiError = new ApiError(
      'INTERNAL_ERROR',
      'Internal server error',
      500,
      'An unexpected error occurred'
    );
  }

  const requestId = res.requestId || 'unknown';
  logEvent('error', {
    code: apiError.code,
    statusCode: apiError.statusCode,
    message: apiError.message,
    requestId,
  });

  const response = apiError.toJSON();
  response.requestId = requestId;

  sendJson(res, apiError.statusCode, response);
}

module.exports = { errorHandler };
