/**
 * Custom Hooks for REMIX.AI
 * 
 * This file implements custom hooks for accessing and manipulating state.
 * These hooks provide a convenient API for components to interact with the application state.
 */

import { useCallback } from 'react';
import { useStore, useAppState, useDispatch } from './store';
import { selectors } from './selectors';
import { 
  authActions, 
  beatsActions, 
  uiActions, 
  audioActions, 
  conversationActions 
} from './actions';
import { Beat, User, Notification, ConversationMessage } from './types';

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const state = useAppState();
  const dispatch = useDispatch();
  
  const isAuthenticated = selectors.auth.isAuthenticated(state);
  const user = selectors.auth.getUser(state);
  const isLoading = selectors.auth.isLoading(state);
  const error = selectors.auth.getError(state);
  
  const login = useCallback((username: string, password: string) => {
    dispatch(authActions.loginRequest());
    
    // This would typically be an API call
    // For now, we'll simulate a successful login
    setTimeout(() => {
      const user: User = {
        id: '1',
        username,
        email: `${username}@example.com`,
      };
      
      dispatch(authActions.loginSuccess(user));
    }, 1000);
  }, [dispatch]);
  
  const logout = useCallback(() => {
    dispatch(authActions.logout());
  }, [dispatch]);
  
  const updateUser = useCallback((updates: Partial<User>) => {
    dispatch(authActions.updateUser(updates));
  }, [dispatch]);
  
  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
    updateUser,
  };
}

/**
 * Hook for beats state and actions
 */
export function useBeats() {
  const state = useAppState();
  const dispatch = useDispatch();
  
  const beats = selectors.beats.getAllBeats(state);
  const currentBeat = selectors.beats.getCurrentBeat(state);
  const currentBeatId = selectors.beats.getCurrentBeatId(state);
  const isLoading = selectors.beats.isLoading(state);
  const error = selectors.beats.getError(state);
  
  const fetchBeats = useCallback(() => {
    dispatch(beatsActions.fetchBeatsRequest());
    
    // This would typically be an API call
    // For now, we'll simulate a successful fetch
    setTimeout(() => {
      const beats: Beat[] = [
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
        },
      ];
      
      dispatch(beatsActions.fetchBeatsSuccess(beats));
    }, 1000);
  }, [dispatch]);
  
  const createBeat = useCallback((name: string, bpm: number) => {
    dispatch(beatsActions.createBeatRequest(name, bpm));
    
    // This would typically be an API call
    // For now, we'll simulate a successful creation
    setTimeout(() => {
      const beat: Beat = {
        id: Math.random().toString(36).substring(2, 15),
        name,
        createdAt: new Date().toISOString(),
        patterns: {
          kick: Array(16).fill(false),
          snare: Array(16).fill(false),
          hihat: Array(16).fill(false),
          bass: Array(16).fill(false),
        },
        bpm,
        isPublic: false,
        createdBy: '1',
      };
      
      dispatch(beatsActions.createBeatSuccess(beat));
    }, 1000);
  }, [dispatch]);
  
  const updateBeat = useCallback((id: string, updates: Partial<Beat>) => {
    dispatch(beatsActions.updateBeatRequest(id, updates));
    
    // This would typically be an API call
    // For now, we'll simulate a successful update
    setTimeout(() => {
      const beat = selectors.beats.getBeatById(state, id);
      
      if (beat) {
        const updatedBeat: Beat = {
          ...beat,
          ...updates,
        };
        
        dispatch(beatsActions.updateBeatSuccess(updatedBeat));
      } else {
        dispatch(beatsActions.updateBeatFailure('Beat not found'));
      }
    }, 1000);
  }, [dispatch, state]);
  
  const deleteBeat = useCallback((id: string) => {
    dispatch(beatsActions.deleteBeatRequest(id));
    
    // This would typically be an API call
    // For now, we'll simulate a successful deletion
    setTimeout(() => {
      dispatch(beatsActions.deleteBeatSuccess(id));
    }, 1000);
  }, [dispatch]);
  
  const setCurrentBeat = useCallback((id: string | null) => {
    dispatch(beatsActions.setCurrentBeat(id));
  }, [dispatch]);
  
  const toggleStep = useCallback((instrument: string, stepIndex: number) => {
    dispatch(beatsActions.toggleStep(instrument, stepIndex));
  }, [dispatch]);
  
  return {
    beats,
    currentBeat,
    currentBeatId,
    isLoading,
    error,
    fetchBeats,
    createBeat,
    updateBeat,
    deleteBeat,
    setCurrentBeat,
    toggleStep,
  };
}

