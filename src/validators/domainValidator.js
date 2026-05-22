import { z } from 'zod';

import { env } from '../config/env.js';
import { normalizeHumanText } from '../utils/domainUtils.js';

const optionalCleanString = z.preprocess((value) => {
  if (value === undefined || value === null) return undefined;
  const clean = normalizeHumanText(value);
  return clean || undefined;
}, z.string().min(1).max(100).optional());

export const generateDomainsSchema = z
  .object({
    country: optionalCleanString,
    city: optionalCleanString,
    state: optionalCleanString,
    State: optionalCleanString,
    profession: optionalCleanString,
    mode: z.enum(['random', 'targeted']).default('random'),
    count: z.coerce.number().int().min(1).max(env.MAX_GENERATE_COUNT).default(env.MAX_GENERATE_COUNT)
  })
  .strict()
  .transform((data) => ({
    country: data.country,
    city: data.city,
    state: data.state || data.State,
    profession: data.profession,
    mode: data.mode,
    count: data.count
  }));

export function formatZodError(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || 'body',
    message: issue.message
  }));
}
