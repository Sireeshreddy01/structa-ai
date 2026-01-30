import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { config } from '../../config/index.js';
import { prisma } from '../../config/database.js';
import { createError } from './errorHandler.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(config.jwt.secret);

    const { payload } = await jose.jwtVerify(token, secret);

    if (!payload.sub) {
      throw createError('Invalid token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });

    if (!user) {
      throw createError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      next(createError('Token expired', 401));
    } else if (error instanceof jose.errors.JWTInvalid) {
      next(createError('Invalid token', 401));
    } else {
      next(error);
    }
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  authMiddleware(req, res, next);
}
