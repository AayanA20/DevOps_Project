import cacheService from '../services/cacheService.js';

/**
 * Instagram System Design - Phase 4A
 * Rate Limiter Middleware
 * 
 * Rules:
 * - 100 requests / minute per user (or IP if unauthenticated)
 * - Enforced at Gateway with Redis counters (Section 4A)
 * - Returns 429 Too Many Requests with Retry-After header
 * - Uses standardized error format: { error: { code: 'RATE_LIMIT_EXCEEDED', message: '...' } }
 */
export const rateLimiter = (limit = 100, windowSeconds = 60) => {
  return async (req, res, next) => {
    // Exempt health checks, docs and internal status
    if (req.path === '/health' || req.path === '/api/health' || req.path === '/') {
      return next();
    }

    // Identify by user ID if authenticated, else IP address
    const identifier = req.user?._id?.toString() || req.ip || req.connection?.remoteAddress || 'anonymous';
    const currentMinute = Math.floor(Date.now() / (windowSeconds * 1000));
    const rateKey = `rate:${identifier}:${currentMinute}`;

    try {
      const currentCount = await cacheService.incr(rateKey, windowSeconds);

      // Remaining TTL for the Retry-After header
      const secondsRemaining = windowSeconds - (Math.floor(Date.now() / 1000) % windowSeconds);

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - currentCount));
      res.setHeader('X-RateLimit-Reset', secondsRemaining);

      if (currentCount > limit) {
        res.setHeader('Retry-After', secondsRemaining);
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Please retry later.',
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit of ${limit} requests per minute exceeded. Try again in ${secondsRemaining} seconds.`,
          },
        });
      }

      return next();
    } catch (err) {
      console.error('Rate limiter check failed:', err);
      // Fail open so Redis issues don't block legitimate users
      return next();
    }
  };
};

export default rateLimiter;
