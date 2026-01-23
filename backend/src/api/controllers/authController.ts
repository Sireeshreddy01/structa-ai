import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { prisma } from '../../config/database.js';
import { config } from '../../config/index.js';
import { AuthenticatedRequest, createError } from '../middlewares/index.js';

// Validation schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

async function generateToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(config.jwt.secret);
  const token = await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.jwt.expiresIn)
    .sign(secret);
  return token;
}

export async function register(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { email, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError('Email already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  const token = await generateToken(user.id);

  res.status(201).json({
    success: true,
    data: {
      user,
      token,
    },
  });
}

export async function login(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw createError('Invalid credentials', 401);
  }

  const token = await generateToken(user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    },
  });
}

export async function getProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw createError('Not authenticated', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: { documents: true },
      },
    },
  });

  res.json({
    success: true,
    data: { user },
  });
}

export async function logout(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  // In a stateless JWT setup, logout is client-side
  // For added security, you could implement a token blacklist
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}
