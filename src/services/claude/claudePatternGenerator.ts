import { Track, Step, MasterEffects, TrackEffects } from '../audioEngine/enhancedAudioEngine';
import { Sequencer } from '../audioEngine/sequencer';
import { usePresetLoader, PresetCategory } from '../audioEngine/presetLoader';
import AudioErrorHandler, { AudioErrorType, ErrorSeverity } from '../audioEngine/errorHandler';

// Initialize error handler
const errorHandler = AudioErrorHandler.getInstance();

// Define interfaces for Claude pattern generation
interface PatternRequest {
  style: string; // e.g., "Hard Techno", "Acid", "Industrial"
  bpm: number;
  complexity: number; // 1-10, how complex the pattern should be
  intensity: number; // 1-10, how intense/aggressive the pattern should be
  focus: string[]; // Array of elements to focus on, e.g., ["kicks", "acid"]
  description?: string; // Optional free-text description
}

interface PatternResponse {
  tracks: Track[];
  masterEffects: MasterEffects;
  bpm: number;
  description: string;
  suggestedVariations: string[];
}

class ClaudePatternGenerator {
  private presetLoader = usePresetLoader();
  private presetCategories: PresetCategory[] = [];
  private sequencer: Sequencer | null = null;
  
  // Initialize pattern generator
  async initialize(): Promise<void> {
    try {
      // Initialize preset loader
      await this.presetLoader.initialize();
      
      // Get preset categories
      this.presetCategories = this.presetLoader.getPresetCategories();
      
      // Initialize sequencer
      this.sequencer = new Sequencer({
        bpm: 140,
        totalSteps: 64,
        swing: 0,
        quantize: true
      });
      
      await this.sequencer.initialize();
      
      console.log('Claude pattern generator initialized successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to initialize Claude pattern generator:', error);
      return Promise.reject('Failed to initialize Claude pattern generator');
    }
  }
  
  // Generate pattern based on request
  async generatePattern(request: PatternRequest): Promise<PatternResponse> {
    try {
      // Validate request
      this.validateRequest(request);
      
      // Generate tracks based on request
      const tracks = await this.generateTracks(request);
      
      // Generate master effects based on request
      const masterEffects = this.generateMasterEffects(request);
      
      // Generate pattern description
      const description = this.generateDescription(request, tracks);
      
      // Generate suggested variations
      const suggestedVariations = this.generateSuggestedVariations(request);
      
      // Create response
      const response: PatternResponse = {
        tracks,
        masterEffects,
        bpm: request.bpm,
        description,
        suggestedVariations
      };
      
      return response;
    } catch (error) {
      console.error('Error generating pattern:', error);
      throw new Error('Failed to generate pattern');
    }
  }
  
  // Validate pattern request
  private validateRequest(request: PatternRequest): void {
    // Validate BPM
    if (request.bpm < 60 || request.bpm > 200) {
      throw new Error('BPM must be between 60 and 200');
    }
    
    // Validate complexity
    if (request.complexity < 1 || request.complexity > 10) {
      throw new Error('Complexity must be between 1 and 10');
    }
    
    // Validate intensity
    if (request.intensity < 1 || request.intensity > 10) {
      throw new Error('Intensity must be between 1 and 10');
    }
  }
  
  // Generate tracks based on request
  private async generateTracks(request: PatternRequest): Promise<Track[]> {
    try {
      const tracks: Track[] = [];
      
      // Determine number of tracks based on complexity
      const numTracks = Math.min(8, Math.max(3, Math.floor(request.complexity / 2) + 2));
      
      // Always include kick track for Hard Techno
      const kickTrack = await this.createKickTrack(request);
      tracks.push(kickTrack);
      
      // Add bass track for foundation
      if (request.focus.includes('bass') || Math.random() > 0.3) {
        const bassTrack = await this.createBassTrack(request);
        tracks.push(bassTrack);
      }
      
      // Add percussion tracks
      const numPercTracks = Math.floor(numTracks / 3) + (request.focus.includes('percussion') ? 1 : 0);
      for (let i = 0; i < numPercTracks; i++) {
        const percTrack = await this.createPercussionTrack(request, i);
        tracks.push(percTrack);
      }
      
      // Add synth tracks
      const numSynthTracks = Math.floor(numTracks / 3) + (request.focus.includes('synths') ? 1 : 0);
      for (let i = 0; i < numSynthTracks; i++) {
        const synthTrack = await this.createSynthTrack(request, i);
        tracks.push(synthTrack);
      }
      
      // Add FX tracks
      const numFxTracks = Math.max(0, numTracks - tracks.length);
      for (let i = 0; i < numFxTracks; i++) {
        const fxTrack = await this.createFxTrack(request, i);
        tracks.push(fxTrack);
      }
      
      // Ensure we don't exceed the track limit
      return tracks.slice(0, numTracks);
    } catch (error) {
      console.error('Error generating tracks:', error);
      throw new Error('Failed to generate tracks');
    }
  }
  
