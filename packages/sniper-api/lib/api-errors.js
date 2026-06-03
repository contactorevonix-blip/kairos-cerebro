// Error definitions — RFC 7807 Problem Details format

class ApiError extends Error {
  constructor(code, message, statusCode = 400, detail = null, fieldErrors = null) {
    super(message);
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      detail: this.detail,
      timestamp: this.timestamp,
      ...(this.fieldErrors && { fieldErrors: this.fieldErrors }),
    };
  }
}

class ValidationError extends ApiError {
  constructor(message, fieldErrors = null) {
    super('VALIDATION_ERROR', message, 400, 'Request validation failed', fieldErrors);
  }
}

class AuthError extends ApiError {
  constructor(message, reason = null) {
    super('AUTH_ERROR', message, 401, reason || 'Authentication failed');
  }
}

class RateLimitError extends ApiError {
  constructor(retryAfter = 60) {
    super('RATE_LIMIT_EXCEEDED', `Rate limit exceeded. Retry after ${retryAfter}s`, 429, null);
    this.retryAfter = retryAfter;
  }
}

class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404, `The requested ${resource.toLowerCase()} does not exist`);
  }
}

class InternalError extends ApiError {
  constructor(message = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500, 'An unexpected error occurred');
  }
}

module.exports = {
  ApiError,
  ValidationError,
  AuthError,
  RateLimitError,
  NotFoundError,
  InternalError,
};
