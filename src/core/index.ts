/**
 * Core index file for REMIX.AI
 * 
 * This file exports all core components for easy access.
 */

// Export error reporting
export { 
  ErrorReporter,
  ErrorCategory,
  ErrorSeverity,
  useErrorReporting
} from './errorReporting';

// Export error boundary
export {
  ErrorBoundary,
  AppErrorBoundary,
  ScreenErrorBoundary,
  ComponentErrorBoundary
} from './errorBoundary';
