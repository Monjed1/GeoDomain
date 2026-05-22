import { redis } from '../config/redis.js';
import { asyncHandler } from '../utils/errors.js';

async function checkRedis() {
  const started = Date.now();
  await redis.ping();
  return { status: 'ok', latencyMs: Date.now() - started };
}

export const healthController = asyncHandler(async (_request, response) => {
  const redisResult = await Promise.allSettled([checkRedis()]);
  const redisHealth =
    redisResult[0].status === 'fulfilled'
      ? redisResult[0].value
      : { status: 'error', message: redisResult[0].reason.message };
  const healthy = redisHealth.status === 'ok';

  response.status(healthy ? 200 : 503).json({
    success: healthy,
    service: 'geo-profession-domain-generator-api',
    uptimeSeconds: Math.round(process.uptime()),
    dependencies: {
      redis: redisHealth
    }
  });
});
