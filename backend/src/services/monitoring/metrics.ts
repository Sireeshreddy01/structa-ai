import { logger } from '../../config/logger.js';

interface Metric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp: Date;
}

interface Timer {
  name: string;
  startTime: number;
  tags?: Record<string, string>;
}

/**
 * Metrics collection service
 */
export class MetricsService {
  private metrics: Metric[] = [];
  private timers: Map<string, Timer> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Flush metrics every 60 seconds
    this.flushInterval = setInterval(() => this.flush(), 60000);
  }
  
  /**
   * Record a counter metric
   */
  counter(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.record(name, value, 'count', tags);
  }
  
  /**
   * Record a gauge metric
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.record(name, value, 'gauge', tags);
  }
  
  /**
   * Record a histogram metric
   */
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    this.record(name, value, 'histogram', tags);
  }
  
  /**
   * Start a timer
   */
  startTimer(name: string, tags?: Record<string, string>): string {
    const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(id, {
      name,
      startTime: performance.now(),
      tags,
    });
    return id;
  }
  
  /**
   * Stop a timer and record the duration
   */
  stopTimer(id: string): number {
    const timer = this.timers.get(id);
    if (!timer) {
      logger.warn('Timer not found', { id });
      return 0;
    }
    
    const duration = performance.now() - timer.startTime;
    this.histogram(`${timer.name}.duration`, duration, {
      ...timer.tags,
      unit: 'ms',
    });
    
    this.timers.delete(id);
    return duration;
  }
  
  /**
   * Measure async function execution time
   */
  async measure<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    const timerId = this.startTimer(name, tags);
    try {
      const result = await fn();
      this.counter(`${name}.success`, 1, tags);
      return result;
    } catch (error) {
      this.counter(`${name}.error`, 1, tags);
      throw error;
    } finally {
      this.stopTimer(timerId);
    }
  }
  
  /**
   * Record a metric
   */
  private record(name: string, value: number, unit: string, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      unit,
      tags,
      timestamp: new Date(),
    });
    
    // Keep buffer size manageable
    if (this.metrics.length > 10000) {
      this.flush();
    }
  }
  
  /**
   * Flush metrics to output
   */
  flush(): void {
    if (this.metrics.length === 0) return;
    
    // In production, send to metrics backend (DataDog, Prometheus, etc.)
    // For now, log aggregated metrics
    const aggregated = this.aggregate();
    
    logger.info('Metrics flush', {
      count: this.metrics.length,
      aggregated,
    });
    
    this.metrics = [];
  }
  
  /**
   * Aggregate metrics
   */
  private aggregate(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const metric of this.metrics) {
      const key = metric.name;
      
      if (!result[key]) {
        result[key] = {
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
        };
      }
      
      result[key].count++;
      result[key].sum += metric.value;
      result[key].min = Math.min(result[key].min, metric.value);
      result[key].max = Math.max(result[key].max, metric.value);
    }
    
    // Calculate averages
    for (const key of Object.keys(result)) {
      result[key].avg = result[key].sum / result[key].count;
    }
    
    return result;
  }
  
  /**
   * Get current metrics summary
   */
  getSummary(): Record<string, any> {
    return this.aggregate();
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const metricsService = new MetricsService();

// Convenience functions
export const counter = metricsService.counter.bind(metricsService);
export const gauge = metricsService.gauge.bind(metricsService);
export const histogram = metricsService.histogram.bind(metricsService);
export const measure = metricsService.measure.bind(metricsService);
