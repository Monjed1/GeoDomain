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
  assert.ok(score.leadValue.estimatedLeadValueUsd >= 800);
  assert.ok(score.leadValue.leadValueScore >= 70);
  assert.ok(score.brandability.brandabilityScore >= 75);
  assert.ok(score.liquidity.liquidityScore >= 70);
  assert.ok(['high', 'very_high'].includes(score.salePotential));
});

test('lead value scoring rewards very high value injury lawyer leads', () => {
  const score = evaluateDomainOpportunity(
    candidate({
      root: 'miamiinjurylawyer',
      domain: 'miamiinjurylawyer.com',
      profession: 'personal injury lawyer',
      serviceKeyword: 'injury'
    })
  );

  assert.equal(score.leadValue.estimatedLeadValueUsd, 3500);
  assert.ok(score.leadValue.leadValueScore >= 90);
  assert.ok(score.reasons.includes('high_estimated_lead_value'));
});

test('brandability rewards short exact-match natural domains', () => {
  const shortExact = evaluateDomainOpportunity(candidate({ root: 'miamidentist', domain: 'miamidentist.com', profession: 'dentist', serviceKeyword: 'dentist' }));
  const longBrandable = evaluateDomainOpportunity(
    candidate({
      root: 'brightlocalmiamidentalexperts',
      domain: 'brightlocalmiamidentalexperts.com',
      profession: 'dentist',
      serviceKeyword: 'dental',
      pattern: 'BrandableGeoRoot'
    })
  );

  assert.ok(shortExact.brandability.brandabilityScore > longBrandable.brandability.brandabilityScore);
  assert.ok(shortExact.liquidity.liquidityScore >= longBrandable.liquidity.liquidityScore);
});

test('market segment classifier avoids substring false positives', () => {
  const florist = evaluateDomainOpportunity(
    candidate({
      root: 'safloralexperts',
      domain: 'safloralexperts.com',
      city: 'San Antonio',
      state: 'Texas',
      profession: 'florist',
      serviceKeyword: 'floral',
      pattern: 'CityServiceExperts'
    })
  );
  const foodTruck = evaluateDomainOpportunity(
    candidate({
      root: 'streetfoodtexas',
      domain: 'streetfoodtexas.com',
      city: 'Dallas',
      state: 'Texas',
      profession: 'food truck',
      serviceKeyword: 'street food',
      pattern: 'ServiceInState'
    })
  );
  const taxAdvisor = evaluateDomainOpportunity(
    candidate({
      root: 'dallasfilehub',
      domain: 'dallasfilehub.com',
      city: 'Dallas',
      state: 'Texas',
      profession: 'tax advisor',
      serviceKeyword: 'file',
      pattern: 'CityServiceHub'
    })
  );

  assert.equal(florist.searchDemand.marketSegment, 'events_creative');
  assert.equal(foodTruck.searchDemand.marketSegment, 'food_local');
  assert.equal(taxAdvisor.searchDemand.marketSegment, 'finance');
});

test('trademark risk blocks protected brand terms', () => {
  const risk = evaluateTrademarkRisk(candidate({ root: 'googlemiamilawyer', domain: 'googlemiamilawyer.com' }));

  assert.equal(risk.level, 'high');
  assert.equal(risk.blocked, true);
  assert.ok(risk.flags.includes('protected_brand:google'));
});
