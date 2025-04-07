/**
 * Selectors for REMIX.AI
 * 
 * This file implements selectors for accessing and deriving state from the application state.
 * Selectors are pure functions that extract specific pieces of state or compute derived data.
 */

import { AppState, Beat, User, Notification, ConversationMessage } from './types';

/**
 * Auth selectors
 */
export const authSelectors = {
  isAuthenticated: (state: AppState): boolean => 
    state.auth.isAuthenticated,
  
  getUser: (state: AppState): User | null => 
    state.auth.user,
  
  isLoading: (state: AppState): boolean => 
    state.auth.loading,
  
  getError: (state: AppState): string | null => 
    state.auth.error,
};

/**
 * Beats selectors
 */
export const beatSelectors = {
  getAllBeats: (state: AppState): Beat[] => 
    state.beats.items,
  
  getBeatById: (state: AppState, id: string): Beat | undefined => 
    state.beats.items.find(beat => beat.id === id),
  
  getCurrentBeat: (state: AppState): Beat | undefined => 
    state.beats.currentBeatId ? 
      state.beats.items.find(beat => beat.id === state.beats.currentBeatId) : 
      undefined,
  
  getCurrentBeatId: (state: AppState): string | null => 
    state.beats.currentBeatId,
  
  isLoading: (state: AppState): boolean => 
    state.beats.loading,
  
  getError: (state: AppState): string | null => 
    state.beats.error,
  
  getUserBeats: (state: AppState, userId: string): Beat[] => 
    state.beats.items.filter(beat => beat.createdBy === userId),
  
  getPublicBeats: (state: AppState): Beat[] => 
    state.beats.items.filter(beat => beat.isPublic),
};

/**
 * UI selectors
 */
export const uiSelectors = {
  getTheme: (state: AppState): 'light' | 'dark' => 
    state.ui.theme,
  
  isSidebarOpen: (state: AppState): boolean => 
    state.ui.sidebarOpen,
  
  getActiveModal: (state: AppState): string | null => 
    state.ui.activeModal,
  
  getNotifications: (state: AppState): Notification[] => 
    state.ui.notifications,
  
  getUnreadNotifications: (state: AppState): Notification[] => 
    state.ui.notifications.filter(notification => !notification.read),
  
  getUnreadNotificationCount: (state: AppState): number => 
    state.ui.notifications.filter(notification => !notification.read).length,
};

/**
 * Audio selectors
 */
export const audioSelectors = {
  isPlaying: (state: AppState): boolean => 
    state.audio.isPlaying,
  
  getCurrentStep: (state: AppState): number | null => 
    state.audio.currentStep,
  
  getVolume: (state: AppState): number => 
    state.audio.volume,
  
  isMuted: (state: AppState): boolean => 
    state.audio.muted,
  
  getEffectiveVolume: (state: AppState): number => 
    state.audio.muted ? 0 : state.audio.volume,
};

/**
 * Conversation selectors
 */
export const conversationSelectors = {
  getMessages: (state: AppState): ConversationMessage[] => 
    state.conversation.messages,
  
  getLastMessage: (state: AppState): ConversationMessage | undefined => 
    state.conversation.messages.length > 0 ? 
      state.conversation.messages[state.conversation.messages.length - 1] : 
      undefined,
  
  getUserMessages: (state: AppState): ConversationMessage[] => 
    state.conversation.messages.filter(message => message.role === 'user'),
  
  getAssistantMessages: (state: AppState): ConversationMessage[] => 
    state.conversation.messages.filter(message => message.role === 'assistant'),
  
  isGenerating: (state: AppState): boolean => 
    state.conversation.isGenerating,
  
  getError: (state: AppState): string | null => 
    state.conversation.error,
  
  getMessageCount: (state: AppState): number => 
    state.conversation.messages.length,
};

/**
 * Combined selectors
 */
export const selectors = {
  auth: authSelectors,
  beats: beatSelectors,
  ui: uiSelectors,
  audio: audioSelectors,
  conversation: conversationSelectors,
};
