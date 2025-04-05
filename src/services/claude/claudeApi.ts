import axios from 'axios';
// Import the API key from @env (ensure react-native-dotenv is set up)
import { ANTHROPIC_API_KEY } from '@env';

// Define the type for conversation history messages
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Mock beat patterns for different styles
const mockBeatPatterns = {
  trap: {
    bpm: 140,
    instruments: {
      kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      bass: [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]
    },
    effects: {
      reverb: 0.2,
      delay: 0.3
    }
  },
  lofi: {
    bpm: 85,
    instruments: {
      kick: [1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      bass: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
    },
    effects: {
      reverb: 0.6,
      delay: 0.4
    }
  },
  house: {
    bpm: 128,
    instruments: {
      kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      bass: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]
    },
    effects: {
      reverb: 0.3,
      delay: 0.2
    }
  }
};

// Claude API service
const claudeApi = {
  // Use the API key from environment variables
  apiKey: ANTHROPIC_API_KEY,
  
  // Base URL for Claude API
  baseUrl: 'https://api.anthropic.com/v1/messages',
  
  // Generate beat from user input
  generateBeat: async (userInput: string, conversationHistory: ConversationMessage[]) => {
    if (!claudeApi.apiKey) {
      console.error('Anthropic API key is missing. Please set ANTHROPIC_API_KEY in your .env file.');
      throw new Error('Missing Anthropic API Key');
    }
    
    try {
      // Format conversation history for Claude API
      const messages = conversationHistory.map((msg: ConversationMessage) => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add user's new message
      messages.push({
        role: 'user',
        content: userInput
      });
      
      // System prompt for beat generation
      const systemPrompt = `You are Claude, an AI music producer for REMIX.AI, a revolutionary music creation app. Your task is to help users create beats through natural conversation.

When a user describes the kind of beat they want, you should:
1. Respond conversationally, discussing their musical request
2. Generate a structured beat pattern in JSON format
3. Explain your musical choices

Your beat pattern JSON must follow this exact structure:
\`\`\`json
{
  "bpm": 120,
  "instruments": {
    "kick": [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    "snare": [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    "hihat": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "bass": [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]
  },
  "effects": {
    "reverb": 0.3,
    "delay": 0.2
  }
}
\`\`\`

The arrays represent a 16-step sequence where 1 means the instrument plays and 0 means it doesn't.
BPM should be between 70-160 depending on the style.
Always include kick, snare, hihat, and bass instruments.
Effects values should be between 0.0 and 1.0.

Always include the JSON code block in your response, and explain your musical choices in a friendly, conversational way.`;

      console.log("Making API request to Claude...");
      
      // Make API request
      const response = await axios.post(
        claudeApi.baseUrl,
        {
          model: 'claude-3-opus-20240229',
          max_tokens: 4000,
          messages,
          system: systemPrompt
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeApi.apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      
      console.log("Claude API response received.");
      return response.data;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }
};

export { claudeApi };
