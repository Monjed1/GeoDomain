import express from 'express';

import { generateDomainsController, generatePremiumDomainsController } from '../controllers/domainController.js';
import { authenticateApiKey } from '../middleware/auth.js';
import { generateRateLimiter } from '../middleware/rateLimiter.js';

export const domainRoutes = express.Router();

domainRoutes.post('/generate-domains', authenticateApiKey, generateRateLimiter, generateDomainsController);
domainRoutes.post('/generate-premium-domains', authenticateApiKey, generateRateLimiter, generatePremiumDomainsController);