  // Create kick track
  private async createKickTrack(request: PatternRequest): Promise<Track> {
    try {
      // Find kick presets
      const kickCategory = this.presetCategories.find(cat => cat.id === 'kicks');
      if (!kickCategory || kickCategory.presets.length === 0) {
        throw new Error('No kick presets found');
      }
      
      // Select kick preset based on intensity
      const kickPresetIndex = Math.min(
        kickCategory.presets.length - 1,
        Math.floor((request.intensity / 10) * kickCategory.presets.length)
      );
      const kickPreset = kickCategory.presets[kickPresetIndex];
      
      // Create kick pattern based on style and complexity
      const steps = this.createDefaultSteps(64);
      
      // Basic kick pattern (every quarter note)
      for (let i = 0; i < 64; i += 16) {
        steps[i].active = true;
        steps[i].velocity = 1.0;
      }
      
      // Add variations based on complexity
      if (request.complexity >= 3) {
        // Add offbeat kicks
        for (let i = 32; i < 64; i += 32) {
          steps[i].active = true;
          steps[i].velocity = 0.8;
        }
      }
      
      if (request.complexity >= 5) {
        // Add ghost kicks with lower velocity
        for (let i = 24; i < 64; i += 32) {
          steps[i].active = true;
          steps[i].velocity = 0.6;
        }
      }
      
      if (request.complexity >= 7) {
        // Add some probability-based kicks
        for (let i = 12; i < 64; i += 16) {
          steps[i].active = true;
          steps[i].velocity = 0.7;
          steps[i].probability = 0.7;
        }
      }
      
      // Create track effects based on intensity
      const trackEffects = this.createKickEffects(request.intensity);
      
      // Create and return track
      return {
        id: `track_kick_${Date.now()}`,
        name: 'Kick',
        presetId: kickPreset.id,
        steps,
        mute: false,
        solo: false,
        volume: 0.9,
        pan: 0,
        effects: trackEffects
      };
    } catch (error) {
      console.error('Error creating kick track:', error);
      throw new Error('Failed to create kick track');
    }
  }
  
