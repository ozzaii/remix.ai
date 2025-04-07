/**
 * Claude API Integration for REMIX.AI
 * 
 * This file exports all Claude API integration components for easy access.
 */

// Export the Claude API client
export { default as ClaudeApiClient } from './claudeApi';
export * from './claudeApi';

// Export the Conversation Context
export { 
  ConversationProvider, 
  useConversation, 
  default as ConversationContext 
} from './ConversationContext';
export * from './ConversationContext';

// Export the Prompt Templates
export { default as PromptTemplates } from './promptTemplates';
export * from './promptTemplates';

// Export the Error Handling utilities
export { default as ErrorHandling } from './errorHandling';
export * from './errorHandling';

// Export the Streaming Response Handler
export { default as StreamingResponse } from './streamingResponseHandler';
export * from './streamingResponseHandler';
