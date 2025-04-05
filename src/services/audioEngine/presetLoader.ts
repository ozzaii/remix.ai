import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import * as FileSystem from 'expo-file-system';

// Define interfaces for preset handling
export interface PresetParameter {
  id: string;
  value: number;
  min: number;
  max: number;
  default: number;
}

export interface Preset {
  id: string;
  name: string;
  category: string;
  filePath: string;
  parameters: PresetParameter[];
  metadata?: {
    author?: string;
    description?: string;
    tags?: string[];
  };
}

export interface PresetCategory {
  id: string;
  name: string;
  presets: Preset[];
}

class PresetLoader {
  private presetCategories: PresetCategory[] = [];
  private loadedSounds: Map<string, Sound> = new Map();
  private isInitialized: boolean = false;

  // CORRECTED Initialize: uses populatePlaceholderPresets
  async initialize(): Promise<void> {
    try {
      this.presetCategories = [
        { id: 'kicks', name: 'Kicks', presets: [] },
        { id: 'basslines', name: 'Basslines', presets: [] },
        { id: 'synths', name: 'Synths', presets: [] },
        { id: 'fx', name: 'FX', presets: [] },
        { id: 'hats', name: 'Hats', presets: [] },
        { id: 'snares', name: 'Snares', presets: [] },
        { id: 'claps', name: 'Claps', presets: [] },
        { id: 'percussion', name: 'Percussion', presets: [] }
      ];
      this.populatePlaceholderPresets();
      this.isInitialized = true;
      console.log('Preset loader initialized successfully (using placeholder presets)');
      console.log(`Available presets: ${this.getTotalPresetCount()} across ${this.presetCategories.length} categories`);
    } catch (error) {
      console.error('Failed to initialize preset loader:', error);
      throw new Error('Failed to initialize preset loader');
    }
  }

  // CORRECTED: populatePlaceholderPresets (no FileSystem access)
  private populatePlaceholderPresets(): void {
    const presetMap: { [key: string]: string[] } = {
      kicks: ['kick_deep', 'kick_hard', 'kick_punchy'],
      basslines: ['bass_deep', 'bass_acid', 'bass_sub'],
      synths: ['synth_lead', 'synth_pad', 'synth_arp'],
      fx: ['fx_sweep', 'fx_impact', 'fx_riser'],
      hats: ['hihat_closed', 'hihat_open', 'hihat_pedal'],
      snares: ['snare_tight', 'snare_fat', 'snare_reverb'],
      claps: ['clap_dry', 'clap_layered'],
      percussion: ['perc_conga', 'perc_shaker', 'perc_rim']
    };
    for (const category of this.presetCategories) {
      const names = presetMap[category.id] || [];
      for (const name of names) {
        const preset: Preset = {
          id: `${category.id}_${name}`,
          name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category: category.id,
          filePath: `placeholder/${category.id}/${name}`,
          parameters: this.generateDefaultParameters()
        };
        category.presets.push(preset);
      }
    }
  }

  // generateDefaultParameters (as before)
  private generateDefaultParameters(): PresetParameter[] {
    return [
      { id: 'attack', value: 0, min: 0, max: 1, default: 0 },
      { id: 'decay', value: 0.5, min: 0, max: 1, default: 0.5 },
      { id: 'sustain', value: 0.5, min: 0, max: 1, default: 0.5 },
      { id: 'release', value: 0.5, min: 0, max: 1, default: 0.5 },
      { id: 'cutoff', value: 1, min: 0, max: 1, default: 1 },
      { id: 'resonance', value: 0, min: 0, max: 1, default: 0 },
      { id: 'volume', value: 0.8, min: 0, max: 1, default: 0.8 }
    ];
  }

