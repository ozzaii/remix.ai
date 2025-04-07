/**
 * Test setup file for REMIX.AI
 * 
 * This file configures the testing environment and adds any global mocks
 * needed for testing React Native components.
 */

import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Mock additional Reanimated functions used in our components
  Reanimated.FadeIn = {
    duration: () => ({ duration: 300 }),
  };
  
  Reanimated.FadeOut = {
    duration: () => ({ duration: 300 }),
  };
  
  Reanimated.SlideInRight = {
    delay: () => ({
      duration: () => ({ duration: 400, delay: 100 }),
    }),
  };
  
  return Reanimated;
});

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock React Native's Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock dimensions for consistent testing
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({
    width: 375,
    height: 812,
  }),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Global mocks
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // error: jest.fn(),
  // warn: jest.fn(),
  // log: jest.fn(),
};
