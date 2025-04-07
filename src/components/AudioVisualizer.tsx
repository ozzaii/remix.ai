/**
 * Audio Visualization Component for REMIX.AI
 * 
 * This component provides real-time visualization of audio playback,
 * enhancing the user experience with visual feedback.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../state';
import { useAudioEngineService } from '../services';
import { ComponentErrorBoundary } from '../core';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Number of bars in the visualizer
const BAR_COUNT = 32;

// Bar configuration
const BAR_WIDTH = (width - 40) / BAR_COUNT;
const BAR_MARGIN = 1;
const MAX_BAR_HEIGHT = 150;

/**
 * Audio Visualizer component that displays real-time visualization
 * of audio playback with animated bars.
 */
export const AudioVisualizer = () => {
  const { isPlaying, currentStep } = useAudio();
  const audioEngineService = useAudioEngineService();
  
  // Animation values for each bar
  const barHeights = useRef(
    Array(BAR_COUNT).fill(0).map(() => new Animated.Value(0))
  ).current;
  
  // Generate random heights for visualization
  const generateRandomHeights = () => {
    return Array(BAR_COUNT).fill(0).map(() => Math.random() * MAX_BAR_HEIGHT);
  };
  
  // Animate bars based on playback
  useEffect(() => {
    if (!isPlaying) {
      // Reset all bars when not playing
      Animated.parallel(
        barHeights.map(height => 
          Animated.timing(height, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          })
        )
      ).start();
      return;
    }
    
    // Function to animate bars
    const animateBars = () => {
      if (!isPlaying) return;
      
      const newHeights = generateRandomHeights();
      
      // Create animations for each bar
      const animations = barHeights.map((height, index) => 
        Animated.timing(height, {
          toValue: newHeights[index],
          duration: 100 + Math.random() * 200, // Varied animation duration
          useNativeDriver: false,
        })
      );
      
      // Run animations in parallel
      Animated.parallel(animations).start(() => {
        if (isPlaying) {
          animateBars();
        }
      });
    };
    
    // Start animation
    animateBars();
    
    // Cleanup
    return () => {
      Animated.parallel(
        barHeights.map(height => 
          Animated.timing(height, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          })
        )
      ).start();
    };
  }, [isPlaying]);
  
  // Add step listener to highlight bars on beat
  useEffect(() => {
    // Function to handle step changes
    const handleStepChange = (step: number | null) => {
      if (step === null) return;
      
      // Highlight bars on beat
      const beatBars = [step * 2, step * 2 + 1];
      
      beatBars.forEach(barIndex => {
        if (barIndex < BAR_COUNT) {
          Animated.sequence([
            Animated.timing(barHeights[barIndex], {
              toValue: MAX_BAR_HEIGHT,
              duration: 50,
              useNativeDriver: false,
            }),
            Animated.timing(barHeights[barIndex], {
              toValue: Math.random() * MAX_BAR_HEIGHT * 0.7,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      });
    };
    
    // Add step listener to audio engine
    const unsubscribe = audioEngineService.addStepListener(handleStepChange);
    
    // Cleanup
    return unsubscribe;
  }, []);
  
  return (
    <ComponentErrorBoundary componentName="AudioVisualizer">
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(10, 132, 255, 0.8)', 'rgba(94, 92, 230, 0.8)']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.visualizer}>
            {barHeights.map((height, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: index % 4 === 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                  },
                ]}
              />
            ))}
          </View>
        </LinearGradient>
      </View>
    </ComponentErrorBoundary>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    height: 180,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: MAX_BAR_HEIGHT,
  },
  bar: {
    width: BAR_WIDTH - BAR_MARGIN * 2,
    marginHorizontal: BAR_MARGIN,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default AudioVisualizer;
