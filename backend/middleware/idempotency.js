import cacheService from '../services/cacheService.js';

/**
 * Instagram System Design - Phase 4A
 * Idempotency Middleware
 * 
 * Intercepts write requests containing an `Idempotency-Key` header.
 * If the key has already been processed within 24 hours, returns the cached
 * response directly without duplicate execution.
 */
export const checkIdempotency = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return next();
  }

  const cacheKey = `idempotency:${idempotencyKey}`;

  try {
    const cachedResponse = await cacheService.get(cacheKey);
    if (cachedResponse) {
      res.setHeader('X-Cache-Lookup', 'HIT-IDEMPOTENT');
      return res.status(cachedResponse.statusCode).json(cachedResponse.body);
    }

    // Intercept res.json to capture response payload
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful or intentional 2xx/4xx outcomes
      if (res.statusCode < 500) {
        cacheService.set(
          cacheKey,
          {
            statusCode: res.statusCode,
            body,
          },
          86400 // 24-hour retention
        );
      }
      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('Idempotency error:', error);
    next();
  }
};

export default checkIdempotency;

