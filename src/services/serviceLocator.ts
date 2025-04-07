/**
 * Service Locator for REMIX.AI
 * 
 * This file implements the Service Locator pattern to provide centralized
 * access to all services in the application. It handles service registration,
 * lazy initialization, and dependency injection.
 */

import { 
  ApiClient, 
  ClaudeService, 
  AudioEngineService, 
  WebSocketService,
  VectorStoreService,
  EventBusService
} from './types';

/**
 * Service Locator singleton that manages all service instances
 */
export class ServiceLocator {
  private static instance: ServiceLocator;
  private services: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  /**
   * Get the singleton instance of the ServiceLocator
   */
  static getInstance(): ServiceLocator {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator();
    }
    return ServiceLocator.instance;
  }
  
  /**
   * Register a service instance
   * 
   * @param serviceName - Name of the service
   * @param instance - Service instance
   */
  register<T>(serviceName: string, instance: T): void {
    this.services.set(serviceName, instance);
  }
  
  /**
   * Register a factory function for lazy initialization of a service
   * 
   * @param serviceName - Name of the service
   * @param factory - Factory function that creates the service
   */
  registerFactory<T>(serviceName: string, factory: () => T): void {
    this.factories.set(serviceName, factory);
  }
  
  /**
   * Get a service instance
   * 
   * @param serviceName - Name of the service
   * @returns The service instance
   * @throws Error if service is not registered
   */
  get<T>(serviceName: string): T {
    // Check if service instance exists
    if (this.services.has(serviceName)) {
      return this.services.get(serviceName) as T;
    }
    
    // Check if factory exists for lazy initialization
    if (this.factories.has(serviceName)) {
      const factory = this.factories.get(serviceName)!;
      const instance = factory();
      this.services.set(serviceName, instance);
      return instance as T;
    }
    
    throw new Error(`Service ${serviceName} not found`);
  }
  
  /**
   * Check if a service is registered
   * 
   * @param serviceName - Name of the service
   * @returns True if service is registered, false otherwise
   */
  has(serviceName: string): boolean {
    return this.services.has(serviceName) || this.factories.has(serviceName);
  }
  
  /**
   * Remove a service
   * 
   * @param serviceName - Name of the service
   */
  remove(serviceName: string): void {
    this.services.delete(serviceName);
    this.factories.delete(serviceName);
  }
  
  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
  
  /**
   * For testing: replace a service with a mock
   * 
   * @param serviceName - Name of the service
   * @param mockService - Mock service instance
   */
  registerMock<T>(serviceName: string, mockService: T): void {
    this.services.set(serviceName, mockService);
  }
}

/**
 * Convenience hooks for accessing services
 */

export function useApiClient(): ApiClient {
  return ServiceLocator.getInstance().get<ApiClient>('apiClient');
}

export function useClaudeService(): ClaudeService {
  return ServiceLocator.getInstance().get<ClaudeService>('claudeService');
}

export function useAudioEngineService(): AudioEngineService {
  return ServiceLocator.getInstance().get<AudioEngineService>('audioEngineService');
}

export function useWebSocketService(): WebSocketService {
  return ServiceLocator.getInstance().get<WebSocketService>('webSocketService');
}

export function useVectorStoreService(): VectorStoreService {
  return ServiceLocator.getInstance().get<VectorStoreService>('vectorStoreService');
}

export function useEventBusService(): EventBusService {
  return ServiceLocator.getInstance().get<EventBusService>('eventBusService');
}