  // Create bass track
  private async createBassTrack(request: PatternRequest): Promise<Track> {
    try {
      // Find bass presets
      const bassCategory = this.presetCategories.find(cat => cat.id === 'basslines');
      if (!bassCategory || bassCategory.presets.length === 0) {
        throw new Error('No bass presets found');
      }
      
      // Select bass preset based on style and intensity
      let bassPresetIndex = 0;
      
      if (request.style.toLowerCase().includes('acid')) {
        // Prefer acid bass sounds
        const acidBass = bassCategory.presets.findIndex(p => 
          p.name.toLowerCase().includes('acid') || 
          p.name.toLowerCase().includes('303')
        );
        
        if (acidBass !== -1) {
          bassPresetIndex = acidBass;
        }
      } else {
        // Select based on intensity
        bassPresetIndex = Math.min(
          bassCategory.presets.length - 1,
          Math.floor((request.intensity / 10) * bassCategory.presets.length)
        );
      }
      
      const bassPreset = bassCategory.presets[bassPresetIndex];
      
      // Create bass pattern based on style and complexity
      const steps = this.createDefaultSteps(64);
      
      // Basic bass pattern
      if (request.style.toLowerCase().includes('acid')) {
        // Acid-style pattern (16th notes with accents)
        for (let i = 0; i < 64; i += 4) {
          steps[i].active = true;
          steps[i].velocity = i % 16 === 0 ? 1.0 : 0.7;
        }
        
        // Add parameter locks for filter cutoff
        for (let i = 0; i < 64; i += 8) {
          if (steps[i].active) {
            steps[i].parameterLocks.push({
              parameterId: 'filter',
              value: 0.3 + (i / 64) * 0.7 // Gradually increase filter
            });
          }
        }
      } else {
        // Standard bass pattern (on beats 1 and 3)
        for (let i = 0; i < 64; i += 32) {
          steps[i].active = true;
          steps[i].velocity = 1.0;
          
          // Add note on beat 3 with lower velocity
          if (i + 16 < 64) {
            steps[i + 16].active = true;
            steps[i + 16].velocity = 0.8;
          }
        }
      }
      
      // Add variations based on complexity
      if (request.complexity >= 4) {
        // Add some offbeat notes
        for (let i = 8; i < 64; i += 16) {
          if (Math.random() > 0.5) {
            steps[i].active = true;
            steps[i].velocity = 0.7;
          }
        }
      }
      
      if (request.complexity >= 6) {
        // Add some 16th note runs
        const runStart = Math.floor(Math.random() * 4) * 16;
        for (let i = 0; i < 8; i++) {
          if (runStart + i < 64) {
            steps[runStart + i].active = true;
            steps[runStart + i].velocity = 0.6 + (i / 8) * 0.4;
          }
        }
      }
      
      // Create track effects
      const trackEffects = this.createBassEffects(request.intensity, request.style);
      
      // Create and return track
      return {
        id: `track_bass_${Date.now()}`,
        name: 'Bass',
        presetId: bassPreset.id,
        steps,
        mute: false,
        solo: false,
        volume: 0.8,
        pan: 0,
        effects: trackEffects
      };
    } catch (error) {
      console.error('Error creating bass track:', error);
      throw new Error('Failed to create bass track');
    }
  }
  
  // Create percussion track
  private async createPercussionTrack(request: PatternRequest, index: number): Promise<Track> {
    try {
      // Determine percussion type based on index
      let percType = 'hats';
      let percName = 'Hi-Hat';
      
      if (index === 1) {
        percType = 'snares';
        percName = 'Snare';
      } else if (index === 2) {
        percType = 'claps';
        percName = 'Clap';
      } else if (index >= 3) {
        percType = 'percussion';
        percName = 'Perc';
      }
      
      // Find percussion presets
      const percCategory = this.presetCategories.find(cat => cat.id === percType);
      if (!percCategory || percCategory.presets.length === 0) {
        // Fallback to FX category if specific percussion not found
        const fxCategory = this.presetCategories.find(cat => cat.id === 'fx');
        if (!fxCategory || fxCategory.presets.length === 0) {
          throw new Error(`No ${percType} or FX presets found`);
        }
        
        percCategory.presets = fxCategory.presets;
      }
      
      // Select percussion preset
      const percPresetIndex = Math.min(
        percCategory.presets.length - 1,
        Math.floor(Math.random() * percCategory.presets.length)
      );
      const percPreset = percCategory.presets[percPresetIndex];
      
      // Create percussion pattern based on type and complexity
      const steps = this.createDefaultSteps(64);
      
      if (percType === 'hats') {
        // Hi-hat pattern (8th or 16th notes)
        const step = request.complexity >= 5 ? 4 : 8;
        for (let i = 0; i < 64; i += step) {
          steps[i].active = true;
          steps[i].velocity = i % 16 === 0 ? 1.0 : 0.7;
        }
        
        // Add open hats on offbeats for higher complexity
        if (request.complexity >= 7) {
          for (let i = 8; i < 64; i += 16) {
            steps[i].active = true;
            steps[i].velocity = 0.9;
            steps[i].parameterLocks.push({
              parameterId: 'pitch',
              value: 0.7 // Higher pitch for open hat
            });
          }
        }
      } else if (percType === 'snares' || percType === 'claps') {
        // Snare/clap on beats 2 and 4
        for (let i = 16; i < 64; i += 32) {
          steps[i].active = true;
          steps[i].velocity = 1.0;
        }
        
        // Add ghost notes for higher complexity
        if (request.complexity >= 6) {
          for (let i = 4; i < 64; i += 8) {
            if (i % 16 !== 0 && i % 32 !== 16 && Math.random() > 0.7) {
              steps[i].active = true;
              steps[i].velocity = 0.5;
              steps[i].probability = 0.7;
            }
          }
        }
      } else {
        // Percussion fills and accents
        for (let i = 12; i < 64; i += 16) {
          steps[i].active = true;
          steps[i].velocity = 0.8;
        }
        
        // Add random accents
        for (let i = 0; i < 64; i += 4) {
          if (Math.random() > 0.8) {
            steps[i].active = true;
            steps[i].velocity = 0.7;
            steps[i].probability = 0.8;
          }
        }
      }
      
      // Create track effects
      const trackEffects = this.createPercussionEffects(request.intensity, percType);
      
      // Pan percussion elements
      let panValue = 0;
      if (percType === 'hats') {
        panValue = 0.3; // Pan hats slightly right
      } else if (percType === 'percussion') {
        panValue = index % 2 === 0 ? 0.5 : -0.5; // Alternate pan for percussion
      }
      
      // Create and return track
      return {
        id: `track_${percType}_${Date.now()}`,
        name: percName,
        presetId: percPreset.id,
        steps,
        mute: false,
        solo: false,
        volume: percType === 'snares' || percType === 'claps' ? 0.8 : 0.7,
        pan: panValue,
        effects: trackEffects
      };
    } catch (error) {
      console.error(`Error creating ${index} percussion track:`, error);
      throw new Error(`Failed to create percussion track`);
    }
  }
  
