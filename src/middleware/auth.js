import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';

export function authenticateApiKey(request, _response, next) {
  if (!env.API_KEY) {
    next();
    return;
  }

  const authorization = request.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';

  if (token !== env.API_KEY) {
    next(new ApiError(401, 'Invalid or missing API key.', undefined, 'UNAUTHORIZED'));
    return;
  }

  next();
}
