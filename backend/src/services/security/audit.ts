import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';

interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

/**
 * Audit logging service for security and compliance
 */
export class AuditService {
  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    logger.info('Audit log', {
      ...entry,
      timestamp: new Date().toISOString(),
    });
    
    // In production, store to dedicated audit log table or external service
    // For now, we use the logger
  }
  
  /**
   * Log document access
   */
  async logDocumentAccess(userId: string, documentId: string, action: string): Promise<void> {
    await this.log({
      userId,
      action: `document.${action}`,
      resource: 'document',
      resourceId: documentId,
    });
  }
  
  /**
   * Log authentication event
   */
  async logAuth(userId: string, action: 'login' | 'logout' | 'register' | 'password_change', details?: Record<string, any>): Promise<void> {
    await this.log({
      userId,
      action: `auth.${action}`,
      resource: 'auth',
      details,
    });
  }
  
  /**
   * Log data export
   */
  async logDataExport(userId: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      userId,
      action: 'data.export',
      resource: 'user_data',
      details,
    });
  }
  
  /**
   * Log data deletion
   */
  async logDataDeletion(userId: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      userId,
      action: 'data.delete',
      resource: 'user_data',
      details,
    });
  }
  
  /**
   * Log security event
   */
  async logSecurityEvent(
    event: 'rate_limit_exceeded' | 'invalid_token' | 'unauthorized_access' | 'suspicious_activity',
    details: Record<string, any>
  ): Promise<void> {
    logger.warn('Security event', {
      event,
      ...details,
      timestamp: new Date().toISOString(),
    });
  }
}

export const auditService = new AuditService();
