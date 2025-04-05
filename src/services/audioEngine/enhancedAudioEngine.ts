import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import { usePresetLoader, Preset, PresetParameter } from './presetLoader';
import AudioErrorHandler, { AudioErrorType, ErrorSeverity } from './errorHandler';
import { Sequencer, SequencerEvent } from './sequencer';

// CORRECT: Export enhanced interfaces
export interface EnhancedBeatPattern {
  bpm: number;
  steps: number; // 16, 32, or 64 steps
  tracks: Track[];
  masterEffects: MasterEffects;
}

export interface Track {
  id: string;
  name: string;
  presetId: string;
  steps: Step[];
  mute: boolean;
  solo: boolean;
  volume: number;
  pan: number;
  effects: TrackEffects;
}

// Interfaces below are likely internal or defined elsewhere, keep as is
interface Step {
  active: boolean;
  velocity: number; // 0-1
  probability: number; // 0-1, chance this step will trigger
  parameterLocks: ParameterLock[];
  microTiming: number; // -0.5 to 0.5, timing offset in steps
}

interface ParameterLock {
  parameterId: string;
  value: number;
}

interface TrackEffects {
  filter: {
    type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
    cutoff: number;
    resonance: number;
    envelope: number;
  };
  delay: {
    time: number;
    feedback: number;
    mix: number;
  };
  reverb: {
    size: number;
    damping: number;
    mix: number;
  };
  distortion: {
    amount: number;
    tone: number;
  };
}

interface MasterEffects {
  limiter: number;
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  eq: {
    low: number;
    mid: number;
    high: number;
  };
}

class EnhancedAudioEngine {
  private bpm: number = 140; // Default Hard Techno tempo
  private steps: number = 64; // 64-step sequencer
  private tracks: Track[] = [];
  private masterEffects: MasterEffects = {
    limiter: 0.8,
    compressor: {
      threshold: 0.7,
      ratio: 4,
      attack: 0.01,
      release: 0.2
    },
    eq: {
      low: 0,
      mid: 0,
      high: 0
    }
  };
  
  private presetLoader = usePresetLoader();
  private loadedSounds: Map<string, Sound> = new Map();
  private isInitialized: boolean = false;
  private isPlaying: boolean = false;
  private currentStep: number = 0;
  private stepCallback: ((step: number) => void) | null = null;
  
  private sequencer: Sequencer | null = null;
  private listeners: Set<(step: number) => void> = new Set();
  
  // Initialize audio engine
  async initialize(): Promise<void> {
    try {
      await this.presetLoader.initialize();
      await this.createDefaultTracks();
      
      this.sequencer = new Sequencer({
        bpm: this.bpm,
        totalSteps: this.steps,
        swing: 0,
        quantize: true,
      });
      await this.sequencer.initialize();
      this.sequencer.registerEventCallback(this.handleSequencerEvent.bind(this));
      
      this.isInitialized = true;
      console.log('Enhanced audio engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize enhanced audio engine:', error);
      throw new Error('Failed to initialize enhanced audio engine');
    }
  }
  
  // Create default tracks with presets from each category
  private async createDefaultTracks(): Promise<void> {
    try {
      const categories = this.presetLoader.getPresetCategories();
      
      // Create a track for each main category with a default preset
      for (const category of categories) {
        if (category.presets.length > 0) {
          // Get first preset in category
          const preset = category.presets[0];
          
          // Create track with default pattern
          const track: Track = {
            id: `track_${category.id}`,
            name: `${category.name} Track`,
            presetId: preset.id,
            steps: this.createDefaultSteps(),
            mute: false,
            solo: false,
            volume: 0.8,
            pan: 0,
            effects: this.createDefaultTrackEffects()
          };
          
          // Add track to tracks array
          this.tracks.push(track);
          
          // Preload the sound for this track
          await this.loadTrackSound(track);
        }
      }
      
      // Create default patterns based on track types
      this.createDefaultPatterns();
      
      console.log(`Created ${this.tracks.length} default tracks`);
    } catch (error) {
      console.error('Error creating default tracks:', error);
      throw new Error('Failed to create default tracks');
    }
  }
  
