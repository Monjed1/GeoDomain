import { z } from 'zod';

import { env } from '../config/env.js';
import { normalizeHumanText } from '../utils/domainUtils.js';

const optionalCleanString = z.preprocess((value) => {
  if (value === undefined || value === null) return undefined;
  const clean = normalizeHumanText(value);
  return clean || undefined;
}, z.string().min(1).max(100).optional());

const baseGenerateShape = {
    country: optionalCleanString,
    city: optionalCleanString,
    state: optionalCleanString,
    State: optionalCleanString,
    profession: optionalCleanString,
    marketSegment: optionalCleanString,
    mode: z.enum(['random', 'targeted']).default('random'),
    count: z.coerce.number().int().min(1).max(env.MAX_GENERATE_COUNT).default(env.MAX_GENERATE_COUNT)
};

function normalizeGenerateData(data) {
  return {
    country: data.country,
    city: data.city,
    state: data.state || data.State,
    profession: data.profession,
    marketSegment: data.marketSegment,
    mode: data.mode,
    count: data.count
  };
}

export const generateDomainsSchema = z
  .object(baseGenerateShape)
  .strict()
  .transform(normalizeGenerateData);

export const generatePremiumDomainsSchema = z
  .object({
    ...baseGenerateShape,
    minDomainPowerScore: z.coerce.number().int().min(0).max(100).default(76),
    minLiquidityScore: z.coerce.number().int().min(0).max(100).default(70),
    minBrandabilityScore: z.coerce.number().int().min(0).max(100).default(70),
    minLeadValueUsd: z.coerce.number().min(0).max(100000).default(0),
    salePotential: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
    internalCandidateLimit: z.coerce.number().int().min(100).max(1200).default(600)
  })
  .strict()
  .transform((data) => ({
    ...normalizeGenerateData(data),
    premiumFilters: {
      minDomainPowerScore: data.minDomainPowerScore,
      minLiquidityScore: data.minLiquidityScore,
      minBrandabilityScore: data.minBrandabilityScore,
      minLeadValueUsd: data.minLeadValueUsd,
      salePotential: data.salePotential,
      internalCandidateLimit: data.internalCandidateLimit
    }
  }));

export function formatZodError(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || 'body',
    message: issue.message
  }));
}
