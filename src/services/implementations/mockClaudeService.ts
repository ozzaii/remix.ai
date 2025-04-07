/**
 * Mock Claude Service Implementation for REMIX.AI
 * 
 * This file provides a mock implementation of the ClaudeService interface
 * for development and testing purposes.
 */

import { ClaudeService, ApiClient, CompletionOptions, CompletionResult, ClaudeMessage } from '../types';

/**
 * Mock implementation of the Claude service
 */
export class MockClaudeService implements ClaudeService {
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
  
  /**
   * Generate a completion from Claude
   */
  async generateCompletion(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    console.log('MockClaudeService: generateCompletion', { prompt, options });
    
    // In a real implementation, this would call the Claude API
    // For now, we'll just return a mock response
    return {
      id: `mock-completion-${Date.now()}`,
      model: options.model || 'claude-3-opus-20240229',
      message: {
        role: 'assistant',
        content: `This is a mock response from Claude for prompt: "${prompt.substring(0, 20)}..."`
      },
      usage: {
        prompt_tokens: prompt.length / 4, // Rough approximation
        completion_tokens: 50,
        total_tokens: (prompt.length / 4) + 50
      }
    };
  }
  
  /**
   * Generate a streaming completion from Claude
   */
  async generateStreamingCompletion(
    prompt: string, 
    onChunk: (chunk: string) => void,
    options: CompletionOptions = {}
  ): Promise<void> {
    console.log('MockClaudeService: generateStreamingCompletion', { prompt, options });
    
    // Mock streaming response
    const mockResponse = `This is a mock streaming response from Claude for your prompt about music creation. 
    
I can help you create amazing beats with REMIX.AI! Let's break down how we could approach this:

1. First, we could start with a basic drum pattern
2. Then add some melodic elements
3. Finally, layer in some atmospheric sounds

What specific style of music are you interested in creating today?`;
    
    // Split the response into chunks and send them with delays
    const chunks = mockResponse.split(' ');
    
    for (const chunk of chunks) {
      // Add a small delay between chunks to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 100));
      onChunk(chunk + ' ');
    }
  }
}
