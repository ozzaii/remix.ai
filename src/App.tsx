import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Animated, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { 
  createStackNavigator, 
  StackNavigationOptions, 
  StackCardInterpolationProps, 
  TransitionPresets, 
} from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, gradients } from './theme/colors';
import VisualizerScreen from './screens/visualizer/VisualizerScreen';
import HomeScreen from './screens/home/HomeScreen';
import ProfileScreen from './screens/auth/ProfileScreen';
import { AuthProvider } from './services/auth/AuthContext';
import ChatScreen from './screens/chat/ChatScreen';
import { ClaudeProvider } from './services/claude/ConversationContext';
import * as Haptics from 'expo-haptics';
import PerformanceOptimizer, { PerformanceLevel } from './utils/performanceOptimizer';

// Initialize performance optimizer
const performanceOptimizer = PerformanceOptimizer.getInstance();

// Define ParamList for the stack navigator
type RootStackParamList = {
  Home: undefined;
  Visualizer: { beatPattern?: any; autoPlay?: boolean; editMode?: boolean; patternId?: string };
  Profile: undefined;
  Chat: undefined;
  Battles: undefined;
  Community: undefined;
};

// Pass the ParamList to the navigator
const Stack = createStackNavigator<RootStackParamList>();
const { width, height } = Dimensions.get('window');

// Enhanced premium transition for GOD-TIER feel
const godTierTransition: StackNavigationOptions = {
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 400, // Slightly longer for more dramatic effect
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
  },
  cardStyleInterpolator: ({ current, next, layouts }: StackCardInterpolationProps) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.92, 1], // More dramatic scale effect
            }),
          },
          {
            rotate: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['2deg', '0deg'], // More noticeable rotation
            }),
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1], // More dramatic fade
        }),
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.7], // Darker overlay for more premium feel
        }),
        backgroundColor: colors.primary + '40', // Tinted overlay with primary color
      },
    };
  },
};

const App = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Premium app loading experience
    const prepareApp = async () => {
      try {
        // Simulate resource loading
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Trigger haptic feedback on launch for premium feel
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        
        // Set performance to GOD-TIER for launch experience
        performanceOptimizer.adjustPerformanceLevel(true); // Increase to maximum
        
        setIsReady(true);
        
        // Enhanced fade-in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800, // Longer, more dramatic fade
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('App initialization error:', error);
        // Graceful fallback
        setIsReady(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };
    
    prepareApp();
  }, []);
  
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.diamond} />
      </View>
    );
  }
  
  return (
    <AuthProvider>
      <ClaudeProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <NavigationContainer theme={{
              dark: true,
              colors: {
                primary: colors.diamond, // Use diamond color for primary navigation elements
                background: colors.deepBlack,
                card: colors.darkBlue,
                text: colors.textPrimary,
                border: 'transparent', // Remove borders for cleaner look
                notification: colors.gold, // Use gold for notifications
              }
            }}>
              <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                  headerShown: false,
                  cardStyle: { backgroundColor: colors.deepBlack },
                  ...godTierTransition,
                }}
              >
                <Stack.Screen 
                  name="Home" 
                  component={HomeScreen} 
                  listeners={{
                    focus: () => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    },
                  }}
                />
                <Stack.Screen 
                  name="Visualizer" 
                  component={VisualizerScreen} 
                  initialParams={{ 
                    beatPattern: null, 
                    autoPlay: false 
                  }}
                  listeners={{
                    focus: () => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                    },
                  }}
                />
                <Stack.Screen 
                  name="Chat" 
                  component={ChatScreen} 
                  options={{ 
                    ...TransitionPresets.ModalPresentationIOS, 
                  }}
                  listeners={{
                    focus: () => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                    },
                  }}
                />
                <Stack.Screen 
                  name="Profile" 
                  component={ProfileScreen} 
                  listeners={{
                    focus: () => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    },
                  }}
                />
                {/* Enhanced placeholders for missing routes */}
                <Stack.Screen 
                  name="Battles" 
                  component={HomeScreen}
                  listeners={{
                    focus: () => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                    },
                  }}
                />
                <Stack.Screen 
                  name="Community" 
                  component={HomeScreen}
                  listeners={{
                    focus: () => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    },
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </Animated.View>
        </SafeAreaProvider>
      </ClaudeProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepBlack,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.deepBlack,
  },
});

export default App;
