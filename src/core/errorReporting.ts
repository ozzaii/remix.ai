/**
 * Error Handling Framework for REMIX.AI
 * 
 * This file implements the error handling framework for the application,
 * including error categorization, reporting, and recovery mechanisms.
 */

// Error categories for better handling
export enum ErrorCategory {
  UI = 'ui',
  NETWORK = 'network',
  API = 'api',
  AUDIO = 'audio',
  WEBSOCKET = 'websocket',
  STORAGE = 'storage',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error report structure
export interface ErrorReport {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  componentName?: string;
  metadata?: Record<string, any>;
  userAction?: string;
  appState?: string;
}

// Options for error reporting
export interface ErrorReportOptions {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  componentName?: string;
  metadata?: Record<string, any>;
  userAction?: string;
}

/**
 * Error Reporting Service that collects, buffers, and sends error reports
 */
export class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errorBuffer: ErrorReport[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private maxBufferSize: number = 50;
  private apiEndpoint: string = '/api/errors';
  private isEnabled: boolean = true;
  private errorListeners: Array<(report: ErrorReport) => void> = [];
  
  private constructor() {
    // Start periodic flush
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 60000); // Flush every minute
  }
  
  /**
   * Get the singleton instance of the ErrorReportingService
   */
  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    
    return ErrorReportingService.instance;
  }
  
  /**
   * Enable error reporting
   */
  enable(): void {
    this.isEnabled = true;
  }
  
  /**
   * Disable error reporting
   */
  disable(): void {
    this.isEnabled = false;
  }
  
  /**
   * Report an error
   * 
   * @param error - Error object or message
   * @param options - Reporting options
   * @returns Error ID
   */
  reportError(error: Error | string, options: ErrorReportOptions = {}): string {
    if (!this.isEnabled) return '';
    
    const errorId = this.generateErrorId();
    
    const report: ErrorReport = {
      id: errorId,
      timestamp: Date.now(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      category: options.category || ErrorCategory.UNKNOWN,
      severity: options.severity || ErrorSeverity.MEDIUM,
      componentName: options.componentName,
      metadata: options.metadata,
      userAction: options.userAction,
      appState: this.captureAppState()
    };
    
    // Add to buffer
    this.errorBuffer.push(report);
    
    // Notify listeners
    this.notifyErrorListeners(report);
    
    // Flush immediately for high severity errors
    if (report.severity === ErrorSeverity.HIGH || report.severity === ErrorSeverity.CRITICAL) {
      this.flush();
    }
    // Flush if buffer is getting full
    else if (this.errorBuffer.length >= this.maxBufferSize) {
      this.flush();
    }
    
    return errorId;
  }
  
  /**
   * Add an error listener
   * 
   * @param listener - Function to call when an error is reported
   */
  addErrorListener(listener: (report: ErrorReport) => void): void {
    this.errorListeners.push(listener);
  }
  
  /**
   * Remove an error listener
   * 
   * @param listener - Listener to remove
   */
  removeErrorListener(listener: (report: ErrorReport) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index !== -1) {
      this.errorListeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all error listeners
   * 
   * @param report - Error report
   */
  private notifyErrorListeners(report: ErrorReport): void {
    for (const listener of this.errorListeners) {
      try {
        listener(report);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    }
  }
  
  /**
   * Flush the error buffer
   */
  private flush(): void {
    if (!this.isEnabled || this.errorBuffer.length === 0) return;
    
    const reports = [...this.errorBuffer];
    this.errorBuffer = [];
    
    // Send to backend
    this.sendErrorReports(reports).catch(error => {
      console.error('Failed to send error reports:', error);
      
      // Put back in buffer for next attempt
      this.errorBuffer.push(...reports);
      
      // Trim buffer if it's too large
      if (this.errorBuffer.length > this.maxBufferSize) {
        this.errorBuffer = this.errorBuffer.slice(-this.maxBufferSize);
      }
    });
  }
  
  /**
   * Send error reports to the backend
   * 
   * @param reports - Error reports to send
   */
  private async sendErrorReports(reports: ErrorReport[]): Promise<void> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reports })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send error reports: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      // Re-throw to be handled by caller
      throw error;
    }
  }
  
  /**
   * Generate a unique error ID
   * 
   * @returns Unique error ID
   */
  private generateErrorId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Capture relevant app state
   * 
   * @returns App state object
   */
  private captureAppState(): string {
    // Implementation to capture relevant app state
    // This would depend on the application's state management
    return JSON.stringify({
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Flush any remaining errors
    this.flush();
  }
}

// Singleton export
export const ErrorReporter = ErrorReportingService.getInstance();

/**
 * React hook for error reporting
 */
export function useErrorReporting() {
  return {
    reportError: (error: Error | string, options: ErrorReportOptions = {}) => {
      return ErrorReporter.reportError(error, options);
    },
    
    handleError: (error: any, options: ErrorReportOptions = {}) => {
      if (error instanceof Error) {
        return ErrorReporter.reportError(error, options);
      } else {
        return ErrorReporter.reportError(String(error), options);
      }
    }
  };
}
