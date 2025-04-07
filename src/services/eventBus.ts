/**
 * Event Bus Service Implementation for REMIX.AI
 * 
 * This file implements the Event Bus pattern to provide a centralized
 * communication mechanism between components. It allows components to
 * publish events and subscribe to events without direct coupling.
 */

import { EventBusService } from './types';

/**
 * Event Bus implementation that provides publish/subscribe functionality
 */
export class EventBus implements EventBusService {
  private static instance: EventBus;
  private listeners: Map<string, Array<(payload: any) => void>> = new Map();
  private onceListeners: Map<string, Array<(payload: any) => void>> = new Map();
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  /**
   * Get the singleton instance of the EventBus
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  /**
   * Subscribe to an event
   * 
   * @param eventType - Type of event to subscribe to
   * @param listener - Function to call when event is published
   * @returns Unsubscribe function
   */
  subscribe<T>(eventType: string, listener: (payload: T) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(listener as any);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener as any);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Subscribe to an event and unsubscribe after first occurrence
   * 
   * @param eventType - Type of event to subscribe to
   * @param listener - Function to call when event is published
   * @returns Unsubscribe function
   */
  once<T>(eventType: string, listener: (payload: T) => void): () => void {
    if (!this.onceListeners.has(eventType)) {
      this.onceListeners.set(eventType, []);
    }
    
    this.onceListeners.get(eventType)!.push(listener as any);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.onceListeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener as any);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Publish an event
   * 
   * @param eventType - Type of event to publish
   * @param payload - Data to send with the event
   */
  publish<T>(eventType: string, payload: T): void {
    // Notify regular listeners
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      }
    }
    
    // Notify once listeners and remove them
    const onceListeners = this.onceListeners.get(eventType);
    if (onceListeners && onceListeners.length > 0) {
      // Create a copy to avoid issues during iteration
      const listenersToCall = [...onceListeners];
      // Clear the original list
      this.onceListeners.set(eventType, []);
      
      for (const listener of listenersToCall) {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in once event listener for ${eventType}:`, error);
        }
      }
    }
  }
  
  /**
   * Clear all listeners for a specific event type or all events
   * 
   * @param eventType - Optional event type to clear listeners for
   */
  clear(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
      this.onceListeners.delete(eventType);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
