import { env } from '../config/env.js';
import { redis } from '../config/redis.js';
import { cacheSegment } from '../utils/domainUtils.js';

const GEO_CACHE_VERSION = 'v6';

export function buildGeoCacheKey({ country, city, profession, selectedMarketSegment, marketSegment, mode, count }) {
  const segment = selectedMarketSegment || marketSegment || 'all';
  return `geo:${GEO_CACHE_VERSION}:${cacheSegment(country)}:${cacheSegment(city)}:${cacheSegment(profession)}:${cacheSegment(segment)}:${mode}:${count}`;
}

export async function getJson(key) {
  const cached = await redis.get(key);
  if (!cached) return null;
  return JSON.parse(cached);
}

export async function setJson(key, value, ttlSeconds = env.CACHE_TTL_SECONDS) {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function getOrSetJson(key, factory, ttlSeconds = env.CACHE_TTL_SECONDS) {
  const cached = await getJson(key);
  if (cached) {
    return { value: cached, cacheHit: true };
  }

  const value = await factory();
  await setJson(key, value, ttlSeconds);
  return { value, cacheHit: false };
}
