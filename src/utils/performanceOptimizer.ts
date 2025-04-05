// Performance optimization utilities for HARD TECHNO GOD ENGINE
// Ensures maximum performance for premium experience

import { Platform } from 'react-native';

// Performance levels
export enum PerformanceLevel {
  STANDARD = 'STANDARD',   // Default performance
  HIGH = 'HIGH',           // Enhanced performance
  ULTRA = 'ULTRA',         // Maximum performance
  GOD_TIER = 'GOD_TIER'    // Beyond mortal comprehension
}

// Device capability detection
export interface DeviceCapabilities {
  performanceLevel: PerformanceLevel;
  maxTracks: number;
  maxSteps: number;
  maxEffects: number;
  supportsHaptics: boolean;
  supportsPremiumVisuals: boolean;
  supportsAdvancedAudio: boolean;
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private deviceCapabilities: DeviceCapabilities;
  private isLowPowerMode: boolean = false;
  private frameDropCounter: number = 0;
  private lastPerformanceCheck: number = 0;
  
  // Singleton pattern
  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }
  
  private constructor() {
    // Initialize with default capabilities
    this.deviceCapabilities = this.detectDeviceCapabilities();
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
  }
  
  // Detect device capabilities based on platform and device specs
  private detectDeviceCapabilities(): DeviceCapabilities {
    // Default capabilities for high-end devices
    const capabilities: DeviceCapabilities = {
      performanceLevel: PerformanceLevel.HIGH,
      maxTracks: 16,
      maxSteps: 64,
      maxEffects: 8,
      supportsHaptics: true,
      supportsPremiumVisuals: true,
      supportsAdvancedAudio: true
    };
    
    // Adjust based on platform
    if (Platform.OS === 'web') {
      // Web has more limitations
      capabilities.maxTracks = 12;
      capabilities.supportsHaptics = false;
      capabilities.supportsAdvancedAudio = false;
    } else if (Platform.OS === 'android') {
      // Android might need some adjustments
      capabilities.supportsPremiumVisuals = Platform.Version >= 28; // Android 9+
    }
    
    // TODO: Add more sophisticated detection based on device model
    // This would require native modules to detect CPU/GPU capabilities
    
    return capabilities;
  }
  
  // Set up performance monitoring
  private setupPerformanceMonitoring() {
    // Check for frame drops periodically
    setInterval(() => {
      this.checkPerformance();
    }, 10000); // Check every 10 seconds
  }
  
  // Check current performance and adjust if needed
  private checkPerformance() {
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastPerformanceCheck;
    this.lastPerformanceCheck = now;
    
    // If we've detected significant frame drops, adjust performance
    if (this.frameDropCounter > 5) {
      this.adjustPerformanceLevel(false); // Decrease performance level
      this.frameDropCounter = 0;
    }
    
    // Reset counter periodically to allow for recovery
    if (timeSinceLastCheck > 30000) { // 30 seconds
      this.frameDropCounter = 0;
    }
  }
  
  // Register a frame drop
  public registerFrameDrop() {
    this.frameDropCounter++;
  }
  
  // Adjust performance level up or down
  public adjustPerformanceLevel(increase: boolean) {
    const currentLevel = this.deviceCapabilities.performanceLevel;
    
    if (increase) {
      // Increase performance level if possible
      switch (currentLevel) {
        case PerformanceLevel.STANDARD:
          this.deviceCapabilities.performanceLevel = PerformanceLevel.HIGH;
          break;
        case PerformanceLevel.HIGH:
          this.deviceCapabilities.performanceLevel = PerformanceLevel.ULTRA;
          break;
        case PerformanceLevel.ULTRA:
          this.deviceCapabilities.performanceLevel = PerformanceLevel.GOD_TIER;
          break;
        // Already at max
        default:
          break;
      }
    } else {
      // Decrease performance level
      switch (currentLevel) {
        case PerformanceLevel.GOD_TIER:
          this.deviceCapabilities.performanceLevel = PerformanceLevel.ULTRA;
          break;
        case PerformanceLevel.ULTRA:
          this.deviceCapabilities.performanceLevel = PerformanceLevel.HIGH;
          break;
        case PerformanceLevel.HIGH:
          this.deviceCapabilities.performanceLevel = PerformanceLevel.STANDARD;
          break;
        // Already at min
        default:
          break;
      }
    }
    
    // Adjust other capabilities based on new performance level
    this.updateCapabilitiesForPerformanceLevel();
    
    console.log(`[PERFORMANCE] Adjusted to ${this.deviceCapabilities.performanceLevel} level`);
  }
  
  // Update capabilities based on current performance level
  private updateCapabilitiesForPerformanceLevel() {
    const level = this.deviceCapabilities.performanceLevel;
    
    switch (level) {
      case PerformanceLevel.STANDARD:
        this.deviceCapabilities.maxTracks = 8;
        this.deviceCapabilities.maxSteps = 32;
        this.deviceCapabilities.maxEffects = 4;
        this.deviceCapabilities.supportsPremiumVisuals = false;
        break;
      case PerformanceLevel.HIGH:
        this.deviceCapabilities.maxTracks = 12;
        this.deviceCapabilities.maxSteps = 64;
        this.deviceCapabilities.maxEffects = 6;
        this.deviceCapabilities.supportsPremiumVisuals = true;
        break;
      case PerformanceLevel.ULTRA:
        this.deviceCapabilities.maxTracks = 16;
        this.deviceCapabilities.maxSteps = 64;
        this.deviceCapabilities.maxEffects = 8;
        this.deviceCapabilities.supportsPremiumVisuals = true;
        break;
      case PerformanceLevel.GOD_TIER:
        this.deviceCapabilities.maxTracks = 24;
        this.deviceCapabilities.maxSteps = 128;
        this.deviceCapabilities.maxEffects = 12;
        this.deviceCapabilities.supportsPremiumVisuals = true;
        break;
    }
  }
  
  // Set low power mode (e.g., when battery is low)
  public setLowPowerMode(enabled: boolean) {
    if (this.isLowPowerMode !== enabled) {
      this.isLowPowerMode = enabled;
      
      if (enabled) {
        // Force standard performance in low power mode
        this.deviceCapabilities.performanceLevel = PerformanceLevel.STANDARD;
        this.updateCapabilitiesForPerformanceLevel();
        console.log('[PERFORMANCE] Low power mode enabled');
      } else {
        // Restore to high performance when exiting low power mode
        this.deviceCapabilities.performanceLevel = PerformanceLevel.HIGH;
        this.updateCapabilitiesForPerformanceLevel();
        console.log('[PERFORMANCE] Low power mode disabled');
      }
    }
  }
  
  // Get current device capabilities
  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }
  
  // Check if premium visuals should be enabled
  public shouldEnablePremiumVisuals(): boolean {
    return this.deviceCapabilities.supportsPremiumVisuals && !this.isLowPowerMode;
  }
  
  // Get optimal buffer size for audio processing
  public getOptimalAudioBufferSize(): number {
    const level = this.deviceCapabilities.performanceLevel;
    
    switch (level) {
      case PerformanceLevel.STANDARD:
        return 2048; // Larger buffer, less CPU
      case PerformanceLevel.HIGH:
        return 1024;
      case PerformanceLevel.ULTRA:
        return 512;
      case PerformanceLevel.GOD_TIER:
        return 256; // Smaller buffer, more responsive
      default:
        return 1024;
    }
  }
  
  // Get optimal sample rate for audio
  public getOptimalSampleRate(): number {
    const level = this.deviceCapabilities.performanceLevel;
    
    switch (level) {
      case PerformanceLevel.STANDARD:
        return 44100;
      case PerformanceLevel.HIGH:
        return 48000;
      case PerformanceLevel.ULTRA:
      case PerformanceLevel.GOD_TIER:
        return 96000;
      default:
        return 44100;
    }
  }
  
  // Get animation frame rate target
  public getTargetFrameRate(): number {
    const level = this.deviceCapabilities.performanceLevel;
    
    switch (level) {
      case PerformanceLevel.STANDARD:
        return 30;
      case PerformanceLevel.HIGH:
        return 60;
      case PerformanceLevel.ULTRA:
      case PerformanceLevel.GOD_TIER:
        return 120;
      default:
        return 60;
    }
  }
}

export default PerformanceOptimizer;
