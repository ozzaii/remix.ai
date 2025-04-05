import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

// Define interfaces
interface BeatPattern {
  bpm: number;
  instruments: {
    [instrument: string]: (boolean | number)[];
  };
  effects: {
    reverb: number;
    delay: number;
  };
}

interface AudioSamples {
  [instrument: string]: Sound;
}

class AudioEngine {
  private bpm: number = 120;
  private instruments: { [instrument: string]: (boolean | number)[] } = {};
  private effects: { reverb: number; delay: number } = { reverb: 0, delay: 0 };
  private audioSamples: AudioSamples = {};
  private isInitialized: boolean = false;
  private isPlaying: boolean = false;
  private currentStep: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private stepCallback: ((step: number) => void) | null = null;

  // Initialize audio engine
  async initialize(): Promise<void> {
    try {
      // Load audio samples
      const kickSound = await Audio.Sound.createAsync(
        require('../../assets/audio/kick/kick_deep.mp3')
      );
      
      const snareSound = await Audio.Sound.createAsync(
        require('../../assets/audio/snare/snare_tight.mp3')
      );
      
      const hihatSound = await Audio.Sound.createAsync(
        require('../../assets/audio/hihat/hihat_closed.mp3')
      );
      
      const bassSound = await Audio.Sound.createAsync(
        require('../../assets/audio/bass/bass_deep.mp3')
      );
      
      // Store audio samples
      this.audioSamples = {
        kick: kickSound.sound,
        snare: snareSound.sound,
        hihat: hihatSound.sound,
        bass: bassSound.sound
      };
      
      // Set volume for all samples
      await Promise.all(
        Object.values(this.audioSamples).map(sound => 
          sound.setVolumeAsync(0.8)
        )
      );
      
      // Set default instruments pattern if none provided
      if (Object.keys(this.instruments).length === 0) {
        this.instruments = {
          kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
          snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
          hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
          bass: [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]
        };
      }
      
      this.isInitialized = true;
      console.log('Audio engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      throw new Error('Failed to initialize audio engine');
    }
  }
  
  // Update beat pattern
  updateBeatPattern(pattern: BeatPattern): void {
    this.bpm = pattern.bpm;
    this.instruments = pattern.instruments;
    this.effects = pattern.effects;
    
    // Apply effects to audio samples
    this.applyEffects();
  }
  
  // Apply audio effects
  private async applyEffects(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      // Apply reverb effect (simulated with volume adjustment)
      const reverbVolume = 0.8 + (this.effects.reverb * 0.2);
      
      // Apply effects to each instrument
      await Promise.all(
        Object.entries(this.audioSamples).map(async ([instrument, sound]) => {
          // Apply instrument-specific effects
          if (instrument === 'hihat') {
            // Higher pitch for hihat with more reverb
            await sound.setRateAsync(1.0 + (this.effects.reverb * 0.2), true);
          } else if (instrument === 'kick') {
            // Lower pitch for kick with more delay
            await sound.setRateAsync(1.0 - (this.effects.delay * 0.1), true);
          }
          
          // Apply volume based on reverb
          await sound.setVolumeAsync(reverbVolume);
        })
      );
    } catch (error) {
      console.error('Failed to apply effects:', error);
    }
  }
  
  // Play the beat pattern
  play(callback?: (step: number) => void): NodeJS.Timeout {
    if (!this.isInitialized) {
      throw new Error('Audio engine not initialized');
    }
    
    this.isPlaying = true;
    this.stepCallback = callback || null;
    
    // Calculate interval based on BPM
    const stepTimeMs = (60 * 1000) / this.bpm / 4; // 16th notes
    
    // Start playback loop
    this.intervalId = setInterval(() => {
      this.playStep();
      
      // Update current step
      this.currentStep = (this.currentStep + 1) % 16;
      
      // Call step callback if provided
      if (this.stepCallback) {
        this.stepCallback(this.currentStep);
      }
    }, stepTimeMs);
    
    return this.intervalId;
  }
  
  // Play current step
  private async playStep(): Promise<void> {
    try {
      // Play each instrument if active for current step
      await Promise.all(
        Object.entries(this.instruments).map(async ([instrument, pattern]) => {
          if (pattern[this.currentStep]) {
            const sound = this.audioSamples[instrument];
            if (sound) {
              // Use playFromPositionAsync(0) to simplify replay and avoid race conditions
              await sound.playFromPositionAsync(0); 
              
              // Apply delay effect if enabled
              if (this.effects.delay > 0 && instrument !== 'kick') {
                const delayMs = (60 * 1000) / this.bpm / 4 * this.effects.delay;
                setTimeout(async () => {
                  if (this.isPlaying) {
                    try { // Add try-catch for safety within timeout
                      // Temporarily lower volume for echo
                      await sound.setVolumeAsync(0.4 * this.effects.delay);
                      // Replay for echo - use playFromPositionAsync here too for consistency
                      await sound.playFromPositionAsync(0);
                      // Reset volume after delay playback (adjust timing if needed)
                      setTimeout(async () => {
                        // Check if still playing before resetting volume
                        if (this.isPlaying) {
                          const baseVolume = 0.8 + (this.effects.reverb * 0.2);
                          await sound.setVolumeAsync(baseVolume);
                        }
                      }, 150); // Slightly longer delay for reset
                    } catch (error) {
                       // Don't log aggressively within the loop, could be noisy
                       // console.error('Error playing delayed step:', error);
                    }
                  }
                }, delayMs);
              } else {
                 // Ensure volume is reset if delay is not active for this step
                 const baseVolume = 0.8 + (this.effects.reverb * 0.2);
                 // Check if sound status is loaded before setting volume
                 const status = await sound.getStatusAsync();
                 if (status.isLoaded) {
                   await sound.setVolumeAsync(baseVolume);
                 }
              }
            }
          }
        })
      );
    } catch (error) {
      console.error('Error playing step:', error);
    }
  }
  
  // Stop playback
  stop(): void {
    this.isPlaying = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.currentStep = 0;
    
    // Stop all sounds
    Object.values(this.audioSamples).forEach(async (sound) => {
      try {
        await sound.stopAsync();
      } catch (error) {
        console.error('Error stopping sound:', error);
      }
    });
  }
  
  // Clean up resources
  async cleanup(): Promise<void> {
    this.stop();
    
    // Unload all sounds
    await Promise.all(
      Object.values(this.audioSamples).map(async (sound) => {
        try {
          await sound.unloadAsync();
        } catch (error) {
          console.error('Error unloading sound:', error);
        }
      })
    );
    
    this.audioSamples = {};
    this.isInitialized = false;
  }
}

// Singleton instance
const audioEngine = new AudioEngine();

// Hook for components to use the audio engine
export const useAudioEngine = () => {
  return audioEngine;
};
