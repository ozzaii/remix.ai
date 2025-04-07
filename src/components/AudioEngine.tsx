import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTeknoVault } from '../services/teknoVaultService';
import { useClaudeSoundDeployment, ClaudeSoundDeploymentResponse } from '../services/claudeSoundDeploymentService';
import BeatVisualizer from './BeatVisualizer';

interface AudioEngineProps {
  beat?: ClaudeSoundDeploymentResponse;
  isPlaying: boolean;
  onPlayingChange: (isPlaying: boolean) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
}

const AudioEngine: React.FC<AudioEngineProps> = ({
  beat,
  isPlaying,
  onPlayingChange,
  bpm,
  onBpmChange
}) => {
  const teknoVault = useTeknoVault();
  const [currentStep, setCurrentStep] = useState(0);
  const [loadedSamples, setLoadedSamples] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate step duration based on BPM
  const getStepDuration = () => {
    // 60000ms per minute / BPM = ms per beat
    // We want 16th notes, so divide by 4
    return 60000 / bpm / 4;
  };

  // Load all samples used in the beat
  useEffect(() => {
    if (beat && teknoVault.isInitialized) {
      const sampleIds = new Set<string>();
      
      // Collect all unique sample IDs
      beat.patterns.forEach(pattern => {
        sampleIds.add(pattern.sampleId);
      });
      
      // Load each sample
      const loadSamples = async () => {
        const newLoadedSamples = new Set<string>();
        
        for (const sampleId of sampleIds) {
          try {
            await teknoVault.loadSample(sampleId);
            newLoadedSamples.add(sampleId);
          } catch (error) {
            console.error(`Failed to load sample ${sampleId}:`, error);
          }
        }
        
        setLoadedSamples(newLoadedSamples);
      };
      
      loadSamples();
      
      // Cleanup function to release samples
      return () => {
        for (const sampleId of loadedSamples) {
          teknoVault.releaseSample(sampleId).catch(error => {
            console.error(`Failed to release sample ${sampleId}:`, error);
          });
        }
      };
    }
  }, [beat, teknoVault.isInitialized]);

  // Handle playback
  useEffect(() => {
    if (isPlaying && beat) {
      // Start playback
      const stepDuration = getStepDuration();
      
      intervalRef.current = setInterval(() => {
        setCurrentStep(prevStep => {
          const nextStep = (prevStep + 1) % 64;
          
          // Play samples for this step
          if (beat && teknoVault.isInitialized) {
            beat.patterns.forEach(pattern => {
              if (pattern.pattern.steps[nextStep]) {
                teknoVault.playSample(pattern.sampleId).catch(error => {
                  console.error(`Failed to play sample ${pattern.sampleId}:`, error);
                });
              }
            });
          }
          
          return nextStep;
        });
      }, stepDuration);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else if (intervalRef.current) {
      // Stop playback
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPlaying, beat, bpm, teknoVault.isInitialized]);

  // Update interval when BPM changes
  useEffect(() => {
    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      
      const stepDuration = getStepDuration();
      
      intervalRef.current = setInterval(() => {
        setCurrentStep(prevStep => {
          const nextStep = (prevStep + 1) % 64;
          
          // Play samples for this step
          if (beat && teknoVault.isInitialized) {
            beat.patterns.forEach(pattern => {
              if (pattern.pattern.steps[nextStep]) {
                teknoVault.playSample(pattern.sampleId).catch(error => {
                  console.error(`Failed to play sample ${pattern.sampleId}:`, error);
                });
              }
            });
          }
          
          return nextStep;
        });
      }, stepDuration);
    }
  }, [bpm]);

  // Handle step toggle
  const handleStepToggle = (patternIndex: number, stepIndex: number) => {
    if (!beat) return;
    
    // Create a deep copy of the beat
    const updatedBeat: ClaudeSoundDeploymentResponse = JSON.parse(JSON.stringify(beat));
    
    // Toggle the step
    updatedBeat.patterns[patternIndex].pattern.steps[stepIndex] = 
      !updatedBeat.patterns[patternIndex].pattern.steps[stepIndex];
    
    // Play the sample if the step was turned on
    if (updatedBeat.patterns[patternIndex].pattern.steps[stepIndex]) {
      teknoVault.playSample(updatedBeat.patterns[patternIndex].sampleId).catch(error => {
        console.error(`Failed to play sample ${updatedBeat.patterns[patternIndex].sampleId}:`, error);
      });
    }
  };

  // Play a sample
  const handlePlaySample = (sampleId: string) => {
    if (teknoVault.isInitialized) {
      teknoVault.playSample(sampleId).catch(error => {
        console.error(`Failed to play sample ${sampleId}:`, error);
      });
    }
  };

  return (
    <View style={styles.container}>
      <BeatVisualizer
        beat={beat}
        isPlaying={isPlaying}
        currentStep={currentStep}
        onStepToggle={handleStepToggle}
        onPlaySample={handlePlaySample}
      />
      
      <View style={styles.controls}>
        <View style={styles.bpmControl}>
          <Text style={styles.bpmLabel}>BPM:</Text>
          <TouchableOpacity
            style={styles.bpmButton}
            onPress={() => onBpmChange(Math.max(60, bpm - 5))}
          >
            <Text style={styles.bpmButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.bpmValue}>{bpm}</Text>
          
          <TouchableOpacity
            style={styles.bpmButton}
            onPress={() => onBpmChange(Math.min(180, bpm + 5))}
          >
            <Text style={styles.bpmButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.stopButton]}
          onPress={() => onPlayingChange(!isPlaying)}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Stop' : 'Play'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 8,
    overflow: 'hidden',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  bpmControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpmLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 8,
  },
  bpmButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpmButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bpmValue: {
    fontSize: 16,
    color: '#FFFFFF',
    marginHorizontal: 8,
    minWidth: 40,
    textAlign: 'center',
  },
  playButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  playButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default AudioEngine;
