/**
 * Type definitions for REMIX.AI services
 */

// Connection state for WebSocket
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed'
}

// WebSocket message
export interface WebSocketMessage {
  type: string;
  payload: any;
}

// Claude service types
export interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface CompletionResult {
  id: string;
  model: string;
  message: {
    role: string;
    content: string;
  };
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Service interfaces
export interface ClaudeService {
  generateCompletion(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
  generateStreamingCompletion(
    prompt: string, 
    onChunk: (chunk: string) => void,
    options?: CompletionOptions
  ): Promise<void>;
}

export interface WebSocketService {
  connect(): void;
  disconnect(): void;
  send(type: string, payload: any): boolean;
  addMessageListener<T>(type: string, listener: (payload: T) => void): () => void;
  addConnectionStateListener(listener: (state: ConnectionState) => void): () => void;
  getConnectionState(): ConnectionState;
}

export interface VectorStoreService {
  addDocument(id: string, text: string, metadata?: Record<string, any>): Promise<void>;
  search(query: string, limit?: number): Promise<Array<{id: string, score: number, metadata?: Record<string, any>}>>;
  getDocument(id: string): Promise<{text: string, metadata?: Record<string, any>} | null>;
  deleteDocument(id: string): Promise<boolean>;
  clear(): void;
  getDocumentCount(): number;
}

export interface AudioEngineService {
  loadSample(id: string, url: string): Promise<void>;
  playSample(id: string): void;
  stopSample(id: string): void;
  setBPM(bpm: number): void;
  setSwing(amount: number): void;
  startPlayback(): void;
  stopPlayback(): void;
  isPlaying(): boolean;
  getCurrentStep(): number;
}

// Event subscription options
export interface EventSubscriptionOptions {
  priority?: number;
  filter?: (event: { type: string; payload: any }) => boolean;
}

// Event bus interface
export interface EventBusService {
  publish<T>(eventType: string, payload: T): void;
  subscribe<T>(
    eventType: string, 
    handler: (payload: T) => void, 
    options?: EventSubscriptionOptions
  ): () => void;
  clear(): void;
}
