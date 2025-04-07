/**
 * Initial State for REMIX.AI
 * 
 * This file defines the initial state for the application.
 */

import { AppState } from './types';

/**
 * Initial application state
 */
export const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  },
  beats: {
    items: [],
    currentBeatId: null,
    loading: false,
    error: null,
  },
  ui: {
    theme: 'dark',
    sidebarOpen: true,
    activeModal: null,
    notifications: [],
  },
  audio: {
    isPlaying: false,
    currentStep: null,
    volume: 0.8,
    muted: false,
  },
  conversation: {
    messages: [],
    isGenerating: false,
    error: null,
  },
};
