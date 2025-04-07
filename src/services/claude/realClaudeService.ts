import { ClaudeService, CompletionOptions, CompletionResult, ClaudeMessage } from '../types';
import ClaudeApiClient, { 
  ClaudeRequestOptions, 
  ClaudeCompletionResponse, 
  ClaudeApiError, 
  ClaudeNetworkError, 
  ClaudeTimeoutError 
} from './claudeApi';
import { ErrorHandling } from './errorHandling';
import { eventBus } from '../eventBus';

/**
 * Real implementation of the Claude service using the Claude API client
 */
export class RealClaudeService implements ClaudeService {
  private apiClient: ClaudeApiClient;
  private defaultModel: string;
  
  constructor(apiKey: string, defaultModel: string = 'claude-3-opus-20240229') {
    this.apiClient = new ClaudeApiClient(apiKey, undefined, defaultModel);
    this.defaultModel = defaultModel;
  }
  
  /**
   * Generate a completion from Claude
   */
  async generateCompletion(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    try {
      // Publish event that request is starting
      eventBus.publish('claude:request:start', { prompt, options });
      
      // Create messages array
      const messages: ClaudeMessage[] = [];
      
      // Add system message if provided
      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }
      
      // Add user message
      messages.push({
        role: 'user',
        content: prompt
      });
      
      // Convert options
      const claudeOptions: ClaudeRequestOptions = {
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: false
      };
      
      // Send request to Claude API
      const response = await this.apiClient.createCompletion(
        messages,
        claudeOptions,
        options.model || this.defaultModel
      );
      
      // Convert response to CompletionResult
      const result: CompletionResult = {
        id: response.id,
        model: response.model,
        message: {
          role: 'assistant',
          content: response.content
        },
        usage: {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens
        }
      };
      
      // Publish event that request is complete
      eventBus.publish('claude:request:complete', { result });
      
      return result;
    } catch (error) {
      // Handle errors
      const formattedError = ErrorHandling.formatErrorForUser(
        error instanceof Error ? error : new Error('Unknown error')
      );
      
      // Publish error event
      eventBus.publish('claude:request:error', { 
        error, 
        formattedError 
      });
      
      throw error;
    }
  }
  
  /**
   * Generate a streaming completion from Claude
   */
  async generateStreamingCompletion(
    prompt: string, 
    onChunk: (chunk: string) => void,
    options: CompletionOptions = {}
  ): Promise<void> {
    try {
      // Publish event that request is starting
      eventBus.publish('claude:request:start', { prompt, options, streaming: true });
      
      // Create messages array
      const messages: ClaudeMessage[] = [];
      
      // Add system message if provided
      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }
      
      // Add user message
      messages.push({
        role: 'user',
        content: prompt
      });
      
      // Convert options
      const claudeOptions: ClaudeRequestOptions = {
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: true
      };
      
      // Track progress
      let fullResponse = '';
      let lastProgressUpdate = Date.now();
      const progressInterval = 500; // Update progress every 500ms
      
      // Send streaming request to Claude API
      await this.apiClient.createStreamingCompletion(
        messages,
        (chunk) => {
          // Send chunk to callback
          onChunk(chunk.delta.text);
          
          // Accumulate full response
          fullResponse += chunk.delta.text;
          
          // Publish progress events at intervals
          const now = Date.now();
          if (now - lastProgressUpdate > progressInterval) {
            eventBus.publish('claude:request:progress', { 
              fullResponse, 
              chunkIndex: chunk.index 
            });
            lastProgressUpdate = now;
          }
        },
        (completeResponse) => {
          // Publish completion event
          eventBus.publish('claude:request:complete', { 
            fullResponse: completeResponse 
          });
        },
        claudeOptions,
        options.model || this.defaultModel
      );
    } catch (error) {
      // Handle errors
      const formattedError = ErrorHandling.formatErrorForUser(
        error instanceof Error ? error : new Error('Unknown error')
      );
      
      // Publish error event
      eventBus.publish('claude:request:error', { 
        error, 
        formattedError 
      });
      
      throw error;
    }
  }
}
