/**
 * Service index file for REMIX.AI
 * 
 * This file exports all service-related components for easy access.
 */

// Export service types
export * from './types';

// Export service locator
export { 
  ServiceLocator,
  useApiClient,
  useClaudeService,
  useAudioEngineService,
  useWebSocketService,
  useVectorStoreService,
  useEventBusService
} from './serviceLocator';

// Export event bus
export { EventBus, eventBus } from './eventBus';
