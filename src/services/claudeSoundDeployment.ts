/**
 * Claude Integration Service for REMIX.AI
 * 
 * This file implements the Claude integration service for sound deployment.
 * It provides specialized prompting and response handling for music creation.
 */

import { ClaudeService, ApiClient, CompletionOptions, CompletionResult } from '../types';

// Sound deployment prompt template
const SOUND_DEPLOYMENT_PROMPT = `
You are REMIX.AI's expert sound deployment system. Your task is to analyze the user's musical request and generate a structured response that can be used to deploy appropriate sounds.

USER REQUEST: {userRequest}

Please respond with a JSON object containing:
1. A brief analysis of the musical style requested
2. Recommended BPM range
3. Key musical elements to include
4. Specific sound selections from TeknoVault
5. Pattern suggestions for each sound
6. Mixing recommendations

Format your response as valid JSON with the following structure:
{
  "analysis": "Brief analysis of the style and mood",
  "bpm": { "min": 90, "max": 110, "recommended": 98 },
  "key": "Suggested musical key",
  "sounds": [
    {
      "name": "Sound name from TeknoVault",
      "category": "kick/snare/hihat/bass/etc",
      "pattern": "Description of pattern or rhythm"
    }
  ],
  "mixing": {
    "recommendations": ["List of mixing recommendations"]
  }
}
`;

/**
 * Claude integration service for sound deployment
 */
export class ClaudeSoundDeploymentService {
  private claudeService: ClaudeService;
  
  constructor(claudeService: ClaudeService) {
    this.claudeService = claudeService;
  }
  
  /**
   * Generate sound deployment recommendations based on user request
   */
  async generateSoundDeployment(userRequest: string): Promise<SoundDeploymentResponse> {
    try {
      // Format the prompt with the user's request
      const prompt = SOUND_DEPLOYMENT_PROMPT.replace('{userRequest}', userRequest);
      
      // Generate completion from Claude
      const completion = await this.claudeService.generateCompletion(prompt, {
        model: 'claude-3-opus-20240229',
        temperature: 0.7,
        systemPrompt: "You are REMIX.AI's sound deployment expert with deep knowledge of music production, sound design, and the TeknoVault sound library. Your responses must be valid JSON that can be parsed by the application."
      });
      
      // Parse the response as JSON
      const responseText = completion.message.content;
      const jsonStartIndex = responseText.indexOf('{');
      const jsonEndIndex = responseText.lastIndexOf('}') + 1;
      
      if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error('Failed to parse JSON response from Claude');
      }
      
      const jsonResponse = responseText.substring(jsonStartIndex, jsonEndIndex);
      const parsedResponse = JSON.parse(jsonResponse) as SoundDeploymentResponse;
      
      return parsedResponse;
    } catch (error) {
      console.error('Error generating sound deployment:', error);
      
      // Return a fallback response
      return this.getFallbackResponse(userRequest);
    }
  }
  
  /**
   * Generate a fallback response when Claude fails
   */
  private getFallbackResponse(userRequest: string): SoundDeploymentResponse {
    // Extract style hints from the user request
    const isTrapOrHipHop = /trap|hip hop|rap/i.test(userRequest);
    const isHouse = /house|edm|dance/i.test(userRequest);
    const isLoFi = /lo-fi|lofi|chill/i.test(userRequest);
    
    let response: SoundDeploymentResponse;
    
    if (isTrapOrHipHop) {
      response = {
        analysis: "This appears to be a trap or hip-hop style beat request",
        bpm: { min: 130, max: 160, recommended: 140 },
        key: "F minor",
        sounds: [
          { name: "808 Kick", category: "kick", pattern: "Quarter notes with variations" },
          { name: "Trap Snare", category: "snare", pattern: "On beats 2 and 4" },
          { name: "Hi-Hat", category: "hihat", pattern: "16th note pattern with emphasis" },
          { name: "808 Bass", category: "bass", pattern: "Follow kick pattern with slides" }
        ],
        mixing: {
          recommendations: [
            "Sidechain the kick and bass",
            "Add reverb to the snare",
            "Pan hi-hats slightly"
          ]
        }
      };
    } else if (isHouse) {
      response = {
        analysis: "This appears to be a house music style request",
        bpm: { min: 120, max: 128, recommended: 124 },
        key: "C minor",
        sounds: [
          { name: "House Kick", category: "kick", pattern: "Four-on-the-floor pattern" },
          { name: "Clap", category: "snare", pattern: "On beats 2 and 4" },
          { name: "Open Hat", category: "hihat", pattern: "Offbeat eighth notes" },
          { name: "House Bass", category: "bass", pattern: "Rhythmic pattern with emphasis on root note" }
        ],
        mixing: {
          recommendations: [
            "Sidechain the bass to the kick",
            "Add delay to the clap",
            "Use filter automation on the bass"
          ]
        }
      };
    } else if (isLoFi) {
      response = {
        analysis: "This appears to be a lo-fi style beat request",
        bpm: { min: 75, max: 95, recommended: 85 },
        key: "D minor",
        sounds: [
          { name: "Dusty Kick", category: "kick", pattern: "Laid-back pattern with swing" },
          { name: "Rim Shot", category: "snare", pattern: "On beats 2 and 4 with swing" },
          { name: "Jazz Hat", category: "hihat", pattern: "Eighth note pattern with swing" },
          { name: "Warm Bass", category: "bass", pattern: "Simple pattern following chord changes" }
        ],
        mixing: {
          recommendations: [
            "Add vinyl crackle",
            "Apply tape saturation",
            "Use light compression on the master"
          ]
        }
      };
    } else {
      // Default fallback
      response = {
        analysis: "Creating a versatile beat based on your request",
        bpm: { min: 90, max: 110, recommended: 100 },
        key: "G minor",
        sounds: [
          { name: "Basic Kick", category: "kick", pattern: "Steady pattern on main beats" },
          { name: "Snare", category: "snare", pattern: "On beats 2 and 4" },
          { name: "Hi-Hat", category: "hihat", pattern: "Eighth note pattern" },
          { name: "Deep Bass", category: "bass", pattern: "Follow kick pattern" }
        ],
        mixing: {
          recommendations: [
            "Balance levels carefully",
            "Add subtle reverb to snare",
            "Keep the kick and bass clean"
          ]
        }
      };
    }
    
    return response;
  }
}

/**
 * Sound deployment response type
 */
export interface SoundDeploymentResponse {
  analysis: string;
  bpm: {
    min: number;
    max: number;
    recommended: number;
  };
  key: string;
  sounds: Array<{
    name: string;
    category: string;
    pattern: string;
  }>;
  mixing: {
    recommendations: string[];
  };
}

/**
 * Create a Claude sound deployment service
 */
export function createClaudeSoundDeploymentService(claudeService: ClaudeService): ClaudeSoundDeploymentService {
  return new ClaudeSoundDeploymentService(claudeService);
}
