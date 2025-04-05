import React from 'react';
import { StyleSheet, View, Text, Dimensions, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Canvas, Skia, Path, useValue, useComputedValue, 
  useClockValue, vec, Group, Paint, Circle, BlurMask, 
  RoundedRect, useSharedValueEffect } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withTiming, 
  withSpring, withRepeat, withDelay, Easing } from 'react-native-reanimated';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 80;

// Define interfaces
interface SkiaHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  animationVariant?: 'default' | 'energetic' | 'calm';
}

const SkiaHeader = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightComponent,
  animationVariant = 'default'
}: SkiaHeaderProps) => {
  // Animation values
  const clock = useClockValue();
  const headerOpacity = useValue(0);
  const headerScale = useValue(0.95);
  const glowIntensity = useValue(0);
  
  // Reanimated shared values
  const animatedOpacity = useSharedValue(0);
  const animatedScale = useSharedValue(0.95);
  const animatedGlow = useSharedValue(0);
  
  // Connect Reanimated shared values to Skia values
  useSharedValueEffect(() => {
    headerOpacity.current = animatedOpacity.value;
  }, animatedOpacity);
  
  useSharedValueEffect(() => {
    headerScale.current = animatedScale.value;
  }, animatedScale);
  
  useSharedValueEffect(() => {
    glowIntensity.current = animatedGlow.value;
  }, animatedGlow);
  
  // Start entrance animation
  React.useEffect(() => {
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
      min: 0.2,
      max: 0.4,
      duration: 3000
    };
    
    switch (animationVariant) {
      case 'energetic':
        glowConfig = {
          min: 0.3,
          max: 0.6,
          duration: 1500
        };
        break;
      case 'calm':
        glowConfig = {
          min: 0.1,
          max: 0.3,
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
  }, [animationVariant]);
  
  // Compute background path
  const backgroundPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    // Create path with rounded bottom corners
    const cornerRadius = 20;
    
    // Top left corner (no rounding)
    path.moveTo(0, 0);
    
    // Top edge
    path.lineTo(width, 0);
    
    // Top right corner (no rounding)
    path.lineTo(width, HEADER_HEIGHT - cornerRadius);
    
    // Bottom right corner (rounded)
    path.arcTo(
      { x: width - cornerRadius, y: HEADER_HEIGHT - cornerRadius, width: cornerRadius * 2, height: cornerRadius * 2 },
      0,
      Math.PI / 2,
      false
    );
    
    // Bottom edge
    path.lineTo(cornerRadius, HEADER_HEIGHT);
    
    // Bottom left corner (rounded)
    path.arcTo(
      { x: 0, y: HEADER_HEIGHT - cornerRadius, width: cornerRadius * 2, height: cornerRadius * 2 },
      Math.PI / 2,
      Math.PI / 2,
      false
    );
    
    // Left edge
    path.lineTo(0, 0);
    
    path.close();
    return path;
  }, []);
  
  // Compute glow effect path
  const glowPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    // Create subtle wave effect at bottom of header
    const waveHeight = 10;
    const waveFrequency = 3;
    const phase = (clock.current / 1000) % (Math.PI * 2);
    
    path.moveTo(0, HEADER_HEIGHT - waveHeight);
    
    for (let x = 0; x <= width; x += 5) {
      const y = HEADER_HEIGHT - (Math.sin((x / width) * Math.PI * waveFrequency + phase) * waveHeight);
      path.lineTo(x, y);
    }
    
    path.lineTo(width, 0);
    path.lineTo(0, 0);
    path.close();
    
    return path;
  }, [clock]);
  
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Canvas style={styles.canvas}>
        {/* Background with gradient */}
        <Group transform={[{ scale: headerScale.current }]} opacity={headerOpacity.current}>
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={HEADER_HEIGHT}
            r={20}
            color="#121212"
          />
          
          {/* Gradient overlay */}
          <Path path={backgroundPath}>
            <Paint>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(width, HEADER_HEIGHT)}
                colors={['rgba(104, 132, 255, 0.3)', 'rgba(138, 43, 226, 0.2)']}
              />
            </Paint>
          </Path>
          
          {/* Glow effect */}
          <Path path={glowPath}>
            <Paint>
              <LinearGradient
                start={vec(width / 2, HEADER_HEIGHT)}
                end={vec(width / 2, HEADER_HEIGHT - 30)}
                colors={[
                  `rgba(104, 132, 255, ${glowIntensity.current})`, 
                  'rgba(104, 132, 255, 0)'
                ]}
              />
            </Paint>
          </Path>
          
          {/* Decorative elements */}
          <Circle
            cx={width - 30}
            cy={15}
            r={4}
            color="rgba(255, 255, 255, 0.3)"
          >
            <BlurMask blur={2} style="normal" />
          </Circle>
          
          <Circle
            cx={width - 50}
            cy={20}
            r={2}
            color="rgba(255, 255, 255, 0.2)"
          >
            <BlurMask blur={1} style="normal" />
          </Circle>
        </Group>
      </Canvas>
      
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          {subtitle ? (
            <>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </>
          ) : (
            <Text style={styles.titleLarge}>{title}</Text>
          )}
        </View>
        
        {rightComponent && (
          <View style={styles.rightComponentContainer}>
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: HEADER_HEIGHT + (Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0),
    zIndex: 10,
  },
  canvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...globalStyles.heading2,
    color: colors.textPrimary,
  },
  titleLarge: {
    ...globalStyles.heading1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightComponentContainer: {
    marginLeft: 16,
  },
});

export default SkiaHeader;
