import assert from 'node:assert/strict';
import test from 'node:test';

import { isCleanDomainRoot, orderCandidatesByRandomPattern, toDomainToken } from '../src/utils/domainUtils.js';

test('normalizes domain tokens to lowercase letters only', () => {
  assert.equal(toDomainToken('S\u00e3o Paulo Dentist!'), 'saopaulodentist');
  assert.equal(toDomainToken('New York + AI'), 'newyorkplusai');
  assert.equal(toDomainToken('Miami 24/7 Doctor 365'), 'miamidoctor');
});

test('rejects dirty, numeric, or oversized domain roots', () => {
  assert.equal(isCleanDomainRoot('miamidoctor', 20), true);
  assert.equal(isCleanDomainRoot('miami-doctor', 20), false);
  assert.equal(isCleanDomainRoot('miami247doctor', 20), false);
  assert.equal(isCleanDomainRoot('thisdomainnameiswaytoolong', 20), false);
});

test('orders candidates by randomized pattern rounds', () => {
  const candidates = [
    { domain: 'aone.com', root: 'aone', pattern: 'PatternA', score: 1 },
    { domain: 'atwo.com', root: 'atwo', pattern: 'PatternA', score: 1 },
    { domain: 'bone.com', root: 'bone', pattern: 'PatternB', score: 1 },
    { domain: 'btwo.com', root: 'btwo', pattern: 'PatternB', score: 1 },
    { domain: 'cone.com', root: 'cone', pattern: 'PatternC', score: 1 },
    { domain: 'ctwo.com', root: 'ctwo', pattern: 'PatternC', score: 1 }
  ];

  const ordered = orderCandidatesByRandomPattern(candidates);
  const firstRoundPatterns = new Set(ordered.slice(0, 3).map((candidate) => candidate.pattern));

  assert.equal(ordered.length, candidates.length);
  assert.equal(new Set(ordered.map((candidate) => candidate.domain)).size, candidates.length);
  assert.deepEqual(firstRoundPatterns, new Set(['PatternA', 'PatternB', 'PatternC']));
});
