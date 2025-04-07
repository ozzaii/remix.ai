/**
 * Store Context for REMIX.AI
 * 
 * This file implements the store context provider for centralized state management.
 * It uses React's Context API and useReducer hook to manage application state.
 */

import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';
import { AppState, Action } from './types';
import { rootReducer } from './reducers';
import { initialState } from './initialState';

// Store context type
interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

// Create context
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Props for StoreProvider
interface StoreProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

/**
 * Store Provider component that provides state to the application
 */
export function StoreProvider({ children, initialState: customInitialState }: StoreProviderProps) {
  // Merge custom initial state with default initial state
  const mergedInitialState = customInitialState 
    ? { ...initialState, ...customInitialState }
    : initialState;
  
  // Create reducer with initial state
  const [state, dispatch] = useReducer(rootReducer, mergedInitialState);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);
  
  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

/**
 * Hook to access the store context
 */
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

/**
 * Hook to access only the state
 */
export function useAppState() {
  const { state } = useStore();
  return state;
}

/**
 * Hook to access only the dispatch function
 */
export function useDispatch() {
  const { dispatch } = useStore();
  return dispatch;
}
