const SALE_POTENTIAL_RANK = {
  low: 1,
  medium: 2,
  high: 3,
  very_high: 4
};

function getPremiumScore(candidate) {
  return Math.round(
    candidate.domainPowerScore * 0.4 +
      candidate.liquidity.liquidityScore * 0.22 +
      candidate.brandability.brandabilityScore * 0.18 +
      candidate.leadValue.leadValueScore * 0.12 +
      candidate.searchDemand.demandScore * 0.08
  );
}

export function candidatePassesPremiumFilters(candidate, filters = {}) {
  const normalizedFilters = {
    minDomainPowerScore: 76,
    minLiquidityScore: 70,
    minBrandabilityScore: 70,
    minLeadValueUsd: 0,
    ...filters
  };
  const requiredSalePotential = normalizedFilters.salePotential ? SALE_POTENTIAL_RANK[normalizedFilters.salePotential] : 0;
  const candidateSalePotential = SALE_POTENTIAL_RANK[candidate.salePotential] || 0;

  return (
    candidate.domainPowerScore >= normalizedFilters.minDomainPowerScore &&
    candidate.liquidity.liquidityScore >= normalizedFilters.minLiquidityScore &&
    candidate.brandability.brandabilityScore >= normalizedFilters.minBrandabilityScore &&
    candidate.leadValue.estimatedLeadValueUsd >= normalizedFilters.minLeadValueUsd &&
    candidateSalePotential >= requiredSalePotential &&
    candidate.trademarkRisk.level === 'low'
  );
}

export function rankPremiumCandidates(candidates, filters = {}) {
  return candidates
    .filter((candidate) => candidatePassesPremiumFilters(candidate, filters))
    .map((candidate) => ({
      ...candidate,
      premiumScore: getPremiumScore(candidate)
    }))
    .sort(
      (left, right) =>
        right.premiumScore - left.premiumScore ||
        right.domainPowerScore - left.domainPowerScore ||
        right.liquidity.liquidityScore - left.liquidity.liquidityScore ||
        right.brandability.brandabilityScore - left.brandability.brandabilityScore ||
        right.leadValue.estimatedLeadValueUsd - left.leadValue.estimatedLeadValueUsd ||
        right.searchDemand.estimatedCpcUsd - left.searchDemand.estimatedCpcUsd ||
        left.root.length - right.root.length
    );
}
