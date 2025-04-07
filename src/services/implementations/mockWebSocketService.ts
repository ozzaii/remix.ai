/**
 * Mock WebSocket Service Implementation for REMIX.AI
 * 
 * This file provides a mock implementation of the WebSocketService interface
 * for development and testing purposes.
 */

import { WebSocketService, ConnectionState, WebSocketMessage } from '../types';

/**
 * Mock implementation of the WebSocket service
 */
export class MockWebSocketService implements WebSocketService {
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private messageListeners: Map<string, Array<(payload: any) => void>> = new Map();
  private connectionStateListeners: Array<(state: ConnectionState) => void> = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  /**
   * Connect to WebSocket server
   */
  connect(): void {
    console.log('MockWebSocketService: connect');
    
    if (this.connectionState === ConnectionState.CONNECTING || 
        this.connectionState === ConnectionState.CONNECTED) {
      return;
    }
    
    this.setConnectionState(ConnectionState.CONNECTING);
    
    // Simulate connection delay
    setTimeout(() => {
      // 90% chance of successful connection
      if (Math.random() < 0.9) {
        this.setConnectionState(ConnectionState.CONNECTED);
        this.startHeartbeat();
      } else {
        this.setConnectionState(ConnectionState.RECONNECTING);
        this.scheduleReconnect();
      }
    }, 1000);
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('MockWebSocketService: disconnect');
    
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.setConnectionState(ConnectionState.DISCONNECTED);
  }
  
  /**
   * Send a message
   */
  send(type: string, payload: any): boolean {
    console.log(`MockWebSocketService: send ${type}`, payload);
    
    if (this.connectionState !== ConnectionState.CONNECTED) {
      console.warn('Cannot send message: not connected');
      return false;
    }
    
    // Simulate sending message
    console.log(`Sent message: ${type}`, payload);
    
    // For demo purposes, echo the message back after a delay
    setTimeout(() => {
      this.receiveMessage({
        type: `${type}_response`,
        payload: {
          success: true,
          originalType: type,
          data: payload
        }
      });
    }, 500);
    
    return true;
  }
  
  /**
   * Add a message listener
   */
  addMessageListener<T>(type: string, listener: (payload: T) => void): () => void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, []);
    }
    
    this.messageListeners.get(type)!.push(listener as any);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.messageListeners.get(type);
      if (listeners) {
        const index = listeners.indexOf(listener as any);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Add a connection state listener
   */
  addConnectionStateListener(listener: (state: ConnectionState) => void): () => void {
    this.connectionStateListeners.push(listener);
    
    // Immediately notify with current state
    listener(this.connectionState);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionStateListeners.indexOf(listener);
      if (index !== -1) {
        this.connectionStateListeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  /**
   * Set connection state and notify listeners
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState === state) return;
    
    this.connectionState = state;
    
    // Notify listeners
    for (const listener of this.connectionStateListeners) {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in connection state listener:', error);
      }
    }
  }
  
  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 2000);
  }
  
  /**
   * Start heartbeat interval
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.connectionState === ConnectionState.CONNECTED) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, 30000);
  }
  
  /**
   * Stop heartbeat interval
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  /**
   * Simulate receiving a message
   */
  private receiveMessage(message: WebSocketMessage): void {
    // Notify listeners
    if (this.messageListeners.has(message.type)) {
      for (const listener of this.messageListeners.get(message.type)!) {
        try {
          listener(message.payload);
        } catch (error) {
          console.error(`Error in message listener for type ${message.type}:`, error);
        }
      }
    }
  }
}
