import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Platform, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

// --- Define Interfaces ---
interface PlaybackControlsProps {
  isPlaying: boolean;
  bpm: number;
  effects: {
    reverb: number;
    delay: number;
  };
  isEditing: boolean;
  onPlayPause: () => void;
  onBpmChange: (bpm: number) => void;
  onEffectsChange: (type: 'reverb' | 'delay', value: number) => void;
}
// --- End Interfaces ---

const { width } = Dimensions.get('window');

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  bpm,
  effects,
  isEditing,
  onPlayPause,
  onBpmChange,
  onEffectsChange,
}) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const playButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const playButtonRotateAnim = useRef(new Animated.Value(0)).current;
  
  // Local state for slider values (for smooth UI updates)
  const [localBpm, setLocalBpm] = useState(bpm);
  const [localReverb, setLocalReverb] = useState(effects.reverb);
  const [localDelay, setLocalDelay] = useState(effects.delay);
  
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
    setLocalReverb(effects.reverb);
    setLocalDelay(effects.delay);
  }, [bpm, effects]);
  
  // Handle BPM change
  const handleBpmChange = useCallback((value: number) => {
    setLocalBpm(value);
  }, []);
  
  const handleBpmChangeComplete = useCallback((value: number) => {
    onBpmChange(value);
  }, [onBpmChange]);
  
  // Handle effects change
  const handleReverbChange = useCallback((value: number) => {
    setLocalReverb(value);
  }, []);
  
  const handleReverbChangeComplete = useCallback((value: number) => {
    onEffectsChange('reverb', value);
  }, [onEffectsChange]);
  
  const handleDelayChange = useCallback((value: number) => {
    setLocalDelay(value);
  }, []);
  
  const handleDelayChangeComplete = useCallback((value: number) => {
    onEffectsChange('delay', value);
  }, [onEffectsChange]);
  
  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    onPlayPause();
  }, [onPlayPause]);
  
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
        >
          <Text style={{ opacity: 0 }}>.</Text>
        </LinearGradient>
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
  
  // Custom slider thumb component
  const renderThumb = useCallback(() => {
    return (
      <View style={styles.sliderThumb}>
        <LinearGradient
          colors={gradients.purpleToNeonBlue}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={{ opacity: 0 }}>.</Text>
        </LinearGradient>
      </View>
    );
  }, []);
  
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
        {renderPlayPauseButton()}
      </View>
      
      <View style={styles.controlsContainer}>
        <View style={styles.controlItem}>
          <View style={styles.controlLabelContainer}>
            <Ionicons name="speedometer-outline" size={20} color={colors.vibrantPurple} />
            <Text style={styles.controlLabel}>BPM</Text>
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
        
        {isEditing && (
          <>
            <View style={styles.controlItem}>
              <View style={styles.controlLabelContainer}>
                <Ionicons name="water-outline" size={20} color={colors.neonBlue} />
                <Text style={styles.controlLabel}>Reverb</Text>
              </View>
              
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  value={localReverb}
                  onValueChange={handleReverbChange}
                  onSlidingComplete={handleReverbChangeComplete}
                  minimumTrackTintColor={colors.neonBlue}
                  maximumTrackTintColor={colors.inactiveSlider}
                  thumbProps={{ children: renderThumb() }}
                />
                <Text style={styles.sliderValue}>{Math.round(localReverb * 100)}%</Text>
              </View>
            </View>
            
            <View style={styles.controlItem}>
              <View style={styles.controlLabelContainer}>
                <Ionicons name="pulse-outline" size={20} color={colors.electricBlue} />
                <Text style={styles.controlLabel}>Delay</Text>
              </View>
              
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  value={localDelay}
                  onValueChange={handleDelayChange}
                  onSlidingComplete={handleDelayChangeComplete}
                  minimumTrackTintColor={colors.electricBlue}
                  maximumTrackTintColor={colors.inactiveSlider}
                  thumbProps={{ children: renderThumb() }}
                />
                <Text style={styles.sliderValue}>{Math.round(localDelay * 100)}%</Text>
              </View>
            </View>
          </>
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
  playPauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...globalStyles.shadow,
  },
  controlsContainer: {
    width: '100%',
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
});

export default React.memo(PlaybackControls);
