import assert from 'node:assert/strict';
import test from 'node:test';

import { candidatePassesPremiumFilters, rankPremiumCandidates } from '../src/services/premiumRankingService.js';

function candidate(overrides = {}) {
  return {
    domain: 'miamiinjurylawyer.com',
    root: 'miamiinjurylawyer',
    pattern: 'City+Profession',
    domainPowerScore: 92,
    salePotential: 'very_high',
    searchDemand: {
      demandScore: 96,
      estimatedCpcUsd: 52
    },
    leadValue: {
      estimatedLeadValueUsd: 3500,
      leadValueScore: 100
    },
    brandability: {
      brandabilityScore: 90
    },
    liquidity: {
      liquidityScore: 94
    },
    trademarkRisk: {
      level: 'low'
    },
    ...overrides
  };
}

test('premium filters reject weak or risky candidates', () => {
  const filters = {
    minDomainPowerScore: 80,
    minLiquidityScore: 75,
    minBrandabilityScore: 75,
    minLeadValueUsd: 500,
    salePotential: 'high'
  };

  assert.equal(candidatePassesPremiumFilters(candidate(), filters), true);
  assert.equal(candidatePassesPremiumFilters(candidate({ domainPowerScore: 62 }), filters), false);
  assert.equal(candidatePassesPremiumFilters(candidate({ trademarkRisk: { level: 'medium' } }), filters), false);
});

test('premium ranking prioritizes stronger sellable domains', () => {
  const ranked = rankPremiumCandidates([
    candidate({
      domain: 'smallcafemiami.com',
      domainPowerScore: 78,
      salePotential: 'high',
      searchDemand: { demandScore: 70, estimatedCpcUsd: 4 },
      leadValue: { estimatedLeadValueUsd: 90, leadValueScore: 30 },
      brandability: { brandabilityScore: 82 },
      liquidity: { liquidityScore: 76 }
    }),
    candidate()
  ]);

  assert.equal(ranked[0].domain, 'miamiinjurylawyer.com');
  assert.ok(ranked[0].premiumScore > ranked[1].premiumScore);
});
