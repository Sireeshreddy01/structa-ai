import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { storageService } from '../storage/index.js';

interface RetentionPolicy {
  type: 'document' | 'session' | 'job';
  retentionDays: number;
}

const DEFAULT_POLICIES: RetentionPolicy[] = [
  { type: 'document', retentionDays: 90 },  // Documents deleted after 90 days
  { type: 'session', retentionDays: 30 },    // Sessions expire after 30 days
  { type: 'job', retentionDays: 7 },         // Job records kept for 7 days
];

/**
 * Data retention service for automatic cleanup
 */
export class RetentionService {
  private policies: RetentionPolicy[];
  
  constructor(policies?: RetentionPolicy[]) {
    this.policies = policies || DEFAULT_POLICIES;
  }
  
  /**
   * Run retention cleanup for all policies
   */
  async runCleanup(): Promise<{
    documentsDeleted: number;
    sessionsDeleted: number;
    jobsDeleted: number;
  }> {
    logger.info('Running data retention cleanup');
    
    const results = {
      documentsDeleted: 0,
      sessionsDeleted: 0,
      jobsDeleted: 0,
    };
    
    for (const policy of this.policies) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);
      
      switch (policy.type) {
        case 'document':
          results.documentsDeleted = await this.cleanupDocuments(cutoffDate);
          break;
        case 'session':
          results.sessionsDeleted = await this.cleanupSessions(cutoffDate);
          break;
        case 'job':
          results.jobsDeleted = await this.cleanupJobs(cutoffDate);
          break;
      }
    }
    
    logger.info('Retention cleanup complete', results);
    return results;
  }
  
  /**
   * Cleanup old documents
   */
  private async cleanupDocuments(cutoffDate: Date): Promise<number> {
    // Find documents to delete
    const documents = await prisma.document.findMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
      include: {
        pages: { select: { imageUrl: true } },
      },
    });
    
    // Delete associated files
    for (const doc of documents) {
      for (const page of doc.pages) {
        try {
          await storageService.deleteFile(page.imageUrl);
        } catch (error) {
          logger.error('Failed to delete page file', { error, url: page.imageUrl });
        }
      }
    }
    
    // Delete from database (cascades to pages, blocks, jobs)
    const result = await prisma.document.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });
    
    logger.info(`Deleted ${result.count} old documents`);
    return result.count;
  }
  
  /**
   * Cleanup expired sessions
   */
  private async cleanupSessions(cutoffDate: Date): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },  // Expired
          { createdAt: { lt: cutoffDate } },   // Too old
        ],
      },
    });
    
    logger.info(`Deleted ${result.count} expired sessions`);
    return result.count;
  }
  
  /**
   * Cleanup old job records
   */
  private async cleanupJobs(cutoffDate: Date): Promise<number> {
    const result = await prisma.job.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: ['COMPLETED', 'FAILED'] },
      },
    });
    
    logger.info(`Deleted ${result.count} old job records`);
    return result.count;
  }
  
  /**
   * Schedule cleanup to run daily
   */
  scheduleDaily(): NodeJS.Timeout {
    // Run cleanup every 24 hours
    const interval = 24 * 60 * 60 * 1000;
    
    return setInterval(() => {
      this.runCleanup().catch(error => {
        logger.error('Retention cleanup failed', { error });
      });
    }, interval);
  }
}

export const retentionService = new RetentionService();
