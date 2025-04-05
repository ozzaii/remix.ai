import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

interface GradientCardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  interactive?: boolean;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
}

const GradientCard: React.FC<GradientCardProps> = ({
  children,
  style,
  onPress,
  interactive = false,
  gradientColors = gradients.darkToLight,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 1 },
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      })
    ]).start();
    
    // Subtle pulse animation for interactive cards
    if (interactive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sine),
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sine),
          })
        ])
      ).start();
    }
  }, []);
  
  const handlePressIn = () => {
    if (!interactive) return;
    
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };
  
  const handlePressOut = () => {
    if (!interactive) return;
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };
  
  const cardContent = (
    <Animated.View 
      style={[
        styles.container,
        style,
        {
          opacity: fadeInAnim,
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim },
            {
              scale: interactive ? pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.02],
              }) : 1
            }
          ]
        }
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={gradientStart}
        end={gradientEnd}
        style={[StyleSheet.absoluteFill, styles.gradient]}
      >
        <Text style={{ opacity: 0 }}>.</Text>
      </LinearGradient>
      {children}
    </Animated.View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }
  
  return cardContent;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...globalStyles.shadowLight,
  },
  gradient: {
    borderRadius: 16,
  },
});

export default GradientCard;
