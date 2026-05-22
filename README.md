# Geo + Profession Domain Generator API

A production-ready REST API for generating high-value `.com` geo-professional domain names for domain flipping, SEO research, and n8n automation.

The API generates clean domain ideas from country, state, city, profession, mode, and count. It uses Redis for caching, rate limiting, permanent duplicate prevention, generated-domain metadata, and stats.

## What It Does

- Generates `.com` domain names from geo + profession inputs.
- Supports `random` and `targeted` generation modes.
- Uses city and profession expansion when inputs are missing.
- Prevents duplicate domains globally with the Redis set `used_domains`.
- Stores every generated domain in Redis metadata keys.
- Caches candidate pools for faster repeat requests.
- Provides `/health` and `/stats` endpoints.
- Designed for n8n HTTP Request nodes and VPS deployment.

## Tech Stack

- Node.js 24 LTS or newer
- Express.js
- Redis with append-only persistence
- dotenv
- axios
- zod
- ioredis

## Project Structure

```text
src/
  app.js
  server.js
  config/
    env.js
    redis.js
  controllers/
    domainController.js
    healthController.js
    statsController.js
  data/
    professionServices.js
    worldCities.json
  middleware/
    auth.js
    errorHandler.js
    rateLimiter.js
    requestLogger.js
  repositories/
    domainRepository.js
  routes/
    domainRoutes.js
    healthRoutes.js
    statsRoutes.js
  services/
    bootstrapService.js
    cacheService.js
    cityService.js
    domainGeneratorService.js
    duplicateService.js
  utils/
    domainUtils.js
    errors.js
    logger.js
  validators/
    domainValidator.js
test/
```

## Quick Start With Docker

```bash
cp .env.example .env
docker compose up --build
```

The API runs on:

```text
http://localhost:3232
```

Redis is included in `docker-compose.yml` and runs with append-only persistence:

```text
appendonly yes
appendfsync everysec
```

That means generated domains, stats, and duplicate-prevention data survive normal container restarts.

## Environment Variables

Create `.env` from `.env.example`.

```bash
NODE_ENV=development
PORT=3232
TRUST_PROXY=false

API_KEY=

REDIS_URL=redis://localhost:6379

CACHE_TTL_SECONDS=3600
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=60
MAX_GENERATE_COUNT=10
MAX_DOMAIN_ROOT_LENGTH=20
DOMAIN_GENERATION_ATTEMPTS=1600
```

`PORT` controls the API port. Default is `3232`.

`API_KEY` is optional. If set, `/generate-domains` and `/stats` require:

```http
Authorization: Bearer followed-by-the-api-key-value
```

`REDIS_URL` points to Redis.

`CACHE_TTL_SECONDS` controls how long generated candidate pools stay cached.

`RATE_LIMIT_ENABLED` turns rate limiting on or off.

`RATE_LIMIT_WINDOW_SECONDS` is the rate limit window size.

`RATE_LIMIT_MAX_REQUESTS` is how many `/generate-domains` requests one client can make per window.

`MAX_GENERATE_COUNT` controls the maximum number of domains per request. The default and recommended maximum is `10`.

`MAX_DOMAIN_ROOT_LENGTH` controls preferred maximum domain length before `.com`.

`DOMAIN_GENERATION_ATTEMPTS` controls how many candidates the generator can try before stopping.

## Rate Limit Examples

Allow 60 generation requests per minute:

```bash
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=60
```

Allow 500 generation requests per day:

```bash
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_SECONDS=86400
RATE_LIMIT_MAX_REQUESTS=500
```

Disable rate limiting:

```bash
RATE_LIMIT_ENABLED=false
```

The API also enforces `MAX_GENERATE_COUNT=10`, so each request can return at most 10 domains unless you intentionally change that limit.

## API Endpoints

### `GET /health`

Checks API and Redis health.

Request:

```bash
curl http://localhost:3232/health
```

Response:

```json
{
  "success": true,
  "service": "geo-profession-domain-generator-api",
  "uptimeSeconds": 120,
  "dependencies": {
    "redis": {
      "status": "ok",
      "latencyMs": 2
    }
  }
}
```

### `POST /generate-domains`

Generates globally unique `.com` domains.

URL:

```text
POST http://localhost:3232/generate-domains
```

Request body:

```json
{
  "country": "United States",
  "State": "Florida",
  "city": "Miami",
  "profession": "doctor",
  "mode": "targeted",
  "count": 10
}
```

