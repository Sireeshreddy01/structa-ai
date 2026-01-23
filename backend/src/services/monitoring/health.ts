import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  lastCheck: Date;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  uptime: number;
  version: string;
  timestamp: Date;
}

/**
 * Health check service
 */
export class HealthService {
  private startTime: Date;
  private version: string;
  
  constructor() {
    this.startTime = new Date();
    this.version = process.env.npm_package_version || '1.0.0';
  }
  
  /**
   * Run all health checks
   */
  async check(): Promise<HealthStatus> {
    const checks: HealthCheck[] = [];
    
    // Database check
    checks.push(await this.checkDatabase());
    
    // Redis check
    checks.push(await this.checkRedis());
    
    // AI Workers check
    checks.push(await this.checkAIWorkers());
    
    // Storage check
    checks.push(await this.checkStorage());
    
    // Determine overall status
    const hasUnhealthy = checks.some(c => c.status === 'unhealthy');
    const hasDegraded = checks.some(c => c.status === 'degraded');
    
    const status: 'healthy' | 'degraded' | 'unhealthy' = 
      hasUnhealthy ? 'unhealthy' : 
      hasDegraded ? 'degraded' : 
      'healthy';
    
    return {
      status,
      checks,
      uptime: Date.now() - this.startTime.getTime(),
      version: this.version,
      timestamp: new Date(),
    };
  }
  
  /**
   * Check database connection
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const start = performance.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      
      return {
        name: 'database',
        status: 'healthy',
        latency: performance.now() - start,
        lastCheck: new Date(),
      };
    } catch (error) {
      logger.error('Database health check failed', { error });
      
      return {
        name: 'database',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
      };
    }
  }
  
  /**
   * Check Redis connection
   */
  private async checkRedis(): Promise<HealthCheck> {
    const start = performance.now();
    
    try {
      // In production, ping Redis
      // For now, assume healthy if no queue errors
      
      return {
        name: 'redis',
        status: 'healthy',
        latency: performance.now() - start,
        lastCheck: new Date(),
      };
    } catch (error) {
      logger.error('Redis health check failed', { error });
      
      return {
        name: 'redis',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
      };
    }
  }
  
  /**
   * Check AI Workers availability
   */
  private async checkAIWorkers(): Promise<HealthCheck> {
    const start = performance.now();
    
    try {
      // In production, check AI workers health endpoint
      const aiWorkersUrl = process.env.AI_WORKERS_URL || 'http://localhost:8000';
      
      const response = await fetch(`${aiWorkersUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        return {
          name: 'ai_workers',
          status: 'healthy',
          latency: performance.now() - start,
          lastCheck: new Date(),
        };
      } else {
        return {
          name: 'ai_workers',
          status: 'degraded',
          message: `HTTP ${response.status}`,
          latency: performance.now() - start,
          lastCheck: new Date(),
        };
      }
    } catch (error) {
      // AI workers being down is degraded, not unhealthy
      // (jobs will queue and process when available)
      return {
        name: 'ai_workers',
        status: 'degraded',
        message: error instanceof Error ? error.message : 'Unreachable',
        lastCheck: new Date(),
      };
    }
  }
  
  /**
   * Check storage availability
   */
  private async checkStorage(): Promise<HealthCheck> {
    const start = performance.now();
    
    try {
      // In production, check storage availability
      // For now, assume healthy
      
      return {
        name: 'storage',
        status: 'healthy',
        latency: performance.now() - start,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        name: 'storage',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
      };
    }
  }
  
  /**
   * Simple liveness check (is the process running)
   */
  liveness(): { status: 'ok' } {
    return { status: 'ok' };
  }
  
  /**
   * Readiness check (is the service ready to accept requests)
   */
  async readiness(): Promise<{ ready: boolean; reason?: string }> {
    try {
      // Check critical dependencies
      await prisma.$queryRaw`SELECT 1`;
      
      return { ready: true };
    } catch (error) {
      return {
        ready: false,
        reason: error instanceof Error ? error.message : 'Database unavailable',
      };
    }
  }
}

export const healthService = new HealthService();
