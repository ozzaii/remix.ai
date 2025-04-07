/**
 * Mock Vector Store Service Implementation for REMIX.AI
 * 
 * This file provides a mock implementation of the VectorStoreService interface
 * for development and testing purposes.
 */

import { VectorStoreService } from '../types';

/**
 * Mock implementation of the Vector Store service
 */
export class MockVectorStoreService implements VectorStoreService {
  private documents: Map<string, { text: string, metadata?: Record<string, any> }> = new Map();
  
  /**
   * Add a document to the vector store
   */
  async addDocument(id: string, text: string, metadata?: Record<string, any>): Promise<void> {
    console.log(`MockVectorStoreService: addDocument ${id}`, { textLength: text.length, metadata });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Store document
    this.documents.set(id, { text, metadata });
  }
  
  /**
   * Search for documents similar to the query
   */
  async search(query: string, limit: number = 5): Promise<Array<{ id: string, score: number, metadata?: Record<string, any> }>> {
    console.log(`MockVectorStoreService: search "${query}"`, { limit });
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would perform semantic search
    // For now, we'll just do a simple text search
    const results: Array<{ id: string, score: number, metadata?: Record<string, any> }> = [];
    
    for (const [id, doc] of this.documents.entries()) {
      // Calculate a mock similarity score based on word overlap
      const queryWords = new Set(query.toLowerCase().split(/\s+/));
      const docWords = new Set(doc.text.toLowerCase().split(/\s+/));
      
      let matchCount = 0;
      for (const word of queryWords) {
        if (docWords.has(word)) {
          matchCount++;
        }
      }
      
      // Calculate score (0-1)
      const score = queryWords.size > 0 ? matchCount / queryWords.size : 0;
      
      // Only include if there's some match
      if (score > 0) {
        results.push({
          id,
          score,
          metadata: doc.metadata
        });
      }
    }
    
    // Sort by score (descending) and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Get a document by ID
   */
  async getDocument(id: string): Promise<{ text: string, metadata?: Record<string, any> } | null> {
    console.log(`MockVectorStoreService: getDocument ${id}`);
    
    // Simulate retrieval delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.documents.get(id) || null;
  }
  
  /**
   * Delete a document by ID
   */
  async deleteDocument(id: string): Promise<boolean> {
    console.log(`MockVectorStoreService: deleteDocument ${id}`);
    
    // Simulate deletion delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.documents.delete(id);
  }
}