Field rules:

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `country` | No | string | Used to filter built-in city data. |
| `State` | No | string | Uppercase `State` is supported as requested. |
| `state` | No | string | Lowercase `state` is also supported. |
| `city` | No | string | If missing, random cities are selected from built-in data. |
| `profession` | No | string | If missing, random profession profiles are selected. |
| `mode` | No | `random` or `targeted` | Defaults to `random`. |
| `count` | No | number | Defaults to `10`; max controlled by `MAX_GENERATE_COUNT`. |

Example with API key:

```bash
curl -X POST http://localhost:3232/generate-domains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer followed-by-the-api-key-value" \
  -d "{\"country\":\"United States\",\"State\":\"Florida\",\"city\":\"Miami\",\"profession\":\"doctor\",\"mode\":\"targeted\",\"count\":10}"
```

Response:

```json
{
  "success": true,
  "count": 3,
  "domains": [
    {
      "domain": "miamidoctor.com",
      "city": "Miami",
      "state": "Florida",
      "country": "United States",
      "profession": "doctor",
      "pattern": "City+Profession"
    },
    {
      "domain": "doctorinmiami.com",
      "city": "Miami",
      "state": "Florida",
      "country": "United States",
      "profession": "doctor",
      "pattern": "ProfessionInCity"
    },
    {
      "domain": "miamiclinic.com",
      "city": "Miami",
      "state": "Florida",
      "country": "United States",
      "profession": "doctor",
      "pattern": "City+ServiceKeyword"
    }
  ]
}
```

The response count can be lower than requested only when the exact request has too few unused candidates left. If no unused domains are available, the API returns `409`.

### `GET /stats`

Returns generated-domain stats from Redis.

Request:

```bash
curl http://localhost:3232/stats
```

Response:

```json
{
  "success": true,
  "generatedDomains": 250,
  "redisUsedDomains": 250,
  "supportedProfessionProfiles": 92,
  "topProfessions": [
    {
      "profession": "doctor",
      "count": 40
    }
  ],
  "topCities": [
    {
      "city": "Miami",
      "country": "United States",
      "count": 20
    }
  ]
}
```

If `API_KEY` is set, `/stats` also requires the bearer token.

## Domain Generation Logic

The generator uses multiple patterns. The `pattern` value in each response tells you which structure created the domain.

| Pattern | Structure | Example |
| --- | --- | --- |
| `City+Profession` | `{City}{Profession}.com` | `miamidoctor.com` |
| `ProfessionInCity` | `{Profession}In{City}.com` | `doctorinmiami.com` |
| `City+ServiceKeyword` | `{City}{ServiceKeyword}.com` | `miamiclinic.com` |
| `ServiceKeyword+City` | `{ServiceKeyword}{City}.com` | `clinicmiami.com` |
| `BestCityService` | `best{City}{ServiceKeyword}.com` | `bestmiamidentist.com` |
| `TopCityService` | `top{City}{ServiceKeyword}.com` | `topmiamilawyer.com` |
| `UrgentCityService` | `urgent{City}{ServiceKeyword}.com` | `urgentmiamicare.com` |
| `CityServicePros` | `{City}{ServiceKeyword}pros.com` | `miamiroofpros.com` |
| `CityServiceExperts` | `{City}{ServiceKeyword}experts.com` | `miamilegalexperts.com` |
| `ServiceNearCity` | `{ServiceKeyword}near{City}.com` | `dentistnearmiami.com` |
| `CityServiceHub` | `{City}{ServiceKeyword}hub.com` | `miamidentalhub.com` |
| `CityServiceCenter` | `{City}{ServiceKeyword}center.com` | `miamimedicalcenter.com` |
| `StateService` | `{State}{ServiceKeyword}.com` | `floridadental.com` |
| `ServiceInState` | `{ServiceKeyword}In{State}.com` | `lawyerinflorida.com` |
| `BrandableGeoRoot` | brand/geo/service hybrid | `brightmiamismile.com` |

Pattern selection is randomized on every generation request. The API groups candidates by pattern, shuffles the pattern order, and pulls from different pattern groups in rounds so one pattern does not dominate the whole response. In `targeted` mode, the pattern order is still randomized, but stronger candidates inside each pattern group are preferred.

Clean-domain rules:

- lowercase only
- `.com` only
- no spaces
- letters only from `a` to `z`
- no numbers in the domain root
- avoids blocked unsafe fragments
- rejects roots that are too short, too long, or hard to pronounce
- prefers roots around 20 characters or less

## Profession Expansion

The built-in profession taxonomy includes many common commercial categories such as:

```text
doctor, lawyer, dentist, fitness, tech, plumber, electrician, roofer,
contractor, cleaner, pest control, hvac, locksmith, mechanic, realtor,
accountant, financial advisor, architect, engineer, marketing agency,
seo consultant, photographer, therapist, veterinarian, web designer,
app developer, cybersecurity, logistics, solar installer, handyman
```

