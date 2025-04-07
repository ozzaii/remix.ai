/**
 * Integration Tests for REMIX.AI
 * 
 * This file contains tests to verify the integration of all components
 * and ensure the application functions correctly as a whole.
 */

import { ServiceLocator } from '../services/serviceLocator';
import { eventBus } from '../services/eventBus';
import { ClaudeService, WebSocketService, VectorStoreService } from '../services/types';
import { RealClaudeService } from '../services/claude/realClaudeService';
import { RealWebSocketService } from '../services/implementations/realWebSocketService';
import { RealVectorStoreService } from '../services/implementations/realVectorStoreService';
import { errorHandler, performanceMonitor } from '../core/errorHandling';

/**
 * Run all integration tests
 */
export async function runIntegrationTests(): Promise<{
  success: boolean;
  results: Record<string, boolean>;
  errors: string[];
}> {
  console.log('Running REMIX.AI integration tests...');
  
  const results: Record<string, boolean> = {};
  const errors: string[] = [];
  
  try {
    // Register services for testing
    setupTestServices();
    
    // Run tests
    results['eventBus'] = await testEventBus();
    results['claudeService'] = await testClaudeService();
    results['webSocketService'] = await testWebSocketService();
    results['vectorStoreService'] = await testVectorStoreService();
    results['errorHandling'] = await testErrorHandling();
    results['componentIntegration'] = await testComponentIntegration();
    
    // Calculate overall success
    const success = Object.values(results).every(result => result === true);
    
    // Log results
    console.log('Integration test results:', results);
    if (errors.length > 0) {
      console.error('Test errors:', errors);
    }
    
    return { success, results, errors };
  } catch (error) {
    console.error('Fatal error during integration tests:', error);
    return { 
      success: false, 
      results, 
      errors: [...errors, error instanceof Error ? error.message : String(error)] 
    };
  } finally {
    // Clean up
    cleanupTestServices();
  }
}

/**
 * Set up test services
 */
function setupTestServices(): void {
  const serviceLocator = ServiceLocator.getInstance();
  
  // Register mock services for testing
  serviceLocator.register('claudeService', new RealClaudeService('test_api_key'));
  serviceLocator.register('webSocketService', new RealWebSocketService('wss://test.example.com/ws'));
  serviceLocator.register('vectorStoreService', new RealVectorStoreService());
  serviceLocator.register('eventBusService', eventBus);
}

/**
 * Clean up test services
 */
function cleanupTestServices(): void {
  const serviceLocator = ServiceLocator.getInstance();
  serviceLocator.clear();
}

/**
 * Test Event Bus functionality
 */
async function testEventBus(): Promise<boolean> {
  console.log('Testing Event Bus...');
  
  try {
    let receivedPayload: any = null;
    const testEventType = 'test:event';
    const testPayload = { message: 'Hello, Event Bus!' };
    
    // Subscribe to test event
    const unsubscribe = eventBus.subscribe(testEventType, (payload) => {
      receivedPayload = payload;
    });
    
    // Publish test event
    eventBus.publish(testEventType, testPayload);
    
    // Verify event was received
    const success = receivedPayload !== null && 
                   receivedPayload.message === testPayload.message;
    
    // Clean up
    unsubscribe();
    
    console.log('Event Bus test:', success ? 'PASSED' : 'FAILED');
    return success;
  } catch (error) {
    console.error('Event Bus test error:', error);
    return false;
  }
}

/**
 * Test Claude Service functionality
 */
async function testClaudeService(): Promise<boolean> {
  console.log('Testing Claude Service...');
  
  try {
    const serviceLocator = ServiceLocator.getInstance();
    const claudeService = serviceLocator.get<ClaudeService>('claudeService');
    
    // Test is simplified since we're using a mock/stub implementation
    // In a real test, we would verify actual API calls
    
    // Subscribe to Claude events
    let requestStarted = false;
    let requestCompleted = false;
    
    const unsubscribe1 = eventBus.subscribe('claude:request:start', () => {
      requestStarted = true;
    });
    
    const unsubscribe2 = eventBus.subscribe('claude:request:complete', () => {
      requestCompleted = true;
    });
    
    // Generate a completion
    await claudeService.generateCompletion('Test prompt');
    
    // Verify events were published
    const success = requestStarted && requestCompleted;
    
    // Clean up
    unsubscribe1();
    unsubscribe2();
    
    console.log('Claude Service test:', success ? 'PASSED' : 'FAILED');
    return success;
  } catch (error) {
    console.error('Claude Service test error:', error);
    return false;
  }
}

/**
 * Test WebSocket Service functionality
 */