  // Create synth track
  private async createSynthTrack(request: PatternRequest, index: number): Promise<Track> {
    try {
      // Determine synth type based on style and index
      let synthType = 'synths';
      let synthName = 'Synth';
      
      if (request.style.toLowerCase().includes('acid') && index === 0) {
        synthType = 'acid';
        synthName = 'Acid';
      } else if (index === 1) {
        synthType = 'leads';
        synthName = 'Lead';
      } else if (index === 2) {
        synthType = 'pads';
        synthName = 'Pad';
      }
      
      // Find synth presets
      const synthCategory = this.presetCategories.find(cat => cat.id === synthType);
      if (!synthCategory || synthCategory.presets.length === 0) {
        // Fallback to general synths category
        const fallbackCategory = this.presetCategories.find(cat => cat.id === 'synths');
        if (!fallbackCategory || fallbackCategory.presets.length === 0) {
          throw new Error(`No ${synthType} or synth presets found`);
        }
        
        synthCategory.presets = fallbackCategory.presets;
      }
      
      // Select synth preset based on intensity
      const synthPresetIndex = Math.min(
        synthCategory.presets.length - 1,
        Math.floor((request.intensity / 10) * synthCategory.presets.length)
      );
      const synthPreset = synthCategory.presets[synthPresetIndex];
      
      // Create synth pattern based on type and complexity
      const steps = this.createDefaultSteps(64);
      
      if (synthType === 'acid') {
        // Acid pattern (16th notes with accents and slides)
        for (let i = 0; i < 64; i += 4) {
          if (Math.random() > 0.4) {
            steps[i].active = true;
            steps[i].velocity = i % 16 === 0 ? 1.0 : 0.8;
            
            // Add parameter locks for filter cutoff
            if (i % 8 === 0) {
              steps[i].parameterLocks.push({
                parameterId: 'filter',
                value: 0.3 + (i / 64) * 0.7 // Gradually increase filter
              });
            }
          }
        }
      } else if (synthType === 'leads') {
        // Lead pattern (melodic phrases)
        // Create a simple melodic phrase
        const phraseStart = Math.floor(Math.random() * 4) * 16;
        const phraseLength = Math.min(16, 64 - phraseStart);
        
        for (let i = 0; i < phraseLength; i += 4) {
          if (Math.random() > 0.3) {
            steps[phraseStart + i].active = true;
            steps[phraseStart + i].velocity = 0.8;
            
            // Add parameter locks for pitch variation
            steps[phraseStart + i].parameterLocks.push({
              parameterId: 'pitch',
              value: 0.3 + (i / phraseLength) * 0.5 // Melodic variation
            });
          }
        }
        
        // Repeat phrase if complexity is high enough
        if (request.complexity >= 8 && phraseStart + phraseLength * 2 <= 64) {
          for (let i = 0; i < phraseLength; i++) {
            steps[phraseStart + phraseLength + i] = { ...steps[phraseStart + i] };
          }
        }
      } else if (synthType === 'pads') {
        // Pad pattern (long sustained notes)
        for (let i = 0; i < 64; i += 32) {
          steps[i].active = true;
          steps[i].velocity = 0.7;
        }
      } else {
        // General synth pattern (arpeggios or stabs)
        if (request.complexity >= 5) {
          // Arpeggio pattern
          for (let i = 0; i < 64; i += 8) {
            if (Math.random() > 0.3) {
              steps[i].active = true;
              steps[i].velocity = 0.8;
              
              // Add parameter locks for pitch variation
              steps[i].parameterLocks.push({
                parameterId: 'pitch',
                value: 0.3 + (i % 32) / 32 * 0.7 // Arpeggio pattern
              });
            }
          }
        } else {
          // Stab pattern
          for (let i = 8; i < 64; i += 16) {
            steps[i].active = true;
            steps[i].velocity = 0.9;
          }
        }
      }
      
      // Create track effects
      const trackEffects = this.createSynthEffects(request.intensity, synthType);
      
      // Create and return track
      return {
        id: `track_${synthType}_${Date.now()}`,
        name: synthName,
        presetId: synthPreset.id,
        steps,
        mute: false,
        solo: false,
        volume: synthType === 'pads' ? 0.6 : 0.75,
        pan: index % 2 === 0 ? 0.2 : -0.2, // Alternate pan for synths
        effects: trackEffects
      };
    } catch (error) {
      console.error(`Error creating ${index} synth track:`, error);
      throw new Error(`Failed to create synth track`);
    }
  }
  
