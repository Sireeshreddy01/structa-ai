import { Response } from 'express';
import { AuthenticatedRequest, createError } from '../middlewares/index.js';
import { prisma } from '../../config/database.js';
import { storageService } from '../../services/storage/index.js';

export async function uploadPage(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) throw createError('Not authenticated', 401);

  const { documentId } = req.params;
  const file = req.file;

  if (!file) {
    throw createError('No file uploaded', 400);
  }

  // Verify document ownership
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: req.user.id,
    },
  });

  if (!document) {
    throw createError('Document not found', 404);
  }

  // Get next page number
  const lastPage = await prisma.page.findFirst({
    where: { documentId },
    orderBy: { pageNumber: 'desc' },
  });

  const pageNumber = (lastPage?.pageNumber ?? 0) + 1;

  // Upload to storage
  const imageUrl = await storageService.uploadFile(
    file.buffer,
    `documents/${documentId}/pages/${pageNumber}.jpg`,
    file.mimetype
  );

  // Create thumbnail
  const thumbnailUrl = await storageService.uploadFile(
    file.buffer, // In production, resize first
    `documents/${documentId}/thumbnails/${pageNumber}.jpg`,
    file.mimetype
  );

  // Create page record
  const page = await prisma.page.create({
    data: {
      documentId,
      pageNumber,
      imageUrl,
      thumbnailUrl,
    },
  });

  // Update document page count
  await prisma.document.update({
    where: { id: documentId },
    data: {
      pageCount: { increment: 1 },
    },
  });

  res.status(201).json({
    success: true,
    data: { page },
  });
}

export async function deletePage(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) throw createError('Not authenticated', 401);

  const { documentId, pageId } = req.params;

  // Verify document ownership
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: req.user.id,
    },
  });

  if (!document) {
    throw createError('Document not found', 404);
  }

  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      documentId,
    },
  });

  if (!page) {
    throw createError('Page not found', 404);
  }

  // Delete from storage
  await storageService.deleteFile(page.imageUrl);
  if (page.thumbnailUrl) {
    await storageService.deleteFile(page.thumbnailUrl);
  }

  // Delete page record
  await prisma.page.delete({
    where: { id: pageId },
  });

  // Update page count
  await prisma.document.update({
    where: { id: documentId },
    data: {
      pageCount: { decrement: 1 },
    },
  });

  // Renumber remaining pages
  const remainingPages = await prisma.page.findMany({
    where: { documentId },
    orderBy: { pageNumber: 'asc' },
  });

  for (let i = 0; i < remainingPages.length; i++) {
    await prisma.page.update({
      where: { id: remainingPages[i].id },
      data: { pageNumber: i + 1 },
    });
  }

  res.json({
    success: true,
    message: 'Page deleted',
  });
}

export async function reorderPages(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) throw createError('Not authenticated', 401);

  const { documentId } = req.params;
  const { pageOrder } = req.body; // Array of page IDs in new order

  // Verify document ownership
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: req.user.id,
    },
  });

  if (!document) {
    throw createError('Document not found', 404);
  }

  // Update page numbers
  for (let i = 0; i < pageOrder.length; i++) {
    await prisma.page.update({
      where: { id: pageOrder[i] },
      data: { pageNumber: i + 1 },
    });
  }

  res.json({
    success: true,
    message: 'Pages reordered',
  });
}
