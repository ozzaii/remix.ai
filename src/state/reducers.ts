/**
 * Reducers for REMIX.AI
 * 
 * This file implements the reducers for the application state.
 * Reducers are pure functions that take the current state and an action,
 * and return a new state.
 */

import { 
  AppState, 
  AuthState, 
  BeatsState, 
  UIState, 
  AudioState, 
  ConversationState,
  Action 
} from './types';
import { 
  AUTH_ACTIONS, 
  BEATS_ACTIONS, 
  UI_ACTIONS, 
  AUDIO_ACTIONS, 
  CONVERSATION_ACTIONS 
} from './actions';

/**
 * Auth reducer
 */
export function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload?.user || null,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload?.error || 'Unknown error',
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload?.user } : null,
      };
    
    default:
      return state;
  }
}

/**
 * Beats reducer
 */
export function beatsReducer(state: BeatsState, action: Action): BeatsState {
  switch (action.type) {
    case BEATS_ACTIONS.FETCH_BEATS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case BEATS_ACTIONS.FETCH_BEATS_SUCCESS:
      return {
        ...state,
        items: action.payload?.beats || [],
        loading: false,
        error: null,
      };
    
    case BEATS_ACTIONS.FETCH_BEATS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.error || 'Unknown error',
      };
    
    case BEATS_ACTIONS.CREATE_BEAT_SUCCESS:
      return {
        ...state,
        items: [...state.items, action.payload?.beat],
        currentBeatId: action.payload?.beat.id,
        loading: false,
        error: null,
      };
    
    case BEATS_ACTIONS.UPDATE_BEAT_SUCCESS:
      return {
        ...state,
        items: state.items.map(beat => 
          beat.id === action.payload?.beat.id ? action.payload.beat : beat
        ),
        loading: false,
        error: null,
      };
    
    case BEATS_ACTIONS.DELETE_BEAT_SUCCESS:
      return {
        ...state,
        items: state.items.filter(beat => beat.id !== action.payload?.id),
        currentBeatId: state.currentBeatId === action.payload?.id ? null : state.currentBeatId,
        loading: false,
        error: null,
      };
    
    case BEATS_ACTIONS.SET_CURRENT_BEAT:
      return {
        ...state,
        currentBeatId: action.payload?.id || null,
      };
    
    case BEATS_ACTIONS.TOGGLE_STEP:
      if (!state.currentBeatId) return state;
      
      const { instrument, stepIndex } = action.payload || {};
      const currentBeat = state.items.find(beat => beat.id === state.currentBeatId);
      
      if (!currentBeat || !instrument || stepIndex === undefined) return state;
      
      const updatedBeat = {
        ...currentBeat,
        patterns: {
          ...currentBeat.patterns,
          [instrument]: currentBeat.patterns[instrument].map((step, index) => 
            index === stepIndex ? !step : step
          ),
        },
      };
      
      return {
        ...state,
        items: state.items.map(beat => 
          beat.id === state.currentBeatId ? updatedBeat : beat
        ),
      };
    
    default:
      return state;
  }
}

/**
 * UI reducer
 */
export function uiReducer(state: UIState, action: Action): UIState {
  switch (action.type) {
    case UI_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload?.theme || 'dark',
      };
    
    case UI_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };
    
    case UI_ACTIONS.SET_ACTIVE_MODAL:
      return {
        ...state,
        activeModal: action.payload?.modalId || null,
      };
    
    case UI_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          action.payload?.notification,
          ...state.notifications,
        ].slice(0, 10), // Keep only the 10 most recent notifications
      };
    
    case UI_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload?.id
        ),
      };
    
    case UI_ACTIONS.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => 
          notification.id === action.payload?.id
            ? { ...notification, read: true }
            : notification
        ),
      };
    
    default:
      return state;
  }
}

/**
 * Audio reducer
 */
export function audioReducer(state: AudioState, action: Action): AudioState {
  switch (action.type) {
    case AUDIO_ACTIONS.SET_PLAYING:
      return {
        ...state,
        isPlaying: action.payload?.isPlaying || false,
      };
    
    case AUDIO_ACTIONS.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload?.step,
      };
    
    case AUDIO_ACTIONS.SET_VOLUME:
      return {
        ...state,
        volume: Math.max(0, Math.min(1, action.payload?.volume || 0)),
        muted: false,
      };
    
    case AUDIO_ACTIONS.TOGGLE_MUTE:
      return {
        ...state,
        muted: !state.muted,
      };
    
    default:
      return state;
  }
}

/**
 * Conversation reducer
 */
export function conversationReducer(state: ConversationState, action: Action): ConversationState {
  switch (action.type) {
    case CONVERSATION_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload?.message],
      };
    
    case CONVERSATION_ACTIONS.SET_GENERATING:
      return {
        ...state,
        isGenerating: action.payload?.isGenerating || false,
      };
    
    case CONVERSATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload?.error || null,
      };
    
    case CONVERSATION_ACTIONS.CLEAR_CONVERSATION:
      return {
        ...state,
        messages: [],
        isGenerating: false,
        error: null,
      };
    
    default:
      return state;
  }
}

/**
 * Root reducer that combines all reducers
 */
export function rootReducer(state: AppState, action: Action): AppState {
  return {
    auth: authReducer(state.auth, action),
    beats: beatsReducer(state.beats, action),
    ui: uiReducer(state.ui, action),
    audio: audioReducer(state.audio, action),
    conversation: conversationReducer(state.conversation, action),
  };
}
