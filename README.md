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
| `profession` | No | string | If missing, the API picks one random market segment for the request, then selects professions from that segment. |
| `marketSegment` | No | string | Optional segment such as `legal`, `dental`, `medical`, `home_services`, `auto`, `finance`, `marketing_tech`, or `food_local`. Used only when `profession` is missing. |
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
  "count": 1,
  "domains": [
    {
      "domain": "miamidoctor.com",
      "city": "Miami",
      "state": "Florida",
      "country": "United States",
      "profession": "doctor",
      "pattern": "City+Profession",
      "selectedMarketSegment": "medical",
      "domainPowerScore": 82,
      "salePotential": "high",
      "reasons": [
        "strong_estimated_search_demand",
        "large_estimated_buyer_pool",
        "high_intent_domain_pattern",
        "clean_readable_domain",
        "low_trademark_risk"
      ],
      "searchDemand": {
        "keyword": "miami doctor",
        "estimatedMonthlySearchVolume": 806,
        "estimatedCpcUsd": 18.21,
        "demandScore": 89,
        "marketSegment": "medical",
        "confidence": "offline_estimate"
      },
      "buyerPool": {
        "estimatedBusinesses": 484,
        "buyerPoolScore": 82,
        "cityTier": "large",
        "confidence": "offline_estimate"
      },
      "leadValue": {
        "estimatedLeadValueUsd": 520,
        "leadValueScore": 52,
        "closeDifficulty": "low",
        "confidence": "offline_estimate"
      },
      "brandability": {
        "brandabilityScore": 96,
        "lengthScore": 100,
        "pronounceableScore": 96,
        "naturalWordOrderScore": 92,
        "exactMatchIntentScore": 95,
        "simplicityScore": 92,
        "strengths": [
          "short_domain_root",
          "pronounceable",
          "natural_word_order",
          "exact_match_intent",
          "simple_letters"
        ]
      },
      "liquidity": {
        "liquidityScore": 95,
        "sellSpeed": "fast",
        "exactMatch": true,
        "cpcScore": 50,
        "cityMarketIndex": 78,
        "confidence": "offline_estimate"
      },
      "trademarkRisk": {
        "level": "low",
        "flags": []
      }
    }
  ]
}
```

The response count can be lower than requested only when the exact request has too few unused candidates left. If no unused domains are available, the API returns `409`.

Every returned domain includes offline opportunity scoring. The API does not call Google, USPTO, DataForSEO, or any external provider. Scores are estimated from built-in commercial-intent, city-market, buyer-density, pattern-quality, and protected-brand rules.

### `POST /generate-premium-domains`

Generates a larger internal candidate pool, filters weak domains, ranks the survivors, reserves only the best unused domains, and returns the premium winners.

Use this endpoint when you want the strongest domains for resale or lead generation instead of a broad random mix.

URL:

```text
POST http://localhost:3232/generate-premium-domains
```

Request body:

```json
{
  "country": "United States",
  "State": "Florida",
  "city": "Miami",
  "profession": "injurylawyer",
  "mode": "targeted",
  "count": 10,
  "minDomainPowerScore": 80,
  "minLiquidityScore": 75,
  "minBrandabilityScore": 75,
  "minLeadValueUsd": 500,
  "salePotential": "high",
  "internalCandidateLimit": 600
}
```

Premium-only fields:

| Field | Required | Default | Notes |
| --- | --- | --- | --- |
| `minDomainPowerScore` | No | `76` | Rejects candidates below this overall score. |
| `minLiquidityScore` | No | `70` | Rejects domains that may be harder to sell quickly. |
| `minBrandabilityScore` | No | `70` | Rejects awkward or weak brandable names. |
| `minLeadValueUsd` | No | `0` | Rejects niches below this estimated customer value. |
| `salePotential` | No | none | Optional minimum: `low`, `medium`, `high`, or `very_high`. |
| `internalCandidateLimit` | No | `600` | Number of ranked internal candidates considered; max `1200`. |

Example response:

```json
{
  "success": true,
  "premium": true,
  "count": 1,
  "candidatePoolSize": 600,
  "filters": {
    "minDomainPowerScore": 80,
    "minLiquidityScore": 75,
    "minBrandabilityScore": 75,
    "minLeadValueUsd": 500,
    "salePotential": "high",
    "internalCandidateLimit": 600
  },
  "domains": [
    {
      "domain": "miamiinjurylawyer.com",
      "city": "Miami",
      "state": "Florida",
      "country": "United States",
      "profession": "personal injury lawyer",
      "pattern": "City+Profession",
      "selectedMarketSegment": "legal",
      "premiumScore": 95,
      "domainPowerScore": 94,
      "salePotential": "very_high",
      "searchDemand": {
        "keyword": "miami injury",
        "estimatedMonthlySearchVolume": 1311,
        "estimatedCpcUsd": 54.92,
        "demandScore": 100,
        "marketSegment": "legal",
        "confidence": "offline_estimate"
      },
      "leadValue": {
        "estimatedLeadValueUsd": 3500,
        "leadValueScore": 100,
        "closeDifficulty": "high",
        "confidence": "offline_estimate"
      },
      "liquidity": {
        "liquidityScore": 96,
        "sellSpeed": "fast",
        "exactMatch": true,
        "cpcScore": 100,
        "cityMarketIndex": 78,
        "confidence": "offline_estimate"
      },
      "trademarkRisk": {
        "level": "low",
        "flags": []
      }
    }
  ]
}
```

If no unused domains match the premium filters, the endpoint returns `409` with code `INSUFFICIENT_PREMIUM_DOMAINS`. Lower the filters or broaden the city/profession.

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

## Offline Opportunity Scoring

The API estimates sale potential without external APIs. Each generated domain gets:

- `domainPowerScore`: overall score from `0` to `100`
- `salePotential`: `very_high`, `high`, `medium`, or `low`
- `searchDemand`: estimated local keyword volume and CPC
- `buyerPool`: estimated number of businesses that could buy the domain
- `leadValue`: estimated value of one converted customer in that niche
- `brandability`: score for shortness, pronounceability, natural order, and exact-match intent
- `liquidity`: estimate of how easy the domain may be to sell quickly
- `trademarkRisk`: local protected-brand risk check
- `reasons`: short machine-friendly signals explaining the score

The offline model uses:

- profession category value, such as legal, dental, medical, home services, auto, real estate, finance, tech, food, and beauty
- city market tier, such as mega, large, medium, local, or broad
- country CPC multiplier
- domain pattern intent weight
- domain length and readability
- estimated lead value economics
- exact-match and word-order liquidity factors
- local protected-brand and high-risk term lists

High trademark-risk domains are rejected before they can be returned or stored. This is a local risk filter, not legal advice or an official trademark clearance.

### Random Market Segment Selection

If `profession` is missing, the API chooses one random market segment for that request and generates domains only from professions in that segment. This keeps each no-profession request focused while still producing variety across repeated n8n runs.

Examples of supported market segments:

```text
legal
dental
medical
home_services
real_estate
auto
finance
beauty
marketing_tech
events_creative
education_fitness
food_local
```

You can also force a specific segment by sending `marketSegment` and leaving `profession` empty:

```json
{
  "country": "United States",
  "city": "Miami",
  "marketSegment": "home_services",
  "mode": "targeted",
  "count": 10
}
```

If `profession` is provided, the API does not randomize the market segment. It uses the real segment detected from that profession so scoring stays accurate.

### Score Interpretation Guide

All scoring is offline and heuristic-based. The scores are designed for sorting and filtering domain ideas, not for guaranteeing domain sales.

#### `domainPowerScore`

Overall score from `0` to `100`. This is the main field to sort by.

It combines:

- search demand
- estimated CPC
- buyer pool
- lead value
- brandability
- liquidity
- pattern intent
- trademark risk penalty

| Score | Meaning | Suggested action |
| --- | --- | --- |
| `88-100` | Excellent domain opportunity. Strong commercial intent, buyer pool, and resale potential. | Prioritize first. Check availability and consider outreach. |
| `76-87` | Strong domain opportunity. Usually worth reviewing manually. | Good candidate for domain flipping or lead-gen testing. |
| `62-75` | Medium opportunity. Some signals are good, but one or more areas are weaker. | Keep if niche/city matters; otherwise compare against better domains. |
| `0-61` | Weak opportunity. Low demand, low buyer pool, weak wording, or low commercial value. | Usually skip unless you have a specific buyer in mind. |

#### `salePotential`

Human-readable version of `domainPowerScore`.

| Value | Meaning |
| --- | --- |
| `very_high` | Best candidates. Usually high-intent services in good cities with strong buyer economics. |
| `high` | Strong candidates. Good enough for review and outreach. |
| `medium` | Usable, but not obviously premium. |
| `low` | Weak resale signal. Usually skip. |

#### `searchDemand`

Estimates how many people may search for the local service and how expensive the keyword is.

Fields:

| Field | Meaning |
| --- | --- |
| `keyword` | Offline keyword phrase used for scoring, such as `miami injury`. |
| `estimatedMonthlySearchVolume` | Estimated local monthly search demand. |
| `estimatedCpcUsd` | Estimated cost per click in USD. Higher CPC means advertisers may pay more for leads. |
| `demandScore` | Combined demand score from `0` to `100`. |
| `marketSegment` | Category used by the offline model, such as `legal`, `dental`, `medical`, or `home_services`. |
| `confidence` | Always `offline_estimate` because no external API is used. |

Good and bad ranges:

| Metric | Good | Medium | Weak |
| --- | --- | --- | --- |
| `estimatedMonthlySearchVolume` | `700+` | `250-699` | below `250` |
| `estimatedCpcUsd` | `$20+` | `$7-$19.99` | below `$7` |
| `demandScore` | `80+` | `55-79` | below `55` |

High CPC niches like injury law, roofing, plumbing, HVAC, dental implants, mortgage, and B2B software often have stronger resale potential.

#### `buyerPool`

Estimates how many businesses could realistically buy the domain.

Fields:

| Field | Meaning |
| --- | --- |
| `estimatedBusinesses` | Estimated number of potential buyers in the city/category. |
| `buyerPoolScore` | Buyer pool score from `0` to `100`. |
| `cityTier` | City market size: `mega`, `large`, `medium`, `local`, or `broad`. |
| `confidence` | Always `offline_estimate`. |

Good and bad ranges:

| Metric | Good | Medium | Weak |
| --- | --- | --- | --- |
| `estimatedBusinesses` | `300+` | `80-299` | below `80` |
| `buyerPoolScore` | `75+` | `50-74` | below `50` |

A big buyer pool matters because a domain is easier to sell when many businesses could use it.

#### `leadValue`

Estimates the value of one converted customer in that niche.

Fields:

| Field | Meaning |
| --- | --- |
| `estimatedLeadValueUsd` | Estimated value of one converted customer or serious lead. |
| `leadValueScore` | Score from `0` to `100`. |
| `closeDifficulty` | `low`, `medium`, or `high`. High-value leads can be harder to close. |
| `confidence` | Always `offline_estimate`. |

Good and bad ranges:

| Metric | Good | Medium | Weak |
| --- | --- | --- | --- |
| `estimatedLeadValueUsd` | `$750+` | `$200-$749` | below `$200` |
| `leadValueScore` | `80+` | `45-79` | below `45` |

Examples:

| Niche | Typical offline lead value |
| --- | --- |
| Personal injury lawyer | `$3500+` |
| Roofer | around `$2000` |
| Solar installer | around `$1800` |
| Pool builder | around `$1700` |
| Dental implants | around `$1200` |
| Plumber | around `$550` |
| Barber, cafe, bakery, car wash | around `$90-$120` |

High lead value is very important for domain flipping because a business can justify paying more for a domain when one new customer is valuable.

#### `brandability`

Measures how clean, memorable, and commercially usable the domain sounds.

Fields:

| Field | Meaning |
| --- | --- |
| `brandabilityScore` | Overall brandability score from `0` to `100`. |
| `lengthScore` | Rewards shorter domain roots. |
| `pronounceableScore` | Rewards pronounceable letter flow. |
| `naturalWordOrderScore` | Rewards natural phrasing like `miamidentist`. |
| `exactMatchIntentScore` | Rewards exact local-service intent. |
| `simplicityScore` | Rewards simple letters and avoids awkward clusters. |
| `strengths` | Machine-friendly reasons for a strong brandability score. |

Good and bad ranges:

| Score | Meaning |
| --- | --- |
| `85-100` | Very brandable. Short, clear, natural, easy to say. |
| `70-84` | Good. Usable, but may be longer or less exact. |
| `55-69` | Average. Might be acceptable for SEO, but not premium. |
| below `55` | Weak. Usually too long, awkward, or not memorable. |

Strong brandability usually means:

- no numbers
- no hyphens
- short root
- easy to pronounce
- exact service intent
- natural word order

#### `liquidity`

Predicts how easy the domain may be to sell quickly.

Fields:

| Field | Meaning |
| --- | --- |
| `liquidityScore` | Overall liquidity score from `0` to `100`. |
| `sellSpeed` | `fast`, `moderate_fast`, `moderate`, or `slow`. |
| `exactMatch` | Whether the pattern matches strong buyer/search intent. |
| `cpcScore` | CPC contribution to liquidity. |
| `cityMarketIndex` | City demand index used in the score. |
| `confidence` | Always `offline_estimate`. |

Good and bad ranges:

| Score | Meaning | Suggested action |
| --- | --- | --- |
| `86-100` | Fast-moving candidate. Strong exact match, strong buyer pool, good CPC. | Prioritize for outreach. |
| `72-85` | Good liquidity. Could sell with targeted outreach. | Keep and test. |
| `58-71` | Moderate liquidity. May need the right buyer. | Review manually. |
| below `58` | Slow liquidity. Harder to resell quickly. | Usually skip. |

Liquidity is not the same as lead value. A domain can have very high lead value but lower liquidity if the buyer pool is small or the wording is hard to sell.

#### `trademarkRisk`

Local risk filter for protected brand terms and suspicious wording.

Fields:

| Field | Meaning |
| --- | --- |
| `level` | `low`, `medium`, or `high`. |
| `flags` | Terms that triggered the risk check. |

Behavior:

- `high` risk domains are blocked and not returned.
- `medium` risk domains are allowed but penalized.
- `low` risk domains are preferred.

Examples of high-risk protected terms include major brands like `google`, `apple`, `amazon`, `facebook`, `instagram`, `tesla`, `nike`, `openai`, and similar.

### Recommended Filtering Rules

For aggressive domain flipping:

```text
domainPowerScore >= 80
liquidity.liquidityScore >= 75
brandability.brandabilityScore >= 75
trademarkRisk.level = low
```

For premium lead-gen domains:

```text
leadValue.estimatedLeadValueUsd >= 500
searchDemand.estimatedCpcUsd >= 15
buyerPool.estimatedBusinesses >= 150
trademarkRisk.level = low
```

For fast resale outreach:

```text
liquidity.sellSpeed = fast OR moderate_fast
buyerPool.buyerPoolScore >= 70
brandability.brandabilityScore >= 80
```

For domains to skip:

```text
domainPowerScore < 62
OR trademarkRisk.level = medium/high
OR brandability.brandabilityScore < 55
OR liquidity.liquidityScore < 58
```

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

Compact no-space profession inputs are also supported. Examples:

```text
injurylawyer, divorcelawyer, criminallawyer, immigrationlawyer,
propertymanager, mortgagebroker, homeinspector, mobilemechanic,
marketingagency, graphicdesigner, aiconsultant, drivingschool,
personaltrainer, pressurewashing, urgentcare, dentalimplants,
estateplanning, pestcontrol, itservices, managedit, aiagency,
leadgeneration
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
| `geo:v5:{country}:{city}:{profession}:{marketSegment}:{mode}:{count}` | String JSON | Cached candidate pool. |
| `domain:{domain}` | Hash | Metadata for each generated domain. |
| `generated_domains` | Set | Index of generated domains. |
| `generated_domains_by_time` | Sorted set | Timeline index. |
| `stats:generated_domains` | String counter | Total generated count. |
| `stats:top_professions` | Sorted set | Profession leaderboard. |
| `stats:top_cities` | Sorted set | City leaderboard. |

Final generated domains are never returned directly from cache. Redis caches candidate pools, then each candidate is checked atomically against `used_domains` before it is returned. The `v5` cache version includes the selected market segment so random segment requests do not keep reusing one old cached segment.

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
