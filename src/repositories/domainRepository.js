import { redis } from '../config/redis.js';

const GENERATED_DOMAIN_INDEX_KEY = 'generated_domains';
const GENERATED_DOMAIN_TIMELINE_KEY = 'generated_domains_by_time';
const GENERATED_DOMAIN_COUNT_KEY = 'stats:generated_domains';
const TOP_PROFESSIONS_KEY = 'stats:top_professions';
const TOP_CITIES_KEY = 'stats:top_cities';
const USED_DOMAINS_KEY = 'used_domains';

function domainDataKey(domain) {
  return `domain:${domain}`;
}

function cleanMetadata(candidate, requestContext) {
  return {
    domain: candidate.domain,
    root: candidate.root,
    city: candidate.city || '',
    state: candidate.state || '',
    country: candidate.country || '',
    profession: candidate.profession || '',
    serviceKeyword: candidate.serviceKeyword || '',
    pattern: candidate.pattern,
    mode: requestContext.mode,
    requestHash: requestContext.requestHash,
    createdAt: new Date().toISOString()
  };
}

function cityStatsMember(candidate) {
  if (!candidate.city) return null;
  return JSON.stringify({
    city: candidate.city,
    country: candidate.country || ''
  });
}

function withScoresToObjects(rows, mapper) {
  const output = [];
  for (let index = 0; index < rows.length; index += 2) {
    output.push(mapper(rows[index], Number(rows[index + 1])));
  }
  return output;
}

export async function saveGeneratedDomain(candidate, requestContext) {
  const metadata = cleanMetadata(candidate, requestContext);
  const cityMember = cityStatsMember(candidate);
  const timestamp = Date.now();
  const metadataEntries = Object.entries(metadata).flat();
  const multi = redis.multi();

  multi.hset(domainDataKey(candidate.domain), ...metadataEntries);
  multi.sadd(GENERATED_DOMAIN_INDEX_KEY, candidate.domain);
  multi.zadd(GENERATED_DOMAIN_TIMELINE_KEY, timestamp, candidate.domain);
  multi.incr(GENERATED_DOMAIN_COUNT_KEY);

  if (candidate.profession) {
    multi.zincrby(TOP_PROFESSIONS_KEY, 1, candidate.profession);
  }

  if (cityMember) {
    multi.zincrby(TOP_CITIES_KEY, 1, cityMember);
  }

  await multi.exec();
  return { id: candidate.domain };
}

export async function getDomainStats() {
  const [generatedCount, usedCount, topProfessionRows, topCityRows] = await Promise.all([
    redis.get(GENERATED_DOMAIN_COUNT_KEY),
    redis.scard(USED_DOMAINS_KEY),
    redis.zrevrange(TOP_PROFESSIONS_KEY, 0, 9, 'WITHSCORES'),
    redis.zrevrange(TOP_CITIES_KEY, 0, 9, 'WITHSCORES')
  ]);

  return {
    generatedDomains: Math.max(Number(generatedCount || 0), Number(usedCount || 0)),
    topProfessions: withScoresToObjects(topProfessionRows, (profession, count) => ({
      profession,
      count
    })),
    topCities: withScoresToObjects(topCityRows, (member, count) => {
      try {
        return { ...JSON.parse(member), count };
      } catch {
        return { city: member, country: '', count };
      }
    })
  };
}
