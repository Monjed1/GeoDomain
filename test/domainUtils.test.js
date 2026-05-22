import assert from 'node:assert/strict';
import test from 'node:test';

import { isCleanDomainRoot, toDomainToken } from '../src/utils/domainUtils.js';

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
