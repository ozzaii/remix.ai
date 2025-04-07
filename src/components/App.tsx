/**
 * App Entry Point for REMIX.AI
 * 
 * This file updates the main App component to integrate the MainScreen
 * and ensure all providers are properly set up.
 */

import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { StoreProvider } from '../state';
import { AppErrorBoundary } from '../core';
import { ServiceInitializer } from './ServiceInitializer';
import MainScreen from './MainScreen';

/**
 * Main App component that sets up the application
 */
export function App() {
  return (
    <AppErrorBoundary>
      <StoreProvider>
        <ServiceInitializer>
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <MainScreen />
          </SafeAreaView>
        </ServiceInitializer>
      </StoreProvider>
    </AppErrorBoundary>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default App;
