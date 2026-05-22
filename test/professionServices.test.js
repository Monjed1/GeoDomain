import assert from 'node:assert/strict';
import test from 'node:test';

import { expandServiceTerms, resolveProfessionProfile } from '../src/data/professionServices.js';

test('resolves required doctor mapping from aliases', () => {
  const profile = resolveProfessionProfile('physician');
  const services = expandServiceTerms(profile);

  assert.equal(profile.profession, 'doctor');
  assert.ok(services.includes('clinic'));
  assert.ok(services.includes('medical'));
  assert.ok(services.includes('health'));
  assert.ok(services.includes('surgery'));
  assert.ok(services.includes('care'));
});

test('creates a usable fallback profile for custom professions', () => {
  const profile = resolveProfessionProfile('marine surveyor');
  const services = expandServiceTerms(profile);

  assert.equal(profile.profession, 'marine surveyor');
  assert.ok(services.includes('marine surveyor'));
  assert.ok(services.includes('service'));
});
