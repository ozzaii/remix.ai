import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Canvas, Skia, Path, useValue, useComputedValue, 
  useClockValue, vec, Group, Paint, Circle, BlurMask, 
  useSharedValueEffect, RoundedRect } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withTiming, 
  withSpring, withRepeat, withDelay, Easing, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

const { width } = Dimensions.get('window');
const CONTROLS_HEIGHT = 120;
const BUTTON_SIZE = 60;
const SLIDER_WIDTH = width - 140;

// Define interfaces
interface PlaybackControlsProps {
  isPlaying: boolean;
  bpm: number;
  onPlayPause: () => void;
  onBpmChange: (bpm: number) => void;
  onReset?: () => void;
  onShare?: () => void;
}

const SkiaPlaybackControls = ({
  isPlaying,
  bpm,
  onPlayPause,
  onBpmChange,
  onReset,
  onShare
}: PlaybackControlsProps) => {
  // Local state
  const [localBpm, setLocalBpm] = useState(bpm);
  
  // Animation values
  const clock = useClockValue();
  const playButtonScale = useValue(1);
  const playButtonRotation = useValue(0);
  const sliderProgress = useValue(0);
  const glowOpacity = useValue(0);
  
  // Reanimated shared values
  const animatedPlayScale = useSharedValue(1);
  const animatedGlowOpacity = useSharedValue(0);
  const animatedSliderProgress = useSharedValue((bpm - 60) / 140); // Map 60-200 BPM to 0-1
  
  // Connect Reanimated shared values to Skia values
  useSharedValueEffect(() => {
    playButtonScale.current = animatedPlayScale.value;
  }, animatedPlayScale);
  
  useSharedValueEffect(() => {
    glowOpacity.current = animatedGlowOpacity.value;
  }, animatedGlowOpacity);
  
  useSharedValueEffect(() => {
    sliderProgress.current = animatedSliderProgress.value;
  }, animatedSliderProgress);
  
  // Update BPM when slider changes
  useEffect(() => {
    setLocalBpm(bpm);
    animatedSliderProgress.value = withTiming((bpm - 60) / 140, { 
      duration: 300, 
      easing: Easing.out(Easing.cubic) 
    });
  }, [bpm]);
  
  // Animate play button based on state
  useEffect(() => {
    if (isPlaying) {
      // Scale animation
      animatedPlayScale.value = withSequence(
        withTiming(1.2, { duration: 200, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.cubic) })
      );
      
      // Glow animation
      animatedGlowOpacity.value = withRepeat(
        withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      );
      
      // Start rotation animation for BPM indicator
      playButtonRotation.current = withRepeat(
        withTiming(Math.PI * 2, { 
          duration: 60000 / bpm, // Rotate once per beat
          easing: Easing.linear 
        }),
        -1,
        false
      );
    } else {
      // Reset animations
      animatedPlayScale.value = withTiming(1, { 
        duration: 300, 
        easing: Easing.out(Easing.cubic) 
      });
      
      animatedGlowOpacity.value = withTiming(0, { 
        duration: 300, 
        easing: Easing.out(Easing.cubic) 
      });
      
      // Stop rotation
      playButtonRotation.current = 0;
    }
  }, [isPlaying, bpm]);
  
  // Handle play/pause button press
  const handlePlayPause = () => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onPlayPause();
  };
  
  // Handle BPM change
  const handleBpmChange = (value: number) => {
    const newBpm = Math.round(60 + value * 140); // Map 0-1 to 60-200 BPM
    setLocalBpm(newBpm);
  };
  
  // Handle BPM change complete
  const handleBpmChangeComplete = (value: number) => {
    const newBpm = Math.round(60 + value * 140); // Map 0-1 to 60-200 BPM
    onBpmChange(newBpm);
    
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Handle reset button press
  const handleReset = () => {
    if (onReset) {
      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Animate button press
      animatedPlayScale.value = withSequence(
        withTiming(0.9, { duration: 100, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
      );
      
      onReset();
    }
  };
  
  // Handle share button press
  const handleShare = () => {
    if (onShare) {
      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Animate button press
      animatedPlayScale.value = withSequence(
        withTiming(0.9, { duration: 100, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
      );
      
      onShare();
    }
  };
  
  // Compute slider track path
  const sliderTrackPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    // Create rounded track
    const height = 8;
    const y = CONTROLS_HEIGHT / 2;
    
    path.moveTo(70, y);
    path.lineTo(70 + SLIDER_WIDTH, y);
    
    return path;
  }, []);
  
  // Compute slider progress path
  const sliderProgressPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    // Create rounded track
    const height = 8;
    const y = CONTROLS_HEIGHT / 2;
    const progressWidth = SLIDER_WIDTH * sliderProgress.current;
    
    path.moveTo(70, y);
    path.lineTo(70 + progressWidth, y);
    
    return path;
  }, [sliderProgress]);
  
  // Compute beat indicator path
  const beatIndicatorPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    // Create beat indicator
    const centerX = BUTTON_SIZE / 2;
    const centerY = BUTTON_SIZE / 2;
    const radius = BUTTON_SIZE / 2 - 4;
    
    // Draw arc from top center
    path.moveTo(centerX, centerY - radius);
    path.arcToOval(
      { x: centerX - radius, y: centerY - radius, width: radius * 2, height: radius * 2 },
      -Math.PI / 2,
      Math.PI / 4,
      false
    );
    
    return path;
  }, []);
  
  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        {/* Reset button */}
        <TouchableOpacity 
          style={styles.sideButton} 
          onPress={handleReset}
          disabled={!onReset}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color={onReset ? colors.textPrimary : colors.textSecondary} 
          />
        </TouchableOpacity>
        
        {/* BPM slider */}
        <View style={styles.sliderContainer}>
          <Canvas style={styles.sliderCanvas}>
            {/* Slider track */}
            <Path 
              path={sliderTrackPath}
              style="stroke"
              strokeWidth={8}
              strokeJoin="round"
              strokeCap="round"
              color={colors.sliderTrack || 'rgba(255, 255, 255, 0.2)'}
            />
            
            {/* Slider progress */}
            <Path 
              path={sliderProgressPath}
              style="stroke"
              strokeWidth={8}
              strokeJoin="round"
              strokeCap="round"
              color={colors.primary}
            >
              <BlurMask blur={4} style="solid" />
            </Path>
            
            {/* Slider thumb */}
            <Circle 
              cx={70 + SLIDER_WIDTH * sliderProgress.current}
              cy={CONTROLS_HEIGHT / 2}
              r={12}
              color={colors.primary}
            >
              <BlurMask blur={8} style="solid" />
            </Circle>
          </Canvas>
          
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={(localBpm - 60) / 140}
            onValueChange={handleBpmChange}
            onSlidingComplete={handleBpmChangeComplete}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbTintColor="transparent"
          />
          
          <Text style={styles.bpmText}>{localBpm} BPM</Text>
        </View>
        
        {/* Share button */}
        <TouchableOpacity 
          style={styles.sideButton} 
          onPress={handleShare}
          disabled={!onShare}
        >
          <Ionicons 
            name="share-outline" 
            size={24} 
            color={onShare ? colors.textPrimary : colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Play/Pause button */}
      <TouchableOpacity 
        style={styles.playButtonContainer}
        onPress={handlePlayPause}
        activeOpacity={0.8}
      >
        <Canvas style={styles.playButtonCanvas}>
          {/* Glow effect */}
          <Circle 
            cx={BUTTON_SIZE / 2}
            cy={BUTTON_SIZE / 2}
            r={BUTTON_SIZE / 2 + 10}
            color={`rgba(104, 132, 255, ${glowOpacity.current})`}
          >
            <BlurMask blur={20} style="normal" />
          </Circle>
          
          {/* Button background */}
          <Group transform={[{ scale: playButtonScale.current }]}>
            <Circle 
              cx={BUTTON_SIZE / 2}
              cy={BUTTON_SIZE / 2}
              r={BUTTON_SIZE / 2}
              color={colors.primary}
            >
              <BlurMask blur={4} style="solid" />
            </Circle>
            
            {/* Beat indicator */}
            <Group transform={[
              { translateX: BUTTON_SIZE / 2 },
              { translateY: BUTTON_SIZE / 2 },
              { rotate: playButtonRotation.current },
              { translateX: -BUTTON_SIZE / 2 },
              { translateY: -BUTTON_SIZE / 2 }
            ]}>
              <Path 
                path={beatIndicatorPath}
                style="stroke"
                strokeWidth={3}
                strokeJoin="round"
                strokeCap="round"
                color="rgba(255, 255, 255, 0.8)"
              />
            </Group>
          </Group>
        </Canvas>
        
        <View style={styles.playButtonIcon}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={30} 
            color="white" 
            style={isPlaying ? {} : { marginLeft: 4 }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: CONTROLS_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sideButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: 40,
    justifyContent: 'center',
  },
  sliderCanvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
    opacity: 0, // Make the actual slider invisible
  },
  bpmText: {
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  playButtonContainer: {
    position: 'absolute',
    bottom: -30,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0 4px 8px ${colors.primary}80`,
      },
    }),
  },
  playButtonCanvas: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  playButtonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SkiaPlaybackControls;