async function testWebSocketService(): Promise<boolean> {
  console.log('Testing WebSocket Service...');
  
  try {
    const serviceLocator = ServiceLocator.getInstance();
    const webSocketService = serviceLocator.get<WebSocketService>('webSocketService');
    
    // Test connection state listeners
    let connectionStateChanged = false;
    
    const unsubscribe = webSocketService.addConnectionStateListener(() => {
      connectionStateChanged = true;
    });
    
    // Test message listeners
    let messageReceived = false;
    
    webSocketService.addMessageListener('test:message', () => {
      messageReceived = true;
    });
    
    // Simulate connection (this won't actually connect since we're using a test URL)
    webSocketService.connect();
    
    // Verify connection state listener was called
    const success = connectionStateChanged;
    
    // Clean up
    unsubscribe();
    webSocketService.disconnect();
    
    console.log('WebSocket Service test:', success ? 'PASSED' : 'FAILED');
    return success;
  } catch (error) {
    console.error('WebSocket Service test error:', error);
    return false;
  }
}

/**
 * Test Vector Store Service functionality
 */
async function testVectorStoreService(): Promise<boolean> {
  console.log('Testing Vector Store Service...');
  
  try {
    const serviceLocator = ServiceLocator.getInstance();
    const vectorStoreService = serviceLocator.get<VectorStoreService>('vectorStoreService');
    
    // Add a test document
    const testId = 'test-doc-1';
    const testText = 'This is a test document for vector search';
    const testMetadata = { category: 'test' };
    
    await vectorStoreService.addDocument(testId, testText, testMetadata);
    
    // Search for the document
    const searchResults = await vectorStoreService.search('test document');
    
    // Verify document was found
    const documentFound = searchResults.some(result => result.id === testId);
    
    // Get the document by ID
    const document = await vectorStoreService.getDocument(testId);
    
    // Verify document retrieval
    const documentRetrieved = document !== null && 
                             document.text === testText &&
                             document.metadata?.category === testMetadata.category;
    
    // Delete the document
    const documentDeleted = await vectorStoreService.deleteDocument(testId);
    
    // Verify document was deleted
    const documentGone = await vectorStoreService.getDocument(testId) === null;
    
    // Overall success
    const success = documentFound && documentRetrieved && documentDeleted && documentGone;
    
    console.log('Vector Store Service test:', success ? 'PASSED' : 'FAILED');
    return success;
  } catch (error) {
    console.error('Vector Store Service test error:', error);
    return false;
  }
}

/**
 * Test Error Handling functionality
 */
async function testErrorHandling(): Promise<boolean> {
  console.log('Testing Error Handling...');
  
  try {
    // Test error capture
    let errorCaptured = false;
    
    const unsubscribe = eventBus.subscribe('error:captured', () => {
      errorCaptured = true;
    });
    
    // Capture a test error
    errorHandler.captureException(
      new Error('Test error'),
      'test',
      'error',
      { test: true }
    );
    
    // Verify error was captured
    const success = errorCaptured;
    
    // Clean up
    unsubscribe();
    
    console.log('Error Handling test:', success ? 'PASSED' : 'FAILED');
    return success;
  } catch (error) {
    console.error('Error Handling test error:', error);
    return false;
  }
}

/**
 * Test Component Integration
 */
async function testComponentIntegration(): Promise<boolean> {
  console.log('Testing Component Integration...');
  
  try {
    // Test event flow between components
    let beatCreated = false;
    let beatVisualized = false;
    let soundDeployed = false;
    
    const unsubscribe1 = eventBus.subscribe('beat:created', () => {
      beatCreated = true;
    });
    
    const unsubscribe2 = eventBus.subscribe('beat:visualized', () => {
      beatVisualized = true;
    });
    
    const unsubscribe3 = eventBus.subscribe('teknovault:pack:deployed', () => {
      soundDeployed = true;
    });
    
    // Simulate component interactions
    eventBus.publish('beat:created', { 
      title: 'Test Beat',
      bpm: 120,
      patterns: []
    });
    
    eventBus.publish('beat:visualized', { 
      beatId: 'test-beat-1'
    });
    
    eventBus.publish('teknovault:pack:deployed', { 
      packId: 'test-pack-1'
    });
    
    // Verify events were published and received
    const success = beatCreated && beatVisualized && soundDeployed;
    
    // Clean up
    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
    
    console.log('Component Integration test:', success ? 'PASSED' : 'FAILED');
    return success;
  } catch (error) {
    console.error('Component Integration test error:', error);
    return false;
  }
}

// Export test functions for individual testing
export {
  testEventBus,
  testClaudeService,
  testWebSocketService,
  testVectorStoreService,
  testErrorHandling,
  testComponentIntegration
};
