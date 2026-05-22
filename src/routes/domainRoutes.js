import express from 'express';

import { generateDomainsController } from '../controllers/domainController.js';
import { authenticateApiKey } from '../middleware/auth.js';
import { generateRateLimiter } from '../middleware/rateLimiter.js';

export const domainRoutes = express.Router();

domainRoutes.post('/generate-domains', authenticateApiKey, generateRateLimiter, generateDomainsController);