  // Create FX track
  private async createFxTrack(request: PatternRequest, index: number): Promise<Track> {
    try {
      // Find FX presets
      const fxCategory = this.presetCategories.find(cat => cat.id === 'fx');
      if (!fxCategory || fxCategory.presets.length === 0) {
        throw new Error('No FX presets found');
      }
      
      // Select FX preset
      const fxPresetIndex = Math.min(
        fxCategory.presets.length - 1,
        Math.floor(Math.random() * fxCategory.presets.length)
      );
      const fxPreset = fxCategory.presets[fxPresetIndex];
      
      // Create FX pattern based on complexity
      const steps = this.createDefaultSteps(64);
      
      // Sparse FX pattern
      if (request.complexity <= 5) {
        // Simple FX accents
        for (let i = 28; i < 64; i += 32) {
          steps[i].active = true;
          steps[i].velocity = 0.9;
        }
      } else {
        // More complex FX pattern
        for (let i = 0; i < 64; i += 16) {
          if (Math.random() > 0.6) {
            const offset = Math.floor(Math.random() * 8);
            if (i + offset < 64) {
              steps[i + offset].active = true;
              steps[i + offset].velocity = 0.8;
              steps[i + offset].probability = 0.8;
            }
          }
        }
      }
      
      // Create track effects
      const trackEffects = this.createFxEffects(request.intensity);
      
      // Create and return track
      return {
        id: `track_fx_${Date.now()}`,
        name: `FX ${index + 1}`,
        presetId: fxPreset.id,
        steps,
        mute: false,
        solo: false,
        volume: 0.7,
        pan: index % 2 === 0 ? 0.4 : -0.4, // Alternate pan for FX
        effects: trackEffects
      };
    } catch (error) {
      console.error(`Error creating ${index} FX track:`, error);
      throw new Error(`Failed to create FX track`);
    }
  }
  
  // Create default steps
  private createDefaultSteps(count: number): Step[] {
    const steps: Step[] = [];
    
    for (let i = 0; i < count; i++) {
      steps.push({
        active: false,
        velocity: 1.0,
        probability: 1.0,
        parameterLocks: [],
        microTiming: 0
      });
    }
    
    return steps;
  }
  
  // Create kick effects
  private createKickEffects(intensity: number): TrackEffects {
    return {
      filter: {
        type: 'lowpass',
        cutoff: 1.0,
        resonance: 0,
        envelope: 0
      },
      delay: {
        time: 0,
        feedback: 0,
        mix: 0
      },
      reverb: {
        size: intensity > 7 ? 0.2 : 0.1,
        damping: 0.8,
        mix: intensity > 7 ? 0.15 : 0.1
      },
      distortion: {
        amount: Math.min(1.0, intensity / 10 * 0.5),
        tone: 0.5
      }
    };
  }
  
