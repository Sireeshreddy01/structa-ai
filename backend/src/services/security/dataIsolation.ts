import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';

/**
 * Data isolation service - ensures users can only access their own data
 */
export class DataIsolationService {
  /**
   * Verify document ownership
   */
  async verifyDocumentOwnership(documentId: string, userId: string): Promise<boolean> {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: userId,
      },
      select: { id: true },
    });
    
    return document !== null;
  }
  
  /**
   * Get documents for user only
   */
  async getUserDocuments(userId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    return prisma.document.findMany({
      where: {
        userId: userId,
        ...(options?.status && { status: options.status as any }),
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'desc' },
    });
  }
  
  /**
   * Verify page belongs to user's document
   */
  async verifyPageOwnership(pageId: string, userId: string): Promise<boolean> {
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        document: {
          userId: userId,
        },
      },
      select: { id: true },
    });
    
    return page !== null;
  }
  
  /**
   * Verify job belongs to user's document
   */
  async verifyJobOwnership(jobId: string, userId: string): Promise<boolean> {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        document: {
          userId: userId,
        },
      },
      select: { id: true },
    });
    
    return job !== null;
  }
  
  /**
   * Delete all user data (GDPR compliance)
   */
  async deleteAllUserData(userId: string): Promise<{
    documentsDeleted: number;
    pagesDeleted: number;
    jobsDeleted: number;
    blocksDeleted: number;
  }> {
    logger.info('Deleting all user data', { userId });
    
    // Get user's documents
    const documents = await prisma.document.findMany({
      where: { userId },
      select: { id: true },
    });
    
    const documentIds = documents.map(d => d.id);
    
    // Delete in order (respecting foreign keys)
    const blocksDeleted = await prisma.block.deleteMany({
      where: { documentId: { in: documentIds } },
    });
    
    const jobsDeleted = await prisma.job.deleteMany({
      where: { documentId: { in: documentIds } },
    });
    
    const pagesDeleted = await prisma.page.deleteMany({
      where: { documentId: { in: documentIds } },
    });
    
    const documentsDeleted = await prisma.document.deleteMany({
      where: { userId },
    });
    
    // Delete sessions
    await prisma.session.deleteMany({
      where: { userId },
    });
    
    // Finally delete user
    await prisma.user.delete({
      where: { id: userId },
    });
    
    logger.info('User data deleted', {
      userId,
      documentsDeleted: documentsDeleted.count,
      pagesDeleted: pagesDeleted.count,
    });
    
    return {
      documentsDeleted: documentsDeleted.count,
      pagesDeleted: pagesDeleted.count,
      jobsDeleted: jobsDeleted.count,
      blocksDeleted: blocksDeleted.count,
    };
  }
  
  /**
   * Export all user data (GDPR compliance)
   */
  async exportAllUserData(userId: string): Promise<any> {
    logger.info('Exporting user data', { userId });
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    const documents = await prisma.document.findMany({
      where: { userId },
      include: {
        pages: true,
        blocks: true,
        jobs: {
          select: {
            id: true,
            type: true,
            status: true,
            createdAt: true,
            completedAt: true,
          },
        },
      },
    });
    
    return {
      user,
      documents,
      exportedAt: new Date().toISOString(),
    };
  }
  
  private async _getPageIds(documentIds: string[]): Promise<string[]> {
    const pages = await prisma.page.findMany({
      where: { documentId: { in: documentIds } },
      select: { id: true },
    });
    return pages.map(p => p.id);
  }
}

export const dataIsolationService = new DataIsolationService();
