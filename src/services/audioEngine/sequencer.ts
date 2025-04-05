import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import { Track, Step, MasterEffects, TrackEffects, ParameterLock } from './enhancedAudioEngine';
import { usePresetLoader } from './presetLoader';

// Define Sequencer interfaces
interface SequencerOptions {
  bpm: number;
  totalSteps: number; // 16, 32, or 64
  swing: number; // 0-1, amount of swing to apply
  quantize: boolean; // Whether to quantize timing
}

interface SequencerEvent {
  type: 'step' | 'bar' | 'pattern';
  step: number;
  bar: number;
  pattern: number;
}

type SequencerEventCallback = (event: SequencerEvent) => void;

class Sequencer {
  private bpm: number = 140;
  private totalSteps: number = 64;
  private swing: number = 0;
  private quantize: boolean = true;
  
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private currentStep: number = 0;
  private currentBar: number = 0;
  private currentPattern: number = 0;
  
  private intervalId: NodeJS.Timeout | null = null;
  private eventCallbacks: SequencerEventCallback[] = [];
  
  private tracks: Track[] = [];
  private masterEffects: MasterEffects;
  private presetLoader = usePresetLoader();
  private loadedSounds: Map<string, Sound> = new Map();
  
  private stepHistory: number[] = []; // For tempo tap calculation
  private lastTapTime: number = 0;
  
  constructor(options?: Partial<SequencerOptions>) {
    // Set default options
    this.bpm = options?.bpm ?? 140;
    this.totalSteps = options?.totalSteps ?? 64;
    this.swing = options?.swing ?? 0;
    this.quantize = options?.quantize ?? true;
    
    // Initialize master effects with default values
    this.masterEffects = {
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
  }
  
  // Initialize sequencer
  async initialize(): Promise<void> {
    try {
      // Initialize preset loader
      await this.presetLoader.initialize();
      
      console.log('Sequencer initialized successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to initialize sequencer:', error);
      return Promise.reject('Failed to initialize sequencer');
    }
  }
  
  // Set tracks
  setTracks(tracks: Track[]): void {
    this.tracks = [...tracks];
    
    // Preload sounds for all tracks
    this.preloadTrackSounds();
  }
  
  // Preload sounds for all tracks
  private async preloadTrackSounds(): Promise<void> {
    try {
      const loadPromises = this.tracks.map(track => this.loadTrackSound(track));
      await Promise.all(loadPromises);
      
      console.log('All track sounds preloaded successfully');
    } catch (error) {
      console.error('Error preloading track sounds:', error);
    }
  }
  
  // Load sound for a track
  private async loadTrackSound(track: Track): Promise<void> {
    try {
      // Check if sound is already loaded
      if (this.loadedSounds.has(track.id)) {
        return;
      }
      
      // Load preset
      const loadedPreset = await this.presetLoader.loadPreset(track.presetId);
      
      // Store sound in loadedSounds map
      this.loadedSounds.set(track.id, loadedPreset.sound);
      
      // Set initial volume
      await loadedPreset.sound.setVolumeAsync(track.volume);
      
      console.log(`Loaded sound for track: ${track.name}`);
    } catch (error) {
      console.error(`Error loading sound for track ${track.name}:`, error);
      // Use fallback sound if available
      this.useFallbackSound(track);
    }
  }
  
  // Use fallback sound if primary sound fails to load
  private async useFallbackSound(track: Track): Promise<void> {
    try {
      // Try to load a default sound as fallback
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audio/fallback.mp3')
      );
      
      this.loadedSounds.set(track.id, sound);
      console.log(`Using fallback sound for track: ${track.name}`);
    } catch (fallbackError) {
      console.error(`Failed to load fallback sound for track ${track.name}:`, fallbackError);
    }
  }
  
  // Set master effects
  setMasterEffects(effects: MasterEffects): void {
    this.masterEffects = { ...effects };
    
    // Apply effects to all tracks
    this.applyEffects();
  }
  
