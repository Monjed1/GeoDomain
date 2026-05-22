import express from 'express';

import { healthController } from '../controllers/healthController.js';

export const healthRoutes = express.Router();

healthRoutes.get('/health', healthController);
