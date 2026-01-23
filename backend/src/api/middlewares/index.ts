export { authMiddleware, optionalAuth } from './auth.js';
export type { AuthenticatedRequest } from './auth.js';

export { errorHandler, notFoundHandler, createError } from './errorHandler.js';
export type { AppError } from './errorHandler.js';

export { generalRateLimiter, authRateLimiter, uploadRateLimiter } from './rateLimit.js';

export { validate } from './validate.js';