  // Apply audio effects to all tracks
  private async applyEffects(): Promise<void> {
    try {
      // Apply effects to each track
      for (const track of this.tracks) {
        const sound = this.loadedSounds.get(track.id);
        if (!sound) continue;
        
        // Skip muted tracks
        if (track.mute) {
          await sound.setVolumeAsync(0);
          continue;
        }
        
        // Handle solo tracks
        const soloTrackExists = this.tracks.some(t => t.solo);
        const shouldPlay = !soloTrackExists || track.solo;
        
        // Apply volume
        await sound.setVolumeAsync(shouldPlay ? track.volume : 0);
        
        // In a real implementation, we would apply other effects here
        // For now, we'll simulate with volume and rate adjustments
        
        // Apply filter effect (simulated with rate adjustment)
        const filterEffect = track.effects.filter.cutoff;
        await sound.setRateAsync(1.0 + (filterEffect - 0.5) * 0.1, true);
      }
      
      // Apply master effects (simulated)
      console.log('Applied master effects:', this.masterEffects);
    } catch (error) {
      console.error('Failed to apply effects:', error);
    }
  }
  
  // Start playback
  play(): void {
    if (this.isPlaying && !this.isPaused) return;
    
    if (this.isPaused) {
      // Resume from paused state
      this.isPaused = false;
      this.isPlaying = true;
    } else {
      // Start from beginning or current position
      this.isPlaying = true;
      this.currentStep = this.currentStep || 0;
    }
    
    // Calculate interval based on BPM
    const stepTimeMs = this.calculateStepTime();
    
    // Start playback loop
    this.intervalId = setInterval(() => {
      this.playStep();
      
      // Update current step
      this.currentStep = (this.currentStep + 1) % this.totalSteps;
      
      // Update bar counter (assuming 16 steps per bar)
      if (this.currentStep % 16 === 0) {
        this.currentBar = (this.currentBar + 1) % 4;
        
        // Emit bar event
        this.emitEvent({
          type: 'bar',
          step: this.currentStep,
          bar: this.currentBar,
          pattern: this.currentPattern
        });
      }
      
      // Update pattern counter (assuming 64 steps per pattern)
      if (this.currentStep === 0 && this.currentBar === 0) {
        this.currentPattern = (this.currentPattern + 1) % 4;
        
        // Emit pattern event
        this.emitEvent({
          type: 'pattern',
          step: this.currentStep,
          bar: this.currentBar,
          pattern: this.currentPattern
        });
      }
      
      // Emit step event
      this.emitEvent({
        type: 'step',
        step: this.currentStep,
        bar: this.currentBar,
        pattern: this.currentPattern
      });
    }, stepTimeMs);
  }
  
  // Calculate step time with swing
  private calculateStepTime(): number {
    // Base step time (ms)
    const baseStepTimeMs = (60 * 1000) / this.bpm / 4; // 16th notes
    
    // Apply swing (alternating steps)
    if (this.swing > 0) {
      // Even steps are played on time, odd steps are delayed
      const evenStepTime = baseStepTimeMs * (1 - (this.swing * 0.5));
      const oddStepTime = baseStepTimeMs * (1 + (this.swing * 0.5));
      
      return this.currentStep % 2 === 0 ? evenStepTime : oddStepTime;
    }
    
    return baseStepTimeMs;
  }
  
  // Play current step
  private async playStep(): Promise<void> {
    if (!this.isPlaying || this.isPaused) return;
    
    try {
      // Play each track if active for current step
      for (const track of this.tracks) {
        // Skip if track is muted or no sound is loaded
        if (track.mute || !this.loadedSounds.has(track.id)) continue;
        
        // Handle solo tracks
        const soloTrackExists = this.tracks.some(t => t.solo);
        if (soloTrackExists && !track.solo) continue;
        
        // Get step data
        const step = track.steps[this.currentStep];
        if (!step || !step.active) continue;
        
        // Apply probability
        if (step.probability < 1.0 && Math.random() > step.probability) {
          continue; // Skip this step based on probability
        }
        
        // Get sound
        const sound = this.loadedSounds.get(track.id);
        if (!sound) continue;
        
        // Apply micro-timing (if not quantized)
        if (!this.quantize && step.microTiming !== 0) {
          const timingOffsetMs = step.microTiming * this.calculateStepTime();
          setTimeout(() => this.triggerSound(sound, track, step), timingOffsetMs);
        } else {
          // Play immediately
          this.triggerSound(sound, track, step);
        }
      }
    } catch (error) {
      console.error('Error playing step:', error);
    }
  }
  
