/**
 * WebSocket Service Implementation for REMIX.AI
 * 
 * This file implements a robust WebSocket service for real-time communication
 * with backend services. It includes automatic reconnection, message queuing,
 * and event-based communication.
 */

import { WebSocketService, WebSocketMessage, ConnectionState } from '../types';
import { eventBus } from '../eventBus';
import { errorHandler, ErrorCategory, ErrorSeverity } from '../../core/errorHandling';
import { NetworkOptimizations } from '../../core/optimizations';

/**
 * Real WebSocket Service implementation
 */
export class RealWebSocketService implements WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000; // Start with 1 second
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Map<string, Set<(payload: any) => void>> = new Map();
  private connectionStateListeners: Set<(state: ConnectionState) => void> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  
  constructor(url: string) {
    this.url = url;
  }
  
  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return; // Already connected or connecting
    }
    
    this.updateConnectionState(ConnectionState.CONNECTING);
    
    try {
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      this.handleError(error as Event);
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.stopHeartbeat();
    
    if (this.socket) {
      // Remove event listeners to prevent reconnection
      this.socket.onclose = null;
      this.socket.onerror = null;
      
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }
      
      this.socket = null;
    }
    
    this.updateConnectionState(ConnectionState.DISCONNECTED);
  }
  
  /**
   * Send a message to the WebSocket server
   */
  public send(type: string, payload: any): boolean {
    const message: WebSocketMessage = { type, payload };
    
    // If not connected, queue the message
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(message);
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      errorHandler.captureException(
        error instanceof Error ? error : new Error('Failed to send WebSocket message'),
        ErrorCategory.NETWORK,
        ErrorSeverity.ERROR,
        { messageType: type }
      );
      
      // Queue the message for retry
      this.messageQueue.push(message);
      return false;
    }
  }
  
  /**
   * Add a message listener
   */
  public addMessageListener<T>(type: string, listener: (payload: T) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type)!.add(listener as any);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(listener as any);
        if (handlers.size === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }
  
  /**
   * Add a connection state listener
   */
  public addConnectionStateListener(listener: (state: ConnectionState) => void): () => void {
    this.connectionStateListeners.add(listener);
    
    // Immediately notify with current state
    listener(this.connectionState);
    
    // Return unsubscribe function
    return () => {
      this.connectionStateListeners.delete(listener);
    };
  }
  
  /**
   * Get the current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    this.updateConnectionState(ConnectionState.CONNECTED);
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    
    // Send any queued messages
    this.flushMessageQueue();
    
    // Publish event
    eventBus.publish('websocket:connected', {});
  }
  
  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // Reset heartbeat timeout
      this.resetHeartbeatTimeout();
      
      // Handle heartbeat response
      if (message.type === 'heartbeat') {
        return;
      }
      
      // Notify handlers for this message type
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message.payload);
          } catch (error) {
            errorHandler.captureException(
              error instanceof Error ? error : new Error('Error in WebSocket message handler'),
              ErrorCategory.UNKNOWN,
              ErrorSeverity.ERROR,
              { messageType: message.type }
            );
          }
        });
      }
      
      // Publish event
      eventBus.publish('websocket:message', message);
    } catch (error) {
      errorHandler.captureException(
        error instanceof Error ? error : new Error('Failed to parse WebSocket message'),
        ErrorCategory.NETWORK,
        ErrorSeverity.ERROR
      );
    }
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();
    
    // Don't attempt to reconnect if closed cleanly (code 1000)
    if (event.code === 1000) {
      this.updateConnectionState(ConnectionState.DISCONNECTED);
      return;
    }
    
    this.attemptReconnect();
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    errorHandler.captureError({
      message: 'WebSocket error',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.ERROR,
      timestamp: Date.now(),
      metadata: { event }
    });
    
    this.stopHeartbeat();
    this.attemptReconnect();
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateConnectionState(ConnectionState.FAILED);
      return;
    }
    
    this.updateConnectionState(ConnectionState.RECONNECTING);
    
    // Calculate delay with exponential backoff
    const delay = Math.min(30000, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts));
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  /**
   * Update the connection state and notify listeners
   */
  private updateConnectionState(state: ConnectionState): void {
    if (this.connectionState === state) {
      return;
    }
    
    this.connectionState = state;
    
    // Notify listeners
    this.connectionStateListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in connection state listener:', error);
      }
    });
    
    // Publish event
    eventBus.publish('websocket:state', { state });
  }
  
  /**
   * Flush the message queue
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) {
      return;
    }
    
    // Create a copy of the queue and clear it
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    // Send all queued messages
    for (const message of queue) {
      this.send(message.type, message.payload);
    }
  }
  
  /**
   * Start the heartbeat
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.send('heartbeat', { timestamp: Date.now() });
      
      // Set timeout for heartbeat response
      this.resetHeartbeatTimeout();
    }, 30000);
  }
  
  /**
   * Reset the heartbeat timeout
   */
  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }
    
    // If no heartbeat response within 10 seconds, reconnect
    this.heartbeatTimeout = setTimeout(() => {
      console.warn('WebSocket heartbeat timeout');
      this.disconnect();
      this.connect();
    }, 10000);
  }
  
  /**
   * Stop the heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }
}

// Create a factory function for the service
export function createWebSocketService(url: string): WebSocketService {
  return new RealWebSocketService(url);
}
