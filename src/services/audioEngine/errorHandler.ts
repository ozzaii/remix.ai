// Enhanced error handling for HARD TECHNO GOD ENGINE
// Provides robust error recovery mechanisms for audio processing

import { EventEmitter } from 'events';

// Error types
export enum AudioErrorType {
  SAMPLE_LOAD_FAILED = 'SAMPLE_LOAD_FAILED',
  PLAYBACK_FAILED = 'PLAYBACK_FAILED',
  SEQUENCER_ERROR = 'SEQUENCER_ERROR',
  PATTERN_GENERATION_ERROR = 'PATTERN_GENERATION_ERROR',
  PRESET_LOAD_ERROR = 'PRESET_LOAD_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',         // Non-critical, can continue with degraded functionality
  MEDIUM = 'MEDIUM',   // Important but recoverable
  HIGH = 'HIGH',       // Critical, requires immediate attention
  FATAL = 'FATAL'      // System cannot continue
}

// Error details interface
export interface AudioErrorDetails {
  type: AudioErrorType;
  severity: ErrorSeverity;
  message: string;
  timestamp: string;
  resourceId?: string; // Sample ID, preset ID, etc.
  originalError?: any;
  recoveryAttempted: boolean;
  recoverySuccessful?: boolean;
  fallbackUsed?: string;
}

// Fallback mapping interface
interface FallbackMap {
  [key: string]: string;
}

class AudioErrorHandler {
  private static instance: AudioErrorHandler;
  private eventEmitter: EventEmitter;
  private errorLog: AudioErrorDetails[] = [];
  private fallbackMap: FallbackMap = {};
  
  // Singleton pattern
  public static getInstance(): AudioErrorHandler {
    if (!AudioErrorHandler.instance) {
      AudioErrorHandler.instance = new AudioErrorHandler();
    }
    return AudioErrorHandler.instance;
  }
  
  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.initializeFallbackMap();
  }
  
  // Initialize fallback mappings for samples
  private initializeFallbackMap() {
    // Kicks
    this.fallbackMap['kick_deep'] = 'kick_punchy';
    this.fallbackMap['kick_punchy'] = 'kick_basic';
    this.fallbackMap['kick_distorted'] = 'kick_basic';
    
    // Hats
    this.fallbackMap['hat_closed'] = 'hat_basic';
    this.fallbackMap['hat_open'] = 'hat_closed';
    
    // Snares/Claps
    this.fallbackMap['snare_tight'] = 'clap_basic';
    this.fallbackMap['clap_basic'] = 'snare_basic';
    
    // Default fallbacks for categories
    this.fallbackMap['kick_'] = 'kick_basic';
    this.fallbackMap['hat_'] = 'hat_basic';
    this.fallbackMap['snare_'] = 'snare_basic';
    this.fallbackMap['clap_'] = 'clap_basic';
    this.fallbackMap['perc_'] = 'perc_basic';
    this.fallbackMap['bass_'] = 'bass_basic';
    this.fallbackMap['synth_'] = 'synth_basic';
    this.fallbackMap['fx_'] = 'fx_basic';
  }
  
  // Handle audio sample loading errors
  public handleSampleLoadError(error: any, sampleId: string): string | null {
    const errorDetails: AudioErrorDetails = {
      type: AudioErrorType.SAMPLE_LOAD_FAILED,
      severity: ErrorSeverity.MEDIUM,
      message: `Failed to load audio sample ${sampleId}: ${error.message || 'Unknown error'}`,
      timestamp: new Date().toISOString(),
      resourceId: sampleId,
      originalError: error,
      recoveryAttempted: false
    };
    
    // Log error
    console.error(`[GOD ENGINE ERROR] ${errorDetails.message}`);
    this.errorLog.push(errorDetails);
    
    // Attempt recovery with fallback sample
    const fallbackSampleId = this.getFallbackSampleId(sampleId);
    
    if (fallbackSampleId && fallbackSampleId !== sampleId) {
      errorDetails.recoveryAttempted = true;
      errorDetails.fallbackUsed = fallbackSampleId;
      
      // Emit error event
      this.eventEmitter.emit('audioError', errorDetails);
      
      return fallbackSampleId;
    }
    
    // No fallback available
    errorDetails.recoveryAttempted = true;
    errorDetails.recoverySuccessful = false;
    
    // Emit error event
    this.eventEmitter.emit('audioError', errorDetails);
    
    return null;
  }
  
  // Handle playback errors
  public handlePlaybackError(error: any, trackId: string): void {
    const errorDetails: AudioErrorDetails = {
      type: AudioErrorType.PLAYBACK_FAILED,
      severity: ErrorSeverity.MEDIUM,
      message: `Playback failed for track ${trackId}: ${error.message || 'Unknown error'}`,
      timestamp: new Date().toISOString(),
      resourceId: trackId,
      originalError: error,
      recoveryAttempted: true,
      recoverySuccessful: false
    };
    
    // Log error
    console.error(`[GOD ENGINE ERROR] ${errorDetails.message}`);
    this.errorLog.push(errorDetails);
    
    // Emit error event
    this.eventEmitter.emit('audioError', errorDetails);
  }
  
  // Handle sequencer errors
  public handleSequencerError(error: any, details?: string): void {
    const errorDetails: AudioErrorDetails = {
      type: AudioErrorType.SEQUENCER_ERROR,
      severity: ErrorSeverity.HIGH,
      message: `Sequencer error: ${error.message || 'Unknown error'} ${details ? `(${details})` : ''}`,
      timestamp: new Date().toISOString(),
      originalError: error,
      recoveryAttempted: true,
      recoverySuccessful: false
    };
    
    // Log error
    console.error(`[GOD ENGINE ERROR] ${errorDetails.message}`);
    this.errorLog.push(errorDetails);
    
    // Emit error event
    this.eventEmitter.emit('audioError', errorDetails);
  }
  
  // Handle pattern generation errors
  public handlePatternGenerationError(error: any, patternRequest?: any): void {
    const errorDetails: AudioErrorDetails = {
      type: AudioErrorType.PATTERN_GENERATION_ERROR,
      severity: ErrorSeverity.HIGH,
      message: `Pattern generation failed: ${error.message || 'Unknown error'}`,
      timestamp: new Date().toISOString(),
      originalError: error,
      recoveryAttempted: false
    };
    
    // Log error
    console.error(`[GOD ENGINE ERROR] ${errorDetails.message}`);
    if (patternRequest) {
      console.error('Pattern request:', JSON.stringify(patternRequest));
    }
    this.errorLog.push(errorDetails);
    
    // Emit error event
    this.eventEmitter.emit('audioError', errorDetails);
  }
  
  // Get fallback sample ID for recovery
  private getFallbackSampleId(originalSampleId: string): string | null {
    // Try exact match first
    if (this.fallbackMap[originalSampleId]) {
      return this.fallbackMap[originalSampleId];
    }
    
    // Try category match
    for (const prefix in this.fallbackMap) {
      if (originalSampleId.startsWith(prefix)) {
        return this.fallbackMap[prefix];
      }
    }
    
    // Last resort - return basic kick sample
    return 'kick_basic';
  }
  
  // Subscribe to error events
  public onError(callback: (error: AudioErrorDetails) => void): void {
    this.eventEmitter.on('audioError', callback);
  }
  
  // Get error log
  public getErrorLog(): AudioErrorDetails[] {
    return [...this.errorLog];
  }
  
  // Clear error log
  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

export default AudioErrorHandler;
