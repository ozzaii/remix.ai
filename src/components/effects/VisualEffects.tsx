import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform } from 'react-native';
import { Canvas, Skia, Path, useValue, useComputedValue, 
  useClockValue, vec, Group, Paint, Circle, BlurMask, 
  RoundedRect, useSharedValueEffect, Rect } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withTiming, 
  withSpring, withRepeat, withDelay, Easing } from 'react-native-reanimated';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

// Define shader for particle effects
const PARTICLE_SHADER = `
uniform float time;
uniform vec2 resolution;
uniform vec2 center;
uniform float intensity;
uniform vec4 color1;
uniform vec4 color2;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
}

half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution.xy;
    vec2 center_uv = center / resolution.xy;
    
    // Calculate distance from center
    float dist = distance(uv, center_uv);
    
    // Create particles
    float particles = 0.0;
    
    for (int i = 0; i < 50; i++) {
        float t = time * 0.5 + float(i) * 0.1;
        float angle = t * 0.5 + float(i) * 0.1;
        float radius = 0.1 + 0.2 * sin(t * 0.3 + float(i) * 0.05);
        
        vec2 particlePos = center_uv + vec2(
            cos(angle) * radius * (resolution.x / resolution.y),
            sin(angle) * radius
        );
        
        float particleSize = 0.003 + 0.002 * sin(t + float(i));
        float particle = smoothstep(particleSize, 0.0, distance(uv, particlePos));
        
        // Add glow
        float glow = smoothstep(particleSize * 5.0, 0.0, distance(uv, particlePos));
        
        particles += particle * 0.5 + glow * 0.1;
    }
    
    // Add wave effect
    float wave = sin(dist * 20.0 - time * 2.0) * 0.5 + 0.5;
    wave *= smoothstep(0.5, 0.0, dist); // Fade out with distance
    
    // Mix colors based on intensity and wave
    vec4 finalColor = mix(color1, color2, wave * intensity);
    
    // Apply particles
    finalColor += vec4(particles * intensity);
    
    // Apply alpha based on distance
    finalColor.a *= smoothstep(0.8, 0.0, dist) * intensity;
    
    return half4(finalColor);
}
`;

// Define interfaces
interface VisualEffectsProps {
  children: React.ReactNode;
  effectType?: 'particles' | 'waves' | 'ripples' | 'none';
  intensity?: number;
  color1?: string;
  color2?: string;
  triggerEffect?: boolean;
}

/**
 * VisualEffects component that adds premium visual effects and transitions
 * using Skia shaders and hardware-accelerated animations.
 */
const VisualEffects = ({
  children,
  effectType = 'particles',
  intensity = 0.5,
  color1 = '#7C4DFF',
  color2 = '#2196F3',
  triggerEffect = false
}: VisualEffectsProps) => {
  // Animation values
  const clock = useClockValue();
  const effectOpacity = useValue(0);
  const effectIntensity = useValue(0);
  const touchPosition = useValue(vec(width / 2, height / 2));
  
  // Reanimated shared values
  const animatedOpacity = useSharedValue(0);
  const animatedIntensity = useSharedValue(0);
  const animatedTouchX = useSharedValue(width / 2);
  const animatedTouchY = useSharedValue(height / 2);
  
  // Connect Reanimated shared values to Skia values
  useSharedValueEffect(() => {
    effectOpacity.current = animatedOpacity.value;
  }, animatedOpacity);
  
  useSharedValueEffect(() => {
    effectIntensity.current = animatedIntensity.value;
  }, animatedIntensity);
  
  useSharedValueEffect(() => {
    touchPosition.current = vec(animatedTouchX.value, animatedTouchY.value);
  }, [animatedTouchX, animatedTouchY]);
  
  // Create shader instance
  // Note: Using simpler effects for compatibility with Skia 1.5.0
  
  // Trigger effect animation
  useEffect(() => {
    if (triggerEffect) {
      // Fade in effect
      animatedOpacity.value = withTiming(1, { 
        duration: 500, 
        easing: Easing.out(Easing.cubic) 
      });
      
      // Increase intensity
      animatedIntensity.value = withSequence(
        withTiming(intensity * 1.5, { 
          duration: 300, 
          easing: Easing.out(Easing.cubic) 
        }),
        withTiming(intensity, { 
          duration: 1000, 
          easing: Easing.inOut(Easing.cubic) 
        })
      );
      
      // Animate touch position
      animatedTouchX.value = withRepeat(
        withTiming(width * 0.7, { 
          duration: 3000, 
          easing: Easing.inOut(Easing.sine) 
        }),
        -1,
        true
      );
      
      animatedTouchY.value = withRepeat(
        withTiming(height * 0.3, { 
          duration: 4000, 
          easing: Easing.inOut(Easing.sine) 
        }),
        -1,
        true
      );
    } else {
      // Fade out effect
      animatedOpacity.value = withTiming(0, { 
        duration: 500, 
        easing: Easing.out(Easing.cubic) 
      });
      
      // Decrease intensity
      animatedIntensity.value = withTiming(0, { 
        duration: 300, 
        easing: Easing.out(Easing.cubic) 
      });
    }
  }, [triggerEffect, intensity]);
  
  // Compute particles
  const particlesPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    // Create particles
    for (let i = 0; i < 20; i++) {
      const t = clock.current / 1000 * 0.5 + i * 0.1;
      const angle = t * 0.5 + i * 0.1;
      const radius = 0.1 + 0.2 * Math.sin(t * 0.3 + i * 0.05);
      
      const x = touchPosition.current.x + Math.cos(angle) * radius * width * 0.5;
      const y = touchPosition.current.y + Math.sin(angle) * radius * height * 0.3;
      
      const particleSize = 5 + 3 * Math.sin(t + i);
      
      path.addCircle(x, y, particleSize * effectIntensity.current);
    }
    
    return path;
  }, [clock, touchPosition, effectIntensity]);
  
  // Render different effect types
  const renderEffect = () => {
    if (effectType === 'none') {
      return null;
    }
    
    return (
      <Canvas style={[styles.canvas, { opacity: effectOpacity.current }]}>
        {/* Particles */}
        <Group opacity={0.7 * effectIntensity.current}>
          <Path path={particlesPath}>
            <Paint>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(width, height)}
                colors={[color1, color2]}
              />
            </Paint>
            <BlurMask blur={10} style="normal" />
          </Path>
        </Group>
        
        {/* Ripple effect */}
        <Circle
          cx={touchPosition.current.x}
          cy={touchPosition.current.y}
          r={100 * effectIntensity.current}
          style="stroke"
          strokeWidth={2}
          color={color1 + '40'}
        >
          <BlurMask blur={5} style="normal" />
        </Circle>
      </Canvas>
    );
  };
  
  return (
    <View style={styles.container}>
      {children}
      {renderEffect()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 10,
    pointerEvents: 'none',
  },
});

export default VisualEffects;
