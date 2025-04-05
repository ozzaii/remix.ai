import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Canvas, Skia, Path, useValue, useComputedValue, 
  useClockValue, vec, Group, Paint, Circle, BlurMask, 
  RoundedRect, useSharedValueEffect } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withTiming, 
  withSpring, withRepeat, withDelay, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

const { width } = Dimensions.get('window');
const BUTTON_HEIGHT = 50;
const BUTTON_BORDER_RADIUS = 25;

// Define interfaces
interface SkiaButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  gradientColors?: string[];
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  style?: any;
}

const SkiaButton = ({
  label,
  onPress,
  icon,
  gradientColors = gradients.purpleToNeonBlue,
  size = 'medium',
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style
}: SkiaButtonProps) => {
  // Animation values
  const clock = useClockValue();
  const buttonOpacity = useValue(0);
  const buttonScale = useValue(0.95);
  const glowOpacity = useValue(0);
  const loadingProgress = useValue(0);
  
  // Reanimated shared values
  const animatedOpacity = useSharedValue(0);
  const animatedScale = useSharedValue(0.95);
  const animatedGlow = useSharedValue(0);
  const animatedLoading = useSharedValue(0);
  const pressed = useSharedValue(false);
  
  // Connect Reanimated shared values to Skia values
  useSharedValueEffect(() => {
    buttonOpacity.current = animatedOpacity.value;
  }, animatedOpacity);
  
  useSharedValueEffect(() => {
    buttonScale.current = animatedScale.value;
  }, animatedScale);
  
  useSharedValueEffect(() => {
    glowOpacity.current = animatedGlow.value;
  }, animatedGlow);
  
  useSharedValueEffect(() => {
    loadingProgress.current = animatedLoading.value;
  }, animatedLoading);
  
  // Start entrance animation
  useEffect(() => {
    // Fade in
    animatedOpacity.value = withTiming(disabled ? 0.6 : 1, { 
      duration: 600, 
      easing: Easing.out(Easing.cubic) 
    });
    
    // Scale up
    animatedScale.value = withSpring(1, { 
      damping: 15, 
      stiffness: 100,
      mass: 1
    });
    
    // Glow animation
    animatedGlow.value = withRepeat(
      withTiming(0.3, { 
        duration: 2000, 
        easing: Easing.inOut(Easing.sine) 
      }),
      -1,
      true
    );
  }, [disabled]);
  
  // Update loading animation
  useEffect(() => {
    if (isLoading) {
      animatedLoading.value = withRepeat(
        withTiming(1, { 
          duration: 1500, 
          easing: Easing.linear 
        }),
        -1,
        false
      );
    } else {
      animatedLoading.value = withTiming(0, { 
        duration: 300, 
        easing: Easing.out(Easing.cubic) 
      });
    }
  }, [isLoading]);
  
  // Handle press
  const handlePress = () => {
    if (!disabled && !isLoading) {
      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Animate press
      pressed.value = true;
      animatedScale.value = withSequence(
        withTiming(0.95, { duration: 100, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
      );
      
      // Increase glow temporarily
      animatedGlow.value = withSequence(
        withTiming(0.6, { duration: 100, easing: Easing.out(Easing.cubic) }),
        withTiming(0.3, { duration: 500, easing: Easing.out(Easing.cubic) })
      );
      
      onPress();
      
      // Reset pressed state
      setTimeout(() => {
        pressed.value = false;
      }, 200);
    }
  };
  
  // Get button dimensions based on size
  const getButtonDimensions = () => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          paddingHorizontal: 16,
          borderRadius: 20,
          fontSize: 14
        };
      case 'large':
        return {
          height: 60,
          paddingHorizontal: 32,
          borderRadius: 30,
          fontSize: 18
        };
      default: // medium
        return {
          height: BUTTON_HEIGHT,
          paddingHorizontal: 24,
          borderRadius: BUTTON_BORDER_RADIUS,
          fontSize: 16
        };
    }
  };
  
  const dimensions = getButtonDimensions();
  
  // Compute loading path
  const loadingPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    // Create circular loading indicator
    const centerX = dimensions.height / 2;
    const centerY = dimensions.height / 2;
    const radius = dimensions.height / 2 - 4;
    
    // Draw arc from top center
    path.moveTo(centerX, centerY - radius);
    path.arcToOval(
      { x: centerX - radius, y: centerY - radius, width: radius * 2, height: radius * 2 },
      -Math.PI / 2,
      Math.PI * 2 * loadingProgress.current,
      false
    );
    
    return path;
  }, [loadingProgress, dimensions.height]);
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        {
          height: dimensions.height,
          borderRadius: dimensions.borderRadius,
          paddingHorizontal: dimensions.paddingHorizontal
        },
        style
      ]} 
      onPress={handlePress}
      activeOpacity={0.95}
      disabled={disabled || isLoading}
    >
      <Canvas style={styles.canvas}>
        {/* Button background */}
        <Group transform={[{ scale: buttonScale.current }]} opacity={buttonOpacity.current}>
          {/* Glow effect */}
          <RoundedRect
            x={0}
            y={0}
            width="100%"
            height="100%"
            r={dimensions.borderRadius}
            color={gradientColors[0] + Math.floor(glowOpacity.current * 255).toString(16).padStart(2, '0')}
          >
            <BlurMask blur={20} style="normal" />
          </RoundedRect>
          
          {/* Button background based on variant */}
          {variant === 'primary' && (
            <RoundedRect
              x={0}
              y={0}
              width="100%"
              height="100%"
              r={dimensions.borderRadius}
            >
              <Paint>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec('100%', '100%')}
                  colors={gradientColors}
                />
              </Paint>
            </RoundedRect>
          )}
          
          {variant === 'secondary' && (
            <RoundedRect
              x={0}
              y={0}
              width="100%"
              height="100%"
              r={dimensions.borderRadius}
              color={colors.cardBackground}
            />
          )}
          
          {variant === 'outline' && (
            <>
              <RoundedRect
                x={0}
                y={0}
                width="100%"
                height="100%"
                r={dimensions.borderRadius}
                color="transparent"
              />
              <RoundedRect
                x={1}
                y={1}
                width="100% - 2"
                height="100% - 2"
                r={dimensions.borderRadius - 1}
                style="stroke"
                strokeWidth={2}
              >
                <Paint>
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec('100%', '100%')}
                    colors={gradientColors}
                  />
                </Paint>
              </RoundedRect>
            </>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <Group transform={[
              { translateX: dimensions.paddingHorizontal },
              { rotate: clock.current / 300 }
            ]}>
              <Path 
                path={loadingPath}
                style="stroke"
                strokeWidth={3}
                strokeJoin="round"
                strokeCap="round"
                color="rgba(255, 255, 255, 0.9)"
              />
            </Group>
          )}
        </Group>
      </Canvas>
      
      <View style={styles.contentContainer}>
        {icon && !isLoading && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        
        {isLoading ? (
          <Text style={[
            styles.label, 
            { 
              fontSize: dimensions.fontSize,
              color: variant === 'outline' ? gradientColors[0] : colors.textPrimary,
              marginLeft: dimensions.height
            }
          ]}>
            Yükleniyor...
          </Text>
        ) : (
          <Text style={[
            styles.label, 
            { 
              fontSize: dimensions.fontSize,
              color: variant === 'outline' ? gradientColors[0] : colors.textPrimary
            }
          ]}>
            {label}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  canvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SkiaButton;