  // Trigger a sound with applied parameters
  private async triggerSound(sound: Sound, track: Track, step: Step): Promise<void> {
    try {
      // Reset sound to beginning
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      
      // Apply velocity as volume adjustment
      const velocityVolume = track.volume * step.velocity;
      await sound.setVolumeAsync(velocityVolume);
      
      // Apply parameter locks if any
      if (step.parameterLocks.length > 0) {
        await this.applyParameterLocks(sound, track, step.parameterLocks);
      }
      
      // Play the sound
      await sound.playAsync();
    } catch (error) {
      console.error('Error triggering sound:', error);
    }
  }
  
  // Apply parameter locks to a sound
  private async applyParameterLocks(sound: Sound, track: Track, parameterLocks: ParameterLock[]): Promise<void> {
    try {
      for (const lock of parameterLocks) {
        // Handle different parameter types
        switch (lock.parameterId) {
          case 'pitch':
            // Adjust pitch (simulated with rate)
            await sound.setRateAsync(1.0 + (lock.value - 0.5), true);
            break;
          case 'filter':
            // Adjust filter (would be implemented with actual audio processing)
            console.log(`Applied filter parameter lock: ${lock.value}`);
            break;
          case 'delay':
            // Adjust delay (would be implemented with actual audio processing)
            console.log(`Applied delay parameter lock: ${lock.value}`);
            break;
          default:
            // Unknown parameter
            console.warn(`Unknown parameter lock: ${lock.parameterId}`);
        }
      }
    } catch (error) {
      console.error('Error applying parameter locks:', error);
    }
  }
  
  // Pause playback
  pause(): void {
    if (!this.isPlaying || this.isPaused) return;
    
    this.isPaused = true;
    
    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  // Stop playback
  stop(): void {
    if (!this.isPlaying && !this.isPaused) return;
    
    this.isPlaying = false;
    this.isPaused = false;
    
    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Reset position
    this.currentStep = 0;
    this.currentBar = 0;
    
    // Stop all sounds
    this.stopAllSounds();
    
    // Emit step event for position 0
    this.emitEvent({
      type: 'step',
      step: 0,
      bar: 0,
      pattern: this.currentPattern
    });
  }
  
  // Stop all sounds
  private async stopAllSounds(): Promise<void> {
    try {
      const stopPromises = Array.from(this.loadedSounds.values()).map(sound => sound.stopAsync());
      await Promise.all(stopPromises);
    } catch (error) {
      console.error('Error stopping sounds:', error);
    }
  }
  
  // Set BPM
  setBpm(bpm: number): void {
    if (bpm < 60 || bpm > 200) {
      console.warn('BPM out of range (60-200):', bpm);
      return;
    }
    
    this.bpm = bpm;
    
    // Restart interval if playing
    if (this.isPlaying && !this.isPaused) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.play();
    }
  }
  
