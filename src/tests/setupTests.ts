/**
 * Setup file for Jest tests in REMIX.AI
 * 
 * This file configures the testing environment and provides global mocks
 * for external dependencies used throughout the application.
 */

// Mock Expo modules
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({
        sound: {
          playAsync: jest.fn(),
          stopAsync: jest.fn(),
          unloadAsync: jest.fn(),
          setPositionAsync: jest.fn(),
          setRateAsync: jest.fn(),
          setVolumeAsync: jest.fn(),
          setIsLoopingAsync: jest.fn(),
          getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true, positionMillis: 0, durationMillis: 1000 })),
        },
        status: { isLoaded: true },
      })),
    },
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-reanimated', () => ({
  FadeIn: {
    duration: jest.fn(() => ({ duration: 300 })),
  },
  FadeOut: {
    duration: jest.fn(() => ({ duration: 300 })),
  },
  SlideInRight: {
    delay: jest.fn(() => ({
      duration: jest.fn(() => ({ duration: 400, delay: 100 })),
    })),
  },
  View: 'AnimatedView',
  useAnimatedStyle: jest.fn(() => ({})),
  useSharedValue: jest.fn(() => ({ value: 0 })),
  withTiming: jest.fn((value) => value),
  withSpring: jest.fn((value) => value),
  runOnJS: jest.fn((fn) => fn),
  useAnimatedGestureHandler: jest.fn(() => ({})),
}));

jest.mock('@react-native-community/slider', () => 'Slider');

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  FontAwesome5: 'FontAwesome5',
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
);

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Set up timing mocks
jest.useFakeTimers();

// Add custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
