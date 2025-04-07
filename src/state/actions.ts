/**
 * Action Types and Action Creators for REMIX.AI
 * 
 * This file defines the action types and action creators for the application.
 * Actions are used to update the application state through reducers.
 */

import { User, Beat, Notification, ConversationMessage, Action } from './types';

// Auth action types
export const AUTH_ACTIONS = {
  LOGIN_REQUEST: 'auth/loginRequest',
  LOGIN_SUCCESS: 'auth/loginSuccess',
  LOGIN_FAILURE: 'auth/loginFailure',
  LOGOUT: 'auth/logout',
  UPDATE_USER: 'auth/updateUser',
};

// Beats action types
export const BEATS_ACTIONS = {
  FETCH_BEATS_REQUEST: 'beats/fetchBeatsRequest',
  FETCH_BEATS_SUCCESS: 'beats/fetchBeatsSuccess',
  FETCH_BEATS_FAILURE: 'beats/fetchBeatsFailure',
  CREATE_BEAT_REQUEST: 'beats/createBeatRequest',
  CREATE_BEAT_SUCCESS: 'beats/createBeatSuccess',
  CREATE_BEAT_FAILURE: 'beats/createBeatFailure',
  UPDATE_BEAT_REQUEST: 'beats/updateBeatRequest',
  UPDATE_BEAT_SUCCESS: 'beats/updateBeatSuccess',
  UPDATE_BEAT_FAILURE: 'beats/updateBeatFailure',
  DELETE_BEAT_REQUEST: 'beats/deleteBeatRequest',
  DELETE_BEAT_SUCCESS: 'beats/deleteBeatSuccess',
  DELETE_BEAT_FAILURE: 'beats/deleteBeatFailure',
  SET_CURRENT_BEAT: 'beats/setCurrentBeat',
  TOGGLE_STEP: 'beats/toggleStep',
};

// UI action types
export const UI_ACTIONS = {
  SET_THEME: 'ui/setTheme',
  TOGGLE_SIDEBAR: 'ui/toggleSidebar',
  SET_ACTIVE_MODAL: 'ui/setActiveModal',
  ADD_NOTIFICATION: 'ui/addNotification',
  REMOVE_NOTIFICATION: 'ui/removeNotification',
  MARK_NOTIFICATION_READ: 'ui/markNotificationRead',
};

// Audio action types
export const AUDIO_ACTIONS = {
  SET_PLAYING: 'audio/setPlaying',
  SET_CURRENT_STEP: 'audio/setCurrentStep',
  SET_VOLUME: 'audio/setVolume',
  TOGGLE_MUTE: 'audio/toggleMute',
};

// Conversation action types
export const CONVERSATION_ACTIONS = {
  ADD_MESSAGE: 'conversation/addMessage',
  SET_GENERATING: 'conversation/setGenerating',
  SET_ERROR: 'conversation/setError',
  CLEAR_CONVERSATION: 'conversation/clearConversation',
};

// Auth action creators
export const authActions = {
  loginRequest: (): Action => ({
    type: AUTH_ACTIONS.LOGIN_REQUEST,
  }),
  
  loginSuccess: (user: User): Action<{ user: User }> => ({
    type: AUTH_ACTIONS.LOGIN_SUCCESS,
    payload: { user },
  }),
  
  loginFailure: (error: string): Action<{ error: string }> => ({
    type: AUTH_ACTIONS.LOGIN_FAILURE,
    payload: { error },
  }),
  
  logout: (): Action => ({
    type: AUTH_ACTIONS.LOGOUT,
  }),
  
  updateUser: (user: Partial<User>): Action<{ user: Partial<User> }> => ({
    type: AUTH_ACTIONS.UPDATE_USER,
    payload: { user },
  }),
};

