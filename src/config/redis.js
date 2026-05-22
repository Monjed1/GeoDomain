import Redis from 'ioredis';

import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  enableReadyCheck: true
});

redis.on('error', (error) => {
  logger.error({ event: 'redis_error', message: error.message });
});

export async function connectRedis() {
  if (redis.status === 'wait' || redis.status === 'end') {
    await redis.connect();
  }
  await redis.ping();
}

export async function disconnectRedis() {
  if (redis.status !== 'end') {
    await redis.quit();
  }
}
