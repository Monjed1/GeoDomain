import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestIdMiddleware, requestLogger } from './middleware/requestLogger.js';
import { domainRoutes } from './routes/domainRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { statsRoutes } from './routes/statsRoutes.js';

export const app = express();

if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: true }));
app.use(compression());
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use(express.json({ limit: '64kb' }));

app.use(healthRoutes);
app.use(domainRoutes);
app.use(statsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
