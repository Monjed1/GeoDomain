import crypto from 'node:crypto';

import { env } from '../config/env.js';
import { PROFESSION_PROFILES, expandBrandRoots, expandServiceTerms, getRandomProfessionProfiles, resolveProfessionProfile } from '../data/professionServices.js';
import { saveGeneratedDomain } from '../repositories/domainRepository.js';
import { ApiError } from '../utils/errors.js';
import {
  compactObject,
  createDomain,
  isCleanDomainRoot,
  scoreDomainRoot,
  shuffle,
  toDomainToken,
  uniqueByDomain
} from '../utils/domainUtils.js';
import { buildGeoCacheKey, getOrSetJson } from './cacheService.js';
import { getCityTokenVariants, resolveCities } from './cityService.js';
import { releaseDomain, reserveDomain } from './duplicateService.js';

const BRAND_PREFIXES = [
  'prime',
  'nova',
  'apex',
  'true',
  'metro',
  'urban',
  'clear',
  'swift',
  'summit',
  'atlas',
  'bright',
  'ever',
  'core',
  'fresh',
  'rapid',
  'elite',
  'smart',
  'local'
];

function createRequestHash(input) {
  return crypto.createHash('sha256').update(JSON.stringify(compactObject(input))).digest('hex');
}

function getProfessionProfiles(input) {
  const resolved = resolveProfessionProfile(input.profession);
  if (resolved) return [resolved];

  const randomCount = input.mode === 'targeted' ? 14 : 28;
  return getRandomProfessionProfiles(randomCount);
}

function createCandidate({ root, cityRecord, profile, serviceKeyword, pattern, maxRootLength }) {
  const cleanRoot = toDomainToken(root);
  if (!isCleanDomainRoot(cleanRoot, maxRootLength)) return null;

  return {
    root: cleanRoot,
    domain: createDomain(cleanRoot),
    city: cityRecord.city || '',
    state: cityRecord.state || '',
    country: cityRecord.country || '',
    profession: profile.profession,
    serviceKeyword: serviceKeyword ? toDomainToken(serviceKeyword) : '',
    pattern,
    score: scoreDomainRoot(cleanRoot, pattern)
  };
}

function getBrandableCityToken(cityTokens) {
  const preferred = cityTokens.find((token) => token.length >= 4 && token.length <= 10);
  return preferred || cityTokens[0];
}

function buildCandidatesForPair(cityRecord, profile, maxRootLength) {
  const cityTokens = getCityTokenVariants(cityRecord);
  const professionToken = toDomainToken(profile.profession);
  const serviceTerms = expandServiceTerms(profile);
  const brandRoots = expandBrandRoots(profile);
  const brandCity = getBrandableCityToken(cityTokens);
  const candidates = [];

  for (const cityToken of cityTokens) {
    candidates.push(
      createCandidate({
        root: `${cityToken}${professionToken}`,
        cityRecord,
        profile,
        pattern: 'City+Profession',
        maxRootLength
      })
    );

    candidates.push(
      createCandidate({
        root: `${professionToken}in${cityToken}`,
        cityRecord,
        profile,
        pattern: 'ProfessionInCity',
        maxRootLength
      })
    );

    for (const serviceTerm of serviceTerms) {
      const serviceToken = toDomainToken(serviceTerm);
      candidates.push(
        createCandidate({
          root: `${cityToken}${serviceToken}`,
          cityRecord,
          profile,
          serviceKeyword: serviceTerm,
          pattern: 'City+ServiceKeyword',
          maxRootLength
        })
      );

      candidates.push(
        createCandidate({
          root: `${serviceToken}${cityToken}`,
          cityRecord,
          profile,
          serviceKeyword: serviceTerm,
          pattern: 'ServiceKeyword+City',
          maxRootLength
        })
      );
    }
  }

  for (const brandRoot of brandRoots) {
    const brandToken = toDomainToken(brandRoot);

    candidates.push(
      createCandidate({
        root: `${brandCity}${brandToken}`,
        cityRecord,
        profile,
        serviceKeyword: brandRoot,
        pattern: 'BrandableGeoRoot',
        maxRootLength
      })
    );

    candidates.push(
      createCandidate({
        root: `${brandToken}${brandCity}`,
        cityRecord,
        profile,
        serviceKeyword: brandRoot,
        pattern: 'BrandableGeoRoot',
        maxRootLength
      })
    );

    for (const prefix of BRAND_PREFIXES) {
      candidates.push(
        createCandidate({
          root: `${prefix}${brandCity}${brandToken}`,
          cityRecord,
          profile,
          serviceKeyword: brandRoot,
          pattern: 'BrandableGeoRoot',
          maxRootLength
        })
      );

      candidates.push(
        createCandidate({
          root: `${brandCity}${prefix}${brandToken}`,
          cityRecord,
          profile,
          serviceKeyword: brandRoot,
          pattern: 'BrandableGeoRoot',
          maxRootLength
        })
      );
    }
  }

  return candidates.filter(Boolean);
}

