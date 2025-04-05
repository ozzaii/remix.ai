import React, { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Custom hook to track app state changes (foreground/background)
 * @returns The current app state ('active', 'background', or 'inactive')
 */
const useAppState = () => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return appState;
};

export default useAppState;
