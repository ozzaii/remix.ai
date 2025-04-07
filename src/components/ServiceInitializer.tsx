/**
 * Service Initializer Component for REMIX.AI
 * 
 * This component initializes all services and registers them with the service locator.
 * It ensures services are properly initialized before the application renders.
 */

import React, { useEffect, useState, ReactNode } from 'react';
import { ServiceLocator } from '../services';
import { useErrorReporting } from '../core';
import { EventBus } from '../services/eventBus';

// Mock implementations for demo purposes
import { MockApiClient } from '../services/implementations/mockApiClient';
import { MockClaudeService } from '../services/implementations/mockClaudeService';
import { MockAudioEngineService } from '../services/implementations/mockAudioEngineService';
import { MockWebSocketService } from '../services/implementations/mockWebSocketService';
import { MockVectorStoreService } from '../services/implementations/mockVectorStoreService';

interface ServiceInitializerProps {
  children: ReactNode;
}

/**
 * Component that initializes services before rendering children
 */
export function ServiceInitializer({ children }: ServiceInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { reportError } = useErrorReporting();
  
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const serviceLocator = ServiceLocator.getInstance();
        
        // Register event bus
        serviceLocator.register('eventBusService', EventBus.getInstance());
        
        // Register API client
        const apiClient = new MockApiClient();
        serviceLocator.register('apiClient', apiClient);
        
        // Register Claude service
        const claudeService = new MockClaudeService(apiClient);
        serviceLocator.register('claudeService', claudeService);
        
        // Register Audio Engine service
        const audioEngineService = new MockAudioEngineService();
        await audioEngineService.init();
        serviceLocator.register('audioEngineService', audioEngineService);
        
        // Register WebSocket service
        const webSocketService = new MockWebSocketService();
        serviceLocator.register('webSocketService', webSocketService);
        
        // Register Vector Store service
        const vectorStoreService = new MockVectorStoreService();
        serviceLocator.register('vectorStoreService', vectorStoreService);
        
        // All services initialized successfully
        setIsInitialized(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        reportError(error, { 
          category: 'UNKNOWN',
          severity: 'CRITICAL',
          componentName: 'ServiceInitializer'
        });
      }
    };
    
    initializeServices();
    
    // Cleanup function
    return () => {
      // Dispose services if needed
      try {
        const serviceLocator = ServiceLocator.getInstance();
        
        // Get audio engine service and dispose it
        if (serviceLocator.has('audioEngineService')) {
          const audioEngineService = serviceLocator.get('audioEngineService');
          if (typeof audioEngineService.dispose === 'function') {
            audioEngineService.dispose();
          }
        }
        
        // Clear all services
        serviceLocator.clear();
      } catch (err) {
        console.error('Error disposing services:', err);
      }
    };
  }, [reportError]);
  
  // Show loading state
  if (!isInitialized && !error) {
    return (
      <div className="service-initializer-loading">
        <p>Initializing REMIX.AI...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="service-initializer-error">
        <h2>Failed to initialize services</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  // Render children once initialized
  return <>{children}</>;
}
