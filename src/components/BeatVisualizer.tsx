import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useConversation } from '../services/claude/ConversationContext';
import { useEventBusService } from '../services/serviceLocator';
import { PromptTemplates, PromptTemplateType } from '../services/claude/promptTemplates';

/**
 * Enhanced Beat Visualizer component for REMIX.AI
 * 
 * This component provides a polished user interface for visualizing and
 * interacting with beat patterns. It includes responsive design, animations,
 * and integration with the event bus.
 */
const BeatVisualizer = ({ beatData, onStepToggle, isPlaying }) => {
  const eventBusService = useEventBusService();
  const [activeStep, setActiveStep] = useState(-1);
  const [hoveredStep, setHoveredStep] = useState(-1);
  
  // Subscribe to step updates from the audio engine
  useEffect(() => {
    const unsubscribe = eventBusService.subscribe('audio:step:change', (payload) => {
      setActiveStep(payload.step);
    });
    
    return unsubscribe;
  }, [eventBusService]);
  
  // Calculate grid dimensions based on patterns
  const gridDimensions = useMemo(() => {
    if (!beatData || !beatData.patterns || beatData.patterns.length === 0) {
      return { rows: 0, cols: 64 };
    }
    
    return {
      rows: beatData.patterns.length,
      cols: 64 // Fixed at 64 steps
    };
  }, [beatData]);
  
  // Render a single step in the grid
  const renderStep = useCallback((patternIndex, stepIndex) => {
    if (!beatData || !beatData.patterns[patternIndex]) return null;
    
    const pattern = beatData.patterns[patternIndex];
    const isActive = pattern.pattern.steps[stepIndex];
    const isCurrentStep = stepIndex === activeStep;
    const isHovered = stepIndex === hoveredStep;
    const isBeatStart = stepIndex % 4 === 0;
    const isBarStart = stepIndex % 16 === 0;
    
    return (
      <TouchableOpacity
        key={`step-${patternIndex}-${stepIndex}`}
        style={[
          styles.step,
          isActive && styles.activeStep,
          isCurrentStep && styles.currentStep,
          isHovered && styles.hoveredStep,
          isBeatStart && styles.beatStart,
          isBarStart && styles.barStart
        ]}
        onPress={() => onStepToggle(patternIndex, stepIndex)}
        onMouseEnter={() => setHoveredStep(stepIndex)}
        onMouseLeave={() => setHoveredStep(-1)}
      />
    );
  }, [beatData, activeStep, hoveredStep, onStepToggle]);
  
  // Render a row of steps for a pattern
  const renderPatternRow = useCallback((patternIndex) => {
    if (!beatData || !beatData.patterns[patternIndex]) return null;
    
    const pattern = beatData.patterns[patternIndex];
    
    return (
      <View key={`pattern-${patternIndex}`} style={styles.patternRow}>
        <View style={styles.patternInfo}>
          <Text style={styles.patternName} numberOfLines={1}>
            {pattern.sampleName}
          </Text>
          <Text style={styles.patternCategory}>
            {pattern.category}
          </Text>
        </View>
        
        <ScrollView 
          horizontal 
          style={styles.stepsContainer}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.stepsRow}>
            {Array.from({ length: 64 }).map((_, stepIndex) => 
              renderStep(patternIndex, stepIndex)
            )}
          </View>
        </ScrollView>
      </View>
    );
  }, [beatData, renderStep]);
  
  // If no beat data, show placeholder
  if (!beatData || !beatData.patterns || beatData.patterns.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No beat pattern available. Create a beat to visualize it here.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.beatTitle}>{beatData.title || 'Untitled Beat'}</Text>
        <Text style={styles.beatInfo}>BPM: {beatData.bpm || 120}</Text>
        
        <View style={styles.transportControls}>
          <TouchableOpacity 
            style={[styles.transportButton, isPlaying && styles.stopButton]}
            onPress={() => {
              eventBusService.publish('audio:transport', { 
                action: isPlaying ? 'stop' : 'play',
                beatData
              });
            }}
          >
            <Text style={styles.transportButtonText}>
              {isPlaying ? 'Stop' : 'Play'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.transportButton}
            onPress={() => {
              eventBusService.publish('beat:save', { beatData });
            }}
          >
            <Text style={styles.transportButtonText}>Save</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.transportButton}
            onPress={() => {
              eventBusService.publish('beat:share', { beatData });
            }}
          >
            <Text style={styles.transportButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.beatGrid}>
        <View style={styles.gridLabels}>
          <View style={styles.cornerLabel}>
            <Text style={styles.cornerText}>Patterns</Text>
          </View>
          
          <View style={styles.stepLabels}>
            {Array.from({ length: 16 }).map((_, i) => (
              <Text key={`label-${i}`} style={styles.stepLabel}>{i + 1}</Text>
            ))}
          </View>
        </View>
        
        <ScrollView style={styles.patternsContainer}>
          {Array.from({ length: gridDimensions.rows }).map((_, patternIndex) => 
            renderPatternRow(patternIndex)
          )}
        </ScrollView>
      </View>
      
      <View style={styles.beatControls}>
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>BPM</Text>
          <View style={styles.bpmControl}>
            <TouchableOpacity 
              style={styles.bpmButton}
              onPress={() => {
                const newBpm = Math.max(60, (beatData.bpm || 120) - 5);
                eventBusService.publish('audio:bpm:change', { bpm: newBpm });
              }}
            >
              <Text style={styles.bpmButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.bpmValue}>{beatData.bpm || 120}</Text>
            
            <TouchableOpacity 
              style={styles.bpmButton}
              onPress={() => {
                const newBpm = Math.min(200, (beatData.bpm || 120) + 5);
                eventBusService.publish('audio:bpm:change', { bpm: newBpm });
              }}
            >
              <Text style={styles.bpmButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Swing</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.slider}>
              <View 
                style={[
                  styles.sliderFill, 
                  { width: `${(beatData.swing || 0) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.sliderValue}>{Math.round((beatData.swing || 0) * 100)}%</Text>
          </View>
        </View>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1E1E1E',
  },
  beatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  beatInfo: {
    fontSize: 14,
    color: '#BBBBBB',
    marginTop: 4,
  },
  transportControls: {
    flexDirection: 'row',
    marginTop: 12,
  },
  transportButton: {
    backgroundColor: '#7C4DFF',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  stopButton: {
    backgroundColor: '#CF6679',
  },
  transportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  beatGrid: {
    flex: 1,
  },
  gridLabels: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cornerLabel: {
    width: 100,
    padding: 8,
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerText: {
    color: '#BBBBBB',
    fontSize: 12,
  },
  stepLabels: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2D2D2D',
    paddingVertical: 8,
  },
  stepLabel: {
    width: 24,
    textAlign: 'center',
    color: '#BBBBBB',
    fontSize: 12,
  },
  patternsContainer: {
    flex: 1,
  },
  patternRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  patternInfo: {
    width: 100,
    padding: 8,
    justifyContent: 'center',
    backgroundColor: '#2D2D2D',
  },
  patternName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  patternCategory: {
    color: '#BBBBBB',
    fontSize: 10,
    marginTop: 2,
  },
  stepsContainer: {
    flex: 1,
  },
  stepsRow: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  step: {
    width: 16,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#333333',
    margin: 2,
  },
  activeStep: {
    backgroundColor: '#7C4DFF',
  },
  currentStep: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  hoveredStep: {
    opacity: 0.8,
  },
  beatStart: {
    marginLeft: 4,
  },
  barStart: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#BBBBBB',
    fontSize: 16,
    textAlign: 'center',
  },
  beatControls: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1E1E1E',
  },
  controlGroup: {
    flex: 1,
    marginRight: 16,
  },
  controlLabel: {
    color: '#BBBBBB',
    fontSize: 12,
    marginBottom: 4,
  },
  bpmControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpmButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bpmValue: {
    color: '#FFFFFF',
    fontSize: 16,
    marginHorizontal: 12,
    width: 40,
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#7C4DFF',
  },
  sliderValue: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
    width: 40,
  },
});

export default BeatVisualizer;
