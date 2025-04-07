/**
 * Error Boundary Component for REMIX.AI
 * 
 * This file implements a hierarchical error boundary system for React components.
 * It provides fallback UIs and automatic recovery attempts for different boundary levels.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorReporter, ErrorCategory, ErrorSeverity } from './errorReporting';

// Boundary types
export type BoundaryType = 'app' | 'screen' | 'component';

// Props for ErrorBoundary component
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  boundary: BoundaryType;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// State for ErrorBoundary component
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  lastErrorTime: number;
}

/**
 * Error Boundary component that catches errors in its child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private recoveryTimeoutId: NodeJS.Timeout | null = null;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: 0
    };
  }

  /**
   * Update state when an error occurs
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Handle caught errors
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const now = Date.now();
    const errorCount = this.state.lastErrorTime > now - 60000 
      ? this.state.errorCount + 1 
      : 1;
    
    this.setState({
      errorInfo,
      errorCount,
      lastErrorTime: now
    });
    
    // Report error to service
    ErrorReporter.reportError(error, {
      category: ErrorCategory.UI,
      severity: this.getSeverityFromBoundary(),
      componentName: this.props.componentName,
      metadata: {
        boundary: this.props.boundary,
        errorCount,
        componentStack: errorInfo.componentStack
      }
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Attempt recovery for component-level errors
    if (this.props.boundary === 'component' && errorCount < 3) {
      this.scheduleRecovery();
    }
  }
  
  /**
   * Clean up on unmount
   */
  componentWillUnmount(): void {
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
      this.recoveryTimeoutId = null;
    }
  }
  
  /**
   * Schedule automatic recovery attempt
   */
  private scheduleRecovery(): void {
    // Exponential backoff for recovery attempts
    const delay = Math.min(1000 * Math.pow(2, this.state.errorCount - 1), 30000);
    
    this.recoveryTimeoutId = setTimeout(() => {
      this.setState({ hasError: false });
      this.recoveryTimeoutId = null;
    }, delay);
  }
  
  /**
   * Handle manual retry
   */
  private handleRetry = (): void => {
    this.setState({ hasError: false });
  }

  /**
   * Get error severity based on boundary type
   */
  private getSeverityFromBoundary(): ErrorSeverity {
    switch (this.props.boundary) {
      case 'app':
        return ErrorSeverity.CRITICAL;
      case 'screen':
        return ErrorSeverity.HIGH;
      case 'component':
        return ErrorSeverity.MEDIUM;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Render component
   */
  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI based on boundary type
      return this.renderDefaultFallback();
    }

    return this.props.children;
  }
  
  /**
   * Render default fallback UI based on boundary type
   */
  private renderDefaultFallback(): ReactNode {
    switch (this.props.boundary) {
      case 'app':
        return (
          <div className="error-boundary error-boundary-app">
            <h1>Application Error</h1>
            <p>Sorry, an unexpected error has occurred in the application.</p>
            <button onClick={() => window.location.reload()}>Restart Application</button>
          </div>
        );
      case 'screen':
        return (
          <div className="error-boundary error-boundary-screen">
            <h2>Screen Error</h2>
            <p>There was a problem loading this screen.</p>
            <button onClick={this.handleRetry}>Try Again</button>
          </div>
        );
      case 'component':
        return (
          <div className="error-boundary error-boundary-component">
            <p>This component failed to load.</p>
            <button onClick={this.handleRetry}>Try Again</button>
          </div>
        );
      default:
        return <div>Something went wrong.</div>;
    }
  }
}

/**
 * App-level error boundary
 */
export const AppErrorBoundary = (props: { children: ReactNode }) => (
  <ErrorBoundary boundary="app">
    {props.children}
  </ErrorBoundary>
);

/**
 * Screen-level error boundary
 */
export const ScreenErrorBoundary = (props: { children: ReactNode, screenName: string }) => (
  <ErrorBoundary 
    boundary="screen" 
    componentName={props.screenName}
  >
    {props.children}
  </ErrorBoundary>
);

/**
 * Component-level error boundary
 */
export const ComponentErrorBoundary = (props: { 
  children: ReactNode, 
  componentName: string,
  fallback?: ReactNode
}) => (
  <ErrorBoundary 
    boundary="component" 
    componentName={props.componentName}
    fallback={props.fallback}
  >
    {props.children}
  </ErrorBoundary>
);
