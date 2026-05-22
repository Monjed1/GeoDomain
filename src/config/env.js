import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return value;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3232),
  TRUST_PROXY: booleanFromEnv.default(false),
  API_KEY: z.string().trim().optional().or(z.literal('')),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  CACHE_TTL_SECONDS: z.coerce.number().int().min(60).default(3600),
  RATE_LIMIT_ENABLED: booleanFromEnv.default(true),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(1).default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(60),
  MAX_GENERATE_COUNT: z.coerce.number().int().min(1).max(10).default(10),
  MAX_DOMAIN_ROOT_LENGTH: z.coerce.number().int().min(12).max(28).default(20),
  DOMAIN_GENERATION_ATTEMPTS: z.coerce.number().int().min(100).max(10000).default(1600)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  throw new Error('Invalid environment configuration');
}

export const env = {
  ...parsed.data,
  API_KEY: parsed.data.API_KEY || undefined
};

export const isProduction = env.NODE_ENV === 'production';