  // Set swing amount
  setSwing(swing: number): void {
    if (swing < 0 || swing > 1) {
      console.warn('Swing out of range (0-1):', swing);
      return;
    }
    
    this.swing = swing;
    
    // Restart interval if playing to apply new swing
    if (this.isPlaying && !this.isPaused) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.play();
    }
  }
  
  // Set quantize mode
  setQuantize(quantize: boolean): void {
    this.quantize = quantize;
  }
  
  // Set total steps
  setTotalSteps(steps: number): void {
    if (steps !== 16 && steps !== 32 && steps !== 64) {
      console.warn('Invalid step count. Must be 16, 32, or 64:', steps);
      return;
    }
    
    this.totalSteps = steps;
    
    // Reset position if current step is beyond new total
    if (this.currentStep >= steps) {
      this.currentStep = 0;
      this.currentBar = 0;
    }
  }
  
  // Register event callback
  addEventListener(callback: SequencerEventCallback): void {
    this.eventCallbacks.push(callback);
  }
  
  // Remove event callback
  removeEventListener(callback: SequencerEventCallback): void {
    this.eventCallbacks = this.eventCallbacks.filter(cb => cb !== callback);
  }
  
  // Emit event to all registered callbacks
  private emitEvent(event: SequencerEvent): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in sequencer event callback:', error);
      }
    });
  }
  
  // Get current step
  getCurrentStep(): number {
    return this.currentStep;
  }
  
  // Get current bar
  getCurrentBar(): number {
    return this.currentBar;
  }
  
  // Get playback state
  isPlaybackActive(): boolean {
    return this.isPlaying && !this.isPaused;
  }
  
  // Process tempo tap
  tempoTap(): number {
    const now = Date.now();
    
    // If first tap or too long since last tap, reset history
    if (this.stepHistory.length === 0 || now - this.lastTapTime > 2000) {
      this.stepHistory = [now];
      this.lastTapTime = now;
      return this.bpm; // Return current BPM
    }
    
    // Add current tap to history
    this.stepHistory.push(now);
    this.lastTapTime = now;
    
    // Keep only last 4 taps
    if (this.stepHistory.length > 4) {
      this.stepHistory.shift();
    }
    
    // Calculate average interval
    let totalInterval = 0;
    for (let i = 1; i < this.stepHistory.length; i++) {
      totalInterval += this.stepHistory[i] - this.stepHistory[i - 1];
    }
    
    const avgInterval = totalInterval / (this.stepHistory.length - 1);
    
    // Convert to BPM
    const calculatedBpm = Math.round(60000 / avgInterval);
    
    // Limit to valid range
    const newBpm = Math.max(60, Math.min(200, calculatedBpm));
    
    // Update sequencer BPM
    this.setBpm(newBpm);
    
    return newBpm;
  }
  
  // Toggle step in a track
  toggleStep(trackId: string, stepIndex: number): void {
    const trackIndex = this.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1 || stepIndex < 0 || stepIndex >= this.totalSteps) {
      console.warn(`Invalid track ID or step index: ${trackId}, ${stepIndex}`);
      return;
    }
    
    // Toggle step active state
    this.tracks[trackIndex].steps[stepIndex].active = !this.tracks[trackIndex].steps[stepIndex].active;
  }
  
  // Edit step properties
  editStep(trackId: string, stepIndex: number, properties: Partial<Step>): void {
    const trackIndex = this.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1 || stepIndex < 0 || stepIndex >= this.totalSteps) {
      console.warn(`Invalid track ID or step index: ${trackId}, ${stepIndex}`);
      return;
    }
    
    // Update step properties
    this.tracks[trackIndex].steps[stepIndex] = {
      ...this.tracks[trackIndex].steps[stepIndex],
      ...properties
    };
  }
  
  // Toggle track mute
  toggleTrackMute(trackId: string): void {
    const trackIndex = this.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) {
      console.warn(`Invalid track ID: ${trackId}`);
      return;
    }
    
    // Toggle mute state
    this.tracks[trackIndex].mute = !this.tracks[trackIndex].mute;
    
    // Apply effects to update volume
    this.applyEffects();
  }
  
  // Toggle track solo
  toggleTrackSolo(trackId: string): void {
    const trackIndex = this.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) {
      console.warn(`Invalid track ID: ${trackId}`);
      return;
    }
    
    // Toggle solo state
    this.tracks[trackIndex].solo = !this.tracks[trackIndex].solo;
    
    // Apply effects to update volume
    this.applyEffects();
  }
  
  // Update track effects
  updateTrackEffects(trackId: string, effects: Partial<TrackEffects>): void {
    const trackIndex = this.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) {
      console.warn(`Invalid track ID: ${trackId}`);
      return;
    }
    
    // Update effects
    this.tracks[trackIndex].effects = {
      ...this.tracks[trackIndex].effects,
      ...effects
    };
    
    // Apply effects
    this.applyEffects();
  }
  
  // Get all tracks
  getTracks(): Track[] {
    return [...this.tracks];
  }
  
  // Get master effects
  getMasterEffects(): MasterEffects {
    return { ...this.masterEffects };
  }
  
  // Get current BPM
  getBpm(): number {
    return this.bpm;
  }
  
  // Get total steps
  getTotalSteps(): number {
    return this.totalSteps;
  }
  
  // Clean up resources
  cleanup(): void {
    // Stop playback
    this.stop();
    
    // Unload all sounds
    this.unloadAllSounds();
    
    // Clear event callbacks
    this.eventCallbacks = [];
  }
  
  // Unload all sounds
  private async unloadAllSounds(): Promise<void> {
    try {
      const unloadPromises = Array.from(this.loadedSounds.values()).map(sound => sound.unloadAsync());
      await Promise.all(unloadPromises);
      this.loadedSounds.clear();
      
      console.log('All sounds unloaded');
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  }
}

export { Sequencer, SequencerOptions, SequencerEvent, SequencerEventCallback };
