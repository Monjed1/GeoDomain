import worldCities from '../data/worldCities.json' with { type: 'json' };
import { normalizeHumanText, sample, toDomainToken, toTitleCase } from '../utils/domainUtils.js';

function sameToken(left, right) {
  return toDomainToken(left) === toDomainToken(right);
}

function matchesFilter(record, { country, state }) {
  const countryMatch = !country || sameToken(record.country, country);
  const stateMatch = !state || sameToken(record.state, state);
  return countryMatch && stateMatch;
}

export function resolveCities({ country, state, city, mode }, limit = 30) {
  if (city) {
    const matched = worldCities.find(
      (record) => sameToken(record.city, city) && matchesFilter(record, { country, state })
    );

    if (matched) return [matched];

    return [
      {
        city: toTitleCase(city),
        state: state ? toTitleCase(state) : '',
        country: country ? toTitleCase(country) : ''
      }
    ];
  }

  const filtered = worldCities.filter((record) => matchesFilter(record, { country, state }));
  const pool = filtered.length > 0 ? filtered : worldCities;
  const sampleSize = mode === 'targeted' ? Math.min(limit, 16) : limit;

  return sample(pool, Math.min(sampleSize, pool.length));
}

export function getCityTokenVariants(cityRecord) {
  const cleanCity = normalizeHumanText(cityRecord.city);
  const cityToken = toDomainToken(cleanCity);
  const variants = new Set([cityToken]);
  const words = cleanCity.split(' ').filter(Boolean);

  if (words.length > 1) {
    const acronym = words.map((word) => word[0]).join('').toLowerCase();
    if (acronym.length >= 2) variants.add(acronym);
    variants.add(toDomainToken(words[0]));
  }

  if (cityToken.length > 10) {
    variants.add(cityToken.slice(0, 10));
  }

  return [...variants].filter((variant) => variant.length >= 2);
}