/**
 * Hook for UI state and actions
 */
export function useUI() {
  const state = useAppState();
  const dispatch = useDispatch();
  
  const theme = selectors.ui.getTheme(state);
  const isSidebarOpen = selectors.ui.isSidebarOpen(state);
  const activeModal = selectors.ui.getActiveModal(state);
  const notifications = selectors.ui.getNotifications(state);
  const unreadNotifications = selectors.ui.getUnreadNotifications(state);
  const unreadNotificationCount = selectors.ui.getUnreadNotificationCount(state);
  
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch(uiActions.setTheme(theme));
  }, [dispatch]);
  
  const toggleSidebar = useCallback(() => {
    dispatch(uiActions.toggleSidebar());
  }, [dispatch]);
  
  const setActiveModal = useCallback((modalId: string | null) => {
    dispatch(uiActions.setActiveModal(modalId));
  }, [dispatch]);
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    dispatch(uiActions.addNotification(notification));
  }, [dispatch]);
  
  const removeNotification = useCallback((id: string) => {
    dispatch(uiActions.removeNotification(id));
  }, [dispatch]);
  
  const markNotificationRead = useCallback((id: string) => {
    dispatch(uiActions.markNotificationRead(id));
  }, [dispatch]);
  
  return {
    theme,
    isSidebarOpen,
    activeModal,
    notifications,
    unreadNotifications,
    unreadNotificationCount,
    setTheme,
    toggleSidebar,
    setActiveModal,
    addNotification,
    removeNotification,
    markNotificationRead,
  };
}

/**
 * Hook for audio state and actions
 */
export function useAudio() {
  const state = useAppState();
  const dispatch = useDispatch();
  
  const isPlaying = selectors.audio.isPlaying(state);
  const currentStep = selectors.audio.getCurrentStep(state);
  const volume = selectors.audio.getVolume(state);
  const isMuted = selectors.audio.isMuted(state);
  const effectiveVolume = selectors.audio.getEffectiveVolume(state);
  
  const setPlaying = useCallback((isPlaying: boolean) => {
    dispatch(audioActions.setPlaying(isPlaying));
  }, [dispatch]);
  
  const setCurrentStep = useCallback((step: number | null) => {
    dispatch(audioActions.setCurrentStep(step));
  }, [dispatch]);
  
  const setVolume = useCallback((volume: number) => {
    dispatch(audioActions.setVolume(volume));
  }, [dispatch]);
  
  const toggleMute = useCallback(() => {
    dispatch(audioActions.toggleMute());
  }, [dispatch]);
  
  return {
    isPlaying,
    currentStep,
    volume,
    isMuted,
    effectiveVolume,
    setPlaying,
    setCurrentStep,
    setVolume,
    toggleMute,
  };
}

/**
 * Hook for conversation state and actions
 */
export function useConversation() {
  const state = useAppState();
  const dispatch = useDispatch();
  
  const messages = selectors.conversation.getMessages(state);
  const lastMessage = selectors.conversation.getLastMessage(state);
  const userMessages = selectors.conversation.getUserMessages(state);
  const assistantMessages = selectors.conversation.getAssistantMessages(state);
  const isGenerating = selectors.conversation.isGenerating(state);
  const error = selectors.conversation.getError(state);
  const messageCount = selectors.conversation.getMessageCount(state);
  
  const addMessage = useCallback((message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    dispatch(conversationActions.addMessage(message));
  }, [dispatch]);
  
  const setGenerating = useCallback((isGenerating: boolean) => {
    dispatch(conversationActions.setGenerating(isGenerating));
  }, [dispatch]);
  
  const setError = useCallback((error: string | null) => {
    dispatch(conversationActions.setError(error));
  }, [dispatch]);
  
  const clearConversation = useCallback(() => {
    dispatch(conversationActions.clearConversation());
  }, [dispatch]);
  
  return {
    messages,
    lastMessage,
    userMessages,
    assistantMessages,
    isGenerating,
    error,
    messageCount,
    addMessage,
    setGenerating,
    setError,
    clearConversation,
  };
}
