import { getDomainStats } from '../repositories/domainRepository.js';
import { countUsedDomains } from '../services/duplicateService.js';
import { getSupportedProfessionCount } from '../services/domainGeneratorService.js';
import { asyncHandler } from '../utils/errors.js';

export const statsController = asyncHandler(async (_request, response) => {
  const [databaseStats, redisUsedDomains] = await Promise.all([getDomainStats(), countUsedDomains()]);

  response.json({
    success: true,
    generatedDomains: databaseStats.generatedDomains,
    redisUsedDomains,
    supportedProfessionProfiles: getSupportedProfessionCount(),
    topProfessions: databaseStats.topProfessions,
    topCities: databaseStats.topCities
  });
});
