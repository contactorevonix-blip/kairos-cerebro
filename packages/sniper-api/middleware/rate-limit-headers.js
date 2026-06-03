// Middleware: Add X-RateLimit headers to responses
// Integrates with rate-limit.js to expose rate limit status to clients

module.exports = function rateLimitHeadersMiddleware(rateLimitFn) {
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const limit = req.user ? 1000 : 100; // Auth: 1000/min, Public: 100/min

    const result = rateLimitFn(key, limit);

    res.set({
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(result.resetAt),
    });

    if (!result.allowed) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Retry after ${Math.ceil((result.resetAt - Date.now()) / 1000)}s`,
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
      });
    }

    next();
  };
};
