import { generateDomains } from '../services/domainGeneratorService.js';
import { ApiError, asyncHandler } from '../utils/errors.js';
import { formatZodError, generateDomainsSchema } from '../validators/domainValidator.js';

export const generateDomainsController = asyncHandler(async (request, response) => {
  const parsed = generateDomainsSchema.safeParse(request.body);

  if (!parsed.success) {
    throw new ApiError(400, 'Invalid request body.', formatZodError(parsed.error), 'VALIDATION_ERROR');
  }

  const domains = await generateDomains(parsed.data);

  response.json({
    success: true,
    count: domains.length,
    domains
  });
});
