/**
 * BeatVisualizer Component for REMIX.AI
 * 
 * A premium, futuristic visualization component for displaying and editing
 * 64-step beat patterns with high-quality animations and interactions.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Canvas, RoundedRect, vec, useValue, useTouchHandler, useComputedValue, useSharedValueEffect, Skia, Group, Paint, Shadow } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useBeats } from '../state';
import { useAudioEngineService } from '../services';
import { useAudio } from '../state';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Constants for visualization
const GRID_ROWS = 8; // Maximum number of instruments
const GRID_COLS = 16; // Steps per page (4 pages for 64 steps)
const CELL_MARGIN = 2;
const CELL_BORDER_RADIUS = 6;
const ACTIVE_SCALE = 1.1;
const INACTIVE_SCALE = 1.0;

// Premium color palette
const COLORS = {
  background: '#121214',
  gridBackground: '#1A1A1F',
  primary: '#6E44FF',
  primaryLight: '#9E7DFF',
  secondary: '#00D2FF',
  accent: '#FF44A1',
  inactive: '#2A2A35',
  active: '#6E44FF',
  activeGlow: '#9E7DFF',
  text: '#FFFFFF',
  textSecondary: '#AAAACC',
  success: '#44FFB2',
  warning: '#FFCC44',
  error: '#FF4466',
  gradientStart: '#6E44FF',
  gradientEnd: '#00D2FF',
};

// Instrument icons and colors
const INSTRUMENTS = {
  kick: { name: 'Kick', color: '#FF44A1', icon: '🥁' },
  snare: { name: 'Snare', color: '#44FFB2', icon: '👏' },
  hihat: { name: 'Hi-Hat', color: '#FFCC44', icon: '🎩' },
  clap: { name: 'Clap', color: '#00D2FF', icon: '👏' },
  tom: { name: 'Tom', color: '#FF8844', icon: '🥁' },
  cymbal: { name: 'Cymbal', color: '#FFFF44', icon: '💿' },
  percussion: { name: 'Perc', color: '#44FF44', icon: '🎵' },
  fx: { name: 'FX', color: '#FF44FF', icon: '✨' },
};

interface BeatVisualizerProps {
  onStepToggle?: (instrument: string, step: number, value: boolean) => void;
  onPageChange?: (page: number) => void;
  showInstrumentLabels?: boolean;
  showStepNumbers?: boolean;
  showPlayhead?: boolean;
  editable?: boolean;
  compact?: boolean;
}

const BeatVisualizer: React.FC<BeatVisualizerProps> = ({
  onStepToggle,
  onPageChange,
  showInstrumentLabels = true,
  showStepNumbers = true,
  showPlayhead = true,
  editable = true,
  compact = false,
}) => {
  // Get state from context
  const { currentBeat, toggleStep } = useBeats();
  const audioEngineService = useAudioEngineService();
  const { isPlaying, currentStep } = useAudio();

  // Local state
  const [currentPage, setCurrentPage] = useState(0);
  const [instrumentsExpanded, setInstrumentsExpanded] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  
  // Animations
  const pageTransition = useSharedValue(0);
  const playheadPosition = useSharedValue(-1);
  const gridOpacity = useSharedValue(1);
  const gridScale = useSharedValue(1);
  
  // Calculate dimensions based on screen size and compact mode
  const cellSize = useMemo(() => {
    const baseSize = compact ? 
      Math.min(24, (SCREEN_WIDTH - 40) / GRID_COLS) : 
      Math.min(32, (SCREEN_WIDTH - 40) / GRID_COLS);
    return baseSize - CELL_MARGIN * 2;
  }, [compact, SCREEN_WIDTH]);
  
  const gridWidth = useMemo(() => 
    (cellSize + CELL_MARGIN * 2) * GRID_COLS, 
    [cellSize]
  );
  
  const gridHeight = useMemo(() => 
    (cellSize + CELL_MARGIN * 2) * (compact ? 4 : GRID_ROWS), 
    [cellSize, compact]
  );

  // Update playhead position based on current step
  useEffect(() => {
    if (currentStep !== null && currentStep >= 0) {
      const page = Math.floor(currentStep / GRID_COLS);
      const stepInPage = currentStep % GRID_COLS;
      
      if (page !== currentPage) {
        setCurrentPage(page);
        pageTransition.value = withTiming(page, { duration: 300 });
      }
      
      playheadPosition.value = stepInPage;
    } else {
      playheadPosition.value = -1;
    }
  }, [currentStep, currentPage, pageTransition, playheadPosition]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 0 && newPage < 4) { // 4 pages for 64 steps
      setCurrentPage(newPage);
      pageTransition.value = withTiming(newPage, { duration: 300 });
      onPageChange?.(newPage);
    }
  }, [onPageChange, pageTransition]);

  // Handle step toggle
  const handleStepToggle = useCallback((instrument: string, step: number) => {
    if (!editable) return;
    
    const globalStep = currentPage * GRID_COLS + step;
    const newValue = !(currentBeat?.patterns?.[instrument]?.[globalStep] ?? false);
    
    // Play the sound when toggling
    if (newValue) {
      audioEngineService.playSample(instrument);
    }
    
    // Update state
    toggleStep(instrument, globalStep, newValue);
    onStepToggle?.(instrument, globalStep, newValue);
    
    // Animate the grid
    gridScale.value = withSpring(ACTIVE_SCALE, { damping: 10, stiffness: 200 });
    setTimeout(() => {
      gridScale.value = withSpring(INACTIVE_SCALE);
    }, 100);
  }, [currentBeat, currentPage, toggleStep, onStepToggle, audioEngineService, gridScale, editable]);

  // Animated styles
  const pageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -pageTransition.value * gridWidth }],
  }));

  const gridAnimatedStyle = useAnimatedStyle(() => ({
    opacity: gridOpacity.value,
    transform: [{ scale: gridScale.value }],
  }));

  // Render the beat grid
  const renderBeatGrid = () => {
    if (!currentBeat || !currentBeat.patterns) {
      return (
        <View style={styles.emptyStateContainer}>
          <LottieView
            source={require('../../assets/animations/empty-state.json')}
            autoPlay
            loop
            style={styles.emptyAnimation}
          />
          <Text style={styles.emptyStateText}>No beat selected</Text>
          <Text style={styles.emptyStateSubtext}>Create a beat using the conversational interface</Text>
        </View>
      );
    }

    const instruments = Object.keys(currentBeat.patterns).slice(0, compact ? 4 : GRID_ROWS);
    
    return (
      <Animated.View style={[styles.gridScrollContainer, pageAnimatedStyle]}>
        {instruments.map((instrument, rowIndex) => {
          const pattern = currentBeat.patterns[instrument];
          
          return (
            <View key={instrument} style={styles.gridRow}>
              {showInstrumentLabels && (
                <View style={styles.instrumentLabel}>
                  <View style={[styles.instrumentIcon, { backgroundColor: INSTRUMENTS[instrument]?.color || COLORS.primary }]}>
                    <Text style={styles.instrumentIconText}>{INSTRUMENTS[instrument]?.icon || '🎵'}</Text>
                  </View>
                  <Text style={styles.instrumentText}>{INSTRUMENTS[instrument]?.name || instrument}</Text>
                </View>
              )}
              
              <View style={styles.stepsContainer}>
                {Array.from({ length: GRID_COLS }).map((_, colIndex) => {
                  const stepIndex = currentPage * GRID_COLS + colIndex;
                  const isActive = pattern[stepIndex];
                  
                  return (
                    <TouchableOpacity
                      key={colIndex}
                      style={[
                        styles.stepCell,
                        { 
                          width: cellSize, 
                          height: cellSize,
                          margin: CELL_MARGIN,
                        },
                      ]}
                      onPress={() => handleStepToggle(instrument, colIndex)}
                      activeOpacity={0.7}
                      disabled={!editable}
                    >
                      {isActive ? (
                        <LinearGradient
                          colors={[INSTRUMENTS[instrument]?.color || COLORS.primary, COLORS.primaryLight]}
                          style={[styles.activeCell, { borderRadius: CELL_BORDER_RADIUS }]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Animated.View 
                            style={styles.activeCellInner}
                            entering={FadeIn.duration(200)}
                            exiting={FadeOut.duration(200)}
                          />
                        </LinearGradient>
                      ) : (
                        <View style={[
                          styles.inactiveCell, 
                          { 
                            borderRadius: CELL_BORDER_RADIUS,
                            backgroundColor: colIndex % 4 === 0 ? COLORS.inactive : '#232330',
                          }
                        ]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
        
        {/* Playhead */}
        {showPlayhead && isPlaying && (
          <Animated.View 
            style={[
              styles.playhead,
              {
                height: gridHeight,
                transform: [{ 
                  translateX: playheadPosition.value * (cellSize + CELL_MARGIN * 2) + CELL_MARGIN 
                }],
                width: cellSize,
                borderRadius: CELL_BORDER_RADIUS,
              }
            ]}
          />
        )}
      </Animated.View>
    );
  };

  // Render page indicators
  const renderPageIndicators = () => {
    return (
      <View style={styles.pageIndicatorsContainer}>
        {Array.from({ length: 4 }).map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pageIndicator,
              currentPage === index && styles.pageIndicatorActive
            ]}
            onPress={() => handlePageChange(index)}
          >
            <Text style={[
              styles.pageIndicatorText,
              currentPage === index && styles.pageIndicatorTextActive
            ]}>
              {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render step numbers
  const renderStepNumbers = () => {
    if (!showStepNumbers) return null;
    
    return (
      <View style={styles.stepNumbersContainer}>
        {Array.from({ length: GRID_COLS }).map((_, index) => (
          <Text key={index} style={[
            styles.stepNumber,
            { 
              width: cellSize, 
              margin: CELL_MARGIN,
              color: index % 4 === 0 ? COLORS.textSecondary : '#555566'
            }
          ]}>
            {currentPage * GRID_COLS + index + 1}
          </Text>
        ))}
      </View>
    );
  };

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, '#1A1A24']}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Beat Visualizer</Text>
          {currentBeat && (
            <Text style={styles.beatInfo}>
              {currentBeat.name} • {currentBeat.bpm} BPM
            </Text>
          )}
        </View>
        
        {renderStepNumbers()}
        
        <Animated.View style={[styles.gridContainer, gridAnimatedStyle]}>
          {renderBeatGrid()}
        </Animated.View>
        
        {renderPageIndicators()}
        
        {editable && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                if (isPlaying) {
                  audioEngineService.stopSequence();
                } else {
                  audioEngineService.playSequence(currentBeat?.patterns || {}, currentBeat?.bpm || 120);
                }
              }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.controlButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.controlButtonText}>
                  {isPlaying ? 'Stop' : 'Play'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setInstrumentsExpanded(!instrumentsExpanded)}
            >
              <LinearGradient
                colors={['#444455', '#333344']}
                style={styles.controlButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.controlButtonText}>
                  {instrumentsExpanded ? 'Hide Instruments' : 'Show Instruments'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Instrument selector panel */}
        {instrumentsExpanded && (
          <Animated.View 
            style={styles.instrumentsPanel}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
          >
            <View style={styles.instrumentsGrid}>
              {Object.entries(INSTRUMENTS).map(([key, instrument]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.instrumentItem,
                    selectedInstrument === key && styles.instrumentItemSelected
                  ]}
                  onPress={() => setSelectedInstrument(key)}
                >
                  <View style={[styles.instrumentItemIcon, { backgroundColor: instrument.color }]}>
                    <Text style={styles.instrumentItemIconText}>{instrument.icon}</Text>
                  </View>
                  <Text style={styles.instrumentItemText}>{instrument.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  beatInfo: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  gridContainer: {
    backgroundColor: COLORS.gridBackground,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gridScrollContainer: {
    flexDirection: 'column',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  instrumentLabel: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  instrumentIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  instrumentIconText: {
    fontSize: 12,
  },
  instrumentText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  stepsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  stepCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCell: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.activeGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  activeCellInner: {
    width: '70%',
    height: '70%',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  inactiveCell: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.inactive,
  },
  playhead: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  pageIndicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  pageIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.inactive,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  pageIndicatorActive: {
    backgroundColor: COLORS.primary,
  },
  pageIndicatorText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  pageIndicatorTextActive: {
    color: COLORS.text,
  },
  stepNumbersContainer: {
    flexDirection: 'row',
    marginLeft: 68,
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 10,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 8,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  instrumentsPanel: {
    backgroundColor: 'rgba(26, 26, 31, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  instrumentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  instrumentItem: {
    width: '23%',
    backgroundColor: COLORS.inactive,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  instrumentItemSelected: {
    backgroundColor: COLORS.primary,
  },
  instrumentItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  instrumentItemIconText: {
    fontSize: 16,
  },
  instrumentItemText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyAnimation: {
    width: 120,
    height: 120,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default BeatVisualizer;
