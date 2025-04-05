import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text, TouchableOpacity } from 'react-native';
import { Canvas, Skia, Path, useValue, useComputedValue, 
  useClockValue, vec, Group, Paint, Shader, RuntimeShader, Circle, 
  BlurMask, Rect, Line, useSharedValueEffect, useValueEffect } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withTiming, 
  withSpring, withRepeat, withDelay, Easing, runOnJS, withSequence } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

const { width } = Dimensions.get('window');
const VISUALIZER_HEIGHT = 300;
const NUM_STEPS = 16;
const STEP_WIDTH = width / NUM_STEPS;
const PADDING = 16;

// Advanced beat visualizer shader with dynamic effects
const BEAT_SHADER = `
uniform float time;
uniform float amplitude;
uniform vec4 color;
uniform vec4 resolution;
uniform float beat;

half4 main(vec2 pos) {
  vec2 uv = pos / resolution.xy;
  
  // Create pulsing effect based on time and amplitude
  float pulse = sin(time * 2.0 + uv.x * 10.0) * amplitude * 0.3;
  
  // Add beat-reactive pulse
  float beatPulse = beat * 0.2 * sin(uv.y * 20.0);
  
  // Create gradient based on position
  vec4 gradientColor = mix(color, color * 1.5, uv.y);
  
  // Add glow effect
  float glow = smoothstep(0.4, 0.5, amplitude) * sin(time * 3.0) * 0.2;
  
  // Add beat-reactive glow
  float beatGlow = beat * 0.3;
  
  // Combine effects
  vec4 finalColor = gradientColor + vec4(glow + beatGlow, glow + beatGlow, glow + beatGlow, 0.0);
  finalColor.a = color.a;
  
  return half4(finalColor);
}
`;

// Define interfaces
interface Instruments {
  [instrument: string]: (boolean | number)[];
}

interface SkiaBeatVisualizerProps {
  instruments: Instruments;
  currentStep: number | null;
  isEditing: boolean;
  onStepToggle: (instrument: string, stepIndex: number) => void;
  onPlaybackStart?: () => void;
  onPlaybackStop?: () => void;
}

