import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { ParsedBeat } from '../../services/beatParser/beatPatternParser';
import audioEngine from '../../services/audioEngine/audioEngine';

interface BeatEditorProps {
  beatPattern: ParsedBeat;
  onSave: (updatedBeat: ParsedBeat) => void;
  onCancel: () => void;
}

const BeatEditor: React.FC<BeatEditorProps> = ({
  beatPattern,
  onSave,
  onCancel,
}) => {
  const [beat, setBeat] = useState<ParsedBeat>({...beatPattern});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedInstrument, setSelectedInstrument] = useState<'kick' | 'snare' | 'hihat' | 'bass'>('kick');

  // Instrument configuration
  const instruments = [
    { key: 'kick', label: 'Kick', color: colors.kickDrum },
    { key: 'snare', label: 'Snare', color: colors.snare },
    { key: 'hihat', label: 'Hi-Hat', color: colors.hiHat },
    { key: 'bass', label: 'Bass', color: colors.bass },
  ];

  // Initialize audio engine and load beat
  useEffect(() => {
    const initAudio = async () => {
      await audioEngine.initialize();
      audioEngine.loadBeat(beat);
    };
    
    initAudio();
    
    // Cleanup on unmount
    return () => {
      audioEngine.stop();
      audioEngine.cleanup();
    };
  }, []);

  // Update audio engine when beat changes
  useEffect(() => {
    audioEngine.loadBeat(beat);
  }, [beat]);

  // Handle play/pause
  const togglePlayback = async () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      setIsPlaying(true);
      audioEngine.play();
      
      // Start step indicator animation
      const stepDuration = (60 / beat.bpm) * 1000 / 4; // 16th notes
      let step = 0;
      
      const interval = setInterval(() => {
        setCurrentStep(step);
        step = (step + 1) % 16;
        
        // Check if still playing
        const playbackState = audioEngine.getPlaybackState();
        if (!playbackState.isPlaying) {
          clearInterval(interval);
          setIsPlaying(false);
          setCurrentStep(-1);
        }
      }, stepDuration);
    }
  };

  // Toggle step for an instrument
  const toggleStep = (instrumentKey: 'kick' | 'snare' | 'hihat' | 'bass', stepIndex: number) => {
    setBeat(prevBeat => {
      const updatedInstruments = {...prevBeat.instruments};
      const updatedPattern = [...updatedInstruments[instrumentKey]];
      updatedPattern[stepIndex] = !updatedPattern[stepIndex];
      updatedInstruments[instrumentKey] = updatedPattern;
      
      return {
        ...prevBeat,
        instruments: updatedInstruments,
        metadata: {
          ...prevBeat.metadata,
          modified: new Date().toISOString(),
        },
      };
    });
  };

  // Update BPM
  const updateBpm = (newBpm: number) => {
    setBeat(prevBeat => ({
      ...prevBeat,
      bpm: newBpm,
      metadata: {
        ...prevBeat.metadata,
        modified: new Date().toISOString(),
      },
    }));
  };

  // Update effect value
  const updateEffect = (effect: 'reverb' | 'delay', value: number) => {
    setBeat(prevBeat => ({
      ...prevBeat,
      effects: {
        ...prevBeat.effects,
        [effect]: value,
      },
      metadata: {
        ...prevBeat.metadata,
        modified: new Date().toISOString(),
      },
    }));
  };

  // Clear all steps for the selected instrument
  const clearInstrument = () => {
    setBeat(prevBeat => {
      const updatedInstruments = {...prevBeat.instruments};
      updatedInstruments[selectedInstrument] = Array(16).fill(false);
      
      return {
        ...prevBeat,
        instruments: updatedInstruments,
        metadata: {
          ...prevBeat.metadata,
          modified: new Date().toISOString(),
        },
      };
    });
  };

  // Render step button
  const renderStep = (instrumentKey: 'kick' | 'snare' | 'hihat' | 'bass', stepIndex: number) => {
    const isActive = beat.instruments[instrumentKey][stepIndex];
    const isCurrentStep = isPlaying && currentStep === stepIndex;
    const isSelected = instrumentKey === selectedInstrument;
    
    return (
      <TouchableOpacity
        key={`${instrumentKey}-${stepIndex}`}
        style={[
          styles.step,
          isActive && { backgroundColor: instruments.find(i => i.key === instrumentKey)?.color + (isCurrentStep ? 'FF' : '80') },
          isCurrentStep && styles.currentStep,
          !isActive && styles.inactiveStep,
          isSelected && styles.selectedInstrumentStep,
        ]}
        onPress={() => toggleStep(instrumentKey, stepIndex)}
        activeOpacity={0.7}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.editorContainer}>
        {/* BPM Control */}
        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>Tempo (BPM)</Text>
          <View style={styles.bpmControl}>
            <Text style={styles.bpmValue}>{Math.round(beat.bpm)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={60}
              maximumValue={180}
              step={1}
              value={beat.bpm}
              onValueChange={updateBpm}
              minimumTrackTintColor={colors.vibrantPurple}
              maximumTrackTintColor={colors.darkBlue}
              thumbTintColor={colors.electricBlue}
            />
          </View>
        </View>
        
        {/* Instrument Selection */}
        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>Enstrüman</Text>
          <View style={styles.instrumentSelector}>
            {instruments.map(instrument => (
              <TouchableOpacity
                key={instrument.key}
                style={[
                  styles.instrumentButton,
                  selectedInstrument === instrument.key && { borderColor: instrument.color },
                ]}
                onPress={() => setSelectedInstrument(instrument.key as any)}
              >
                <Text style={[
                  styles.instrumentButtonText,
                  selectedInstrument === instrument.key && { color: instrument.color },
                ]}>
                  {instrument.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Sequencer Grid */}
        <View style={styles.sequencerContainer}>
          <Text style={styles.sectionTitle}>Beat Düzenleyici</Text>
          
          {instruments.map(instrument => (
            <View key={instrument.key} style={styles.row}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: instrument.color }]}>
                  {instrument.label}
                </Text>
              </View>
              
              <View style={styles.stepsContainer}>
                {Array.from({ length: 16 }).map((_, index) => 
                  renderStep(instrument.key as any, index)
                )}
              </View>
            </View>
          ))}
          
          {isPlaying && (
            <LinearGradient
              colors={['transparent', colors.vibrantPurple + '30', 'transparent']}
              style={[
                styles.playingIndicator,
                { left: `${(currentStep / 16) * 100}%` }
              ]}
            />
          )}
        </View>
        
        {/* Effects Controls */}
        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>Efektler</Text>
          
          <View style={styles.effectControl}>
            <Text style={styles.effectLabel}>Reverb</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={beat.effects.reverb}
              onValueChange={(value) => updateEffect('reverb', value)}
              minimumTrackTintColor={colors.vibrantPurple}
              maximumTrackTintColor={colors.darkBlue}
              thumbTintColor={colors.electricBlue}
            />
            <Text style={styles.effectValue}>{Math.round(beat.effects.reverb * 100)}%</Text>
          </View>
          
          <View style={styles.effectControl}>
            <Text style={styles.effectLabel}>Delay</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={beat.effects.delay}
              onValueChange={(value) => updateEffect('delay', value)}
              minimumTrackTintColor={colors.vibrantPurple}
              maximumTrackTintColor={colors.darkBlue}
              thumbTintColor={colors.electricBlue}
            />
            <Text style={styles.effectValue}>{Math.round(beat.effects.delay * 100)}%</Text>
          </View>
        </View>
        
        {/* Playback Controls */}
        <View style={styles.controlSection}>
          <View style={styles.playbackControls}>
            <Button
              title={isPlaying ? "Durdur" : "Oynat"}
              onPress={togglePlayback}
              variant="primary"
              size="medium"
              style={styles.playButton}
            />
            
            <Button
              title="Temizle"
              onPress={clearInstrument}
              variant="outline"
              size="medium"
              style={styles.clearButton}
            />
          </View>
        </View>
        
        {/* Save/Cancel Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="İptal"
            onPress={onCancel}
            variant="outline"
            size="medium"
            style={styles.cancelButton}
          />
          
          <Button
            title="Kaydet"
            onPress={() => onSave(beat)}
            variant="primary"
            size="medium"
            style={styles.saveButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepBlack,
  },
  editorContainer: {
    padding: 16,
  },
  controlSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...globalStyles.heading3,
    marginBottom: 12,
  },
  bpmControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpmValue: {
    ...globalStyles.heading3,
    width: 50,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  instrumentSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  instrumentButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.darkBlue,
    backgroundColor: colors.deepBlack,
  },
  instrumentButtonText: {
    ...globalStyles.bodyText,
    fontWeight: '600',
  },
  sequencerContainer: {
    backgroundColor: colors.deepBlack + '80',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...globalStyles.shadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    width: 60,
    marginRight: 8,
  },
  label: {
    ...globalStyles.bodyText,
    fontWeight: '500',
  },
  stepsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  step: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.darkBlue,
  },
  inactiveStep: {
    backgroundColor: colors.inactiveStep,
  },
  currentStep: {
    borderColor: colors.vibrantPurple,
    borderWidth: 2,
  },
  selectedInstrumentStep: {
    borderColor: colors.vibrantPurple + '80',
  },
  playingIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.vibrantPurple + '50',
  },
  effectControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  effectLabel: {
    ...globalStyles.bodyText,
    width: 60,
  },
  effectValue: {
    ...globalStyles.bodyText,
    width: 50,
    textAlign: 'right',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playButton: {
    flex: 1,
    marginRight: 8,
  },
  clearButton: {
    flex: 1,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default BeatEditor;
