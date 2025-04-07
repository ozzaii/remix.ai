/**
 * Index file for state management in REMIX.AI
 * 
 * This file exports all state management components for easy access.
 */

// Export types
export * from './types';

// Export initial state
export { initialState } from './initialState';

// Export store and hooks
export { 
  StoreProvider, 
  useStore, 
  useAppState, 
  useDispatch 
} from './store';

// Export actions
export { 
  authActions, 
  beatsActions, 
  uiActions, 
  audioActions, 
  conversationActions 
} from './actions';

// Export selectors
export { selectors } from './selectors';

// Export custom hooks
export { 
  useAuth, 
  useBeats, 
  useUI, 
  useAudio, 
  useConversation 
} from './hooks';
