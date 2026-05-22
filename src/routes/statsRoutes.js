import express from 'express';

import { statsController } from '../controllers/statsController.js';
import { authenticateApiKey } from '../middleware/auth.js';

export const statsRoutes = express.Router();

statsRoutes.get('/stats', authenticateApiKey, statsController);