Examples of automatic service expansion:

```text
doctor -> clinic, medical, health, surgery, care
lawyer -> legal, law, attorney, justice
dentist -> dental, smile, teeth, oral
fitness -> gym, training, coach, body
tech -> ai, software, app, cloud, dev
```

If the user sends a profession not in the built-in taxonomy, the API creates a safe fallback profile using that profession plus generic commercial terms such as service, expert, pro, care, solutions, agency, and local.

## City Selection

If `city` is provided, that city is used.

If `city` is missing, the API selects cities from the built-in world city dataset. If `country` or `State` is provided, city selection is filtered by those fields when possible.

If no matching built-in city is found, the generator still works by normalizing the provided city, state, and country values.

## Redis Keys

Main Redis keys:

| Key | Type | Purpose |
| --- | --- | --- |
| `used_domains` | Set | Global duplicate-prevention set. |
| `geo:v2:{country}:{city}:{profession}:{mode}:{count}` | String JSON | Cached candidate pool. |
| `domain:{domain}` | Hash | Metadata for each generated domain. |
| `generated_domains` | Set | Index of generated domains. |
| `generated_domains_by_time` | Sorted set | Timeline index. |
| `stats:generated_domains` | String counter | Total generated count. |
| `stats:top_professions` | Sorted set | Profession leaderboard. |
| `stats:top_cities` | Sorted set | City leaderboard. |

Final generated domains are never returned directly from cache. Redis caches candidate pools, then each candidate is checked atomically against `used_domains` before it is returned. The `v2` cache version is used so older cached pools do not lock the API into old pattern behavior after an update.

## Duplicate Prevention

For every candidate domain:

1. The API checks Redis set `used_domains`.
2. If the domain already exists, it is discarded.
3. If the domain is new, it is added to `used_domains`.
4. Metadata and stats are saved in Redis.
5. The domain is returned to the client.

This prevents the same domain from being returned twice across all workflows and requests.

## n8n Setup

Use an HTTP Request node.

Settings:

```text
Method: POST
URL: http://localhost:3232/generate-domains
Body Content Type: JSON
```

JSON body:

```json
{
  "country": "United States",
  "State": "Florida",
  "city": "Miami",
  "profession": "dentist",
  "mode": "targeted",
  "count": 10
}
```

If `API_KEY` is configured, add a header:

```text
Authorization: Bearer followed-by-the-api-key-value
```

Recommended n8n automation pattern:

1. Trigger workflow on schedule.
2. Send geo/profession payload to `/generate-domains`.
3. Split returned `domains`.
4. Check registrar availability or SEO metrics.
5. Save results to a sheet, CRM, Airtable, or database.

## VPS Deployment

Basic VPS flow:

```bash
cd /opt/geo-profession-domain-generator-api
cp .env.example .env
docker compose up -d --build
```

Check logs:

```bash
docker compose logs -f api
```

Check health:

```bash
curl http://localhost:3232/health
```

If using a firewall, allow port `3232`:

```bash
sudo ufw allow 3232/tcp
```

For production, set `API_KEY` in `.env`.

## Reverse Proxy Example

If using Nginx, proxy traffic to the local API:

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3232;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

When behind a proxy, set:

```bash
TRUST_PROXY=true
```

## Error Responses

Validation error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body.",
    "details": [
      {
        "path": "count",
        "message": "Number must be less than or equal to 10"
      }
    ],
    "requestId": "..."
  }
}
```

Rate limit error:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Reduce request frequency or increase RATE_LIMIT_MAX_REQUESTS.",
    "details": {
      "windowSeconds": 60,
      "maxRequests": 60
    },
    "requestId": "..."
  }
}
```

Not enough unique domains:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_UNIQUE_DOMAINS",
    "message": "No unused domains are available for this exact request. Try a broader country, city, or profession.",
    "details": {
      "requested": 10,
      "generated": 0
    },
    "requestId": "..."
  }
}
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the API:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Run syntax check:

```bash
npm run lint
```

## Production Notes

- Use a strong `API_KEY`.
- Keep Redis persistence enabled.
- Back up Redis data if generated-domain history is business-critical.
- Put the API behind Nginx or another reverse proxy for TLS.
- Keep `MAX_GENERATE_COUNT=10` for predictable n8n batching.
- Increase `RATE_LIMIT_MAX_REQUESTS` for trusted private automation.
- Use `TRUST_PROXY=true` only when the app is behind a trusted reverse proxy.
