import { redis } from '../config/redis.js';

export const USED_DOMAINS_KEY = 'used_domains';

export async function reserveDomain(domain) {
  const added = await redis.sadd(USED_DOMAINS_KEY, domain);
  return added === 1;
}

export async function releaseDomain(domain) {
  await redis.srem(USED_DOMAINS_KEY, domain);
}

export async function isDomainUsed(domain) {
  const exists = await redis.sismember(USED_DOMAINS_KEY, domain);
  return exists === 1;
}

export async function markDomainsUsed(domains) {
  if (!domains.length) return 0;
  return redis.sadd(USED_DOMAINS_KEY, ...domains);
}

export async function countUsedDomains() {
  return redis.scard(USED_DOMAINS_KEY);
}