  // Create default steps for a track
  private createDefaultSteps(): Step[] {
    const steps: Step[] = [];
    
    for (let i = 0; i < this.steps; i++) {
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
  
  // Create default track effects
  private createDefaultTrackEffects(): TrackEffects {
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
        size: 0,
        damping: 0.5,
        mix: 0
      },
      distortion: {
        amount: 0,
        tone: 0.5
      }
    };
  }
  
  // Create default patterns based on track types
  private createDefaultPatterns(): void {
    // Find tracks by category
    const kickTrack = this.tracks.find(track => track.id.includes('kicks'));
    const bassTrack = this.tracks.find(track => track.id.includes('basslines'));
    const hatTrack = this.tracks.find(track => track.id.includes('hats'));
    const fxTrack = this.tracks.find(track => track.id.includes('fx'));
    
    // Create kick pattern (on every quarter note)
    if (kickTrack) {
      for (let i = 0; i < this.steps; i += 16) {
        kickTrack.steps[i].active = true;
      }
    }
    
    // Create bass pattern
    if (bassTrack) {
      for (let i = 0; i < this.steps; i += 32) {
        bassTrack.steps[i].active = true;
        if (i + 24 < this.steps) {
          bassTrack.steps[i + 24].active = true;
        }
      }
    }
    
    // Create hat pattern (on every 8th note)
    if (hatTrack) {
      for (let i = 0; i < this.steps; i += 8) {
        hatTrack.steps[i].active = true;
      }
    }
    
    // Create FX pattern (occasional hits)
    if (fxTrack) {
      for (let i = 0; i < this.steps; i += 48) {
        if (i + 32 < this.steps) {
          fxTrack.steps[i + 32].active = true;
        }
      }
    }
  }
  
  // Load sound for a track
  private async loadTrackSound(track: Track): Promise<void> {
    try {
      const sound = await this.presetLoader.loadPresetSound(track.presetId);
      if (sound) {
        this.loadedSounds.set(track.presetId, sound);
      } else {
        console.warn(`Sound could not be loaded for preset: ${track.presetId}`);
      }
    } catch (error) {
      console.error(`Error loading sound for track ${track.id}:`, error);
    }
  }
  
  /**
   * Sets the BPM (Beats Per Minute) for the sequencer
   * @param bpm - The new BPM value
   */
  setBpm(newBpm: number): void {
    if (!this.isInitialized || !this.sequencer) return;
    if (newBpm < 60) newBpm = 60;
    if (newBpm > 200) newBpm = 200;
    
    this.bpm = newBpm;
    this.sequencer.setBpm(newBpm);
    console.log(`Audio engine BPM set to ${newBpm}`);
  }

  /**
   * Gets the current BPM value
   * @returns The current BPM
   */
  getBpm(): number {
    return this.bpm;
  }

  /**
   * Sets the mute state for a specific track
   * @param trackId - The ID of the track to mute/unmute
   * @param mute - Whether to mute (true) or unmute (false) the track
   */
  setTrackMute(trackId: string, mute: boolean): void {
    const trackIndex = this.tracks.findIndex(track => track.id === trackId);
    if (trackIndex === -1) return;
    
    // Update track mute state
    this.tracks[trackIndex].mute = mute;
    
    // Update sequencer if initialized
    if (this.sequencer) {
      this.sequencer.setTrackMute(trackId, mute);
    }
    
    // Notify listeners
    this.notifyListeners(trackId, mute);
  }