  // CORRECTED loadPresetSound: uses require() based on category with CORRECT paths
  async loadPresetSound(presetId: string): Promise<Sound> {
    if (!this.isInitialized) throw new Error('Preset loader not initialized');
    if (this.loadedSounds.has(presetId)) return this.loadedSounds.get(presetId)!;

    const preset = this.findPresetById(presetId);
    if (!preset) throw new Error(`Preset not found: ${presetId}`);

    try {
      let samplePath;
      // CORRECT relative path from src/services/audioEngine to src/assets/audio
      const baseAssetPath = '../../assets/audio'; 

      switch (preset.category) {
        case 'kicks': samplePath = require('../../assets/audio/kicks/kick_deep.mp3'); break;
        case 'basslines': samplePath = require('../../assets/audio/basslines/bass_deep.mp3'); break;
        case 'synths': samplePath = require('../../assets/audio/synths/synth_lead.mp3'); break;
        case 'fx': samplePath = require('../../assets/audio/fx/fx_sweep.mp3'); break;
        case 'hats': samplePath = require('../../assets/audio/hats/hihat_closed.mp3'); break;
        case 'snares': samplePath = require('../../assets/audio/snares/snare_tight.mp3'); break;
        case 'claps': samplePath = require('../../assets/audio/claps/clap_dry.mp3'); break;
        case 'percussion': samplePath = require('../../assets/audio/percussion/perc_conga.mp3'); break;
        default:
          console.warn(`No specific sample path for category ${preset.category}, using fallback.`);
          samplePath = require('../../assets/audio/kicks/kick_deep.mp3'); // Correct fallback path
      }
      if (!samplePath) throw new Error(`Could not determine sample path for preset ${presetId}`);

      const { sound } = await Audio.Sound.createAsync(samplePath);
      this.loadedSounds.set(presetId, sound);
      console.log(`Successfully loaded sound for preset: ${presetId}`);
      return sound;

    } catch (error) {
      console.error(`Error loading sound for preset ${presetId}:`, error);
      try {
        console.warn(`Attempting to load fallback sound for ${presetId}`);
        // Correct fallback path
        const fallbackPath = require('../../assets/audio/kicks/kick_deep.mp3'); 
        const { sound: fallbackSound } = await Audio.Sound.createAsync(fallbackPath);
        this.loadedSounds.set(presetId, fallbackSound);
        return fallbackSound;
      } catch (fallbackError) {
        console.error(`FATAL: Failed to load even fallback sound for ${presetId}:`, fallbackError);
        throw new Error(`Failed to load sound for preset: ${presetId}`);
      }
    }
  }

  // findPresetById (as before)
  findPresetById(presetId: string): Preset | undefined {
    for (const category of this.presetCategories) {
      const preset = category.presets.find(p => p.id === presetId);
      if (preset) return preset;
    }
    return undefined;
  }

  // getPresetCategories (as before)
  getPresetCategories(): PresetCategory[] {
    return this.presetCategories;
  }

  // getPresetsByCategory (as before)
  getPresetsByCategory(categoryId: string): Preset[] {
    const category = this.presetCategories.find(c => c.id === categoryId);
    return category ? category.presets : [];
  }

  // getTotalPresetCount (as before)
  getTotalPresetCount(): number {
    return this.presetCategories.reduce((count, category) => count + category.presets.length, 0);
  }

  // RESTORED updatePresetParameter
  updatePresetParameter(presetId: string, parameterId: string, value: number): void {
    // NOTE: This needs adjustment as we store Sounds now, not { preset, sound }
    const sound = this.loadedSounds.get(presetId); 
    const preset = this.findPresetById(presetId); // Find preset definition separately
    
    if (!sound || !preset) {
      console.warn(`Cannot update parameter: preset ${presetId} or its sound not loaded`);
      return;
    }

    const parameter = preset.parameters.find((p: PresetParameter) => p.id === parameterId);
    if (!parameter) {
      console.warn(`Parameter ${parameterId} not found in preset definition ${presetId}`);
      return;
    }

    parameter.value = Math.max(parameter.min, Math.min(parameter.max, value));
    console.log(`Updated parameter ${parameterId} of preset ${presetId} definition to ${parameter.value}`);
    // TODO: Apply parameter change to the actual sound object if possible (e.g., sound.setVolumeAsync)
  }

  // RESTORED cleanup
  async cleanup(): Promise<void> {
    for (const [presetId, sound] of this.loadedSounds.entries()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error(`Error unloading sound ${presetId}:`, error);
      }
    }
    this.loadedSounds.clear();
    this.isInitialized = false;
    console.log('Preset loader cleaned up.');
  }
  
} // End of PresetLoader class

// CORRECTED Singleton pattern
let instance: PresetLoader | null = null;

export const usePresetLoader = (): PresetLoader => {
  if (instance === null) {
    instance = new PresetLoader();
  }
  return instance;
};
