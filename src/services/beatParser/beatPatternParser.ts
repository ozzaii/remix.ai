import { BeatPattern } from '../claude/claudeApi';

/**
 * Interface for parsed beat data ready for audio engine
 */
export interface ParsedBeat {
  bpm: number;
  instruments: {
    kick: boolean[];
    snare: boolean[];
    hihat: boolean[];
    bass: boolean[];
  };
  effects: {
    reverb: number;
    delay: number;
  };
  metadata: {
    created: string;
    modified: string;
    name: string;
  };
}

/**
 * Class for parsing and validating beat patterns from Claude API
 */
class BeatPatternParser {
  /**
   * Parse and validate a beat pattern from Claude API
   * @param beatPattern The beat pattern from Claude API
   * @param name Optional name for the beat
   * @returns Parsed beat data ready for audio engine
   */
  parsePattern(beatPattern: BeatPattern, name: string = 'Untitled Beat'): ParsedBeat {
    // Validate BPM (between 60-180)
    const bpm = this.validateBpm(beatPattern.bpm);
    
    // Validate instrument patterns (16 steps, 0 or 1)
    const instruments = {
      kick: this.validateInstrumentPattern(beatPattern.instruments.kick),
      snare: this.validateInstrumentPattern(beatPattern.instruments.snare),
      hihat: this.validateInstrumentPattern(beatPattern.instruments.hihat),
      bass: this.validateInstrumentPattern(beatPattern.instruments.bass),
    };
    
    // Validate effects (between 0-1)
    const effects = {
      reverb: this.validateEffectValue(beatPattern.effects.reverb),
      delay: this.validateEffectValue(beatPattern.effects.delay),
    };
    
    // Create metadata
    const now = new Date().toISOString();
    const metadata = {
      created: now,
      modified: now,
      name: name,
    };
    
    return {
      bpm,
      instruments,
      effects,
      metadata,
    };
  }
  
  /**
   * Validate BPM value
   * @param bpm BPM value from beat pattern
   * @returns Validated BPM value
   */
  private validateBpm(bpm: number): number {
    if (typeof bpm !== 'number') {
      return 120; // Default BPM
    }
    
    // Clamp BPM between 60-180
    return Math.max(60, Math.min(180, Math.round(bpm)));
  }
  
  /**
   * Validate instrument pattern
   * @param pattern Instrument pattern from beat pattern
   * @returns Validated instrument pattern as boolean array
   */
  private validateInstrumentPattern(pattern: number[]): boolean[] {
    if (!Array.isArray(pattern)) {
      // Create empty pattern if invalid
      return Array(16).fill(false);
    }
    
    // Ensure pattern has exactly 16 steps
    let validatedPattern = pattern.slice(0, 16);
    
    // If pattern is shorter than 16 steps, fill with zeros
    while (validatedPattern.length < 16) {
      validatedPattern.push(0);
    }
    
    // Convert to boolean array (0 -> false, anything else -> true)
    return validatedPattern.map(step => step !== 0);
  }
  
  /**
   * Validate effect value
   * @param value Effect value from beat pattern
   * @returns Validated effect value between 0-1
   */
  private validateEffectValue(value: number): number {
    if (typeof value !== 'number') {
      return 0; // Default effect value
    }
    
    // Clamp effect value between 0-1
    return Math.max(0, Math.min(1, value));
  }
  
  /**
   * Create an empty beat pattern
   * @param name Optional name for the beat
   * @returns Empty parsed beat data
   */
  createEmptyPattern(name: string = 'New Beat'): ParsedBeat {
    const now = new Date().toISOString();
    
    return {
      bpm: 120,
      instruments: {
        kick: Array(16).fill(false),
        snare: Array(16).fill(false),
        hihat: Array(16).fill(false),
        bass: Array(16).fill(false),
      },
      effects: {
        reverb: 0.3,
        delay: 0.2,
      },
      metadata: {
        created: now,
        modified: now,
        name: name,
      },
    };
  }
  
  /**
   * Convert parsed beat back to Claude API format
   * @param parsedBeat Parsed beat data
   * @returns Beat pattern in Claude API format
   */
  convertToClaudeFormat(parsedBeat: ParsedBeat): BeatPattern {
    return {
      bpm: parsedBeat.bpm,
      instruments: {
        kick: parsedBeat.instruments.kick.map(step => step ? 1 : 0),
        snare: parsedBeat.instruments.snare.map(step => step ? 1 : 0),
        hihat: parsedBeat.instruments.hihat.map(step => step ? 1 : 0),
        bass: parsedBeat.instruments.bass.map(step => step ? 1 : 0),
      },
      effects: {
        reverb: parsedBeat.effects.reverb,
        delay: parsedBeat.effects.delay,
      },
    };
  }
}

export default new BeatPatternParser();
