import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

const { width } = Dimensions.get('window');

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showLogo?: boolean;
  transparent?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showLogo = false,
  transparent = false,
  rightComponent,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const handleBackPress = () => {
    // Animate out before navigating back
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -5,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (onBackPress) {
        onBackPress();
      }
    });
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        transparent && styles.transparent,
        { 
          paddingTop: insets.top,
          opacity: fadeAnim,
          transform: [{ translateY }]
        }
      ]}
    >
      {!transparent && (
        <LinearGradient
          colors={gradients.purpleToNeonBlue}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <BlurView intensity={20} style={StyleSheet.absoluteFill}>
            <Text style={{ opacity: 0 }}>.</Text>
          </BlurView>
        </LinearGradient>
      )}
      
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={transparent ? gradients.glassEffect : gradients.darkToLight}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              >
                <Text style={{ opacity: 0 }}>.</Text>
              </LinearGradient>
              <Ionicons 
                name="chevron-back" 
                size={28} 
                color={transparent ? colors.vibrantPurple : colors.textPrimary} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.centerContainer}>
          {showLogo ? (
            // <Image
            //  source={require('../../assets/images/logo.png')}
            //  style={styles.logo}
            //  resizeMode="contain"
            // />
            null
          ) : (
            <Animated.Text 
              style={[
                styles.title,
                transparent && styles.transparentTitle,
                { opacity: fadeAnim }
              ]}
            >
              {title}
            </Animated.Text>
          )}
        </View>
        
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 100,
    position: 'relative',
    zIndex: 10,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftContainer: {
    width: 60,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 60,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...globalStyles.shadowLight,
  },
  title: {
    ...globalStyles.heading2,
    color: colors.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  transparentTitle: {
    color: colors.textPrimary,
    textShadowColor: 'transparent',
  },
  logo: {
    height: 40,
    width: width * 0.4,
  },
});

export default Header;
