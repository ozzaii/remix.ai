import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Canvas, Skia, Path, useValue, useComputedValue, 
  useClockValue, vec, Group, Paint, Circle, BlurMask, 
  RoundedRect, useSharedValueEffect } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withTiming, 
  withSpring, withRepeat, withDelay, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

const { width } = Dimensions.get('window');
const CARD_BORDER_RADIUS = 16;

// Define interfaces
interface SkiaCardProps {
  children: React.ReactNode;
  style?: any;
  gradientColors?: string[];
  glowIntensity?: number;
  onPress?: () => void;
  animationVariant?: 'default' | 'energetic' | 'calm';
}

const SkiaCard = ({
  children,
  style,
  gradientColors = gradients.purpleToNeonBlue,
  glowIntensity = 0.3,
  onPress,
  animationVariant = 'default'
}: SkiaCardProps) => {
  // Animation values
  const clock = useClockValue();
  const cardOpacity = useValue(0);
  const cardScale = useValue(0.95);
  const glowOpacity = useValue(0);
  const borderGlow = useValue(0);
  
  // Reanimated shared values
  const animatedOpacity = useSharedValue(0);
  const animatedScale = useSharedValue(0.95);
  const animatedGlow = useSharedValue(0);
  const animatedBorderGlow = useSharedValue(0);
  const pressed = useSharedValue(false);
  
  // Connect Reanimated shared values to Skia values
  useSharedValueEffect(() => {
    cardOpacity.current = animatedOpacity.value;
  }, animatedOpacity);
  
  useSharedValueEffect(() => {
    cardScale.current = animatedScale.value;
  }, animatedScale);
  
  useSharedValueEffect(() => {
    glowOpacity.current = animatedGlow.value;
  }, animatedGlow);
  
  useSharedValueEffect(() => {
    borderGlow.current = animatedBorderGlow.value;
  }, animatedBorderGlow);
  
  // Start entrance animation
  useEffect(() => {
    // Fade in
    animatedOpacity.value = withTiming(1, { 
      duration: 600, 
      easing: Easing.out(Easing.cubic) 
    });
    
    // Scale up
    animatedScale.value = withSpring(1, { 
      damping: 15, 
      stiffness: 100,
      mass: 1
    });
    
    // Glow animation based on variant
    let glowConfig = {
      min: 0.1,
      max: glowIntensity,
      duration: 3000
    };
    
    switch (animationVariant) {
      case 'energetic':
        glowConfig = {
          min: 0.2,
          max: glowIntensity * 1.5,
          duration: 1500
        };
        break;
      case 'calm':
        glowConfig = {
          min: 0.05,
          max: glowIntensity * 0.7,
          duration: 5000
        };
        break;
    }
    
    // Start glow animation
    animatedGlow.value = withRepeat(
      withTiming(glowConfig.max, { 
        duration: glowConfig.duration, 
        easing: Easing.inOut(Easing.sine) 
      }),
      -1,
      true
    );
    
    // Border glow animation
    animatedBorderGlow.value = withRepeat(
      withTiming(1, { 
        duration: glowConfig.duration * 1.5, 
        easing: Easing.inOut(Easing.sine) 
      }),
      -1,
      true
    );
  }, [animationVariant, glowIntensity]);
  
  // Handle press
  const handlePress = () => {
    if (onPress) {
      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Animate press
      pressed.value = true;
      animatedScale.value = withSequence(
        withTiming(0.97, { duration: 100, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
      );
      
      // Increase glow temporarily
      animatedGlow.value = withSequence(
        withTiming(glowIntensity * 2, { duration: 100, easing: Easing.out(Easing.cubic) }),
        withTiming(glowIntensity, { duration: 500, easing: Easing.out(Easing.cubic) })
      );
      
      onPress();
      
      // Reset pressed state
      setTimeout(() => {
        pressed.value = false;
      }, 200);
    }
  };
  
  // Compute border path
  const borderPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    // Create rounded rectangle path for border
    const rect = { x: 0, y: 0, width: '100%', height: '100%' };
    path.addRRect({
      rect,
      rx: CARD_BORDER_RADIUS,
      ry: CARD_BORDER_RADIUS
    });
    
    return path;
  }, []);
  
  // Compute glow path
  const glowPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    // Create path with subtle wave effect on edges
    const waveAmplitude = 2;
    const waveFrequency = 4;
    const phase = (clock.current / 1000) % (Math.PI * 2);
    
    // Top edge with wave
    path.moveTo(CARD_BORDER_RADIUS, 0);
    for (let x = CARD_BORDER_RADIUS; x <= width - CARD_BORDER_RADIUS; x += 5) {
      const normalizedX = (x - CARD_BORDER_RADIUS) / (width - CARD_BORDER_RADIUS * 2);
      const y = Math.sin(normalizedX * Math.PI * waveFrequency + phase) * waveAmplitude;
      path.lineTo(x, y);
    }
    
    // Right edge
    path.lineTo(width, CARD_BORDER_RADIUS);
    path.lineTo(width, '100% - ' + CARD_BORDER_RADIUS);
    
    // Bottom edge with wave
    for (let x = width - CARD_BORDER_RADIUS; x >= CARD_BORDER_RADIUS; x -= 5) {
      const normalizedX = (x - CARD_BORDER_RADIUS) / (width - CARD_BORDER_RADIUS * 2);
      const y = '100% - ' + Math.sin(normalizedX * Math.PI * waveFrequency + phase + Math.PI) * waveAmplitude;
      path.lineTo(x, y);
    }
    
    // Left edge
    path.lineTo(0, '100% - ' + CARD_BORDER_RADIUS);
    path.lineTo(0, CARD_BORDER_RADIUS);
    path.close();
    
    return path;
  }, [clock]);
  
  // Render card content
  const renderContent = () => {
    return (
      <View style={styles.contentContainer}>
        {children}
      </View>
    );
  };
  
  // Render card with or without touch handler
  if (onPress) {
    return (
      <TouchableOpacity 
        style={[styles.container, style]} 
        onPress={handlePress}
        activeOpacity={0.95}
      >
        <Canvas style={styles.canvas}>
          {/* Card background */}
          <Group transform={[{ scale: cardScale.current }]} opacity={cardOpacity.current}>
            {/* Glow effect */}
            <RoundedRect
              x={0}
              y={0}
              width="100%"
              height="100%"
              r={CARD_BORDER_RADIUS}
              color={gradientColors[0] + Math.floor(glowOpacity.current * 255).toString(16).padStart(2, '0')}
            >
              <BlurMask blur={20} style="normal" />
            </RoundedRect>
            
            {/* Card background */}
            <RoundedRect
              x={0}
              y={0}
              width="100%"
              height="100%"
              r={CARD_BORDER_RADIUS}
              color={colors.cardBackground}
            />
            
            {/* Border glow */}
            <Path path={borderPath} style="stroke" strokeWidth={2} color={gradientColors[0] + Math.floor((0.5 + borderGlow.current * 0.5) * 255).toString(16).padStart(2, '0')}>
              <BlurMask blur={4} style="normal" />
            </Path>
          </Group>
        </Canvas>
        
        {renderContent()}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={[styles.container, style]}>
      <Canvas style={styles.canvas}>
        {/* Card background */}
        <Group transform={[{ scale: cardScale.current }]} opacity={cardOpacity.current}>
          {/* Glow effect */}
          <RoundedRect
            x={0}
            y={0}
            width="100%"
            height="100%"
            r={CARD_BORDER_RADIUS}
            color={gradientColors[0] + Math.floor(glowOpacity.current * 255).toString(16).padStart(2, '0')}
          >
            <BlurMask blur={20} style="normal" />
          </RoundedRect>
          
          {/* Card background */}
          <RoundedRect
            x={0}
            y={0}
            width="100%"
            height="100%"
            r={CARD_BORDER_RADIUS}
            color={colors.cardBackground}
          />
          
          {/* Border glow */}
          <Path path={borderPath} style="stroke" strokeWidth={2} color={gradientColors[0] + Math.floor((0.5 + borderGlow.current * 0.5) * 255).toString(16).padStart(2, '0')}>
            <BlurMask blur={4} style="normal" />
          </Path>
        </Group>
      </Canvas>
      
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  canvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
  },
});

export default SkiaCard;
