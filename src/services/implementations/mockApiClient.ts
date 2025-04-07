/**
 * Mock API Client Implementation for REMIX.AI
 * 
 * This file provides a mock implementation of the ApiClient interface
 * for development and testing purposes.
 */

import { ApiClient, RequestOptions } from '../types';

/**
 * Mock implementation of the API client
 */
export class MockApiClient implements ApiClient {
  private baseUrl: string = 'https://api.example.com';
  private authToken: string | null = null;
  
  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }
  
  /**
   * Get request implementation
   */
  async get<T>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    console.log(`MockApiClient: GET ${this.baseUrl}${url}`, { params, options });
    
    // Simulate network delay
    await this.delay(500);
    
    // Mock response based on URL
    return this.getMockResponse<T>(url, params);
  }
  
  /**
   * Post request implementation
   */
  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    console.log(`MockApiClient: POST ${this.baseUrl}${url}`, { data, options });
    
    // Simulate network delay
    await this.delay(500);
    
    // Mock response based on URL
    return this.getMockResponse<T>(url, data);
  }
  
  /**
   * Put request implementation
   */
  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    console.log(`MockApiClient: PUT ${this.baseUrl}${url}`, { data, options });
    
    // Simulate network delay
    await this.delay(500);
    
    // Mock response based on URL
    return this.getMockResponse<T>(url, data);
  }
  
  /**
   * Delete request implementation
   */
  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    console.log(`MockApiClient: DELETE ${this.baseUrl}${url}`, { options });
    
    // Simulate network delay
    await this.delay(500);
    
    // Mock response based on URL
    return this.getMockResponse<T>(url);
  }
  
  /**
   * Streaming request implementation
   */
  async stream<T>(url: string, data: any, onChunk: (chunk: string) => void): Promise<void> {
    console.log(`MockApiClient: STREAM ${this.baseUrl}${url}`, { data });
    
    // Simulate streaming response
    const mockChunks = [
      'This ',
      'is ',
      'a ',
      'mock ',
      'streaming ',
      'response ',
      'from ',
      'the ',
      'API ',
      'client.'
    ];
    
    for (const chunk of mockChunks) {
      // Simulate delay between chunks
      await this.delay(200);
      onChunk(chunk);
    }
  }
  
  /**
   * Helper method to simulate delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Helper method to generate mock responses
   */
  private getMockResponse<T>(url: string, data?: any): T {
    // Mock responses based on URL pattern
    if (url.includes('/auth/login')) {
      return {
        token: 'mock-auth-token-123',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com'
        }
      } as unknown as T;
    }
    
    if (url.includes('/beats')) {
      return {
        beats: [
          {
            id: '1',
            name: 'Demo Beat 1',
            createdAt: new Date().toISOString(),
            patterns: {
              kick: Array(16).fill(false).map((_, i) => i % 4 === 0),
              snare: Array(16).fill(false).map((_, i) => i % 8 === 4),
              hihat: Array(16).fill(false).map((_, i) => i % 2 === 0),
              bass: Array(16).fill(false).map((_, i) => i % 8 === 0),
            },
            bpm: 120,
            isPublic: true,
            createdBy: '1',
          }
        ]
      } as unknown as T;
    }
    
    if (url.includes('/v1/complete')) {
      return {
        id: 'mock-completion-123',
        model: 'claude-3-opus-20240229',
        completion: 'This is a mock response from Claude. I can help you create amazing beats!',
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        }
      } as unknown as T;
    }
    
    // Default response
    return {
      success: true,
      message: 'Mock API response',
      data
    } as unknown as T;
  }
}
