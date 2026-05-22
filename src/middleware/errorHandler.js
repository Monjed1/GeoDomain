import { isProduction } from '../config/env.js';
import { ApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(request, _response, next) {
  next(new ApiError(404, `Route not found: ${request.method} ${request.originalUrl}`, undefined, 'NOT_FOUND'));
}

export function errorHandler(error, request, response, _next) {
  const statusCode = error.statusCode || error.status || 500;
  const isOperational = error instanceof ApiError;

  logger.error({
    event: 'request_failed',
    requestId: request.id,
    statusCode,
    code: error.code || 'INTERNAL_ERROR',
    message: error.message,
    stack: isProduction ? undefined : error.stack
  });

  response.status(statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: isOperational || !isProduction ? error.message : 'Internal server error.',
      details: error.details,
      requestId: request.id
    }
  });
}
