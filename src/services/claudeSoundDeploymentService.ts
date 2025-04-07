import { useState, useEffect } from 'react';
import { useTeknoVault, SoundSample, SoundCategory } from './teknoVaultService';

// Types for Claude sound deployment
export interface ClaudeSoundDeploymentRequest {
  prompt: string;
  context?: string;
  constraints?: {
    categories?: SoundCategory[];
    maxSamples?: number;
    bpm?: number;
  };
}

export interface StepPattern {
  steps: boolean[];
}

export interface InstrumentPattern {
  sampleId: string;
  sampleName: string;
  category: SoundCategory;
  pattern: StepPattern;
  volume: number;
  pan: number;
  effects?: {
    reverb?: number;
    delay?: number;
    filter?: number;
  };
}

export interface ClaudeSoundDeploymentResponse {
  title: string;
  description: string;
  bpm: number;
  patterns: InstrumentPattern[];
  explanation: string;
  suggestions?: string[];
}

// Claude Sound Deployment Service
export class ClaudeSoundDeploymentService {
  private teknoVaultService;
  private isInitialized: boolean = false;

  constructor(teknoVaultService: ReturnType<typeof useTeknoVault>) {
    this.teknoVaultService = teknoVaultService;
  }

  // Initialize the service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Wait for TeknoVault to be initialized
      if (!this.teknoVaultService.isInitialized) {
        throw new Error('TeknoVault service must be initialized first');
      }
      
