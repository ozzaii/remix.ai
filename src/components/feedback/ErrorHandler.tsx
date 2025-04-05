import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform } from 'react-native';
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
const TOAST_HEIGHT = 60;
const TOAST_PADDING = 16;
const TOAST_MARGIN = 16;
const TOAST_BORDER_RADIUS = 12;

// Define toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Define interfaces
interface ErrorHandlerProps {
  children: React.ReactNode;
}

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onDismiss: () => void;
}

// Create context for error handling
export const ErrorHandlerContext = React.createContext<{
  showToast: (message: string, type: ToastType, duration?: number) => void;
  handleError: (error: Error) => void;
}>({
  showToast: () => {},
  handleError: () => {},
});

// Toast component with Skia animations
const Toast = ({ message, type, duration = 3000, onDismiss }: ToastProps) => {
  // Animation values
  const toastOpacity = useValue(0);
  const toastTranslateY = useValue(-TOAST_HEIGHT - TOAST_MARGIN);
  
  // Reanimated shared values
  const animatedOpacity = useSharedValue(0);
  const animatedTranslateY = useSharedValue(-TOAST_HEIGHT - TOAST_MARGIN);
  
  // Connect Reanimated shared values to Skia values
  useSharedValueEffect(() => {
    toastOpacity.current = animatedOpacity.value;
  }, animatedOpacity);
  
  useSharedValueEffect(() => {
    toastTranslateY.current = animatedTranslateY.value;
  }, animatedTranslateY);
  
  // Get toast colors based on type
  const getToastColors = () => {
    switch (type) {
      case 'success':
        return {
          background: '#4CAF50',
          icon: '✓',
          gradient: ['#43A047', '#2E7D32']
        };
      case 'error':
        return {
          background: '#F44336',
          icon: '✕',
          gradient: ['#E53935', '#C62828']
        };
      case 'warning':
        return {
          background: '#FFC107',
          icon: '!',
          gradient: ['#FFB300', '#FF8F00']
        };
      case 'info':
      default:
        return {
          background: '#2196F3',
          icon: 'i',
          gradient: ['#1E88E5', '#1565C0']
        };
    }
  };
  
  const toastColors = getToastColors();
  
  // Show toast animation
  useEffect(() => {
    // Trigger haptic feedback based on toast type
    if (Platform.OS !== 'web') {
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    
    // Animate in
    animatedOpacity.value = withTiming(1, { 
      duration: 300, 
      easing: Easing.out(Easing.cubic) 
    });
    
    animatedTranslateY.value = withSpring(TOAST_MARGIN, { 
      damping: 15, 
      stiffness: 120,
      mass: 1
    });
    
    // Auto dismiss after duration
    const dismissTimeout = setTimeout(() => {
      dismiss();
    }, duration);
    
    return () => clearTimeout(dismissTimeout);
  }, []);
  
  // Dismiss toast animation
  const dismiss = () => {
    animatedOpacity.value = withTiming(0, { 
      duration: 300, 
      easing: Easing.out(Easing.cubic) 
    });
    
    animatedTranslateY.value = withTiming(-TOAST_HEIGHT - TOAST_MARGIN, { 
      duration: 300, 
      easing: Easing.out(Easing.cubic) 
    });
    
    // Call onDismiss after animation completes
    setTimeout(onDismiss, 300);
  };
  
  return (
    <View style={[styles.toastContainer, { transform: [{ translateY: toastTranslateY.current }] }]}>
      <Canvas style={styles.canvas}>
        <Group opacity={toastOpacity.current}>
          {/* Glow effect */}
          <RoundedRect
            x={0}
            y={0}
            width="100%"
            height={TOAST_HEIGHT}
            r={TOAST_BORDER_RADIUS}
            color={toastColors.background + '80'}
          >
            <BlurMask blur={15} style="normal" />
          </RoundedRect>
          
          {/* Toast background */}
          <RoundedRect
            x={0}
            y={0}
            width="100%"
            height={TOAST_HEIGHT}
            r={TOAST_BORDER_RADIUS}
          >
            <Paint>
              <LinearGradient
                start={vec(0, 0)}
                end={vec('100%', '100%')}
                colors={toastColors.gradient.map(color => color + 'F0')}
              />
            </Paint>
          </RoundedRect>
        </Group>
      </Canvas>
      
      <View style={styles.toastContent}>
        <View style={[styles.iconContainer, { backgroundColor: toastColors.background }]}>
          <Text style={styles.icon}>{toastColors.icon}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </View>
    </View>
  );
};

// Main ErrorHandler component
const ErrorHandler = ({ children }: ErrorHandlerProps) => {
  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
    duration: number;
  }>({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000
  });
  
  // Show toast method
  const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    setToast({
      visible: true,
      message,
      type,
      duration
    });
  };
  
  // Handle error method
  const handleError = (error: Error) => {
    console.error('Error caught by ErrorHandler:', error);
    
    // Show error toast
    showToast(
      error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
      'error',
      5000
    );
    
    // Log error to analytics service in production
    if (!__DEV__) {
      // This would be replaced with actual error logging service
      console.log('Logging error to analytics service:', error);
    }
  };
  
  // Dismiss toast
  const dismissToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };
  
  return (
    <ErrorHandlerContext.Provider value={{ showToast, handleError }}>
      <View style={styles.container}>
        {children}
        
        {/* Toast */}
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onDismiss={dismissToast}
          />
        )}
      </View>
    </ErrorHandlerContext.Provider>
  );
};

// Custom hook to use error handler
export const useErrorHandler = () => {
  return React.useContext(ErrorHandlerContext);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: TOAST_MARGIN,
    right: TOAST_MARGIN,
    height: TOAST_HEIGHT,
    borderRadius: TOAST_BORDER_RADIUS,
    overflow: 'hidden',
    zIndex: 9999,
  },
  canvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  toastContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TOAST_PADDING,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorHandler;
