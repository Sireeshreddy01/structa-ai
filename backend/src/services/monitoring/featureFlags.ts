import { logger } from '../../config/logger.js';

interface FeatureFlag {
  name: string;
  enabled: boolean;
  percentage?: number;  // Percentage rollout (0-100)
  userIds?: string[];    // Specific users
  startDate?: Date;
  endDate?: Date;
  metadata?: Record<string, any>;
}

/**
 * Feature flags service for gradual rollouts
 */
export class FeatureFlagsService {
  private flags: Map<string, FeatureFlag> = new Map();
  
  constructor() {
    // Initialize default flags
    this.initializeFlags();
  }
  
  /**
   * Initialize feature flags from config or database
   */
  private initializeFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        name: 'new_ocr_engine',
        enabled: false,
        percentage: 0,
      },
      {
        name: 'table_extraction_v2',
        enabled: false,
        percentage: 10,  // 10% rollout
      },
      {
        name: 'export_pdf',
        enabled: true,
      },
      {
        name: 'export_excel',
        enabled: true,
      },
      {
        name: 'handwriting_recognition',
        enabled: false,
      },
      {
        name: 'batch_processing',
        enabled: false,
        percentage: 5,
      },
      {
        name: 'ai_confidence_display',
        enabled: true,
      },
    ];
    
    for (const flag of defaultFlags) {
      this.flags.set(flag.name, flag);
    }
    
    logger.info('Feature flags initialized', { count: this.flags.size });
  }
  
  /**
   * Check if a feature is enabled for a user
   */
  isEnabled(flagName: string, userId?: string): boolean {
    const flag = this.flags.get(flagName);
    
    if (!flag) {
      logger.warn('Unknown feature flag', { flagName });
      return false;
    }
    
    // Check if globally disabled
    if (!flag.enabled) {
      return false;
    }
    
    // Check date range
    const now = new Date();
    if (flag.startDate && now < flag.startDate) {
      return false;
    }
    if (flag.endDate && now > flag.endDate) {
      return false;
    }
    
    // Check specific user list
    if (flag.userIds && userId) {
      if (flag.userIds.includes(userId)) {
        return true;
      }
    }
    
    // Check percentage rollout
    if (flag.percentage !== undefined && flag.percentage < 100) {
      if (!userId) {
        return false;  // Need user ID for percentage rollout
      }
      
      // Hash user ID to get consistent percentage
      const hash = this.hashString(userId + flagName);
      const userPercentage = hash % 100;
      
      return userPercentage < flag.percentage;
    }
    
    return true;
  }
  
  /**
   * Get all flags for a user
   */
  getAllFlags(userId?: string): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    
    for (const [name] of this.flags) {
      result[name] = this.isEnabled(name, userId);
    }
    
    return result;
  }
  
  /**
   * Update a feature flag
   */
  updateFlag(name: string, updates: Partial<FeatureFlag>): void {
    const flag = this.flags.get(name);
    
    if (!flag) {
      logger.warn('Cannot update unknown feature flag', { name });
      return;
    }
    
    this.flags.set(name, { ...flag, ...updates });
    
    logger.info('Feature flag updated', { name, updates });
  }
  
  /**
   * Create a new feature flag
   */
  createFlag(flag: FeatureFlag): void {
    if (this.flags.has(flag.name)) {
      logger.warn('Feature flag already exists', { name: flag.name });
      return;
    }
    
    this.flags.set(flag.name, flag);
    logger.info('Feature flag created', { name: flag.name });
  }
  
  /**
   * Delete a feature flag
   */
  deleteFlag(name: string): void {
    if (!this.flags.has(name)) {
      logger.warn('Cannot delete unknown feature flag', { name });
      return;
    }
    
    this.flags.delete(name);
    logger.info('Feature flag deleted', { name });
  }
  
  /**
   * Simple string hash for consistent percentage calculation
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;  // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export const featureFlagsService = new FeatureFlagsService();

// Convenience function
export function isFeatureEnabled(flagName: string, userId?: string): boolean {
  return featureFlagsService.isEnabled(flagName, userId);
}
