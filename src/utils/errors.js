export class ApiError extends Error {
  constructor(statusCode, message, details = undefined, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

export function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
