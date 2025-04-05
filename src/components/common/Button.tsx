import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Animated, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
}) => {
  // Animation for press effect
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  
  // Setup loading animation
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(loadingAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      loadingAnim.setValue(0);
    }
  }, [loading]);
  
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 40,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.2,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  // Determine button styles based on variant and size
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    let buttonStyles: StyleProp<ViewStyle> = [styles.button];
    
    // Size styles
    switch (size) {
      case 'small':
        buttonStyles.push(styles.buttonSmall);
        break;
      case 'large':
        buttonStyles.push(styles.buttonLarge);
        break;
      default:
        buttonStyles.push(styles.buttonMedium);
    }
    
    // Variant styles
    switch (variant) {
      case 'secondary':
        buttonStyles.push(styles.buttonSecondary);
        break;
      case 'outline':
        buttonStyles.push(styles.buttonOutline);
        break;
      case 'ghost':
        buttonStyles.push(styles.buttonGhost);
        break;
      default:
        buttonStyles.push(styles.buttonPrimary);
    }
    
    // Full width style
    if (fullWidth) {
      buttonStyles.push(styles.buttonFullWidth);
    }
    
    // Disabled style
    if (disabled) {
      buttonStyles.push(styles.buttonDisabled);
    }
    
    return buttonStyles;
  };
  
  // Determine text styles based on variant
  const getTextStyles = (): StyleProp<TextStyle> => {
    let textStyles: StyleProp<TextStyle> = [styles.buttonText];
    
    // Size styles
    switch (size) {
      case 'small':
        textStyles.push(styles.buttonTextSmall);
        break;
      case 'large':
        textStyles.push(styles.buttonTextLarge);
        break;
      default:
        textStyles.push(styles.buttonTextMedium);
    }
    
    // Variant styles
    switch (variant) {
      case 'outline':
        textStyles.push(styles.buttonTextOutline);
        break;
      case 'ghost':
        textStyles.push(styles.buttonTextGhost);
        break;
      default:
        textStyles.push(styles.buttonTextPrimary);
    }
    
    // Disabled style
    if (disabled) {
      textStyles.push(styles.buttonTextDisabled);
    }
    
    return textStyles;
  };
  
  // Determine icon styles
  const getIconStyles = (): StyleProp<TextStyle> => {
    let iconStyles: StyleProp<TextStyle> = [styles.icon];
    
    if (iconPosition === 'right') {
      iconStyles.push(styles.iconRight);
    } else {
      iconStyles.push(styles.iconLeft);
    }
    
    return iconStyles;
  };
  
  // Determine icon color based on variant
  const getIconColor = () => {
    switch (variant) {
      case 'outline':
        return colors.diamond;
      case 'ghost':
        return colors.primary;
      default:
        return colors.textPrimary;
    }
  };
  
  // Render loading spinner or content
  const renderContent = () => {
    if (loading) {
      // Interpolate loadingAnim for base opacity (0.3 to 1.0)
      const baseOpacity = loadingAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1.0]
      });

      // Interpolate loadingAnim for dot 2 opacity (slightly delayed fade-in)
      const dot2Opacity = loadingAnim.interpolate({
        inputRange: [0, 0.25, 1],
        outputRange: [0.3, 0.3, 1.0]
      });

      // Interpolate loadingAnim for dot 3 opacity (more delayed fade-in)
      const dot3Opacity = loadingAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.3, 1.0]
      });

      return (
        <View style={styles.loadingContainer}>
          <Animated.View 
            style={[
              styles.loadingDot, 
              { opacity: baseOpacity } // Use interpolated base opacity
            ]} 
          />
          <Animated.View 
            style={[
              styles.loadingDot, 
              { opacity: dot2Opacity } // Use interpolated dot 2 opacity
            ]} 
          />
          <Animated.View 
            style={[
              styles.loadingDot, 
              { opacity: dot3Opacity } // Use interpolated dot 3 opacity
            ]} 
          />
        </View>
      );
    }
    
    return (
      <>
        {icon && iconPosition === 'left' && (
          <View style={getIconStyles()}>
            <Ionicons name={icon as any} size={size === 'small' ? 16 : size === 'large' ? 24 : 20} color={getIconColor()} />
          </View>
        )}
        <Text style={getTextStyles()}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <View style={getIconStyles()}>
            <Ionicons name={icon as any} size={size === 'small' ? 16 : size === 'large' ? 24 : 20} color={getIconColor()} />
          </View>
        )}
      </>
    );
  };
  
  // Render gradient background for primary and secondary buttons
  const renderBackground = () => {
    if (variant === 'primary') {
      return (
        <LinearGradient
          colors={gradients.godTier}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        >
          <Text style={{ opacity: 0 }}>.</Text>
        </LinearGradient>
      );
    } else if (variant === 'secondary') {
      return (
        <LinearGradient
          colors={gradients.diamondGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        >
          <Text style={{ opacity: 0 }}>.</Text>
        </LinearGradient>
      );
    }
    
    return null;
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={style}
    >
      <Animated.View style={[
        getButtonStyles(),
        { transform: [{ scale: scaleAnim }] }
      ]}>
        {renderBackground()}
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            styles.pressEffect,
            { opacity: opacityAnim }
          ]} 
        />
        {renderContent()}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 100,
    borderRadius: 20,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 140,
    borderRadius: 24,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 180,
    borderRadius: 28,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    ...globalStyles.shadow,
    shadowColor: colors.diamond,
    shadowOpacity: 0.8,
    elevation: 8,
  },
  buttonSecondary: {
    backgroundColor: colors.backgroundLight,
    ...globalStyles.shadowLight,
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    elevation: 6,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.diamond,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSmall: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextMedium: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextLarge: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: colors.textPrimary,
  },
  buttonTextOutline: {
    color: colors.vibrantPurple,
  },
  buttonTextGhost: {
    color: colors.vibrantPurple,
  },
  buttonTextDisabled: {
    color: colors.textSecondary,
  },
  icon: {
    marginHorizontal: 8,
  },
  iconLeft: {
    marginRight: 8,
    marginLeft: 0,
  },
  iconRight: {
    marginLeft: 8,
    marginRight: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.diamond,
    marginHorizontal: 3,
    shadowColor: colors.diamond,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  pressEffect: {
    backgroundColor: colors.diamond + '30',
  },
});

export default Button;
