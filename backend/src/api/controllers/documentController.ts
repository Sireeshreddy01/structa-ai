import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { AuthenticatedRequest, createError } from '../middlewares/index.js';
import { addJob, isQueueEnabled } from '../../services/queue/index.js';

// Validation schemas
export const createDocumentSchema = z.object({
  body: z.object({
    title: z.string().optional(),
  }),
});

export const updateDocumentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().optional(),
  }),
});

export async function createDocument(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) throw createError('Not authenticated', 401);

  const { title } = req.body;

  const document = await prisma.document.create({
    data: {
      userId: req.user.id,
      title,
    },
  });

  res.status(201).json({
    success: true,
    data: { document },
  });
}

export async function listDocuments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) throw createError('Not authenticated', 401);

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: { select: { pages: true, blocks: true } },
      },
    }),
    prisma.document.count({ where: { userId: req.user.id } }),
  ]);

  res.json({
    success: true,
    data: {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}

export async function getDocument(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) throw createError('Not authenticated', 401);

  const { id } = req.params;

  const document = await prisma.document.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      pages: {
        orderBy: { pageNumber: 'asc' },
      },
      blocks: {
        orderBy: { pageNumber: 'asc' },
      },
    },
  });

  if (!document) {
    throw createError('Document not found', 404);
  }

  res.json({
    success: true,
    data: { document },
  });
}

export async function getDocumentStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) throw createError('Not authenticated', 401);

  const { id } = req.params;

  const document = await prisma.document.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
    select: {
      id: true,
      status: true,
      pageCount: true,
      updatedAt: true,
    },
  });

  if (!document) {
    throw createError('Document not found', 404);
  }

  // Get job progress
  const jobs = await prisma.job.findMany({
    where: { documentId: id },
    select: {
      type: true,
      status: true,
    },
  });

  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED').length;
  const progress = jobs.length > 0 ? (completedJobs / jobs.length) * 100 : 0;

  res.json({
    success: true,
    data: {
      status: document.status,
      progress,
      pageCount: document.pageCount,
    },
  });
}

export async function deleteDocument(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) throw createError('Not authenticated', 401);

  const { id } = req.params;

  const document = await prisma.document.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!document) {
    throw createError('Document not found', 404);
  }

  await prisma.document.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Document deleted',
  });
}

export async function processDocument(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) throw createError('Not authenticated', 401);

  const { id } = req.params;

  const document = await prisma.document.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      pages: true,
    },
  });

  if (!document) {
    throw createError('Document not found', 404);
  }

  if (document.pages.length === 0) {
    throw createError('Document has no pages', 400);
  }

  // Update status
  await prisma.document.update({
    where: { id },
    data: { status: 'PROCESSING' },
  });

  // Queue processing jobs if queue is enabled
  if (isQueueEnabled()) {
    await addJob({
      documentId: id,
      type: 'PREPROCESS',
      payload: {
        pageIds: document.pages.map((p) => p.id),
      },
    });
  } else {
    // Mock processing when queue is disabled - immediately mark as completed
    setTimeout(async () => {
      await prisma.document.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
    }, 2000);
  }

  res.json({
    success: true,
    message: 'Document processing started',
  });
}
