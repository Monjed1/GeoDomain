import { env } from '../config/env.js';
import { redis } from '../config/redis.js';
import { ApiError } from '../utils/errors.js';

function clientKey(request) {
  const forwarded = request.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.ip;
  return ip || 'unknown';
}

export async function generateRateLimiter(request, response, next) {
  if (!env.RATE_LIMIT_ENABLED) {
    next();
    return;
  }

  try {
    const key = `rate:generate:${clientKey(request)}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, env.RATE_LIMIT_WINDOW_SECONDS);
    }

    const ttl = await redis.ttl(key);
    response.setHeader('X-RateLimit-Limit', env.RATE_LIMIT_MAX_REQUESTS);
    response.setHeader('X-RateLimit-Remaining', Math.max(env.RATE_LIMIT_MAX_REQUESTS - current, 0));
    response.setHeader('X-RateLimit-Reset', Math.max(ttl, 0));

    if (current > env.RATE_LIMIT_MAX_REQUESTS) {
      next(
        new ApiError(
          429,
          'Rate limit exceeded. Reduce request frequency or increase RATE_LIMIT_MAX_REQUESTS.',
          { windowSeconds: env.RATE_LIMIT_WINDOW_SECONDS, maxRequests: env.RATE_LIMIT_MAX_REQUESTS },
          'RATE_LIMITED'
        )
      );
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
