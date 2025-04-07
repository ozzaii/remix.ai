/**
 * AudioEngine Service Implementation for REMIX.AI
 * 
 * This file implements a robust audio engine service for playing
 * and managing audio samples and beat patterns.
 */

import { AudioEngineService } from '../types';
import { errorHandler, ErrorCategory, ErrorSeverity } from '../../core/errorHandling';
import { AudioOptimizations } from '../../core/optimizations';
import { eventBus } from '../eventBus';

/**
 * Real Audio Engine Service implementation
 */
export class RealAudioEngineService implements AudioEngineService {
  private audioContext: AudioContext | null = null;
  private samples: Map<string, AudioBuffer> = new Map();
  private sampleNodes: Map<string, AudioBufferSourceNode> = new Map();
  private bpm: number = 120;
  private swing: number = 0;
  private isPlaybackActive: boolean = false;
  private currentStep: number = -1;
  private stepInterval: number = 0;
  private nextStepTime: number = 0;
  private schedulerTimer: number | null = null;
  
  constructor() {
    this.initAudioContext();
    this.calculateStepInterval();
  }
  
  /**
   * Initialize the audio context
   */
  private initAudioContext(): void {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Publish event
      eventBus.publish('audio:context:initialized', {});
    } catch (error) {
      errorHandler.captureException(
        error instanceof Error ? error : new Error('Failed to initialize audio context'),
        ErrorCategory.AUDIO,
        ErrorSeverity.ERROR
      );
    }
  }
  
  /**
   * Calculate the step interval based on BPM
   */
  private calculateStepInterval(): void {
    // 60000ms / BPM = ms per beat
    // We use 16th notes, so divide by 4
    this.stepInterval = 60000 / this.bpm / 4;
  }
  
  /**
   * Load a sample
   */
  public async loadSample(id: string, url: string): Promise<void> {
    if (!this.audioContext) {
      this.initAudioContext();
      
      if (!this.audioContext) {
        throw new Error('Audio context could not be initialized');
      }
    }
    
    try {
      // Publish event
      eventBus.publish('audio:sample:loading', { id, url });
      
      // Fetch the audio file
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode the audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Store the sample
      this.samples.set(id, audioBuffer);
      
      // Publish event
      eventBus.publish('audio:sample:loaded', { id });
    } catch (error) {
      errorHandler.captureException(
        error instanceof Error ? error : new Error(`Failed to load sample: ${id}`),
        ErrorCategory.AUDIO,
        ErrorSeverity.ERROR,
        { sampleId: id, url }
      );
      
      // Publish event
      eventBus.publish('audio:sample:error', { id, error });
      
      throw error;
    }
  }
  
  /**
   * Play a sample
   */
  public playSample(id: string): void {
    if (!this.audioContext) {
      this.initAudioContext();
      
      if (!this.audioContext) {
        throw new Error('Audio context could not be initialized');
      }
    }
    
    try {
      const sample = this.samples.get(id);
      
      if (!sample) {
        throw new Error(`Sample not found: ${id}`);
      }
      
      // Stop any existing playback of this sample
      this.stopSample(id);
      
      // Create a new source node
      const sourceNode = this.audioContext.createBufferSource();
      sourceNode.buffer = sample;
      
      // Connect to destination
      sourceNode.connect(this.audioContext.destination);
      
      // Store the node
      this.sampleNodes.set(id, sourceNode);
      
      // Start playback
      sourceNode.start();
      
      // Publish event
      eventBus.publish('audio:sample:playing', { id });
      
      // Remove the node when playback ends
      sourceNode.onended = () => {
        this.sampleNodes.delete(id);
        eventBus.publish('audio:sample:ended', { id });
      };
    } catch (error) {
      errorHandler.captureException(
        error instanceof Error ? error : new Error(`Failed to play sample: ${id}`),
        ErrorCategory.AUDIO,
        ErrorSeverity.ERROR,
        { sampleId: id }
      );
      
      // Publish event
      eventBus.publish('audio:sample:error', { id, error });
    }
  }
  
  /**
   * Stop a sample
   */
  public stopSample(id: string): void {
    try {
      const sourceNode = this.sampleNodes.get(id);
      
      if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
        this.sampleNodes.delete(id);
        
        // Publish event
        eventBus.publish('audio:sample:stopped', { id });
      }
    } catch (error) {
      errorHandler.captureException(
        error instanceof Error ? error : new Error(`Failed to stop sample: ${id}`),
        ErrorCategory.AUDIO,
        ErrorSeverity.ERROR,
        { sampleId: id }
      );
    }
  }
  
  /**
   * Set the BPM
   */
  public setBPM(bpm: number): void {
    this.bpm = Math.max(60, Math.min(200, bpm));
    this.calculateStepInterval();
    
    // Publish event
    eventBus.publish('audio:bpm:changed', { bpm: this.bpm });
  }
  
  /**
   * Set the swing amount
   */
  public setSwing(amount: number): void {
    this.swing = Math.max(0, Math.min(1, amount));
    
    // Publish event
    eventBus.publish('audio:swing:changed', { swing: this.swing });
  }
  
  /**
   * Start playback
   */
  public startPlayback(): void {
    if (this.isPlaybackActive) {
      return;
    }
    
    if (!this.audioContext) {
      this.initAudioContext();
      
      if (!this.audioContext) {
        throw new Error('Audio context could not be initialized');
      }
    }
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.isPlaybackActive = true;
    this.currentStep = -1;
    this.nextStepTime = this.audioContext.currentTime;
    
    // Start the scheduler
    this.scheduleNextStep();
    
    // Publish event
    eventBus.publish('audio:playback:start', {});
  }
  
  /**
   * Stop playback
   */
  public stopPlayback(): void {
    this.isPlaybackActive = false;
    
    // Stop the scheduler
    if (this.schedulerTimer !== null) {
      window.clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    
    // Stop all playing samples
    for (const id of this.sampleNodes.keys()) {
      this.stopSample(id);
    }
    
    this.currentStep = -1;
    
    // Publish event
    eventBus.publish('audio:playback:stop', {});
  }
  
  /**
   * Check if playback is active
   */
  public isPlaying(): boolean {
    return this.isPlaybackActive;
  }
  
  /**
   * Get the current step
   */
  public getCurrentStep(): number {
    return this.currentStep;
  }
  
  /**
   * Schedule the next step
   */
  private scheduleNextStep(): void {
    if (!this.isPlaybackActive || !this.audioContext) {
      return;
    }
    
    // Calculate time until next step
    const currentTime = this.audioContext.currentTime;
    const timeUntilNextStep = Math.max(0, this.nextStepTime - currentTime);
    
    // Schedule the next step
    this.schedulerTimer = window.setTimeout(() => {
      this.processStep();
      this.scheduleNextStep();
    }, timeUntilNextStep * 1000);
  }
  
  /**
   * Process a step
   */
  private processStep(): void {
    if (!this.isPlaybackActive || !this.audioContext) {
      return;
    }
    
    // Increment step
    this.currentStep = (this.currentStep + 1) % 64;
    
    // Publish step change event
    eventBus.publish('audio:step:change', { step: this.currentStep });
    
    // Calculate next step time with swing
    const swingAdjustment = (this.currentStep % 2 === 1) ? this.swing * this.stepInterval * 0.5 : 0;
    this.nextStepTime += (this.stepInterval + swingAdjustment) / 1000;
  }
}

// Create a factory function for the service
export function createAudioEngineService(): AudioEngineService {
  return new RealAudioEngineService();
}
