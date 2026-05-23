import {
  CITY_MARKET_TIERS,
  COUNTRY_CPC_MULTIPLIERS,
  HIGH_RISK_DOMAIN_TERMS,
  MARKET_SEGMENTS,
  PATTERN_INTENT_WEIGHTS,
  PROTECTED_BRAND_TERMS,
  SCORING_VERSION
} from '../data/marketSignals.js';
import { hasVowel, toDomainToken } from '../utils/domainUtils.js';

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function tokenText(candidate) {
  return [
    candidate.root,
    candidate.domain,
    candidate.city,
    candidate.state,
    candidate.country,
    candidate.profession,
    candidate.serviceKeyword,
    candidate.pattern
  ]
    .map((value) => toDomainToken(value || ''))
    .join(' ');
}

function getMarketSegment(candidate) {
  const text = tokenText(candidate);

  return (
    MARKET_SEGMENTS.find((segment) => segment.terms.some((term) => text.includes(toDomainToken(term)))) ||
    MARKET_SEGMENTS.find((segment) => segment.key === 'default_local')
  );
}

function getCitySignal(candidate) {
  const cityToken = toDomainToken(candidate.city);
  const countryToken = toDomainToken(candidate.country);
  const knownCity = CITY_MARKET_TIERS[cityToken];

  if (knownCity) {
    return {
      cityTier: knownCity.tier,
      marketIndex: knownCity.marketIndex,
      countryCpcMultiplier: COUNTRY_CPC_MULTIPLIERS[countryToken] || 0.42
    };
  }

  return {
    cityTier: candidate.city ? 'local' : 'broad',
    marketIndex: candidate.city ? 42 : 36,
    countryCpcMultiplier: COUNTRY_CPC_MULTIPLIERS[countryToken] || 0.42
  };
}

function getKeyword(candidate) {
  const city = candidate.city || candidate.state || candidate.country || 'local';
  const service = candidate.serviceKeyword || candidate.profession || 'service';
  return `${city} ${service}`.toLowerCase();
}

function getPhraseQuality(candidate) {
  const rootLength = candidate.root.length;
  const lengthScore = rootLength >= 8 && rootLength <= 18 ? 100 : rootLength <= 24 ? 82 : 62;
  const vowelScore = hasVowel(candidate.root) ? 100 : 45;
  const patternScore = PATTERN_INTENT_WEIGHTS[candidate.pattern] || 65;
  const exactLocalBonus = ['City+Profession', 'City+ServiceKeyword', 'ServiceNearCity'].includes(candidate.pattern) ? 8 : 0;
  return clamp(Math.round(lengthScore * 0.35 + vowelScore * 0.15 + patternScore * 0.5 + exactLocalBonus));
}

export function evaluateTrademarkRisk(candidate) {
  const root = toDomainToken(candidate.root || candidate.domain || '');
  const flags = [];

  for (const brand of PROTECTED_BRAND_TERMS) {
    if (root.includes(brand)) {
      flags.push(`protected_brand:${brand}`);
    }
  }

  for (const term of HIGH_RISK_DOMAIN_TERMS) {
    if (root.includes(term)) {
      flags.push(`high_risk_term:${term}`);
    }
  }

  const hasBrand = flags.some((flag) => flag.startsWith('protected_brand:'));
  const hasRiskTerm = flags.some((flag) => flag.startsWith('high_risk_term:'));
  const level = hasBrand ? 'high' : hasRiskTerm ? 'medium' : 'low';

  return {
    level,
    blocked: level === 'high',
    scorePenalty: hasBrand ? 100 : hasRiskTerm ? 18 : 0,
    flags
  };
}

export function evaluateDomainOpportunity(candidate) {
  const segment = getMarketSegment(candidate);
  const citySignal = getCitySignal(candidate);
  const trademarkRisk = evaluateTrademarkRisk(candidate);
  const patternIntent = PATTERN_INTENT_WEIGHTS[candidate.pattern] || 65;
  const phraseQualityScore = getPhraseQuality(candidate);
  const marketMultiplier = citySignal.marketIndex / 55;
  const patternMultiplier = patternIntent / 82;
  const urgencyMultiplier = segment.urgency / 75;

  const estimatedMonthlySearchVolume = Math.max(
    10,
    Math.round(segment.baseMonthlyVolume * marketMultiplier * patternMultiplier)
  );
  const estimatedCpcUsd = roundCurrency(
    Math.max(1.2, segment.baseCpcUsd * citySignal.countryCpcMultiplier * urgencyMultiplier * (patternIntent / 88))
  );
  const estimatedBuyerPool = Math.max(
    3,
    Math.round(segment.buyerDensity * citySignal.marketIndex * (candidate.city ? 1 : 0.65))
  );

  const demandScore = clamp(
    Math.round(
      Math.min(estimatedMonthlySearchVolume / 18, 62) +
        Math.min(estimatedCpcUsd * 1.15, 32) +
        (segment.urgency >= 80 ? 6 : 0)
    )
  );
  const buyerPoolScore = clamp(Math.round(Math.min(estimatedBuyerPool / 7, 78) + Math.min(segment.buyerDensity * 2.2, 22)));
  const domainPowerScore = clamp(
    Math.round(
      demandScore * 0.34 +
        buyerPoolScore * 0.24 +
        phraseQualityScore * 0.24 +
        segment.saleValue * 0.12 +
        patternIntent * 0.06 -
        trademarkRisk.scorePenalty
    )
  );
  const salePotential =
    domainPowerScore >= 88 ? 'very_high' : domainPowerScore >= 76 ? 'high' : domainPowerScore >= 62 ? 'medium' : 'low';
  const reasons = [];

  if (estimatedCpcUsd >= 20) reasons.push('high_estimated_cpc');
  if (estimatedMonthlySearchVolume >= 700) reasons.push('strong_estimated_search_demand');
  if (estimatedBuyerPool >= 300) reasons.push('large_estimated_buyer_pool');
  if (patternIntent >= 88) reasons.push('high_intent_domain_pattern');
  if (phraseQualityScore >= 85) reasons.push('clean_readable_domain');
  if (trademarkRisk.level === 'low') reasons.push('low_trademark_risk');

  return {
    scoringVersion: SCORING_VERSION,
    domainPowerScore,
    salePotential,
    reasons,
    searchDemand: {
      keyword: getKeyword(candidate),
      estimatedMonthlySearchVolume,
      estimatedCpcUsd,
      demandScore,
      marketSegment: segment.key,
      confidence: 'offline_estimate'
    },
    buyerPool: {
      estimatedBusinesses: estimatedBuyerPool,
      buyerPoolScore,
      cityTier: citySignal.cityTier,
      confidence: 'offline_estimate'
    },
    trademarkRisk
  };
}
