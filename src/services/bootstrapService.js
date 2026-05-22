import { logger } from '../utils/logger.js';
import { countUsedDomains } from './duplicateService.js';

export async function initializeRedisStore() {
  const usedDomains = await countUsedDomains();
  logger.info({
    event: 'redis_store_ready',
    usedDomains
  });
}
