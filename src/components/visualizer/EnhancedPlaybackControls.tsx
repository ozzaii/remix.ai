import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Platform, Dimensions, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import * as Haptics from 'expo-haptics';
import { MasterEffects, TrackEffects } from '../../services/audioEngine/enhancedAudioEngine';

// --- Define Interfaces ---
interface EnhancedPlaybackControlsProps {
  isPlaying: boolean;
  bpm: number;
  masterEffects: MasterEffects;
  isEditing: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onBpmChange: (bpm: number) => void;
  onMasterEffectsChange: (effects: Partial<MasterEffects>) => void;
  onTempoTap: () => void;
}
// --- End Interfaces ---

const { width } = Dimensions.get('window');

const EnhancedPlaybackControls: React.FC<EnhancedPlaybackControlsProps> = ({
  isPlaying,
  bpm,
  masterEffects,
  isEditing,
  onPlayPause,
  onStop,
  onBpmChange,
  onMasterEffectsChange,
  onTempoTap,
}) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const playButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const playButtonRotateAnim = useRef(new Animated.Value(0)).current;
  const tempoTapPulseAnim = useRef(new Animated.Value(1)).current;
  
  // Local state for slider values (for smooth UI updates)
  const [localBpm, setLocalBpm] = useState(bpm);
  const [localLimiter, setLocalLimiter] = useState(masterEffects.limiter);
  const [localEqLow, setLocalEqLow] = useState(masterEffects.eq.low);
  const [localEqMid, setLocalEqMid] = useState(masterEffects.eq.mid);
  const [localEqHigh, setLocalEqHigh] = useState(masterEffects.eq.high);
  const [localCompThreshold, setLocalCompThreshold] = useState(masterEffects.compressor.threshold);
  const [localCompRatio, setLocalCompRatio] = useState(masterEffects.compressor.ratio);
  
  // State for expanded effects panel
  const [effectsPanelExpanded, setEffectsPanelExpanded] = useState(false);
  
  // Entrance animation
  useEffect(() => {
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
  
  // Play button animation
  useEffect(() => {
    if (isPlaying) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(playButtonScaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(playButtonScaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(playButtonRotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(playButtonScaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(playButtonScaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(playButtonRotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isPlaying]);
  
  // Update local state when props change
  useEffect(() => {
    setLocalBpm(bpm);
    setLocalLimiter(masterEffects.limiter);
    setLocalEqLow(masterEffects.eq.low);
    setLocalEqMid(masterEffects.eq.mid);
    setLocalEqHigh(masterEffects.eq.high);
    setLocalCompThreshold(masterEffects.compressor.threshold);
    setLocalCompRatio(masterEffects.compressor.ratio);
  }, [bpm, masterEffects]);
  
  // Handle BPM change
  const handleBpmChange = useCallback((value: number) => {
    setLocalBpm(value);
  }, []);
  
  const handleBpmChangeComplete = useCallback((value: number) => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onBpmChange(value);
  }, [onBpmChange]);
  
  // Handle master effects changes
  const handleLimiterChange = useCallback((value: number) => {
    setLocalLimiter(value);
  }, []);
  
  const handleLimiterChangeComplete = useCallback((value: number) => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMasterEffectsChange({ limiter: value });
  }, [onMasterEffectsChange]);
  
  const handleEqLowChange = useCallback((value: number) => {
    setLocalEqLow(value);
  }, []);
  
  const handleEqLowChangeComplete = useCallback((value: number) => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMasterEffectsChange({ eq: { ...masterEffects.eq, low: value } });
  }, [onMasterEffectsChange, masterEffects.eq]);
  
  const handleEqMidChange = useCallback((value: number) => {
    setLocalEqMid(value);
  }, []);
  
  const handleEqMidChangeComplete = useCallback((value: number) => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMasterEffectsChange({ eq: { ...masterEffects.eq, mid: value } });
  }, [onMasterEffectsChange, masterEffects.eq]);
  
  const handleEqHighChange = useCallback((value: number) => {
    setLocalEqHigh(value);
  }, []);
  
  const handleEqHighChangeComplete = useCallback((value: number) => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMasterEffectsChange({ eq: { ...masterEffects.eq, high: value } });
  }, [onMasterEffectsChange, masterEffects.eq]);
  
  const handleCompThresholdChange = useCallback((value: number) => {
    setLocalCompThreshold(value);
  }, []);
  
  const handleCompThresholdChangeComplete = useCallback((value: number) => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMasterEffectsChange({ compressor: { ...masterEffects.compressor, threshold: value } });
  }, [onMasterEffectsChange, masterEffects.compressor]);
  
  const handleCompRatioChange = useCallback((value: number) => {
    setLocalCompRatio(value);
  }, []);
  
  const handleCompRatioChangeComplete = useCallback((value: number) => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMasterEffectsChange({ compressor: { ...masterEffects.compressor, ratio: value } });
  }, [onMasterEffectsChange, masterEffects.compressor]);
  
  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPlayPause();
  }, [onPlayPause]);
  
  // Handle stop
  const handleStop = useCallback(() => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onStop();
  }, [onStop]);
  
  // Handle tempo tap
  const handleTempoTap = useCallback(() => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    // Animate tempo tap button
    Animated.sequence([
      Animated.timing(tempoTapPulseAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(tempoTapPulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    onTempoTap();
  }, [onTempoTap, tempoTapPulseAnim]);
  
  // Toggle effects panel
  const toggleEffectsPanel = useCallback(() => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setEffectsPanelExpanded(prev => !prev);
  }, []);
  
  // Render play/pause button
  const renderPlayPauseButton = () => {
    const rotate = playButtonRotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    
    return (
      <TouchableOpacity
        style={styles.playPauseButton}
        onPress={handlePlayPause}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isPlaying ? gradients.purpleToNeonBlue : gradients.darkToLight}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={{
            transform: [
              { scale: playButtonScaleAnim },
              { rotate }
            ]
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={32}
            color={colors.textPrimary}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };
  
  // Render stop button
  const renderStopButton = () => {
    return (
      <TouchableOpacity
        style={styles.stopButton}
        onPress={handleStop}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={gradients.darkToLight}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons
          name="stop"
          size={24}
          color={colors.textPrimary}
        />
      </TouchableOpacity>
    );
  };
  
  // Render tempo tap button
  const renderTempoTapButton = () => {
    return (
      <TouchableOpacity
        style={styles.tempoTapButton}
        onPress={handleTempoTap}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={gradients.purpleToNeonBlue}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={{
            transform: [{ scale: tempoTapPulseAnim }]
          }}
        >
          <Ionicons
            name="finger-print"
            size={24}
            color={colors.textPrimary}
          />
        </Animated.View>
        <Text style={styles.tempoTapText}>TAP</Text>
      </TouchableOpacity>
    );
  };
  
  // Custom slider thumb component
  const renderThumb = useCallback(() => {
    return (
      <View style={styles.sliderThumb}>
        <LinearGradient
          colors={gradients.purpleToNeonBlue}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
    );
  }, []);
  
  // Render EQ sliders
  const renderEqSliders = () => {
    return (
      <View style={styles.eqContainer}>
        <Text style={styles.effectSectionTitle}>Equalizer</Text>
        
        <View style={styles.eqSlidersContainer}>
          <View style={styles.eqSliderItem}>
            <Slider
              style={styles.eqSlider}
              minimumValue={-1}
              maximumValue={1}
              step={0.01}
              value={localEqLow}
              onValueChange={handleEqLowChange}
              onSlidingComplete={handleEqLowChangeComplete}
              minimumTrackTintColor={colors.vibrantPurple}
              maximumTrackTintColor={colors.inactiveSlider}
              thumbProps={{ children: renderThumb() }}
              disabled={!isEditing}
            />
            <Text style={styles.eqLabel}>LOW</Text>
          </View>
          
          <View style={styles.eqSliderItem}>
            <Slider
              style={styles.eqSlider}
              minimumValue={-1}
              maximumValue={1}
              step={0.01}
              value={localEqMid}
              onValueChange={handleEqMidChange}
              onSlidingComplete={handleEqMidChangeComplete}
              minimumTrackTintColor={colors.neonBlue}
              maximumTrackTintColor={colors.inactiveSlider}
              thumbProps={{ children: renderThumb() }}
              disabled={!isEditing}
            />
            <Text style={styles.eqLabel}>MID</Text>
          </View>
          
          <View style={styles.eqSliderItem}>
            <Slider
              style={styles.eqSlider}
              minimumValue={-1}
              maximumValue={1}
              step={0.01}
              value={localEqHigh}
              onValueChange={handleEqHighChange}
              onSlidingComplete={handleEqHighChangeComplete}
              minimumTrackTintColor={colors.electricBlue}
              maximumTrackTintColor={colors.inactiveSlider}
              thumbProps={{ children: renderThumb() }}
              disabled={!isEditing}
            />
            <Text style={styles.eqLabel}>HIGH</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Render compressor controls
  const renderCompressorControls = () => {
    return (
      <View style={styles.compressorContainer}>
        <Text style={styles.effectSectionTitle}>Compressor</Text>
        
        <View style={styles.controlItem}>
          <View style={styles.controlLabelContainer}>
            <Ionicons name="trending-down-outline" size={18} color={colors.vibrantPurple} />
            <Text style={styles.controlLabel}>Threshold</Text>
          </View>
          
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={localCompThreshold}
              onValueChange={handleCompThresholdChange}
              onSlidingComplete={handleCompThresholdChangeComplete}
              minimumTrackTintColor={colors.vibrantPurple}
              maximumTrackTintColor={colors.inactiveSlider}
              thumbProps={{ children: renderThumb() }}
              disabled={!isEditing}
            />
            <Text style={styles.sliderValue}>{Math.round(localCompThreshold * 100)}%</Text>
          </View>
        </View>
        
        <View style={styles.controlItem}>
          <View style={styles.controlLabelContainer}>
            <Ionicons name="resize-outline" size={18} color={colors.neonBlue} />
            <Text style={styles.controlLabel}>Ratio</Text>
          </View>
          
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={20}
              step={0.5}
              value={localCompRatio}
              onValueChange={handleCompRatioChange}
              onSlidingComplete={handleCompRatioChangeComplete}
              minimumTrackTintColor={colors.neonBlue}
              maximumTrackTintColor={colors.inactiveSlider}
              thumbProps={{ children: renderThumb() }}
              disabled={!isEditing}
            />
            <Text style={styles.sliderValue}>{localCompRatio.toFixed(1)}:1</Text>
          </View>
        </View>
      </View>
    );
  };
  
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
      <View style={styles.playbackHeader}>
        <Text style={styles.playbackTitle}>Playback Controls</Text>
        <View style={styles.transportControls}>
          {renderStopButton()}
          {renderPlayPauseButton()}
        </View>
      </View>
      
      <View style={styles.controlsContainer}>
        <View style={styles.bpmContainer}>
          <View style={styles.bpmControls}>
            <View style={styles.controlLabelContainer}>
              <Ionicons name="speedometer-outline" size={20} color={colors.vibrantPurple} />
              <Text style={styles.controlLabel}>BPM</Text>
            </View>
            
            {renderTempoTapButton()}
          </View>
          
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={60}
              maximumValue={180}
              step={1}
              value={localBpm}
              onValueChange={handleBpmChange}
              onSlidingComplete={handleBpmChangeComplete}
              minimumTrackTintColor={colors.vibrantPurple}
              maximumTrackTintColor={colors.inactiveSlider}
              thumbProps={{ children: renderThumb() }}
              disabled={!isEditing && isPlaying}
            />
            <Text style={styles.sliderValue}>{Math.round(localBpm)}</Text>
          </View>
        </View>
        
        <View style={styles.controlItem}>
          <View style={styles.controlLabelContainer}>
            <Ionicons name="volume-high-outline" size={20} color={colors.electricBlue} />
            <Text style={styles.controlLabel}>Master Limiter</Text>
          </View>
          
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={localLimiter}
              onValueChange={handleLimiterChange}
              onSlidingComplete={handleLimiterChangeComplete}
              minimumTrackTintColor={colors.electricBlue}
              maximumTrackTintColor={colors.inactiveSlider}
              thumbProps={{ children: renderThumb() }}
              disabled={!isEditing}
            />
            <Text style={styles.sliderValue}>{Math.round(localLimiter * 100)}%</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={toggleEffectsPanel}
          activeOpacity={0.7}
        >
          <Text style={styles.expandButtonText}>
            {effectsPanelExpanded ? 'Hide Advanced Effects' : 'Show Advanced Effects'}
          </Text>
          <Ionicons 
            name={effectsPanelExpanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
        
        {effectsPanelExpanded && (
          <View style={styles.advancedEffectsContainer}>
            {renderEqSliders()}
            {renderCompressorControls()}
          </View>
        )}
      </View>
      
      <View style={styles.visualizerContainer}>
        <LinearGradient
          colors={gradients.darkToLight}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Frequency visualization bars */}
        <View style={styles.frequencyBars}>
          {Array.from({ length: 16 }).map((_, index) => {
            // Calculate random height for visualization
            const height = Math.random() * 0.8 + 0.2;
            
            return (
              <View 
                key={index} 
                style={[
                  styles.frequencyBar,
                  { 
                    height: `${height * 100}%`,
                    backgroundColor: index < 5 ? colors.vibrantPurple : 
                                    index < 10 ? colors.neonBlue : 
                                    colors.electricBlue,
                    opacity: isPlaying ? 1 : 0.3
                  }
                ]} 
              />
            );
          })}
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
  playbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playbackTitle: {
    ...globalStyles.heading3,
    color: colors.textPrimary,
  },
  transportControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...globalStyles.shadowMedium,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
    ...globalStyles.shadowMedium,
  },
  tempoTapButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...globalStyles.shadowMedium,
  },
  tempoTapText: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
    marginTop: 2,
    fontWeight: '700',
    fontSize: 10,
  },
  controlsContainer: {
    width: '100%',
  },
  bpmContainer: {
    marginBottom: 16,
  },
  bpmControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlItem: {
    marginBottom: 16,
  },
  controlLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlLabel: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
    marginLeft: 8,
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    height: 40,
    marginRight: 16,
  },
  sliderValue: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
    width: 50,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    ...globalStyles.shadowLight,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    marginBottom: 16,
  },
  expandButtonText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginRight: 8,
  },
  advancedEffectsContainer: {
    marginBottom: 16,
  },
  effectSectionTitle: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  eqContainer: {
    marginBottom: 16,
  },
  eqSlidersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eqSliderItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  eqSlider: {
    width: '100%',
    height: 100,
    transform: [{ rotate: '-90deg' }],
  },
  eqLabel: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  compressorContainer: {
    marginBottom: 16,
  },
  visualizerContainer: {
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  frequencyBars: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  frequencyBar: {
    width: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});

export default React.memo(EnhancedPlaybackControls);
