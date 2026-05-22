const BLOCKED_FRAGMENTS = [
  'casino',
  'porn',
  'xxx',
  'scam',
  'fake',
  'spam',
  'hack',
  'crack',
  'drugs',
  'weapon'
];

export function stripDiacritics(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeHumanText(value = '') {
  return stripDiacritics(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toTitleCase(value = '') {
  return normalizeHumanText(value)
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function toDomainToken(value = '') {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\+/g, 'plus')
    .replace(/[^a-z]/g, '');
}

export function createDomain(root) {
  return `${root}.com`;
}

export function hasVowel(value) {
  return /[aeiouy]/.test(value);
}

export function isCleanDomainRoot(root, maxLength = 20) {
  if (!root || typeof root !== 'string') return false;
  if (!/^[a-z]+$/.test(root)) return false;
  if (root.length < 6 || root.length > maxLength) return false;
  if (!hasVowel(root)) return false;
  if (/(.)\1\1/.test(root)) return false;
  if (/[bcdfghjklmnpqrstvwxz]{6,}/.test(root)) return false;
  return !BLOCKED_FRAGMENTS.some((fragment) => root.includes(fragment));
}

export function scoreDomainRoot(root, pattern = '') {
  const lengthDistance = Math.abs(root.length - 14);
  const patternBoost = pattern === 'BrandableGeoRoot' ? 3 : 0;
  const inPenalty = root.includes('in') && root.length > 18 ? 2 : 0;
  return Math.max(1, 25 - lengthDistance - inPenalty + patternBoost);
}

export function uniqueByDomain(candidates) {
  const seen = new Set();
  return candidates.filter((candidate) => {
    if (!candidate?.domain || seen.has(candidate.domain)) return false;
    seen.add(candidate.domain);
    return true;
  });
}

export function orderCandidatesByRandomPattern(candidates, options = {}) {
  const buckets = new Map();
  const preserveScore = Boolean(options.preserveScore);

  for (const candidate of candidates) {
    const pattern = candidate.pattern || 'Unknown';
    const bucket = buckets.get(pattern) || [];
    bucket.push(candidate);
    buckets.set(pattern, bucket);
  }

  for (const [pattern, bucket] of buckets.entries()) {
    const orderedBucket = preserveScore
      ? [...bucket].sort((left, right) => right.score - left.score || left.root.length - right.root.length)
      : shuffle(bucket);
    buckets.set(pattern, orderedBucket);
  }

  const orderedCandidates = [];
  let activePatterns = shuffle([...buckets.keys()]);

  while (activePatterns.length > 0) {
    const nextActivePatterns = [];

    for (const pattern of shuffle(activePatterns)) {
      const bucket = buckets.get(pattern);
      const candidate = bucket.shift();

      if (candidate) {
        orderedCandidates.push(candidate);
      }

      if (bucket.length > 0) {
        nextActivePatterns.push(pattern);
      }
    }

    activePatterns = nextActivePatterns;
  }

  return orderedCandidates;
}

export function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }
  return copy;
}

export function sample(items, count) {
  return shuffle(items).slice(0, count);
}

export function cacheSegment(value) {
  return toDomainToken(value || 'all') || 'all';
}

export function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}
