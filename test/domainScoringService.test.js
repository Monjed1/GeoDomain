import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateDomainOpportunity, evaluateTrademarkRisk } from '../src/services/domainScoringService.js';

function candidate(overrides = {}) {
  return {
    root: 'miamidivorcelawyer',
    domain: 'miamidivorcelawyer.com',
    city: 'Miami',
    state: 'Florida',
    country: 'United States',
    profession: 'divorce lawyer',
    serviceKeyword: 'divorce',
    pattern: 'City+Profession',
    ...overrides
  };
}

test('offline scoring rates high-intent local legal domains strongly', () => {
  const score = evaluateDomainOpportunity(candidate());

  assert.equal(score.searchDemand.confidence, 'offline_estimate');
  assert.equal(score.buyerPool.confidence, 'offline_estimate');
  assert.ok(score.domainPowerScore >= 75);
  assert.ok(score.searchDemand.estimatedCpcUsd >= 20);
  assert.ok(score.buyerPool.estimatedBusinesses >= 300);
  assert.ok(['high', 'very_high'].includes(score.salePotential));
});

test('trademark risk blocks protected brand terms', () => {
  const risk = evaluateTrademarkRisk(candidate({ root: 'googlemiamilawyer', domain: 'googlemiamilawyer.com' }));

  assert.equal(risk.level, 'high');
  assert.equal(risk.blocked, true);
  assert.ok(risk.flags.includes('protected_brand:google'));
});
