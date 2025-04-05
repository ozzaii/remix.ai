import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { claudeApi } from './claudeApi';

// --- Define Interfaces ---
interface BeatStep {
  [instrument: string]: (number | boolean)[]; 
}

interface BeatPattern {
  bpm: number;
  instruments: BeatStep;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  beatPattern?: BeatPattern | null; 
}

interface ClaudeContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<Message | null>; 
  clearConversation: () => void;
}

// Create context with the defined type
const ClaudeContext = createContext<ClaudeContextType | null>(null);

interface ClaudeProviderProps {
  children: ReactNode;
}

// Claude provider component
const ClaudeProvider = ({ children }: ClaudeProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); 
  
  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hi there! I\'m Claude, your AI music producer. Tell me what kind of beat you want to create, and I\'ll help you bring it to life. You can be as specific or as vague as you like about the style, mood, tempo, and instruments.',
        beatPattern: null // Explicitly set beatPattern for initial message
      }
    ]);
  }, []);
  
  // Send message to Claude API
  const sendMessage = async (content: string): Promise<Message | null> => {
    try {
      // Add user message to state
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      
      // Set loading state
      setIsLoading(true);
      setError(null);
      
      // Call Claude API
      const response = await claudeApi.generateBeat(content, messages);
      
      // Process response to extract beat pattern
      const { message: processedMessage, beatPattern } = processClaudeResponse(response);
      
      // Add assistant message to state
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: processedMessage,
        beatPattern: beatPattern 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      return assistantMessage;
    } catch (err) {
      console.error('Error sending message to Claude:', err);
      setError('Failed to communicate with Claude. Please try again.');
      setIsLoading(false);
      return null;
    }
  };
  
  // Process Claude response to extract beat pattern
  const processClaudeResponse = (response: any): { message: string; beatPattern: BeatPattern | null } => {
    try {
      // Extract message content
      const message = response.content[0].text as string;
      
      // Look for JSON beat pattern in the response
      const beatPatternMatch = message.match(/```json\n([\s\S]*?)\n```/);
      
      if (beatPatternMatch && beatPatternMatch[1]) {
        // Parse beat pattern JSON
        const beatPattern = JSON.parse(beatPatternMatch[1]) as BeatPattern;
        
        // Clean message by removing the JSON block
        const cleanMessage = message.replace(/```json\n[\s\S]*?\n```/, '');
        
        return { 
          message: cleanMessage, 
          beatPattern 
        };
      }
      
      // If no beat pattern found, return original message
      return { 
        message, 
        beatPattern: null 
      };
    } catch (err) {
      console.error('Error processing Claude response:', err);
      const message = response?.content?.[0]?.text || 'Error processing response';
      return { 
        message: message as string, 
        beatPattern: null 
      };
    }
  };
  
  // Clear conversation
  const clearConversation = (): void => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hi there! I\'m Claude, your AI music producer. Tell me what kind of beat you want to create, and I\'ll help you bring it to life. You can be as specific or as vague as you like about the style, mood, tempo, and instruments.',
        beatPattern: null // Explicitly set beatPattern for initial message
      }
    ]);
    setError(null);
  };
  
  // Context value
  const value: ClaudeContextType = {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation
  };
  
  return (
    <ClaudeContext.Provider value={value}>
      {children}
    </ClaudeContext.Provider>
  );
};

// Custom hook to use Claude context
const useClaude = (): ClaudeContextType => {
  const context = useContext(ClaudeContext);
  if (!context) {
    throw new Error('useClaude must be used within a ClaudeProvider');
  }
  return context;
};

export { ClaudeProvider, useClaude, Message, BeatPattern };