  /**
   * Sets the solo state for a specific track
   * @param trackId - The ID of the track to solo/unsolo
   * @param solo - Whether to solo (true) or unsolo (false) the track
   */
  setTrackSolo(trackId: string, solo: boolean): void {
    const trackIndex = this.tracks.findIndex(track => track.id === trackId);
    if (trackIndex === -1) return;
    
    // Update track solo state
    this.tracks[trackIndex].solo = solo;
    
    // If soloing this track, unsolo all others
    if (solo) {
      this.tracks.forEach(track => {
        if (track.id !== trackId) {
          track.solo = false;
        }
      });
    }
    
    // Update sequencer if initialized
    if (this.sequencer) {
      this.sequencer.setTrackSolo(trackId, solo);
    }
    
    // Notify listeners
    this.notifyListeners(trackId, solo);
  }

  /**
   * Gets the steps for a specific track
   * @param trackId - The ID of the track to get steps for
   * @returns The steps for the specified track, or an empty array if not found
   */
  getSteps(trackId: string): Step[] {
    const track = this.tracks.find(track => track.id === trackId);
    return track ? track.steps : [];
  }

  /**
   * Gets all tracks
   * @returns Array of all tracks
   */
  getTracks(): Track[] {
    return this.tracks;
  }

  // Update beat pattern
  updateBeatPattern(pattern: Partial<EnhancedBeatPattern>): void {
    if (!this.isInitialized) return;
    console.log('Updating beat pattern (basic implementation)');
    if (pattern.bpm) {
      this.setBpm(pattern.bpm);
    }
    if (pattern.tracks) {
      console.log(`Received ${pattern.tracks.length} tracks to update.`);
    }
  }
  
