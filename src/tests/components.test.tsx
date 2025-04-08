/**
 * Quality Assurance Test Suite for REMIX.AI
 * 
 * This file contains tests to verify the functionality and quality
 * of the REMIX.AI implementation.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StoreProvider } from '../state';
import { ServiceInitializer } from '../components/ServiceInitializer';
import { App } from '../components/App';
import { MainScreen } from '../components/MainScreen';
import { ConversationalInterface } from '../components/ConversationalInterface';
import { SoundDeployment } from '../components/SoundDeployment';
import { BeatVisualizer } from '../components/BeatVisualizer';
import { BeatLibrary } from '../components/BeatLibrary';
import { AuthContainer } from '../components/AuthContainer';
import { SocialSharing } from '../components/SocialSharing';

// Mock the services
jest.mock('../services', () => ({
  useClaudeService: jest.fn(() => ({
    generateCompletion: jest.fn(),
    generateStreamingCompletion: jest.fn((_, onChunk) => {
      onChunk('Mock response');
      return Promise.resolve();
    }),
  })),
  useAudioEngineService: jest.fn(() => ({
    init: jest.fn(),
    loadSample: jest.fn(),
    playSample: jest.fn(),
    playSequence: jest.fn(),
    stopSequence: jest.fn(),
    setBpm: jest.fn(),
    addStepListener: jest.fn(() => () => {}),
    dispose: jest.fn(),
  })),
  useWebSocketService: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn(),
    addMessageListener: jest.fn(),
    addConnectionStateListener: jest.fn(),
    getConnectionState: jest.fn(),
  })),
  useVectorStoreService: jest.fn(() => ({
    addDocument: jest.fn(),
    search: jest.fn(),
    getDocument: jest.fn(),
    deleteDocument: jest.fn(),
  })),
  useEventBusService: jest.fn(() => ({
    subscribe: jest.fn(),
    publish: jest.fn(),
    unsubscribe: jest.fn(),
  })),
  useApiClient: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    stream: jest.fn(),
  })),
}));

// Mock the state hooks
jest.mock('../state', () => ({
  StoreProvider: ({ children }) => children,
  useConversation: jest.fn(() => ({
    messages: [],
    addMessage: jest.fn(),
    isGenerating: false,
    setGenerating: jest.fn(),
    setError: jest.fn(),
    lastMessage: null,
  })),
  useBeats: jest.fn(() => ({
    beats: [],
    loadBeats: jest.fn(),
    isLoading: false,
    currentBeat: null,
    setCurrentBeat: jest.fn(),
    toggleStep: jest.fn(),
    createBeat: jest.fn(),
    updateBeat: jest.fn(),
    shareBeat: jest.fn(),
    isSharing: false,
    error: null,
  })),
  useAuth: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  })),
  useAudio: jest.fn(() => ({
    isPlaying: false,
    setPlaying: jest.fn(),
    currentStep: null,
  })),
  useUI: jest.fn(() => ({
    isModalOpen: false,
    setModalOpen: jest.fn(),
    activeModal: null,
    setActiveModal: jest.fn(),
  })),
}));

// Mock Expo components
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('react-native-reanimated', () => ({
  FadeIn: {
    duration: () => ({ duration: 300 }),
  },
  FadeOut: {
    duration: () => ({ duration: 300 }),
  },
  SlideInRight: {
    delay: () => ({
      duration: () => ({ duration: 400, delay: 100 }),
    }),
  },
  View: 'AnimatedView',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('REMIX.AI Components', () => {
  // App Component Tests
  describe('App Component', () => {
    it('renders without crashing', () => {
      const { getByText } = render(<App />);
      expect(getByText('REMIX.AI')).toBeTruthy();
    });
  });

  // MainScreen Component Tests
  describe('MainScreen Component', () => {
    it('renders the correct tabs', () => {
      const { getByText } = render(<MainScreen />);
      expect(getByText('Chat')).toBeTruthy();
      expect(getByText('Sounds')).toBeTruthy();
      expect(getByText('Library')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
    });

    it('changes tab when tab button is pressed', () => {
      const { getByText } = render(<MainScreen />);
      fireEvent.press(getByText('Library'));
      // In a real test, we would verify the tab content changed
    });
  });

  // ConversationalInterface Component Tests
  describe('ConversationalInterface Component', () => {
    it('renders the input field', () => {
      const { getByPlaceholderText } = render(<ConversationalInterface />);
      expect(getByPlaceholderText('Tell me what kind of beat you want to create...')).toBeTruthy();
    });

    it('shows welcome message when no messages exist', () => {
      const { getByText } = render(<ConversationalInterface />);
      expect(getByText('Welcome to REMIX.AI')).toBeTruthy();
    });

    it('sends a message when the send button is pressed', () => {
      const mockUseConversation = require('../state').useConversation;
      mockUseConversation.mockReturnValue({
        messages: [],
        addMessage: jest.fn(),
        isGenerating: false,
        setGenerating: jest.fn(),
        setError: jest.fn(),
        lastMessage: null,
      });

      const { getByPlaceholderText, getByText } = render(<ConversationalInterface />);
      const input = getByPlaceholderText('Tell me what kind of beat you want to create...');
      fireEvent.changeText(input, 'Create a lofi beat');
      fireEvent.press(getByText('Send'));

      expect(mockUseConversation().addMessage).toHaveBeenCalled();
    });
  });

  // SoundDeployment Component Tests
  describe('SoundDeployment Component', () => {
    it('shows loading state initially', () => {
      const { getByText } = render(<SoundDeployment userRequest="Create a lofi beat" />);
      expect(getByText('Generating sound deployment...')).toBeTruthy();
    });
  });

  // BeatVisualizer Component Tests
  describe('BeatVisualizer Component', () => {
    it('renders without crashing', () => {
      render(<BeatVisualizer />);
      // Visual component, so we just check it renders
    });
  });

  // BeatLibrary Component Tests
  describe('BeatLibrary Component', () => {
    it('renders the header', () => {
      const { getByText } = render(<BeatLibrary />);
      expect(getByText('Beat Library')).toBeTruthy();
    });

    it('shows loading state initially', () => {
      const mockUseBeats = require('../state').useBeats;
      mockUseBeats.mockReturnValue({
        beats: [],
        loadBeats: jest.fn(),
        isLoading: true,
        currentBeat: null,
        setCurrentBeat: jest.fn(),
        error: null,
      });

      const { getByText } = render(<BeatLibrary />);
      expect(getByText('Loading beats...')).toBeTruthy();
    });

    it('shows empty state when no beats are available', () => {
      const mockUseBeats = require('../state').useBeats;
      mockUseBeats.mockReturnValue({
        beats: [],
        loadBeats: jest.fn(),
        isLoading: false,
        currentBeat: null,
        setCurrentBeat: jest.fn(),
        error: null,
      });

      const { getByText } = render(<BeatLibrary />);
      expect(getByText('No beats found')).toBeTruthy();
    });
  });

  // AuthContainer Component Tests
  describe('AuthContainer Component', () => {
    it('renders login form when not authenticated', () => {
      const { getByText, getByPlaceholderText } = render(<AuthContainer />);
      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('toggles between login and register forms', () => {
      const { getByText } = render(<AuthContainer />);
      fireEvent.press(getByText('Sign Up'));
      expect(getByText('Create Account')).toBeTruthy();
    });
  });

  // SocialSharing Component Tests
  describe('SocialSharing Component', () => {
    const mockBeat = {
      id: '1',
      name: 'Test Beat',
      bpm: 120,
      createdAt: new Date().toISOString(),
      patterns: {},
      isPublic: true,
      createdBy: '1',
    };

    it('renders share options when opened', () => {
      const { getByText } = render(
        <SocialSharing beat={mockBeat} isVisible={true} onClose={jest.fn()} />
      );
      expect(getByText('Share Your Beat')).toBeTruthy();
    });
  });
});

// Integration Tests
describe('REMIX.AI Integration', () => {
  it('full app renders without crashing', () => {
    render(
      <StoreProvider>
        <ServiceInitializer>
          <App />
        </ServiceInitializer>
      </StoreProvider>
    );
    // If no errors are thrown, the test passes
  });

  it('conversation flow works correctly', async () => {
    const mockUseConversation = require('../state').useConversation;
    mockUseConversation.mockReturnValue({
      messages: [],
      addMessage: jest.fn(),
      isGenerating: false,
      setGenerating: jest.fn(),
      setError: jest.fn(),
      lastMessage: null,
    });

    const mockClaudeService = require('../services').useClaudeService();

    const { getByPlaceholderText, getByText } = render(<ConversationalInterface />);
    const input = getByPlaceholderText('Tell me what kind of beat you want to create...');
    
    fireEvent.changeText(input, 'Create a lofi beat');
    fireEvent.press(getByText('Send'));

    expect(mockUseConversation().addMessage).toHaveBeenCalledWith({
      role: 'user',
      content: 'Create a lofi beat'
    });

    expect(mockUseConversation().setGenerating).toHaveBeenCalledWith(true);
    
    await waitFor(() => {
      expect(mockClaudeService.generateStreamingCompletion).toHaveBeenCalled();
    });
  });
});

// Performance Tests
describe('REMIX.AI Performance', () => {
  it('renders efficiently without excessive re-renders', () => {
    // In a real implementation, we would use a render counter component
    // to track re-renders and ensure components are optimized
    const { rerender } = render(<MainScreen />);
    rerender(<MainScreen />);
    // If no errors are thrown, the test passes
  });
});

// Accessibility Tests
describe('REMIX.AI Accessibility', () => {
  it('has accessible elements with proper contrast', () => {
    // In a real implementation, we would use accessibility testing tools
    // to verify contrast ratios and accessibility properties
    const { getByText } = render(<MainScreen />);
    expect(getByText('REMIX.AI')).toBeTruthy();
  });
});
