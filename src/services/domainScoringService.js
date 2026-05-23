import {
  CITY_MARKET_TIERS,
  COUNTRY_CPC_MULTIPLIERS,
  EXACT_INTENT_PATTERNS,
  HIGH_RISK_DOMAIN_TERMS,
  LEAD_VALUE_OVERRIDES,
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

function countSyllableLikeGroups(root) {
  const matches = root.match(/[aeiouy]+/g);
  return matches ? matches.length : 0;
}

function hasNaturalWordOrder(candidate) {
  return [
    'City+Profession',
    'City+ServiceKeyword',
    'BestCityService',
    'TopCityService',
    'UrgentCityService',
    'CityServicePros',
    'CityServiceExperts',
    'CityServiceHub',
    'CityServiceCenter',
    'StateService',
    'BrandableGeoRoot'
  ].includes(candidate.pattern);
}

function getLeadValueSignal(candidate, segment) {
  const text = tokenText(candidate);
  const override = LEAD_VALUE_OVERRIDES.find((entry) => entry.terms.some((term) => text.includes(toDomainToken(term))));
  const estimatedLeadValueUsd = override?.estimatedLeadValueUsd || segment.leadValueUsd;
  const leadValueScore = clamp(
    Math.round(
      Math.min(estimatedLeadValueUsd / 15, 75) +
        Math.min(segment.urgency / 5, 20) +
        (estimatedLeadValueUsd >= 1000 ? 5 : 0)
    )
  );

  return {
    estimatedLeadValueUsd,
    leadValueScore,
    closeDifficulty: override?.closeDifficulty || (estimatedLeadValueUsd >= 900 ? 'medium' : 'low'),
    confidence: 'offline_estimate'
  };
}

function getBrandabilityScore(candidate, phraseQualityScore, patternIntent) {
  const root = candidate.root;
  const lengthScore = root.length <= 12 ? 100 : root.length <= 16 ? 92 : root.length <= 20 ? 78 : root.length <= 24 ? 58 : 38;
  const syllableGroups = countSyllableLikeGroups(root);
  const pronounceableScore = clamp(hasVowel(root) ? 72 + Math.min(syllableGroups * 7, 24) : 28);
  const naturalOrderScore = hasNaturalWordOrder(candidate) ? 92 : 74;
  const exactIntentScore = EXACT_INTENT_PATTERNS.includes(candidate.pattern) ? 95 : candidate.pattern === 'BrandableGeoRoot' ? 72 : 82;
  const simplicityScore = /[qxz]{2,}|[bcdfghjklmnpqrstvwxz]{5,}/.test(root) ? 58 : 92;
  const score = clamp(
    Math.round(
      lengthScore * 0.24 +
        pronounceableScore * 0.18 +
        naturalOrderScore * 0.2 +
        exactIntentScore * 0.24 +
        simplicityScore * 0.1 +
        phraseQualityScore * 0.04
    )
  );
  const strengths = [];

  if (lengthScore >= 90) strengths.push('short_domain_root');
  if (pronounceableScore >= 85) strengths.push('pronounceable');
  if (naturalOrderScore >= 90) strengths.push('natural_word_order');
  if (exactIntentScore >= 90) strengths.push('exact_match_intent');
  if (simplicityScore >= 90) strengths.push('simple_letters');

  return {
    brandabilityScore: score,
    lengthScore,
    pronounceableScore,
    naturalWordOrderScore: naturalOrderScore,
    exactMatchIntentScore: exactIntentScore,
    simplicityScore,
    strengths
  };
}

function getLiquidityScore({ candidate, demandScore, buyerPoolScore, brandability, leadValue, estimatedCpcUsd, citySignal }) {
  const exactMatchBoost = EXACT_INTENT_PATTERNS.includes(candidate.pattern) ? 8 : 0;
  const cityBoost = citySignal.marketIndex >= 75 ? 7 : citySignal.marketIndex >= 60 ? 4 : 0;
  const cpcScore = clamp(Math.round(Math.min(estimatedCpcUsd * 2.4, 100)));
  const leadLiquidityPenalty = leadValue.closeDifficulty === 'high' ? 5 : leadValue.closeDifficulty === 'medium' ? 2 : 0;
  const liquidityScore = clamp(
    Math.round(
      demandScore * 0.22 +
        buyerPoolScore * 0.24 +
        brandability.brandabilityScore * 0.24 +
        cpcScore * 0.12 +
        citySignal.marketIndex * 0.1 +
        leadValue.leadValueScore * 0.08 +
        exactMatchBoost +
        cityBoost -
        leadLiquidityPenalty
    )
  );
  const sellSpeed =
    liquidityScore >= 86 ? 'fast' : liquidityScore >= 72 ? 'moderate_fast' : liquidityScore >= 58 ? 'moderate' : 'slow';

  return {
    liquidityScore,
    sellSpeed,
    exactMatch: EXACT_INTENT_PATTERNS.includes(candidate.pattern),
    cpcScore,
    cityMarketIndex: citySignal.marketIndex,
    confidence: 'offline_estimate'
  };
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
  const leadValue = getLeadValueSignal(candidate, segment);
  const brandability = getBrandabilityScore(candidate, phraseQualityScore, patternIntent);
  const liquidity = getLiquidityScore({
    candidate,
    demandScore,
    buyerPoolScore,
    brandability,
    leadValue,
    estimatedCpcUsd,
    citySignal
  });
  const domainPowerScore = clamp(
    Math.round(
      demandScore * 0.23 +
        buyerPoolScore * 0.18 +
        brandability.brandabilityScore * 0.17 +
        liquidity.liquidityScore * 0.16 +
        leadValue.leadValueScore * 0.14 +
        segment.saleValue * 0.08 +
        patternIntent * 0.04 -
        trademarkRisk.scorePenalty
    )
  );
  const salePotential =
    domainPowerScore >= 88 ? 'very_high' : domainPowerScore >= 76 ? 'high' : domainPowerScore >= 62 ? 'medium' : 'low';
  const reasons = [];

  if (estimatedCpcUsd >= 20) reasons.push('high_estimated_cpc');
  if (estimatedMonthlySearchVolume >= 700) reasons.push('strong_estimated_search_demand');
  if (estimatedBuyerPool >= 300) reasons.push('large_estimated_buyer_pool');
  if (leadValue.leadValueScore >= 80) reasons.push('high_estimated_lead_value');
  if (brandability.brandabilityScore >= 85) reasons.push('strong_brandability');
  if (liquidity.liquidityScore >= 80) reasons.push('high_liquidity');
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
    leadValue,
    brandability,
    liquidity,
    trademarkRisk
  };
}