const SkiaBeatVisualizer = ({
  instruments,
  currentStep,
  isEditing,
  onStepToggle,
  onPlaybackStart,
  onPlaybackStop
}: SkiaBeatVisualizerProps) => {
  // Animation values
  const clock = useClockValue();
  const progress = useValue(0);
  const amplitude = useValue(0);
  const rotation = useValue(0);
  const scale = useValue(0.95);
  const beat = useValue(0);
  
  // Reanimated shared values for advanced animations
  const animatedBeat = useSharedValue(0);
  const animatedScale = useSharedValue(0.95);
  const animatedRotation = useSharedValue(0);
  const animatedProgress = useSharedValue(0);
  const pressed = useSharedValue(false);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  
  // Create shader instance
  const shader = Skia.RuntimeEffect.Make(BEAT_SHADER);
  
  // Connect Reanimated shared values to Skia values
  useSharedValueEffect(() => {
    beat.current = animatedBeat.value;
  }, animatedBeat);
  
  useSharedValueEffect(() => {
    scale.current = animatedScale.value;
  }, animatedScale);
  
  useSharedValueEffect(() => {
    rotation.current = animatedRotation.value;
  }, animatedRotation);
  
  useSharedValueEffect(() => {
    progress.current = animatedProgress.value;
  }, animatedProgress);
  
  // Compute shader uniforms
  const uniforms = useComputedValue(() => {
    return {
      time: clock.current / 1000,
      amplitude: amplitude.current,
      color: [0.4, 0.6, 1.0, 1.0], // Blue base color
      resolution: [width, VISUALIZER_HEIGHT, 0, 0],
      beat: beat.current
    };
  }, [clock, amplitude, beat]);
  
  // Compute paths for each instrument
  const instrumentPaths = useComputedValue(() => {
    const paths = {};
    
    Object.entries(instruments).forEach(([instrument, pattern]) => {
      const path = Skia.Path.Make();
      
      // Start path at the beginning
      path.moveTo(PADDING, VISUALIZER_HEIGHT / 2);
      
      // Create dynamic path based on pattern
      pattern.forEach((active, index) => {
        const x = PADDING + (index * STEP_WIDTH);
        const isActive = !!active;
        const intensity = isActive ? 1 : 0.1;
        
        // Calculate y position based on instrument and activity
        let yOffset = 0;
        switch(instrument) {
          case 'kick':
            yOffset = isActive ? -80 : -10;
            break;
          case 'snare':
            yOffset = isActive ? 60 : 10;
            break;
          case 'hihat':
            yOffset = isActive ? -40 : -5;
            break;
          case 'bass':
            yOffset = isActive ? 80 : 15;
            break;
        }
        
        // Add point to path with dynamic curve
        const y = (VISUALIZER_HEIGHT / 2) + yOffset * intensity;
        
        if (index === 0) {
          path.moveTo(x, y);
        } else {
          // Create smooth curve between points
          const prevX = PADDING + ((index - 1) * STEP_WIDTH);
          const controlX = (prevX + x) / 2;
          path.cubicTo(
            controlX, y - 20 * intensity,
            controlX, y + 20 * intensity,
            x, y
          );
        }
      });
      
      // Complete the path
      path.lineTo(width - PADDING, VISUALIZER_HEIGHT / 2);
      
      paths[instrument] = path;
    });
    
    return paths;
  }, [instruments]);
  
  // Handle current step animation with advanced effects
  useEffect(() => {
    if (currentStep !== null) {
      // Pulse beat animation
      animatedBeat.value = withSequence(
        withTiming(1, { duration: 100, easing: Easing.out(Easing.exp) }),
        withTiming(0.3, { duration: 300, easing: Easing.inOut(Easing.cubic) })
      );
      
      // Animate amplitude for current step
      amplitude.current = 0.8;
      setTimeout(() => {
        amplitude.current = 0.3;
      }, 100);
      
      // Rotate with spring physics for organic feel
      animatedRotation.value = withSequence(
        withSpring((currentStep % 2 === 0) ? 0.5 : -0.5, { 
          damping: 10, 
          stiffness: 90,
          mass: 0.5
        }),
        withDelay(
          100,
          withSpring(0, { 
            damping: 8, 
            stiffness: 80,
            mass: 0.5
          })
        )
      );
    }
  }, [currentStep]);
  
  // Entrance animation with sophisticated physics
  useEffect(() => {
    // Reset initial values
    animatedProgress.value = 0;
    animatedScale.value = 0.95;
    animatedBeat.value = 0;
    
    // Animate in with staggered sequence
    const animateIn = () => {
      // Progress animation
      animatedProgress.value = withTiming(1, { 
        duration: 800, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });
      
      // Scale animation with spring physics
      animatedScale.value = withSpring(1, { 
        damping: 12, 
        stiffness: 100,
        mass: 1,
        restDisplacementThreshold: 0.01
      });
      
      // Beat animation
      animatedBeat.value = withSequence(
        withTiming(0.6, { duration: 400, easing: Easing.out(Easing.cubic) }),
        withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.cubic) })
      );
      
      // Amplitude animation
      amplitude.current = withTiming(0.3, { duration: 1000 });
    };
    
    // Start animation after a short delay
    setTimeout(animateIn, 100);
    
    // Setup continuous subtle animation for ambient motion
    const ambientAnimation = () => {
      animatedRotation.value = withRepeat(
        withTiming(0.2, { duration: 4000, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      );
    };
    
    // Start ambient animation after entrance
    setTimeout(ambientAnimation, 1000);
  }, []);
  
  // Setup tap gesture for step toggling with haptic feedback
  const tap = Gesture.Tap()
    .onBegin((e) => {
      pressed.value = true;
      startX.value = e.x;
      startY.value = e.y;
    })
    .onFinalize((e) => {
      if (isEditing) {
        // Calculate which step was tapped
        const stepIndex = Math.floor((e.x - PADDING) / STEP_WIDTH);
        
        // Calculate which instrument was tapped
        const instrumentIndex = Math.floor(e.y / (VISUALIZER_HEIGHT / Object.keys(instruments).length));
        const instrument = Object.keys(instruments)[instrumentIndex];
        
        // Toggle step if valid
        if (stepIndex >= 0 && stepIndex < NUM_STEPS && instrument) {
          // Trigger haptic feedback
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          
          // Animate tap response
          animatedBeat.value = withSequence(
            withTiming(0.8, { duration: 100, easing: Easing.out(Easing.exp) }),
            withTiming(0.3, { duration: 300, easing: Easing.inOut(Easing.cubic) })
          );
          
          runOnJS(onStepToggle)(instrument, stepIndex);
        }
      }
      
      pressed.value = false;
    });
  
  // Get color for instrument
  const getInstrumentColor = (instrument: string): string => {
    switch(instrument.toLowerCase()) {
      case 'kick':
        return colors.kickDrum || '#FF5252';
      case 'snare':
        return colors.snare || '#FFD740';
      case 'hihat':
        return colors.hiHat || '#40C4FF';
      case 'bass':
        return colors.bass || '#7C4DFF';
      default:
        return '#FFFFFF';
    }
  };
  
  // Convert hex color to RGBA array
  const hexToRgba = (hex: string, alpha = 1): number[] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b, alpha];
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.visualizerHeader}>
        <Text style={styles.visualizerTitle}>
          {isEditing ? 'Beat Düzenleyici' : 'Beat Görüntüleyici'}
        </Text>
        
        {isEditing && (
          <View style={styles.editingBadge}>
            <LinearGradient
              colors={gradients.purpleToNeonBlue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.editingBadgeText}>Düzenleme</Text>
          </View>
        )}
      </View>
      
      <GestureDetector gesture={tap}>
        <View style={styles.canvasContainer}>
          <Canvas style={styles.canvas}>
            {/* Background with advanced shader effect */}
            <Paint>
              <RuntimeShader source={BEAT_SHADER} uniforms={uniforms} />
            </Paint>
            <Rect x={0} y={0} width={width} height={VISUALIZER_HEIGHT} />
            
            {/* Current step indicator with glow effect */}
            {currentStep !== null && (
              <Group>
                <Rect 
                  x={PADDING + (currentStep * STEP_WIDTH) - 2}
                  y={0}
                  width={STEP_WIDTH + 4}
                  height={VISUALIZER_HEIGHT}
                  color="rgba(255, 255, 255, 0.1)"
                >
                  <BlurMask blur={10 + beat.current * 20} style="normal" />
                </Rect>
              </Group>
            )}
            
            {/* Instrument paths with dynamic animations */}
            <Group transform={[
              { scale: scale.current },
              { rotate: rotation.current }
            ]}>
              {Object.entries(instruments).map(([instrument, pattern], index) => {
                const path = instrumentPaths.current[instrument];
                const baseColor = getInstrumentColor(instrument);
                const rgbaColor = hexToRgba(baseColor);
                
                return (
                  <Group key={instrument}>
                    {/* Main path with dynamic stroke */}
                    <Path 
                      path={path}
                      style="stroke"
                      strokeWidth={4 + beat.current * 2}
                      strokeJoin="round"
                      strokeCap="round"
                      color={baseColor}
                    >
                      <BlurMask blur={amplitude.current * 10} style="solid" />
                    </Path>
                    
                    {/* Glow effect with dynamic blur */}
                    <Path 
                      path={path}
                      style="stroke"
                      strokeWidth={8 + beat.current * 4}
                      strokeJoin="round"
                      strokeCap="round"
                      color={`rgba(${rgbaColor[0]*255}, ${rgbaColor[1]*255}, ${rgbaColor[2]*255}, ${0.3 + beat.current * 0.2})`}
                    >
                      <BlurMask blur={20 + beat.current * 10} style="solid" />
                    </Path>
                    
                    {/* Step circles with reactive animations */}
                    {pattern.map((active, stepIndex) => {
                      const isActive = !!active;
                      const x = PADDING + (stepIndex * STEP_WIDTH);
                      const y = VISUALIZER_HEIGHT / 2;
                      const size = isActive ? 12 : 6;
                      const opacity = isActive ? 1 : 0.3;
                      const isCurrentStep = currentStep === stepIndex;
                      
                      return (
                        <Group key={`${instrument}_${stepIndex}`}>
                          {/* Main circle */}
                          <Circle 
                            cx={x} 
                            cy={y} 
                            r={size + (isCurrentStep ? beat.current * 10 : 0)}
                            color={`rgba(${rgbaColor[0]*255}, ${rgbaColor[1]*255}, ${rgbaColor[2]*255}, ${opacity})`}
                          >
                            {isActive && (
                              <BlurMask blur={5 + (isCurrentStep ? beat.current * 5 : 0)} style="solid" />
                            )}
                          </Circle>
                          
                          {/* Reactive glow for active steps */}
                          {isActive && (
                            <Circle 
                              cx={x} 
                              cy={y} 
                              r={size * 1.5 + (isCurrentStep ? beat.current * 15 : 0)}
                              color={`rgba(${rgbaColor[0]*255}, ${rgbaColor[1]*255}, ${rgbaColor[2]*255}, ${(isCurrentStep ? beat.current * 0.7 : 0.2)})`}
                            >
                              <BlurMask blur={15 + (isCurrentStep ? beat.current * 10 : 0)} style="solid" />
                            </Circle>
                          )}
                          
                          {/* Extra pulse for current step */}
                          {isActive && isCurrentStep && (
                            <Circle 
                              cx={x} 
                              cy={y} 
                              r={size * 2.5 + beat.current * 20}
                              color={`rgba(${rgbaColor[0]*255}, ${rgbaColor[1]*255}, ${rgbaColor[2]*255}, ${beat.current * 0.4})`}
                            >
                              <BlurMask blur={30} style="solid" />
                            </Circle>
                          )}
                        </Group>
                      );
                    })}
                  </Group>
                );
              })}
            </Group>
            
            {/* Beat markers with subtle animations */}
            {Array.from({ length: NUM_STEPS }).map((_, index) => {
              const isMajorBeat = index % 4 === 0;
              const x = PADDING + (index * STEP_WIDTH);
              const isCurrentBeat = currentStep === index;
              
              return (
                <Group key={`marker_${index}`}>
                  <Line 
                    p1={vec(x, 10)}
                    p2={vec(x, isMajorBeat ? 20 + (isCurrentBeat ? beat.current * 10 : 0) : 15)}
                    color={isMajorBeat 
                      ? `rgba(255, 255, 255, ${0.8 + (isCurrentBeat ? beat.current * 0.2 : 0)})`
                      : `rgba(255, 255, 255, ${0.4 + (isCurrentBeat ? beat.current * 0.2 : 0)})`
                    }
                    style="stroke"
                    strokeWidth={isMajorBeat ? 2 : 1}
                  >
                    {isCurrentBeat && (
                      <BlurMask blur={beat.current * 5} style="solid" />
                    )}
                  </Line>
                </Group>
              );
            })}
          </Canvas>
        </View>
      </GestureDetector>
      
      <View style={styles.instrumentLabels}>
        {Object.keys(instruments).map((instrument) => (
          <View key={`label_${instrument}`} style={styles.instrumentLabelContainer}>
            <View 
              style={[
                styles.instrumentColorDot, 
                { backgroundColor: getInstrumentColor(instrument) }
              ]} 
            />
            <Text style={styles.instrumentLabel}>
              {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  visualizerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  visualizerTitle: {
    ...globalStyles.heading3,
    color: colors.textPrimary,
  },
  editingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editingBadgeText: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  canvasContainer: {
    width: '100%',
    height: VISUALIZER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
  instrumentLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  instrumentLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instrumentColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  instrumentLabel: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
  },
});

export default SkiaBeatVisualizer;
