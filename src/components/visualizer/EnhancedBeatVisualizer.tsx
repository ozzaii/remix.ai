import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import { Track, Step, ParameterLock } from '../../services/audioEngine/enhancedAudioEngine';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// --- Define Interfaces ---
interface EnhancedBeatVisualizerProps {
  tracks: Track[];
  currentStep: number | null;
  isEditing: boolean;
  totalSteps: number; // 16, 32, or 64
  onStepToggle: (trackId: string, stepIndex: number) => void;
  onStepEdit: (trackId: string, stepIndex: number, step: Partial<Step>) => void;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
}
// --- End Interfaces ---

const EnhancedBeatVisualizer = ({
  tracks,
  currentStep,
  isEditing,
  totalSteps,
  onStepToggle,
  onStepEdit,
  onTrackMute,
  onTrackSolo
}: EnhancedBeatVisualizerProps) => {
  // State for visible step range (for scrolling)
  const [visibleStepRange, setVisibleStepRange] = useState({ start: 0, end: Math.min(16, totalSteps) });
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Scroll ref
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Memoized step animations
  const stepAnimations = useRef<{[key: string]: Animated.Value}>({}).current;
  
  // Initialize step animations
  useEffect(() => {
    tracks.forEach(track => {
      for (let i = 0; i < totalSteps; i++) {
        const key = `${track.id}_${i}`;
        if (!stepAnimations[key]) {
          stepAnimations[key] = new Animated.Value(track.steps[i]?.active ? 1 : 0);
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
  
  // Update step animations when tracks change
  useEffect(() => {
    tracks.forEach(track => {
      for (let i = 0; i < totalSteps; i++) {
        const key = `${track.id}_${i}`;
        const targetValue = track.steps[i]?.active ? 1 : 0;
        
        if (stepAnimations[key]) {
          Animated.spring(stepAnimations[key], {
            toValue: targetValue,
            friction: 8,
            tension: 40,
            useNativeDriver: false,
          }).start();
        }
      }
    });
  }, [tracks]);
  
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
      
      // Auto-scroll to keep current step visible
      if (scrollViewRef.current && currentStep >= 0) {
        // Calculate if current step is outside visible range
        if (currentStep < visibleStepRange.start || currentStep >= visibleStepRange.end) {
          // Calculate new visible range
          const stepsPerPage = visibleStepRange.end - visibleStepRange.start;
          const newStart = Math.max(0, Math.floor(currentStep / stepsPerPage) * stepsPerPage);
          const newEnd = Math.min(totalSteps, newStart + stepsPerPage);
          
          // Scroll to new position
          scrollViewRef.current.scrollTo({
            x: (newStart / totalSteps) * width * 3, // Adjust multiplier based on your layout
            animated: true
          });
          
          // Update visible range
          setVisibleStepRange({ start: newStart, end: newEnd });
        }
      }
    } else {
      currentStepAnim.setValue(0);
    }
  }, [currentStep]);
  
  // Memoized step toggle handler with haptic feedback
  const handleStepToggle = useCallback((trackId: string, stepIndex: number) => {
    if (!isEditing) return;
    
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onStepToggle(trackId, stepIndex);
  }, [isEditing, onStepToggle]);
  
  // Handle long press for step editing
  const handleStepLongPress = useCallback((trackId: string, stepIndex: number) => {
    if (!isEditing) return;
    
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // TODO: Show step edit modal
    console.log(`Long press on step ${stepIndex} of track ${trackId}`);
    
    // For now, just toggle probability between 1.0 and 0.5
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      const currentProb = track.steps[stepIndex].probability;
      onStepEdit(trackId, stepIndex, { 
        probability: currentProb === 1.0 ? 0.5 : 1.0 
      });
    }
  }, [isEditing, tracks, onStepEdit]);
  
  // Handle track mute/solo
  const handleTrackMute = useCallback((trackId: string) => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onTrackMute(trackId);
  }, [onTrackMute]);
  
  const handleTrackSolo = useCallback((trackId: string) => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onTrackSolo(trackId);
  }, [onTrackSolo]);
  
  // Render track row
  const renderTrackRow = useCallback((track: Track) => {
    return (
      <View key={track.id} style={styles.trackRow}>
        <View style={styles.trackLabelContainer}>
          <Text style={styles.trackLabel}>{track.name}</Text>
          
          <View style={styles.trackControls}>
            <TouchableOpacity
              style={[styles.trackControlButton, track.mute && styles.trackControlActive]}
              onPress={() => handleTrackMute(track.id)}
            >
              <Text style={[styles.trackControlText, track.mute && styles.trackControlTextActive]}>M</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.trackControlButton, track.solo && styles.trackControlActive]}
              onPress={() => handleTrackSolo(track.id)}
            >
              <Text style={[styles.trackControlText, track.solo && styles.trackControlTextActive]}>S</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stepsScrollView}
          contentContainerStyle={styles.stepsContainer}
          onScroll={(e) => {
            // Calculate visible step range based on scroll position
            const scrollX = e.nativeEvent.contentOffset.x;
            const viewWidth = e.nativeEvent.layoutMeasurement.width;
            const contentWidth = e.nativeEvent.contentSize.width;
            
            const stepsPerPage = Math.floor((viewWidth / contentWidth) * totalSteps);
            const startStep = Math.floor((scrollX / contentWidth) * totalSteps);
            const endStep = Math.min(totalSteps, startStep + stepsPerPage);
            
            setVisibleStepRange({ start: startStep, end: endStep });
          }}
          scrollEventThrottle={16}
        >
          {Array.from({ length: totalSteps }).map((_, index) => {
            const key = `${track.id}_${index}`;
            const step = track.steps[index] || { active: false, velocity: 1.0, probability: 1.0, parameterLocks: [], microTiming: 0 };
            const isActive = step.active;
            const isCurrentStep = currentStep === index;
            const animationValue = stepAnimations[key];
            
            // Calculate color based on velocity and probability
            const getStepColor = () => {
              const baseColor = getTrackColor(track.id);
              
              // If not active, return inactive color
              if (!isActive) return colors.inactiveStep;
              
              // For current step, use diamond color with glow effect
              if (isCurrentStep) {
                return colors.diamond;
              }
              
              // Adjust opacity based on probability
              const alpha = Math.max(0.4, step.probability);
              
              // Convert hex to rgba with enhanced colors
              const r = parseInt(baseColor.slice(1, 3), 16);
              const g = parseInt(baseColor.slice(3, 5), 16);
              const b = parseInt(baseColor.slice(5, 7), 16);
              
              return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            
            const animatedStyle = animationValue
              ? {
                  backgroundColor: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.inactiveStep, getStepColor()]
                  }),
                  transform: [
                    { 
                      scale: animationValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1 + (step.velocity * 0.2)]
                      }) 
                    }
                  ],
                  opacity: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, step.probability]
                  })
                }
              : {
                  backgroundColor: getStepColor(),
                  transform: [{ scale: isActive ? 1 + (step.velocity * 0.2) : 0.8 }],
                  opacity: isActive ? step.probability : 0.6,
                };
            
            // Show parameter lock indicator
            const hasParameterLocks = step.parameterLocks && step.parameterLocks.length > 0;
            
            // Show micro-timing indicator
            const hasMicroTiming = step.microTiming !== 0;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.step,
                  isEditing && styles.editableStep,
                  // Highlight every 4th step
                  index % 16 === 0 && styles.mainBeatStep,
                  index % 4 === 0 && styles.quarterBeatStep
                ]}
                onPress={() => handleStepToggle(track.id, index)}
                onLongPress={() => handleStepLongPress(track.id, index)}
                delayLongPress={300}
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
                    />
                  )}
                  
                  {hasParameterLocks && (
                    <View style={styles.paramLockIndicator} />
                  )}
                  
                  {hasMicroTiming && (
                    <View style={[
                      styles.microTimingIndicator,
                      step.microTiming > 0 ? styles.microTimingLate : styles.microTimingEarly
                    ]} />
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }, [currentStep, isEditing, handleStepToggle, handleStepLongPress, stepAnimations, currentStepAnim, totalSteps, visibleStepRange]);
  
  // Get color based on track type
  const getTrackColor = (trackId: string): string => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return colors.activeStep;
    
    if (trackId.includes('kick')) return colors.kickDrum;
    if (trackId.includes('snare')) return colors.snare;
    if (trackId.includes('hat')) return colors.hiHat;
    if (trackId.includes('bass')) return colors.bass;
    if (trackId.includes('fx')) return colors.fx;
    if (trackId.includes('synth')) return colors.synth;
    
    return colors.activeStep;
  };
  
  // Render beat markers (1, 5, 9, 13, etc.)
  const renderBeatMarkers = useCallback(() => {
    return (
      <View style={styles.beatMarkersContainer}>
        <View style={styles.trackLabelContainer} />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stepsScrollView}
          contentContainerStyle={styles.stepsContainer}
          scrollEnabled={false}
        >
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.beatMarkerStep,
                // Highlight every 4th step
                index % 16 === 0 && styles.mainBeatMarker,
                index % 4 === 0 && styles.quarterBeatMarker
              ]}
            >
              {(index % 16 === 0) && (
                <Text style={styles.beatMarkerText}>{index + 1}</Text>
              )}
              {(index % 4 === 0 && index % 16 !== 0) && (
                <View style={styles.beatMarkerDot} />
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }, [totalSteps]);
  
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
        
        <View style={styles.headerControls}>
          {isEditing && (
            <View style={styles.editingBadge}>
              <LinearGradient
                colors={gradients.purpleToNeonBlue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.editingBadgeText}>Editing</Text>
            </View>
          )}
          
          <View style={styles.stepCountBadge}>
            <Text style={styles.stepCountText}>{totalSteps} Steps</Text>
          </View>
        </View>
      </View>
      
      {renderBeatMarkers()}
      
      <View style={styles.tracksContainer}>
        {tracks.map(track => renderTrackRow(track))}
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Active Step</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.paramLockIndicator, { position: 'relative' }]} />
          <Text style={styles.legendText}>Parameter Lock</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { opacity: 0.5 }]} />
          <Text style={styles.legendText}>Probability &lt; 100%</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.microTimingIndicator, styles.microTimingLate, { position: 'relative' }]} />
          <Text style={styles.legendText}>Micro-timing</Text>
        </View>
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
    ...globalStyles.shadowMedium,
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
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
  },
  editingBadgeText: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stepCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.cardBorder,
  },
  stepCountText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  beatMarkersContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tracksContainer: {
    width: '100%',
  },
  trackRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  trackLabelContainer: {
    width: 80,
    justifyContent: 'center',
  },
  trackLabel: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  trackControls: {
    flexDirection: 'row',
    marginTop: 4,
  },
  trackControlButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  trackControlActive: {
    backgroundColor: colors.accentPrimary,
  },
  trackControlText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 10,
  },
  trackControlTextActive: {
    color: colors.textPrimary,
  },
  stepsScrollView: {
    flex: 1,
  },
  stepsContainer: {
    flexDirection: 'row',
    paddingRight: 16, // Add some padding at the end
  },
  step: {
    width: 30,
    height: 30,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  stepInner: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editableStep: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
  },
  mainBeatStep: {
    borderColor: colors.accentPrimary,
    borderWidth: 1,
  },
  quarterBeatStep: {
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  currentStepHighlight: {
    backgroundColor: colors.white50,
    borderRadius: 4,
  },
  beatMarkerStep: {
    width: 30,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  mainBeatMarker: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accentPrimary,
  },
  quarterBeatMarker: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  beatMarkerText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    fontSize: 10,
  },
  beatMarkerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
  },
  paramLockIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentSecondary,
  },
  microTimingIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 0,
    backgroundColor: colors.white,
  },
  microTimingLate: {
    right: 2,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  microTimingEarly: {
    left: 2,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentPrimary,
    marginRight: 4,
  },
  legendText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    fontSize: 10,
  },
});

export default React.memo(EnhancedBeatVisualizer);
