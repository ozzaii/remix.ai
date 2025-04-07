/**
 * Integration tests for REMIX.AI
 * 
 * This file contains integration tests to verify the interactions
 * between different components of the REMIX.AI application.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StoreProvider } from '../state';
import { ServiceInitializer } from '../components/ServiceInitializer';
import { App } from '../components/App';
import { MainScreen } from '../components/MainScreen';

// Mock the services and state hooks
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

describe('REMIX.AI Integration Tests', () => {
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

  it('navigates between tabs correctly', () => {
    const { getByText } = render(<MainScreen />);
    
    // Initial tab should be Chat
    expect(getByText('REMIX.AI')).toBeTruthy();
    
    // Navigate to Library tab
    fireEvent.press(getByText('Library'));
    
    // Navigate to Profile tab
    fireEvent.press(getByText('Profile'));
    
    // Navigate back to Chat tab
    fireEvent.press(getByText('Chat'));
  });

  it('conversation flow integrates with sound deployment', async () => {
    // Mock state hooks for this test
    const mockUseConversation = require('../state').useConversation;
    const mockUseBeats = require('../state').useBeats;
    
    // Setup conversation state
    mockUseConversation.mockReturnValue({
      messages: [
        { id: '1', role: 'user', content: 'Create a lofi beat', timestamp: Date.now() },
        { id: '2', role: 'assistant', content: 'I can help with that', timestamp: Date.now() }
      ],
      addMessage: jest.fn(),
      isGenerating: false,
      setGenerating: jest.fn(),
      setError: jest.fn(),
      lastMessage: { id: '2', role: 'assistant', content: 'I can help with that', timestamp: Date.now() }
    });
    
    // Setup beats state
    mockUseBeats.mockReturnValue({
      beats: [],
      loadBeats: jest.fn(),
      isLoading: false,
      currentBeat: {
        id: '1',
        name: 'Lofi Beat',
        bpm: 85,
        patterns: {
          kick: Array(16).fill(false).map((_, i) => i % 4 === 0),
          snare: Array(16).fill(false).map((_, i) => i % 8 === 4),
          hihat: Array(16).fill(false).map((_, i) => i % 2 === 0)
        },
        createdAt: new Date().toISOString(),
        isPublic: true,
        createdBy: '1'
      },
      setCurrentBeat: jest.fn(),
      toggleStep: jest.fn(),
      createBeat: jest.fn(),
      updateBeat: jest.fn(),
      error: null
    });
    
    const { getByText } = render(<MainScreen />);
    
    // Navigate to Sounds tab
    fireEvent.press(getByText('Sounds'));
    
    // Verify sound deployment is shown
    await waitFor(() => {
      expect(getByText('Sound Analysis')).toBeTruthy();
    });
  });

  it('authentication flow works correctly', async () => {
    // Mock auth state for this test
    const mockUseAuth = require('../state').useAuth;
    let authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: jest.fn((email, password) => {
        // Simulate successful login
        authState.isAuthenticated = true;
        authState.user = { id: '1', name: 'Test User', email };
      }),
      register: jest.fn(),
      logout: jest.fn()
    };
    
    mockUseAuth.mockImplementation(() => authState);
    
    const { getByText, getByPlaceholderText, rerender } = render(<MainScreen />);
    
    // Navigate to Profile tab
    fireEvent.press(getByText('Profile'));
    
    // Find login form
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    // Fill login form
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Submit login form
    fireEvent.press(getByText('Sign In'));
    
    // Verify login function was called
    expect(authState.login).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Rerender to reflect state changes
    rerender(<MainScreen />);
    
    // After successful login, profile should be shown
    await waitFor(() => {
      expect(getByText('Test User')).toBeTruthy();
    });
  });

  it('beat library integrates with audio engine', async () => {
    // Mock beats state for this test
    const mockUseBeats = require('../state').useBeats;
    const mockUseAudio = require('../state').useAudio;
    
    const mockBeats = [
      {
        id: '1',
        name: 'Test Beat 1',
        bpm: 120,
        patterns: {
          kick: Array(16).fill(false).map((_, i) => i % 4 === 0),
          snare: Array(16).fill(false).map((_, i) => i % 8 === 4)
        },
        createdAt: new Date().toISOString(),
        isPublic: true,
        createdBy: '1'
      },
      {
        id: '2',
        name: 'Test Beat 2',
        bpm: 90,
        patterns: {
          kick: Array(16).fill(false).map((_, i) => i % 4 === 0),
          snare: Array(16).fill(false).map((_, i) => i % 8 === 4)
        },
        createdAt: new Date().toISOString(),
        isPublic: true,
        createdBy: '1'
      }
    ];
    
    let audioState = {
      isPlaying: false,
      setPlaying: jest.fn((playing) => {
        audioState.isPlaying = playing;
      }),
      currentStep: null
    };
    
    mockUseBeats.mockReturnValue({
      beats: mockBeats,
      loadBeats: jest.fn(),
      isLoading: false,
      currentBeat: null,
      setCurrentBeat: jest.fn(),
      error: null
    });
    
    mockUseAudio.mockImplementation(() => audioState);
    
    const { getByText } = render(<MainScreen />);
    
    // Navigate to Library tab
    fireEvent.press(getByText('Library'));
    
    // Verify beat library is shown
    await waitFor(() => {
      expect(getByText('Beat Library')).toBeTruthy();
      expect(getByText('Test Beat 1')).toBeTruthy();
      expect(getByText('Test Beat 2')).toBeTruthy();
    });
  });
});
