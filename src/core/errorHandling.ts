/**
 * Error handling and monitoring utilities for REMIX.AI
 * 
 * This file provides comprehensive error handling, logging, and monitoring
 * capabilities for production environments.
 */

import { eventBus } from '../services/eventBus';

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  AUDIO = 'audio',
  UI = 'ui',
  STATE = 'state',
  CLAUDE = 'claude',
  STORAGE = 'storage',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error data structure
export interface ErrorData {
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  componentName?: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
  isFatal?: boolean;
}

/**
 * Global error handler
 */
class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ErrorData[] = [];
  private maxErrorsStored: number = 100;
  private isEnabled: boolean = true;
  private errorListeners: Array<(error: ErrorData) => void> = [];
  
  private constructor() {
    // Set up global error listener
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  /**
   * Handle a global error event
   */
  private handleGlobalError(event: ErrorEvent): void {
    if (!this.isEnabled) return;
    
    const errorData: ErrorData = {
      message: event.message || 'Unknown error',
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      timestamp: Date.now(),
      stackTrace: event.error?.stack
    };
    
    this.captureError(errorData);
  }
  
  /**
   * Handle an unhandled promise rejection
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    if (!this.isEnabled) return;
    
    const errorData: ErrorData = {
      message: event.reason?.message || 'Unhandled promise rejection',
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      timestamp: Date.now(),
      stackTrace: event.reason?.stack
    };
    
    this.captureError(errorData);
  }
  
  /**
   * Capture and process an error
   */
  public captureError(errorData: ErrorData): void {
    if (!this.isEnabled) return;
    
    // Store error
    this.errors.push(errorData);
    
    // Trim error list if it exceeds max size
    if (this.errors.length > this.maxErrorsStored) {
      this.errors = this.errors.slice(-this.maxErrorsStored);
    }
    
    // Notify listeners
    this.notifyListeners(errorData);
    
    // Publish to event bus
    eventBus.publish('error:captured', errorData);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[${errorData.category}][${errorData.severity}] ${errorData.message}`,
        errorData.metadata || {}
      );
      if (errorData.stackTrace) {
        console.error(errorData.stackTrace);
      }
    }
  }
  
  /**
   * Create an error from an exception
   */
  public captureException(
    error: Error,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    metadata?: Record<string, any>
  ): void {
    const errorData: ErrorData = {
      message: error.message || 'Unknown error',
      category,
      severity,
      timestamp: Date.now(),
      stackTrace: error.stack,
      metadata
    };
    
    this.captureError(errorData);
  }
  
  /**
   * Add an error listener
   */
  public addErrorListener(listener: (error: ErrorData) => void): () => void {
    this.errorListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index !== -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify all error listeners
   */
  private notifyListeners(error: ErrorData): void {
    for (const listener of this.errorListeners) {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    }
  }
  
  /**
   * Get all captured errors
   */
  public getErrors(): ErrorData[] {
    return [...this.errors];
  }
  
  /**
   * Clear all captured errors
   */
  public clearErrors(): void {
    this.errors = [];
  }
  
  /**
   * Enable or disable error handling
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
  
  /**
   * Set maximum number of errors to store
   */
  public setMaxErrorsStored(max: number): void {
    this.maxErrorsStored = max;
    
    // Trim existing errors if needed
    if (this.errors.length > this.maxErrorsStored) {
      this.errors = this.errors.slice(-this.maxErrorsStored);
    }
  }
}

/**
 * Performance monitoring utilities
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Record<string, any[]> = {};
  private isEnabled: boolean = true;
  private maxMetricsPerType: number = 100;
  
  private constructor() {
    // Set up performance observer if available
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver(this.handlePerformanceEntries.bind(this));
        observer.observe({ entryTypes: ['resource', 'navigation', 'longtask', 'paint'] });
      } catch (e) {
        console.warn('PerformanceObserver not fully supported:', e);
      }
    }
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Handle performance entries from observer
   */
  private handlePerformanceEntries(list: PerformanceObserverEntryList): void {
    if (!this.isEnabled) return;
    
    const entries = list.getEntries();
    for (const entry of entries) {
      this.captureMetric(entry.entryType, entry);
    }
  }
  
  /**
   * Capture a performance metric
   */
  public captureMetric(metricType: string, data: any): void {
    if (!this.isEnabled) return;
    
    // Initialize array for this metric type if needed
    if (!this.metrics[metricType]) {
      this.metrics[metricType] = [];
    }
    
    // Add timestamp if not present
    if (!data.timestamp) {
      data.timestamp = Date.now();
    }
    
    // Add metric
    this.metrics[metricType].push(data);
    
    // Trim metrics if they exceed max size
    if (this.metrics[metricType].length > this.maxMetricsPerType) {
      this.metrics[metricType] = this.metrics[metricType].slice(-this.maxMetricsPerType);
    }
    
    // Publish to event bus
    eventBus.publish('performance:metric', { type: metricType, data });
  }
  
  /**
   * Measure execution time of a function
   */
  public measureExecutionTime<T>(
    fn: () => T,
    metricName: string,
    metadata?: Record<string, any>
  ): T {
    if (!this.isEnabled) {
      return fn();
    }
    
    const startTime = performance.now();
    let result: T;
    
    try {
      result = fn();
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.captureMetric('executionTime', {
        name: metricName,
        duration,
        timestamp: Date.now(),
        ...metadata
      });
    }
    
    return result;
  }
  
  /**
   * Measure execution time of an async function
   */
  public async measureAsyncExecutionTime<T>(
    fn: () => Promise<T>,
    metricName: string,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.isEnabled) {
      return fn();
    }
    
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.captureMetric('executionTime', {
        name: metricName,
        duration,
        timestamp: Date.now(),
        ...metadata
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.captureMetric('executionTime', {
        name: metricName,
        duration,
        error: true,
        timestamp: Date.now(),
        ...metadata
      });
      
      throw error;
    }
  }
  
  /**
   * Get metrics by type
   */
  public getMetrics(metricType?: string): Record<string, any[]> {
    if (metricType) {
      return { [metricType]: [...(this.metrics[metricType] || [])] };
    }
    
    // Clone all metrics
    const result: Record<string, any[]> = {};
    for (const type in this.metrics) {
      result[type] = [...this.metrics[type]];
    }
    
    return result;
  }
  
  /**
   * Clear metrics
   */
  public clearMetrics(metricType?: string): void {
    if (metricType) {
      this.metrics[metricType] = [];
    } else {
      this.metrics = {};
    }
  }
  
  /**
   * Enable or disable performance monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
  
  /**
   * Set maximum number of metrics to store per type
   */
  public setMaxMetricsPerType(max: number): void {
    this.maxMetricsPerType = max;
    
    // Trim existing metrics if needed
    for (const type in this.metrics) {
      if (this.metrics[type].length > this.maxMetricsPerType) {
        this.metrics[type] = this.metrics[type].slice(-this.maxMetricsPerType);
      }
    }
  }
}

// Export singleton instances
export const errorHandler = ErrorHandler.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export utility functions
export function captureError(
  message: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  metadata?: Record<string, any>
): void {
  errorHandler.captureError({
    message,
    category,
    severity,
    timestamp: Date.now(),
    metadata
  });
}

export function captureException(
  error: Error,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  metadata?: Record<string, any>
): void {
  errorHandler.captureException(error, category, severity, metadata);
}

export function measureExecutionTime<T>(
  fn: () => T,
  metricName: string,
  metadata?: Record<string, any>
): T {
  return performanceMonitor.measureExecutionTime(fn, metricName, metadata);
}

export function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  metricName: string,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.measureAsyncExecutionTime(fn, metricName, metadata);
}
