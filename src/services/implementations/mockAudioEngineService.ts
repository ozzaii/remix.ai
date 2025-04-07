/**
 * Mock Audio Engine Service Implementation for REMIX.AI
 * 
 * This file provides a mock implementation of the AudioEngineService interface
 * for development and testing purposes.
 */

import { AudioEngineService, AudioSample, BeatPatterns, AudioEngineOptions } from '../types';

/**
 * Mock implementation of the Audio Engine service
 */
export class MockAudioEngineService implements AudioEngineService {
  private initialized: boolean = false;
  private samples: Map<string, AudioSample> = new Map();
  private isPlaying: boolean = false;
  private currentStep: number = 0;
  private bpm: number = 120;
  private stepListeners: Array<(step: number | null) => void> = [];
  private sequenceInterval: NodeJS.Timeout | null = null;
  
  /**
   * Initialize the audio engine
   */
  async init(options: AudioEngineOptions = {}): Promise<void> {
    console.log('MockAudioEngineService: init', options);
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Load default samples
    await this.loadDefaultSamples();
    
    this.initialized = true;
    console.log('MockAudioEngineService: initialized successfully');
  }
  
  /**
   * Load a sample
   */
  async loadSample(name: string, url: string): Promise<AudioSample> {
    console.log(`MockAudioEngineService: loadSample ${name} from ${url}`);
    
    if (!this.initialized) {
      throw new Error('Audio engine not initialized');
    }
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Create mock sample
    const sample: AudioSample = {
      id: `sample-${Date.now()}`,
      buffer: {} as AudioBuffer, // Mock buffer
      name,
      category: this.getCategoryFromName(name)
    };
    
    // Store sample
    this.samples.set(name, sample);
    
    return sample;
  }
  
  /**
   * Play a sample
   */
  playSample(name: string): void {
    console.log(`MockAudioEngineService: playSample ${name}`);
    
    if (!this.initialized) {
      console.error('Audio engine not initialized');
      return;
    }
    
    if (!this.samples.has(name)) {
      console.error(`Sample ${name} not found`);
      return;
    }
    
    // In a real implementation, this would play the audio
    // For now, we'll just log it
    console.log(`Playing sample: ${name}`);
  }
  
  /**
   * Play a sequence
   */
  playSequence(patterns: BeatPatterns, bpm: number): void {
    console.log('MockAudioEngineService: playSequence', { patterns, bpm });
    
    if (!this.initialized) {
      console.error('Audio engine not initialized');
      return;
    }
    
    // Stop any existing sequence
    this.stopSequence();
    
    // Set BPM
    this.bpm = bpm;
    
    // Start playing
    this.isPlaying = true;
    this.currentStep = 0;
    
    // Calculate interval based on BPM (60000 ms / BPM / 4 steps per beat)
    const stepInterval = 60000 / bpm / 4;
    
    // Start sequencer
    this.sequenceInterval = setInterval(() => {
      // Play samples for current step
      for (const [instrument, steps] of Object.entries(patterns)) {
        if (steps[this.currentStep]) {
          this.playSample(instrument);
        }
      }
      
      // Notify listeners
      this.notifyStepListeners(this.currentStep);
      
      // Advance step
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepInterval);
  }
  
  /**
   * Stop the sequence
   */
  stopSequence(): void {
    console.log('MockAudioEngineService: stopSequence');
    
    if (this.sequenceInterval) {
      clearInterval(this.sequenceInterval);
      this.sequenceInterval = null;
    }
    
    this.isPlaying = false;
    this.currentStep = 0;
    
    // Notify listeners
    this.notifyStepListeners(null);
  }
  
  /**
   * Set BPM
   */
  setBpm(bpm: number): void {
    console.log(`MockAudioEngineService: setBpm ${bpm}`);
    
    this.bpm = bpm;
    
    // If playing, restart sequence with new BPM
    if (this.isPlaying && this.sequenceInterval) {
      // Get current patterns (in a real implementation, we'd have access to these)
      const dummyPatterns: BeatPatterns = {
        kick: Array(16).fill(false).map((_, i) => i % 4 === 0),
        snare: Array(16).fill(false).map((_, i) => i % 8 === 4),
        hihat: Array(16).fill(false).map((_, i) => i % 2 === 0),
        bass: Array(16).fill(false).map((_, i) => i % 8 === 0),
      };
      
      // Restart sequence
      this.stopSequence();
      this.playSequence(dummyPatterns, bpm);
    }
  }
  
  /**
   * Add a step listener
   */
  addStepListener(listener: (step: number | null) => void): () => void {
    this.stepListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.stepListeners.indexOf(listener);
      if (index !== -1) {
        this.stepListeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Dispose resources
   */
  dispose(): void {
    console.log('MockAudioEngineService: dispose');
    
    // Stop any playing sequence
    this.stopSequence();
    
    // Clear samples
    this.samples.clear();
    
    // Clear listeners
    this.stepListeners = [];
    
    this.initialized = false;
  }
  
  /**
   * Notify step listeners
   */
  private notifyStepListeners(step: number | null): void {
    for (const listener of this.stepListeners) {
      try {
        listener(step);
      } catch (error) {
        console.error('Error in step listener:', error);
      }
    }
  }
  
  /**
   * Load default samples
   */
  private async loadDefaultSamples(): Promise<void> {
    // Load default samples
    const defaultSamples = {
      kick: '/samples/kick.wav',
      snare: '/samples/snare.wav',
      hihat: '/samples/hihat.wav',
      bass: '/samples/bass.wav'
    };
    
    // Load samples in parallel
    await Promise.all(
      Object.entries(defaultSamples).map(([name, url]) => 
        this.loadSample(name, url)
      )
    );
  }
  
  /**
   * Get category from sample name
   */
  private getCategoryFromName(name: string): string {
    if (['kick', 'snare', 'hihat', 'tom', 'cymbal'].includes(name.toLowerCase())) {
      return 'drums';
    }
    
    if (['bass', 'sub'].includes(name.toLowerCase())) {
      return 'bass';
    }
    
    if (['synth', 'pad', 'lead'].includes(name.toLowerCase())) {
      return 'synth';
    }
    
    if (['fx', 'effect'].includes(name.toLowerCase())) {
      return 'fx';
    }
    
    return 'other';
  }
}
