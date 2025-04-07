import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

// Sound categories and their respective samples
export type SoundCategory = 'drums' | 'bass' | 'synth' | 'fx' | 'vocals';

export interface SoundSample {
  id: string;
  name: string;
  category: SoundCategory;
  url: string;
  sound?: Audio.Sound;
  isLoaded: boolean;
}

export interface SoundPack {
  id: string;
  name: string;
  description: string;
  samples: SoundSample[];
}

// TeknoVault service for managing sound packs
export class TeknoVaultService {
  private soundPacks: Map<string, SoundPack> = new Map();
  private loadedSamples: Map<string, Audio.Sound> = new Map();
  private isInitialized: boolean = false;

  // Initialize the service with default sound packs
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // In a real implementation, this would fetch from TeknoVault API
      // For now, we'll use mock data
      const defaultPacks = this.getMockSoundPacks();
      
      for (const pack of defaultPacks) {
        this.soundPacks.set(pack.id, pack);
      }
      
      this.isInitialized = true;
      console.log('TeknoVault service initialized with', this.soundPacks.size, 'sound packs');
    } catch (error) {
      console.error('Failed to initialize TeknoVault service:', error);
      throw error;
    }
  }

  // Get all available sound packs
  getSoundPacks(): SoundPack[] {
    return Array.from(this.soundPacks.values());
  }

  // Get a specific sound pack by ID
  getSoundPack(packId: string): SoundPack | undefined {
    return this.soundPacks.get(packId);
  }

  // Get samples by category across all packs
  getSamplesByCategory(category: SoundCategory): SoundSample[] {
    const samples: SoundSample[] = [];
    
    for (const pack of this.soundPacks.values()) {
      samples.push(...pack.samples.filter(sample => sample.category === category));
    }
    
    return samples;
  }

  // Load a sound sample
  async loadSample(sampleId: string): Promise<Audio.Sound> {
    // Check if already loaded
    if (this.loadedSamples.has(sampleId)) {
      return this.loadedSamples.get(sampleId)!;
    }
    
    // Find the sample
    let targetSample: SoundSample | undefined;
    
    for (const pack of this.soundPacks.values()) {
      const sample = pack.samples.find(s => s.id === sampleId);
      if (sample) {
        targetSample = sample;
        break;
      }
    }
    
    if (!targetSample) {
      throw new Error(`Sample with ID ${sampleId} not found`);
    }
    
    try {
      // Load the sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: targetSample.url },
        { shouldPlay: false }
      );
      
      // Store the loaded sound
      this.loadedSamples.set(sampleId, sound);
      
      // Update the sample's loaded status
      targetSample.isLoaded = true;
      targetSample.sound = sound;
      
      return sound;
    } catch (error) {
      console.error(`Failed to load sample ${sampleId}:`, error);
      throw error;
    }
  }

  // Play a sound sample
  async playSample(sampleId: string): Promise<void> {
    try {
      const sound = await this.loadSample(sampleId);
      
      // Reset to beginning and play
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.error(`Failed to play sample ${sampleId}:`, error);
      throw error;
    }
  }

  // Release a loaded sound to free memory
  async releaseSample(sampleId: string): Promise<void> {
    if (this.loadedSamples.has(sampleId)) {
      const sound = this.loadedSamples.get(sampleId)!;
      
      try {
        await sound.unloadAsync();
        this.loadedSamples.delete(sampleId);
        
        // Update the sample's loaded status
        for (const pack of this.soundPacks.values()) {
          const sample = pack.samples.find(s => s.id === sampleId);
          if (sample) {
            sample.isLoaded = false;
            sample.sound = undefined;
            break;
          }
        }
      } catch (error) {
        console.error(`Failed to release sample ${sampleId}:`, error);
        throw error;
      }
    }
  }

  // Release all loaded sounds
  async releaseAllSamples(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const sampleId of this.loadedSamples.keys()) {
      promises.push(this.releaseSample(sampleId));
    }
    
    await Promise.all(promises);
  }

  // Mock data for development
  private getMockSoundPacks(): SoundPack[] {
    return [
      {
        id: 'tekno-essentials',
        name: 'TeknoVault Essentials',
        description: 'Essential techno sounds for beat creation',
        samples: [
          {
            id: 'kick-1',
            name: 'Kick 1',
            category: 'drums',
            url: 'https://teknovault.com/samples/kick-1.mp3',
            isLoaded: false
          },
          {
            id: 'kick-2',
            name: 'Kick 2',
            category: 'drums',
            url: 'https://teknovault.com/samples/kick-2.mp3',
            isLoaded: false
          },
          {
            id: 'snare-1',
            name: 'Snare 1',
            category: 'drums',
            url: 'https://teknovault.com/samples/snare-1.mp3',
            isLoaded: false
          },
          {
            id: 'hihat-closed',
            name: 'Hi-Hat Closed',
            category: 'drums',
            url: 'https://teknovault.com/samples/hihat-closed.mp3',
            isLoaded: false
          },
          {
            id: 'hihat-open',
            name: 'Hi-Hat Open',
            category: 'drums',
            url: 'https://teknovault.com/samples/hihat-open.mp3',
            isLoaded: false
          },
          {
            id: 'bass-1',
            name: 'Bass 1',
            category: 'bass',
            url: 'https://teknovault.com/samples/bass-1.mp3',
            isLoaded: false
          },
          {
            id: 'bass-2',
            name: 'Bass 2',
            category: 'bass',
            url: 'https://teknovault.com/samples/bass-2.mp3',
            isLoaded: false
          },
          {
            id: 'synth-1',
            name: 'Synth 1',
            category: 'synth',
            url: 'https://teknovault.com/samples/synth-1.mp3',
            isLoaded: false
          },
          {
            id: 'synth-2',
            name: 'Synth 2',
            category: 'synth',
            url: 'https://teknovault.com/samples/synth-2.mp3',
            isLoaded: false
          },
          {
            id: 'fx-1',
            name: 'FX 1',
            category: 'fx',
            url: 'https://teknovault.com/samples/fx-1.mp3',
            isLoaded: false
          }
        ]
      },
      {
        id: 'tekno-drums',
        name: 'TeknoVault Drums',
        description: 'Premium drum samples for techno production',
        samples: [
          {
            id: 'kick-3',
            name: 'Kick 3',
            category: 'drums',
            url: 'https://teknovault.com/samples/kick-3.mp3',
            isLoaded: false
          },
          {
            id: 'kick-4',
            name: 'Kick 4',
            category: 'drums',
            url: 'https://teknovault.com/samples/kick-4.mp3',
            isLoaded: false
          },
          {
            id: 'snare-2',
            name: 'Snare 2',
            category: 'drums',
            url: 'https://teknovault.com/samples/snare-2.mp3',
            isLoaded: false
          },
          {
            id: 'clap-1',
            name: 'Clap 1',
            category: 'drums',
            url: 'https://teknovault.com/samples/clap-1.mp3',
            isLoaded: false
          },
          {
            id: 'tom-1',
            name: 'Tom 1',
            category: 'drums',
            url: 'https://teknovault.com/samples/tom-1.mp3',
            isLoaded: false
          },
          {
            id: 'rim-1',
            name: 'Rim 1',
            category: 'drums',
            url: 'https://teknovault.com/samples/rim-1.mp3',
            isLoaded: false
          }
        ]
      },
      {
        id: 'tekno-synths',
        name: 'TeknoVault Synths',
        description: 'Cutting-edge synth sounds for techno tracks',
        samples: [
          {
            id: 'synth-3',
            name: 'Synth 3',
            category: 'synth',
            url: 'https://teknovault.com/samples/synth-3.mp3',
            isLoaded: false
          },
          {
            id: 'synth-4',
            name: 'Synth 4',
            category: 'synth',
            url: 'https://teknovault.com/samples/synth-4.mp3',
            isLoaded: false
          },
          {
            id: 'pad-1',
            name: 'Pad 1',
            category: 'synth',
            url: 'https://teknovault.com/samples/pad-1.mp3',
            isLoaded: false
          },
          {
            id: 'arp-1',
            name: 'Arp 1',
            category: 'synth',
            url: 'https://teknovault.com/samples/arp-1.mp3',
            isLoaded: false
          },
          {
            id: 'lead-1',
            name: 'Lead 1',
            category: 'synth',
            url: 'https://teknovault.com/samples/lead-1.mp3',
            isLoaded: false
          }
        ]
      }
    ];
  }
}

// Hook for using TeknoVault in components
export function useTeknoVault() {
  const [service] = useState(() => new TeknoVaultService());
  const [isInitialized, setIsInitialized] = useState(false);
  const [soundPacks, setSoundPacks] = useState<SoundPack[]>([]);
  
  useEffect(() => {
    const initService = async () => {
      try {
        await service.initialize();
        setSoundPacks(service.getSoundPacks());
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize TeknoVault service:', error);
      }
    };
    
    initService();
    
    // Cleanup on unmount
    return () => {
      service.releaseAllSamples().catch(error => {
        console.error('Failed to release samples:', error);
      });
    };
  }, [service]);
  
  return {
    isInitialized,
    soundPacks,
    getSoundPack: service.getSoundPack.bind(service),
    getSamplesByCategory: service.getSamplesByCategory.bind(service),
    loadSample: service.loadSample.bind(service),
    playSample: service.playSample.bind(service),
    releaseSample: service.releaseSample.bind(service)
  };
}

export default TeknoVaultService;