  // Create bass effects
  private createBassEffects(intensity: number, style: string): TrackEffects {
    const isAcid = style.toLowerCase().includes('acid');
    
    return {
      filter: {
        type: 'lowpass',
        cutoff: isAcid ? 0.7 : 0.9,
        resonance: isAcid ? 0.7 : 0.2,
        envelope: isAcid ? 0.5 : 0
      },
      delay: {
        time: isAcid ? 0.3 : 0,
        feedback: isAcid ? 0.3 : 0,
        mix: isAcid ? 0.2 : 0
      },
      reverb: {
        size: 0.1,
        damping: 0.8,
        mix: 0.1
      },
      distortion: {
        amount: Math.min(1.0, intensity / 10 * 0.4),
        tone: 0.6
      }
    };
  }
  
  // Create percussion effects
  private createPercussionEffects(intensity: number, percType: string): TrackEffects {
    let reverbSize = 0.2;
    let reverbMix = 0.2;
    
    if (percType === 'snares' || percType === 'claps') {
      reverbSize = 0.4;
      reverbMix = 0.3;
    }
    
    return {
      filter: {
        type: percType === 'hats' ? 'highpass' : 'bandpass',
        cutoff: percType === 'hats' ? 0.8 : 0.6,
        resonance: 0.2,
        envelope: 0
      },
      delay: {
        time: percType === 'claps' ? 0.2 : 0,
        feedback: percType === 'claps' ? 0.3 : 0,
        mix: percType === 'claps' ? 0.2 : 0
      },
      reverb: {
        size: reverbSize,
        damping: 0.5,
        mix: reverbMix
      },
      distortion: {
        amount: Math.min(1.0, intensity / 10 * 0.3),
        tone: 0.7
      }
    };
  }
  
  // Create synth effects
  private createSynthEffects(intensity: number, synthType: string): TrackEffects {
    const isAcid = synthType === 'acid';
    const isPad = synthType === 'pads';
    
    return {
      filter: {
        type: isAcid ? 'lowpass' : (isPad ? 'bandpass' : 'highpass'),
        cutoff: isAcid ? 0.7 : (isPad ? 0.6 : 0.8),
        resonance: isAcid ? 0.8 : 0.3,
        envelope: isAcid ? 0.6 : 0
      },
      delay: {
        time: isPad ? 0.4 : (isAcid ? 0.3 : 0.2),
        feedback: isPad ? 0.3 : (isAcid ? 0.4 : 0.2),
        mix: isPad ? 0.3 : (isAcid ? 0.2 : 0.15)
      },
      reverb: {
        size: isPad ? 0.7 : 0.3,
        damping: isPad ? 0.4 : 0.6,
        mix: isPad ? 0.4 : 0.2
      },
      distortion: {
        amount: Math.min(1.0, intensity / 10 * (isAcid ? 0.6 : 0.3)),
        tone: 0.6
      }
    };
  }
  
  // Create FX effects
  private createFxEffects(intensity: number): TrackEffects {
    return {
      filter: {
        type: 'bandpass',
        cutoff: 0.7,
        resonance: 0.5,
        envelope: 0.3
      },
      delay: {
        time: 0.5,
        feedback: 0.6,
        mix: 0.4
      },
      reverb: {
        size: 0.8,
        damping: 0.3,
        mix: 0.5
      },
      distortion: {
        amount: Math.min(1.0, intensity / 10 * 0.7),
        tone: 0.5
      }
    };
  }
  
  // Generate master effects based on request
  private generateMasterEffects(request: PatternRequest): MasterEffects {
    return {
      limiter: 0.8,
      compressor: {
        threshold: 0.7 - (request.intensity / 10 * 0.2), // More compression for higher intensity
        ratio: 3 + (request.intensity / 10 * 3), // Higher ratio for higher intensity
        attack: 0.01,
        release: 0.2
      },
      eq: {
        low: request.style.toLowerCase().includes('acid') ? 0.2 : 0,
        mid: -0.1, // Slight mid scoop for clarity
        high: request.intensity > 7 ? 0.1 : 0 // Boost highs for higher intensity
      }
    };
  }
  