  // Apply audio effects to all tracks
  private async applyEffects(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      // Apply effects to each track
      for (const track of this.tracks) {
        const sound = this.loadedSounds.get(track.presetId);
        if (!sound) continue;
        
        // Apply volume
        await sound.setVolumeAsync(track.mute ? 0 : track.volume);
        
        // In a real implementation, we would apply other effects here
        // For now, we'll simulate with volume and rate adjustments
        
        // Apply filter effect (simulated with rate adjustment)
        const filterEffect = track.effects.filter.cutoff;
        await sound.setRateAsync(1.0 + (filterEffect - 0.5) * 0.1, true);
      }
    } catch (error) {
      console.error('Failed to apply effects:', error);
    }
  }
  
  // CORRECT: Sequencer event handler (was tick handler)
  private handleSequencerEvent(event: SequencerEvent): void {
    if (event.type === 'step') {
      this.currentStep = event.step;
      this.triggerStepSounds(event.step);
      this.notifyListeners(event.step);
    } else if (event.type === 'bar') {
      // Handle bar changes if needed
    } else if (event.type === 'pattern') {
      // Handle pattern changes if needed
    }
  }

  // triggerStepSounds (adjustments might be needed based on how mute/solo is handled)
  private triggerStepSounds(step: number): void {
    if (!this.isPlaying) return;
    this.tracks.forEach(track => {
      // Check mute/solo logic - Sequencer doesn't handle this directly
      const isSoloActive = this.tracks.some(t => t.solo && !t.mute);
      const shouldPlay = !track.mute && (!isSoloActive || track.solo);

      if (shouldPlay) {
        const stepData = track.steps[step % track.steps.length];
        if (stepData?.active && Math.random() < (stepData.probability ?? 1.0)) {
          const sound = this.loadedSounds.get(track.presetId);
          if (sound) {
            sound.replayAsync().catch(e => console.error(`Error replaying sound ${track.presetId}:`, e));
            sound.setVolumeAsync(stepData.velocity ?? track.volume ?? 0.8);
          } else {
            console.warn(`Sound not loaded for preset ${track.presetId} on step ${step}`);
          }
        }
      }
    });
  }

  // CORRECT: Playback control methods using Sequencer's play/stop
  play(callback: (step: number) => void): void { 
    if (!this.isInitialized || !this.sequencer) return;
    this.registerStepListener(callback); 
    this.sequencer.play(); // Use play()
    this.isPlaying = true;
    console.log('Audio engine playing');
  }

  stop(): void {
    if (!this.isInitialized || !this.sequencer) return;
    this.sequencer.stop(); // Use stop()
    this.isPlaying = false;
    this.currentStep = 0;
    this.notifyListeners(this.currentStep); 
    console.log('Audio engine stopped');
  }

  // Listener registration and notification
  registerStepListener(listener: (step: number) => void): void {
    this.listeners.add(listener);
  }

  unregisterStepListener(listener: (step: number) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(step: number): void {
    this.listeners.forEach(listener => listener(step));
  }

  // Get current tracks
  getTracks(): Track[] {
    return this.tracks;
  }
  
  // Get track by ID
  getTrackById(trackId: string): Track | undefined {
    return this.tracks.find(track => track.id === trackId);
  }
  
  // Add a new track
  async addTrack(presetId: string, name?: string): Promise<Track> {
    try {
      // Get preset
      const preset = this.presetLoader.findPresetById(presetId);
      if (!preset) {
        throw new Error(`Preset not found: ${presetId}`);
      }
      
      // Create track
      const track: Track = {
        id: `track_${Date.now()}`,
        name: name || `${preset.name} Track`,
        presetId,
        steps: this.createDefaultSteps(),
        mute: false,
        solo: false,
        volume: 0.8,
        pan: 0,
        effects: this.createDefaultTrackEffects()
      };
      
      // Load track sound
      await this.loadTrackSound(track);
      
      // Add track to tracks array
      this.tracks.push(track);
      
      return track;
    } catch (error) {
      console.error('Error adding track:', error);
      throw new Error('Failed to add track');
    }
  }
  
  // Remove a track
  removeTrack(trackId: string): void {
    const index = this.tracks.findIndex(track => track.id === trackId);
    if (index === -1) return;
    
    // Get sound
    const sound = this.loadedSounds.get(trackId);
    if (sound) {
      // Unload sound
      sound.unloadAsync();
      this.loadedSounds.delete(trackId);
    }
    
    // Remove track
    this.tracks.splice(index, 1);
  }
  
  // Update track preset
  async updateTrackPreset(trackId: string, presetId: string): Promise<void> {
    const track = this.getTrackById(trackId);
    if (!track) {
      throw new Error(`Track not found: ${trackId}`);
    }
    
    // Update preset ID
    track.presetId = presetId;
    
    // Unload old sound
    const oldSound = this.loadedSounds.get(trackId);
    if (oldSound) {
      await oldSound.unloadAsync();
      this.loadedSounds.delete(trackId);
    }
    
    // Load new sound
    await this.loadTrackSound(track);
  }
  
  // Update track step
  updateTrackStep(trackId: string, stepIndex: number, step: Partial<Step>): void {
    const track = this.getTrackById(trackId);
    if (!track || stepIndex < 0 || stepIndex >= track.steps.length) return;
    
    // Update step properties
    track.steps[stepIndex] = {
      ...track.steps[stepIndex],
      ...step
    };
  }
  
  // Update track effects
  updateTrackEffects(trackId: string, effects: Partial<TrackEffects>): void {
    const track = this.getTrackById(trackId);
    if (!track) return;
    
    // Update effects
    track.effects = {
      ...track.effects,
      ...effects
    };
    
    // Apply effects
    this.applyEffects();
  }
  
  // Update master effects
  updateMasterEffects(effects: Partial<MasterEffects>): void {
    this.masterEffects = {
      ...this.masterEffects,
      ...effects
    };
    
    // Apply effects
    this.applyEffects();
  }
  
  // Clean up resources
  async cleanup(): Promise<void> {
    this.stop();
    
    // Unload all sounds
    for (const sound of this.loadedSounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound:', error);
      }
    }
    
    this.loadedSounds.clear();
    
    this.sequencer?.cleanup();
    this.listeners.clear();
    
    this.isInitialized = false;
    console.log('Enhanced audio engine cleaned up.');
  }
}

let engineInstance: EnhancedAudioEngine | null = null;

export const useEnhancedAudioEngine = (): EnhancedAudioEngine => {
  if (engineInstance === null) {
    engineInstance = new EnhancedAudioEngine();
  }
  return engineInstance;
};