      this.isInitialized = true;
      console.log('Claude Sound Deployment service initialized');
    } catch (error) {
      console.error('Failed to initialize Claude Sound Deployment service:', error);
      throw error;
    }
  }

  // Generate a beat using Claude AI
  async generateBeat(request: ClaudeSoundDeploymentRequest): Promise<ClaudeSoundDeploymentResponse> {
    if (!this.isInitialized) {
      throw new Error('Claude Sound Deployment service not initialized');
    }
    
    try {
      // In a real implementation, this would call the Claude API
      // For now, we'll use mock data based on the request
      
      // Get available samples based on constraints
      const availableCategories = request.constraints?.categories || ['drums', 'bass', 'synth', 'fx', 'vocals'];
      const availableSamples: SoundSample[] = [];
      
      for (const category of availableCategories) {
        availableSamples.push(...this.teknoVaultService.getSamplesByCategory(category));
      }
      
      // Generate a mock response
      return this.generateMockResponse(request, availableSamples);
    } catch (error) {
      console.error('Failed to generate beat:', error);
      throw error;
    }
  }

  // Modify an existing beat based on feedback
  async modifyBeat(
    currentBeat: ClaudeSoundDeploymentResponse, 
    feedback: string
  ): Promise<ClaudeSoundDeploymentResponse> {
    if (!this.isInitialized) {
      throw new Error('Claude Sound Deployment service not initialized');
    }
    
    try {
      // In a real implementation, this would call the Claude API with the current beat and feedback
      // For now, we'll make some simple modifications to the current beat
      
      // Create a deep copy of the current beat
      const modifiedBeat: ClaudeSoundDeploymentResponse = JSON.parse(JSON.stringify(currentBeat));
      
      // Make some modifications based on the feedback
      if (feedback.toLowerCase().includes('faster')) {
        modifiedBeat.bpm = Math.min(modifiedBeat.bpm + 10, 180);
      } else if (feedback.toLowerCase().includes('slower')) {
        modifiedBeat.bpm = Math.max(modifiedBeat.bpm - 10, 80);
      }
      
      if (feedback.toLowerCase().includes('more drums')) {
        // Add more drum patterns or intensify existing ones
        for (const pattern of modifiedBeat.patterns) {
          if (pattern.category === 'drums') {
            // Add more steps to the pattern
            for (let i = 0; i < pattern.pattern.steps.length; i++) {
              if (i % 4 === 0 && !pattern.pattern.steps[i]) {
                pattern.pattern.steps[i] = true;
              }
            }
          }
        }
      }
      
      if (feedback.toLowerCase().includes('more bass')) {
        // Increase volume of bass patterns
        for (const pattern of modifiedBeat.patterns) {
          if (pattern.category === 'bass') {
            pattern.volume = Math.min(pattern.volume + 0.1, 1.0);
          }
        }
      }
      
      // Update the explanation
      modifiedBeat.explanation = `I've modified the beat based on your feedback: "${feedback}". ${modifiedBeat.explanation}`;
      
      return modifiedBeat;
    } catch (error) {
      console.error('Failed to modify beat:', error);
      throw error;
    }
  }

  // Generate a mock response for development
  private generateMockResponse(
    request: ClaudeSoundDeploymentRequest, 
    availableSamples: SoundSample[]
  ): ClaudeSoundDeploymentResponse {
    // Extract keywords from the prompt
    const prompt = request.prompt.toLowerCase();
    const isEnergetic = prompt.includes('energetic') || prompt.includes('fast') || prompt.includes('hard');
    const isMinimal = prompt.includes('minimal') || prompt.includes('simple');
    const isDark = prompt.includes('dark') || prompt.includes('deep');
    const isMelodic = prompt.includes('melodic') || prompt.includes('melody');
    
    // Determine BPM based on keywords
    let bpm = request.constraints?.bpm || 130;
    if (isEnergetic) bpm = Math.min(bpm + 20, 180);
    if (isMinimal) bpm = Math.max(bpm - 10, 80);
    
    // Select samples based on keywords and available samples
    const selectedSamples: SoundSample[] = [];
    
    // Always include some drums
    const drumSamples = availableSamples.filter(s => s.category === 'drums');
    if (drumSamples.length > 0) {
      selectedSamples.push(drumSamples[0]); // Kick
      if (drumSamples.length > 2) {
        selectedSamples.push(drumSamples[1]); // Snare
        selectedSamples.push(drumSamples[2]); // Hi-hat
      }
    }
    
    // Include bass if available
    const bassSamples = availableSamples.filter(s => s.category === 'bass');
    if (bassSamples.length > 0) {
      selectedSamples.push(bassSamples[0]);
    }
    
    // Include synths if melodic
    if (isMelodic) {
      const synthSamples = availableSamples.filter(s => s.category === 'synth');
      if (synthSamples.length > 0) {
        selectedSamples.push(synthSamples[0]);
        if (synthSamples.length > 1) {
          selectedSamples.push(synthSamples[1]);
        }
      }
    }
    
    // Include FX if dark
    if (isDark) {
      const fxSamples = availableSamples.filter(s => s.category === 'fx');
      if (fxSamples.length > 0) {
        selectedSamples.push(fxSamples[0]);
      }
    }
    
    // Limit the number of samples if specified
    const maxSamples = request.constraints?.maxSamples || 8;
    const limitedSamples = selectedSamples.slice(0, maxSamples);
    
    // Generate patterns for each sample
    const patterns: InstrumentPattern[] = limitedSamples.map(sample => {
      // Create a 64-step pattern
      const steps = Array(64).fill(false);
      
      // Fill in steps based on sample category and keywords
      if (sample.category === 'drums') {
        if (sample.name.toLowerCase().includes('kick')) {
          // Kick pattern
          for (let i = 0; i < steps.length; i++) {
            if (i % 8 === 0) steps[i] = true; // On every 8th step
            if (isEnergetic && i % 4 === 0) steps[i] = true; // More kicks if energetic
          }
        } else if (sample.name.toLowerCase().includes('snare') || sample.name.toLowerCase().includes('clap')) {
          // Snare pattern
          for (let i = 0; i < steps.length; i++) {
            if (i % 8 === 4) steps[i] = true; // On every 8th step, offset by 4
          }
        } else if (sample.name.toLowerCase().includes('hi') || sample.name.toLowerCase().includes('hat')) {
          // Hi-hat pattern
          for (let i = 0; i < steps.length; i++) {
            if (i % 2 === 0) steps[i] = true; // On every 2nd step
            if (isMinimal && i % 4 !== 0) steps[i] = false; // Less hi-hats if minimal
          }
        }
      } else if (sample.category === 'bass') {
        // Bass pattern
        for (let i = 0; i < steps.length; i++) {
          if (i % 16 === 0) steps[i] = true; // On every 16th step
          if (isEnergetic && i % 8 === 0) steps[i] = true; // More bass if energetic
        }
      } else if (sample.category === 'synth') {
        // Synth pattern
        for (let i = 0; i < steps.length; i++) {
          if (i % 32 === 0) steps[i] = true; // On every 32nd step
          if (isMelodic && i % 16 === 8) steps[i] = true; // More synth if melodic
        }
      } else if (sample.category === 'fx') {
        // FX pattern - sparse
        for (let i = 0; i < steps.length; i++) {
          if (i % 48 === 0) steps[i] = true; // Very sparse
        }
      }
      
      return {
        sampleId: sample.id,
        sampleName: sample.name,
        category: sample.category,
        pattern: { steps },
        volume: 0.8,
        pan: 0,
        effects: {
          reverb: sample.category === 'synth' || sample.category === 'fx' ? 0.3 : 0,
          delay: sample.category === 'fx' ? 0.2 : 0,
          filter: 0
        }
      };
    });
    
    // Generate a title based on the prompt
    let title = 'Generated Beat';
    if (prompt.length > 0) {
      const words = prompt.split(' ');
      if (words.length >= 2) {
        title = words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      } else {
        title = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      }
      title += ' Beat';
    }
    
    // Generate an explanation
    let explanation = `I've created a ${bpm} BPM beat `;
    if (isEnergetic) explanation += 'with high energy ';
    if (isMinimal) explanation += 'using minimal elements ';
    if (isDark) explanation += 'with a dark atmosphere ';
    if (isMelodic) explanation += 'featuring melodic elements ';
    explanation += `based on your prompt: "${request.prompt}". `;
    explanation += `The beat uses ${patterns.length} different sounds from the TeknoVault library, `;
    explanation += `including ${patterns.filter(p => p.category === 'drums').length} drum sounds, `;
    explanation += `${patterns.filter(p => p.category === 'bass').length} bass sounds, `;
    explanation += `${patterns.filter(p => p.category === 'synth').length} synth sounds, and `;
    explanation += `${patterns.filter(p => p.category === 'fx').length} FX sounds. `;
    explanation += 'Feel free to modify the patterns or ask for specific changes!';
    
    return {
      title,
      description: request.prompt,
      bpm,
      patterns,
      explanation,
      suggestions: [
        'Try increasing the tempo for more energy',
        'Add more variation to the hi-hat pattern',
        'Experiment with different bass sounds',
        'Add some reverb to the synth sounds'
      ]
    };
  }
}

// Hook for using Claude Sound Deployment in components
export function useClaudeSoundDeployment() {
  const teknoVault = useTeknoVault();
  const [service, setService] = useState<ClaudeSoundDeploymentService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (teknoVault.isInitialized && !service) {
      const newService = new ClaudeSoundDeploymentService(teknoVault);
      setService(newService);
      
      newService.initialize()
        .then(() => {
          setIsInitialized(true);
        })
        .catch(error => {
          console.error('Failed to initialize Claude Sound Deployment service:', error);
        });
    }
  }, [teknoVault.isInitialized, service]);
  
  return {
    isInitialized,
    generateBeat: service?.generateBeat.bind(service),
    modifyBeat: service?.modifyBeat.bind(service)
  };
}

export default ClaudeSoundDeploymentService;
