import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform, TouchableWithoutFeedback } from 'react-native';
import { Canvas, Skia, Path, useValue, useComputedValue, 
  useClockValue, vec, Group, Paint, Circle, BlurMask, 
  useSharedValueEffect, useValueEffect } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withTiming, 
  withSpring, withRepeat, withDelay, Easing, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');
const INTERACTION_HEIGHT = 200;

// Define interfaces
interface AudioInteractionLayerProps {
  isActive: boolean;
  onParameterChange?: (parameter: string, value: number) => void;
  onTriggerSample?: (x: number, y: number) => void;
}

const AudioInteractionLayer = ({
  isActive,
  onParameterChange,
  onTriggerSample
}: AudioInteractionLayerProps) => {
  // Animation values
  const clock = useClockValue();
  const touchPoints = useValue<{x: number, y: number, radius: number, opacity: number, color: string}[]>([]);
  const waveAmplitude = useValue(0);
  const waveFrequency = useValue(5);
  
  // Reanimated shared values
  const animatedAmplitude = useSharedValue(0);
  const animatedFrequency = useSharedValue(5);
  const touchActive = useSharedValue(false);
  const touchX = useSharedValue(0);
  const touchY = useSharedValue(0);
  
  // Connect Reanimated shared values to Skia values
  useSharedValueEffect(() => {
    waveAmplitude.current = animatedAmplitude.value;
  }, animatedAmplitude);
  
  useSharedValueEffect(() => {
    waveFrequency.current = animatedFrequency.value;
  }, animatedFrequency);
  
  // Compute wave path
  const wavePath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    if (waveAmplitude.current <= 0) {
      path.moveTo(0, INTERACTION_HEIGHT / 2);
      path.lineTo(width, INTERACTION_HEIGHT / 2);
      return path;
    }
    
    path.moveTo(0, INTERACTION_HEIGHT / 2);
    
    const amplitude = waveAmplitude.current * 50; // Scale for visual effect
    const frequency = waveFrequency.current;
    const phase = (clock.current / 300) % (Math.PI * 2); // Moving phase
    
    for (let x = 0; x <= width; x += 5) {
      const y = INTERACTION_HEIGHT / 2 + 
        amplitude * Math.sin((x / width) * Math.PI * frequency + phase);
      path.lineTo(x, y);
    }
    
    return path;
  }, [clock, waveAmplitude, waveFrequency]);
  
  // Entrance animation
  useEffect(() => {
    if (isActive) {
      animatedAmplitude.value = withTiming(0.5, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      });
    } else {
      animatedAmplitude.value = withTiming(0, { 
        duration: 400, 
        easing: Easing.out(Easing.cubic) 
      });
    }
  }, [isActive]);
  
  // Setup pan gesture for parameter control
  const pan = Gesture.Pan()
    .onBegin((e) => {
      touchActive.value = true;
      touchX.value = e.x;
      touchY.value = e.y;
      
      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Add touch point
      const newTouchPoints = [...touchPoints.current];
      newTouchPoints.push({
        x: e.x,
        y: e.y,
        radius: 20,
        opacity: 0.8,
        color: getRandomColor()
      });
      touchPoints.current = newTouchPoints;
      
      // Update parameters based on touch position
      updateParameters(e.x, e.y);
    })
    .onUpdate((e) => {
      touchX.value = e.x;
      touchY.value = e.y;
      
      // Update parameters based on touch position
      updateParameters(e.x, e.y);
    })
    .onFinalize(() => {
      touchActive.value = false;
      
      // Fade out touch points
      const newTouchPoints = touchPoints.current.map(point => ({
        ...point,
        opacity: 0
      }));
      touchPoints.current = newTouchPoints;
      
      // Reset touch points after animation
      setTimeout(() => {
        touchPoints.current = [];
      }, 500);
    });
  
  // Setup tap gesture for triggering samples
  const tap = Gesture.Tap()
    .onBegin((e) => {
      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Add touch point with pulse animation
      const newTouchPoints = [...touchPoints.current];
      newTouchPoints.push({
        x: e.x,
        y: e.y,
        radius: 40,
        opacity: 0.9,
        color: getRandomColor()
      });
      touchPoints.current = newTouchPoints;
      
      // Trigger sample
      if (onTriggerSample) {
        runOnJS(onTriggerSample)(e.x, e.y);
      }
      
      // Create pulse effect
      animatedAmplitude.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0.5, { duration: 500 })
      );
    });
  
  // Combine gestures
  const gesture = Gesture.Exclusive(
    pan,
    tap
  );
  
  // Update parameters based on touch position
  const updateParameters = (x: number, y: number) => {
    if (!onParameterChange) return;
    
    // X position controls frequency
    const normalizedX = Math.max(0, Math.min(1, x / width));
    const frequencyValue = 1 + normalizedX * 10; // Range: 1-11
    animatedFrequency.value = withTiming(frequencyValue, { duration: 100 });
    onParameterChange('frequency', normalizedX);
    
    // Y position controls amplitude
    const normalizedY = 1 - Math.max(0, Math.min(1, y / INTERACTION_HEIGHT));
    onParameterChange('amplitude', normalizedY);
  };
  
  // Generate random color for touch points
  const getRandomColor = () => {
    const colors = [
      '#FF5252', // Red
      '#FF4081', // Pink
      '#7C4DFF', // Purple
      '#536DFE', // Indigo
      '#40C4FF', // Light Blue
      '#64FFDA', // Teal
      '#FFFF00', // Yellow
      '#FF6E40'  // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.interactionContainer}>
          <Canvas style={styles.canvas}>
            {/* Wave visualization */}
            <Path 
              path={wavePath}
              style="stroke"
              strokeWidth={3}
              strokeJoin="round"
              strokeCap="round"
              color={colors.primary}
            >
              <BlurMask blur={5} style="solid" />
            </Path>
            
            {/* Touch points */}
            {touchPoints.current.map((point, index) => (
              <Group key={index}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={point.radius}
                  color={`${point.color}${Math.floor(point.opacity * 255).toString(16).padStart(2, '0')}`}
                >
                  <BlurMask blur={20} style="solid" />
                </Circle>
              </Group>
            ))}
            
            {/* Grid lines for visual reference */}
            {Array.from({ length: 5 }).map((_, i) => {
              const y = (INTERACTION_HEIGHT / 4) * i;
              return (
                <Group key={`h-${i}`}>
                  <Path
                    path={(() => {
                      const path = Skia.Path.Make();
                      path.moveTo(0, y);
                      path.lineTo(width, y);
                      return path;
                    })()}
                    style="stroke"
                    strokeWidth={1}
                    color="rgba(255, 255, 255, 0.1)"
                  />
                </Group>
              );
            })}
            
            {Array.from({ length: 11 }).map((_, i) => {
              const x = (width / 10) * i;
              return (
                <Group key={`v-${i}`}>
                  <Path
                    path={(() => {
                      const path = Skia.Path.Make();
                      path.moveTo(x, 0);
                      path.lineTo(x, INTERACTION_HEIGHT);
                      return path;
                    })()}
                    style="stroke"
                    strokeWidth={1}
                    color="rgba(255, 255, 255, 0.1)"
                  />
                </Group>
              );
            })}
          </Canvas>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  interactionContainer: {
    width: '100%',
    height: INTERACTION_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  canvas: {
    flex: 1,
  },
});

export default AudioInteractionLayer;
