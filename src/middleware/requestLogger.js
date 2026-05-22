import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import { logger } from '../utils/logger.js';

export function requestIdMiddleware(request, response, next) {
  request.id = randomUUID();
  response.setHeader('X-Request-Id', request.id);
  next();
}

export function requestLogger(request, response, next) {
  const start = performance.now();

  response.on('finish', () => {
    logger.info({
      event: 'request_completed',
      requestId: request.id,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Math.round(performance.now() - start),
      ip: request.ip
    });
  });

  next();
}