  // Generate pattern description
  private generateDescription(request: PatternRequest, tracks: Track[]): string {
    const styleDesc = request.style.toLowerCase();
    const intensityDesc = request.intensity <= 3 ? 'subtle' : 
                         (request.intensity <= 6 ? 'moderate' : 
                         (request.intensity <= 8 ? 'intense' : 'extreme'));
    
    const complexityDesc = request.complexity <= 3 ? 'minimal' : 
                          (request.complexity <= 6 ? 'balanced' : 
                          (request.complexity <= 8 ? 'intricate' : 'complex'));
    
    const kickDesc = tracks.find(t => t.name === 'Kick') ? 
                    (request.intensity >= 8 ? 'punishing' : 
                    (request.intensity >= 5 ? 'powerful' : 'solid')) + ' kicks' : '';
    
    const bassDesc = tracks.find(t => t.name === 'Bass') ?
                    (styleDesc.includes('acid') ? 'squelching acid basslines' : 
                    (request.intensity >= 7 ? 'rumbling bass' : 'driving basslines')) : '';
    
    const percDesc = tracks.filter(t => t.name.includes('Hat') || t.name.includes('Snare') || t.name.includes('Clap') || t.name.includes('Perc')).length > 0 ?
                    (request.complexity >= 7 ? 'intricate percussion' : 
                    (request.complexity >= 4 ? 'rhythmic percussion' : 'minimal percussion')) : '';
    
    const synthDesc = tracks.filter(t => t.name.includes('Synth') || t.name.includes('Lead') || t.name.includes('Pad') || t.name.includes('Acid')).length > 0 ?
                     (request.intensity >= 8 ? 'aggressive synth elements' : 
                     (request.intensity >= 5 ? 'energetic synth patterns' : 'atmospheric synth textures')) : '';
    
    const fxDesc = tracks.filter(t => t.name.includes('FX')).length > 0 ?
                  (request.complexity >= 7 ? 'detailed FX processing' : 'subtle FX accents') : '';
    
    // Combine elements
    const elements = [kickDesc, bassDesc, percDesc, synthDesc, fxDesc].filter(e => e !== '');
    
    let description = `A ${intensityDesc} ${complexityDesc} ${request.style} pattern at ${request.bpm} BPM`;
    
    if (elements.length > 0) {
      description += ` featuring ${elements.join(', ')}`;
    }
    
    if (request.description) {
      description += `. ${request.description}`;
    }
    
    return description;
  }
  
  // Generate suggested variations
  private generateSuggestedVariations(request: PatternRequest): string[] {
    const variations: string[] = [];
    
    // Suggest BPM variations
    variations.push(`Increase tempo to ${Math.min(200, request.bpm + 5)} BPM for more energy`);
    variations.push(`Decrease tempo to ${Math.max(60, request.bpm - 5)} BPM for a heavier feel`);
    
    // Suggest complexity variations
    if (request.complexity < 8) {
      variations.push(`Add more intricate percussion patterns`);
    } else {
      variations.push(`Simplify the rhythm for more impact`);
    }
    
    // Suggest style variations
    if (!request.style.toLowerCase().includes('acid')) {
      variations.push(`Add acid elements for more character`);
    }
    
    if (!request.style.toLowerCase().includes('industrial')) {
      variations.push(`Add industrial elements for more aggression`);
    }
    
    // Suggest specific track variations
    variations.push(`Experiment with different kick patterns`);
    variations.push(`Add more filter automation to the synths`);
    
    // Return 3 random variations
    return this.shuffleArray(variations).slice(0, 3);
  }
  
  // Shuffle array (Fisher-Yates algorithm)
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  
  // Apply pattern to sequencer
  applyPatternToSequencer(pattern: PatternResponse): void {
    if (!this.sequencer) {
      console.error('Sequencer not initialized');
      return;
    }
    
    // Set BPM
    this.sequencer.setBpm(pattern.bpm);
    
    // Set tracks
    this.sequencer.setTracks(pattern.tracks);
    
    // Set master effects
    this.sequencer.setMasterEffects(pattern.masterEffects);
  }
  
  // Get sequencer instance
  getSequencer(): Sequencer | null {
    return this.sequencer;
  }
  
  // Clean up resources
  cleanup(): void {
    if (this.sequencer) {
      this.sequencer.cleanup();
    }
  }
}

export { ClaudePatternGenerator, PatternRequest, PatternResponse };