export function createCandidatePool(input, options = {}) {
  const maxRootLength = options.maxRootLength || env.MAX_DOMAIN_ROOT_LENGTH;
  const cityLimit = input.city ? 1 : input.mode === 'targeted' ? 16 : 42;
  const cities = resolveCities(input, cityLimit);
  const profiles = getProfessionProfiles(input);

  const candidates = [];
  for (const cityRecord of cities) {
    for (const profile of profiles) {
      candidates.push(...buildCandidatesForPair(cityRecord, profile, maxRootLength));
    }
  }

  const uniqueCandidates = uniqueByDomain(candidates);
  const sorted = uniqueCandidates.sort((left, right) => right.score - left.score || left.root.length - right.root.length);

  return input.mode === 'random' ? shuffle(sorted).slice(0, 1200) : sorted.slice(0, 1200);
}

async function reserveCandidates({ candidates, count, requestContext, triedDomains }) {
  const reserved = [];
  let attempts = 0;

  for (const candidate of candidates) {
    if (reserved.length >= count) break;
    if (attempts >= env.DOMAIN_GENERATION_ATTEMPTS) break;
    attempts += 1;

    if (triedDomains.has(candidate.domain)) continue;
    triedDomains.add(candidate.domain);

    const reservedInRedis = await reserveDomain(candidate.domain);
    if (!reservedInRedis) continue;

    try {
      const saved = await saveGeneratedDomain(candidate, requestContext);
      if (!saved) {
        continue;
      }
      reserved.push(candidate);
    } catch (error) {
      await releaseDomain(candidate.domain);
      throw error;
    }
  }

  return reserved;
}

export async function generateDomains(input) {
  const cacheKey = buildGeoCacheKey(input);
  const requestContext = {
    mode: input.mode,
    requestHash: createRequestHash(input)
  };
  const triedDomains = new Set();
  const { value: cachedCandidates } = await getOrSetJson(cacheKey, () => createCandidatePool(input));

  if (!cachedCandidates.length) {
    throw new ApiError(422, 'No clean domain candidates could be generated for this request.', undefined, 'NO_CANDIDATES');
  }

  let domains = await reserveCandidates({
    candidates: cachedCandidates,
    count: input.count,
    requestContext,
    triedDomains
  });

  let round = 0;
  while (domains.length < input.count && round < 3) {
    round += 1;
    const expandedPool = createCandidatePool(input, {
      maxRootLength: Math.min(env.MAX_DOMAIN_ROOT_LENGTH + round * 3, 28)
    });

    const extraDomains = await reserveCandidates({
      candidates: shuffle(expandedPool),
      count: input.count - domains.length,
      requestContext,
      triedDomains
    });

    domains = [...domains, ...extraDomains];
  }

  if (domains.length === 0) {
    throw new ApiError(
      409,
      'No unused domains are available for this exact request. Try a broader country, city, or profession.',
      { requested: input.count, generated: domains.length },
      'INSUFFICIENT_UNIQUE_DOMAINS'
    );
  }

  return domains.map((candidate) => ({
    domain: candidate.domain,
    city: candidate.city,
    state: candidate.state,
    country: candidate.country,
    profession: candidate.profession,
    pattern: candidate.pattern
  }));
}

export function getSupportedProfessionCount() {
  return PROFESSION_PROFILES.length;
}
