import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

const { width } = Dimensions.get('window');

// --- Define Interfaces ---
interface Instruments {
  [instrument: string]: (boolean | number)[]; 
}

interface BeatVisualizerProps {
  instruments: Instruments;
  currentStep: number | null; 
  isEditing: boolean;
  onStepToggle: (instrument: string, stepIndex: number) => void;
}
// --- End Interfaces ---

const BeatVisualizer = ({ 
  instruments, 
  currentStep, 
  isEditing, 
  onStepToggle 
}: BeatVisualizerProps) => {
  // Number of steps to display
  const numSteps = 16;
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Memoized step animations
  const stepAnimations = useRef<{[key: string]: Animated.Value}>({}).current;
  
  // Initialize step animations
  useEffect(() => {
    Object.keys(instruments).forEach(instrument => {
      for (let i = 0; i < numSteps; i++) {
        const key = `${instrument}_${i}`;
        if (!stepAnimations[key]) {
          stepAnimations[key] = new Animated.Value(instruments[instrument][i] ? 1 : 0);
        }
      }
    });
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Update step animations when instruments change
  useEffect(() => {
    Object.keys(instruments).forEach(instrument => {
      for (let i = 0; i < numSteps; i++) {
        const key = `${instrument}_${i}`;
        const targetValue = instruments[instrument][i] ? 1 : 0;
        
        Animated.spring(stepAnimations[key], {
          toValue: targetValue,
          friction: 8,
          tension: 40,
          useNativeDriver: false,
        }).start();
      }
    });
  }, [instruments]);
  
  // Current step highlight animation
  const currentStepAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (currentStep !== null) {
      Animated.sequence([
        Animated.timing(currentStepAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(currentStepAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: false,
        })
      ]).start();
    } else {
      currentStepAnim.setValue(0);
    }
  }, [currentStep]);
  
  // Memoized step toggle handler
  const handleStepToggle = useCallback((instrument: string, stepIndex: number) => {
    if (!isEditing) return;
    onStepToggle(instrument, stepIndex);
  }, [isEditing, onStepToggle]);
  
  // Render instrument row
  const renderInstrumentRow = useCallback((instrument: string, pattern: (boolean | number)[]) => {
    return (
      <View key={instrument} style={styles.instrumentRow}>
        <View style={styles.instrumentLabelContainer}>
          <Text style={styles.instrumentLabel}>{instrument}</Text>
        </View>
        
        <View style={styles.stepsContainer}>
          {Array.from({ length: numSteps }).map((_, index) => {
            const key = `${instrument}_${index}`;
            const isActive = !!pattern[index];
            const isCurrentStep = currentStep === index;
            const animationValue = stepAnimations[key];

            const animatedStyle = animationValue
              ? {
                  backgroundColor: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.inactiveStep, getInstrumentColor(instrument)]
                  }),
                  transform: [
                    { 
                      scale: animationValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
                      }) 
                    }
                  ],
                  opacity: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1]
                  })
                }
              : {
                  backgroundColor: isActive ? getInstrumentColor(instrument) : colors.inactiveStep,
                  transform: [{ scale: isActive ? 1 : 0.8 }],
                  opacity: isActive ? 1 : 0.6,
                };

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.step,
                  isEditing && styles.editableStep
                ]}
                onPress={() => handleStepToggle(instrument, index)}
                activeOpacity={isEditing ? 0.6 : 1}
              >
                <Animated.View
                  style={[
                    styles.stepInner,
                    animatedStyle
                  ]}
                >
                  {isCurrentStep && (
                    <Animated.View
                      style={[
                        StyleSheet.absoluteFill,
                        styles.currentStepHighlight,
                        {
                          opacity: currentStepAnim
                        }
                      ]}
                    >
                      <Text style={{ opacity: 0 }}>.</Text>
                    </Animated.View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }, [currentStep, isEditing, handleStepToggle, stepAnimations, currentStepAnim]);
  
  // Get color based on instrument type
  const getInstrumentColor = (instrument: string): string => {
    switch(instrument.toLowerCase()) {
      case 'kick':
        return colors.kickDrum;
      case 'snare':
        return colors.snare;
      case 'hihat':
        return colors.hiHat;
      case 'bass':
        return colors.bass;
      default:
        return colors.activeStep;
    }
  };
  
  // Render beat markers (1, 5, 9, 13)
  const renderBeatMarkers = useCallback(() => {
    return (
      <View style={styles.beatMarkersContainer}>
        <View style={styles.instrumentLabelContainer} />
        
        <View style={styles.stepsContainer}>
          {Array.from({ length: numSteps }).map((_, index) => (
            <View key={index} style={styles.beatMarkerStep}>
              {(index === 0 || index === 4 || index === 8 || index === 12) && (
                <Text style={styles.beatMarkerText}>{index + 1}</Text>
              )}
              {!(index === 0 || index === 4 || index === 8 || index === 12) && (
                <Text style={{ opacity: 0 }}>.</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }, [numSteps]);
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.visualizerHeader}>
        <Text style={styles.visualizerTitle}>
          {isEditing ? 'Edit Beat Pattern' : 'Beat Visualizer'}
        </Text>
        
        {isEditing && (
          <View style={styles.editingBadge}>
            <LinearGradient
              colors={gradients.purpleToNeonBlue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            >
              <Text style={{ opacity: 0 }}>.</Text>
            </LinearGradient>
            <Text style={styles.editingBadgeText}>Editing</Text>
          </View>
        )}
      </View>
      
      {renderBeatMarkers()}
      
      <View style={styles.instrumentsContainer}>
        {Object.entries(instruments).map(([instrument, pattern]) => 
          renderInstrumentRow(instrument, pattern as (boolean | number)[])
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...globalStyles.shadowLight,
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
  beatMarkersContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instrumentsContainer: {
    width: '100%',
  },
  instrumentRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instrumentLabelContainer: {
    width: 60,
    justifyContent: 'center',
  },
  instrumentLabel: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  stepsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  step: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInner: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  editableStep: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
  },
  currentStepHighlight: {
    backgroundColor: colors.white50,
    borderRadius: 4,
  },
  beatMarkerStep: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  beatMarkerText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
});

export default React.memo(BeatVisualizer);
