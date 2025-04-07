/**
 * State Management Types for REMIX.AI
 * 
 * This file defines the types for the centralized state management system.
 * It includes the overall app state structure and individual state slices.
 */

// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Beat pattern types
export interface BeatPatterns {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  bass: boolean[];
}

// Beat entity
export interface Beat {
  id: string;
  name: string;
  createdAt: string;
  patterns: BeatPatterns;
  bpm: number;
  isPublic: boolean;
  createdBy: string;
}

// Beats state
export interface BeatsState {
  items: Beat[];
  currentBeatId: string | null;
  loading: boolean;
  error: string | null;
}

// Notification type
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  read: boolean;
}

// UI state
export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
}

// Audio state
export interface AudioState {
  isPlaying: boolean;
  currentStep: number | null;
  volume: number;
  muted: boolean;
}

// Conversation message
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Conversation state
export interface ConversationState {
  messages: ConversationMessage[];
  isGenerating: boolean;
  error: string | null;
}

// Complete application state
export interface AppState {
  auth: AuthState;
  beats: BeatsState;
  ui: UIState;
  audio: AudioState;
  conversation: ConversationState;
}

// Action types
export interface Action<T = any> {
  type: string;
  payload?: T;
}

// Reducer type
export type Reducer<S, A> = (state: S, action: A) => S;