// Beats action creators
export const beatsActions = {
  fetchBeatsRequest: (): Action => ({
    type: BEATS_ACTIONS.FETCH_BEATS_REQUEST,
  }),
  
  fetchBeatsSuccess: (beats: Beat[]): Action<{ beats: Beat[] }> => ({
    type: BEATS_ACTIONS.FETCH_BEATS_SUCCESS,
    payload: { beats },
  }),
  
  fetchBeatsFailure: (error: string): Action<{ error: string }> => ({
    type: BEATS_ACTIONS.FETCH_BEATS_FAILURE,
    payload: { error },
  }),
  
  createBeatRequest: (name: string, bpm: number): Action<{ name: string, bpm: number }> => ({
    type: BEATS_ACTIONS.CREATE_BEAT_REQUEST,
    payload: { name, bpm },
  }),
  
  createBeatSuccess: (beat: Beat): Action<{ beat: Beat }> => ({
    type: BEATS_ACTIONS.CREATE_BEAT_SUCCESS,
    payload: { beat },
  }),
  
  createBeatFailure: (error: string): Action<{ error: string }> => ({
    type: BEATS_ACTIONS.CREATE_BEAT_FAILURE,
    payload: { error },
  }),
  
  updateBeatRequest: (id: string, updates: Partial<Beat>): Action<{ id: string, updates: Partial<Beat> }> => ({
    type: BEATS_ACTIONS.UPDATE_BEAT_REQUEST,
    payload: { id, updates },
  }),
  
  updateBeatSuccess: (beat: Beat): Action<{ beat: Beat }> => ({
    type: BEATS_ACTIONS.UPDATE_BEAT_SUCCESS,
    payload: { beat },
  }),
  
  updateBeatFailure: (error: string): Action<{ error: string }> => ({
    type: BEATS_ACTIONS.UPDATE_BEAT_FAILURE,
    payload: { error },
  }),
  
  deleteBeatRequest: (id: string): Action<{ id: string }> => ({
    type: BEATS_ACTIONS.DELETE_BEAT_REQUEST,
    payload: { id },
  }),
  
  deleteBeatSuccess: (id: string): Action<{ id: string }> => ({
    type: BEATS_ACTIONS.DELETE_BEAT_SUCCESS,
    payload: { id },
  }),
  
  deleteBeatFailure: (error: string): Action<{ error: string }> => ({
    type: BEATS_ACTIONS.DELETE_BEAT_FAILURE,
    payload: { error },
  }),
  
  setCurrentBeat: (id: string | null): Action<{ id: string | null }> => ({
    type: BEATS_ACTIONS.SET_CURRENT_BEAT,
    payload: { id },
  }),
  
  toggleStep: (instrument: string, stepIndex: number): Action<{ instrument: string, stepIndex: number }> => ({
    type: BEATS_ACTIONS.TOGGLE_STEP,
    payload: { instrument, stepIndex },
  }),
};

// UI action creators
export const uiActions = {
  setTheme: (theme: 'light' | 'dark'): Action<{ theme: 'light' | 'dark' }> => ({
    type: UI_ACTIONS.SET_THEME,
    payload: { theme },
  }),
  
  toggleSidebar: (): Action => ({
    type: UI_ACTIONS.TOGGLE_SIDEBAR,
  }),
  
  setActiveModal: (modalId: string | null): Action<{ modalId: string | null }> => ({
    type: UI_ACTIONS.SET_ACTIVE_MODAL,
    payload: { modalId },
  }),
  
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Action<{ notification: Notification }> => ({
    type: UI_ACTIONS.ADD_NOTIFICATION,
    payload: { 
      notification: {
        ...notification,
        id: Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        read: false,
      } 
    },
  }),
  
  removeNotification: (id: string): Action<{ id: string }> => ({
    type: UI_ACTIONS.REMOVE_NOTIFICATION,
    payload: { id },
  }),
  
  markNotificationRead: (id: string): Action<{ id: string }> => ({
    type: UI_ACTIONS.MARK_NOTIFICATION_READ,
    payload: { id },
  }),
};

// Audio action creators
export const audioActions = {
  setPlaying: (isPlaying: boolean): Action<{ isPlaying: boolean }> => ({
    type: AUDIO_ACTIONS.SET_PLAYING,
    payload: { isPlaying },
  }),
  
  setCurrentStep: (step: number | null): Action<{ step: number | null }> => ({
    type: AUDIO_ACTIONS.SET_CURRENT_STEP,
    payload: { step },
  }),
  
  setVolume: (volume: number): Action<{ volume: number }> => ({
    type: AUDIO_ACTIONS.SET_VOLUME,
    payload: { volume },
  }),
  
  toggleMute: (): Action => ({
    type: AUDIO_ACTIONS.TOGGLE_MUTE,
  }),
};

// Conversation action creators
export const conversationActions = {
  addMessage: (message: Omit<ConversationMessage, 'id' | 'timestamp'>): Action<{ message: ConversationMessage }> => ({
    type: CONVERSATION_ACTIONS.ADD_MESSAGE,
    payload: { 
      message: {
        ...message,
        id: Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
      } 
    },
  }),
  
  setGenerating: (isGenerating: boolean): Action<{ isGenerating: boolean }> => ({
    type: CONVERSATION_ACTIONS.SET_GENERATING,
    payload: { isGenerating },
  }),
  
  setError: (error: string | null): Action<{ error: string | null }> => ({
    type: CONVERSATION_ACTIONS.SET_ERROR,
    payload: { error },
  }),
  
  clearConversation: (): Action => ({
    type: CONVERSATION_ACTIONS.CLEAR_CONVERSATION,
  }),
};
