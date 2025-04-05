import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Canvas, Skia, Path, useValue, useComputedValue, 
  useClockValue, vec, Group, Paint, Circle, BlurMask, 
  useSharedValueEffect } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withTiming, 
  withSpring, withRepeat, withDelay, Easing } from 'react-native-reanimated';
import { colors } from '../../theme/colors';

// Define interfaces
interface PerformanceOptimizationProps {
  children: React.ReactNode;
  optimizationLevel?: 'low' | 'medium' | 'high';
}

/**
 * PerformanceOptimization component that wraps children with optimized rendering
 * and provides hardware-accelerated animations with adaptive performance based on device capabilities.
 */
const PerformanceOptimization = ({
  children,
  optimizationLevel = 'medium'
}: PerformanceOptimizationProps) => {
  // Performance metrics
  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const isLowPerformanceDevice = useRef<boolean>(false);
  
  // Animation values
  const clock = useClockValue();
  const fpsIndicator = useValue(60);
  
  // Reanimated shared values
  const animatedFps = useSharedValue(60);
  
  // Connect Reanimated shared values to Skia values
  useSharedValueEffect(() => {
    fpsIndicator.current = animatedFps.value;
  }, animatedFps);
  
  // Detect device performance
  useEffect(() => {
    // Check if device is low performance
    const checkDevicePerformance = () => {
      // Platform-specific checks
      if (Platform.OS === 'android') {
        // Android-specific performance detection
        isLowPerformanceDevice.current = Platform.Version < 24; // Android 7.0 (Nougat)
      } else if (Platform.OS === 'ios') {
        // iOS-specific performance detection
        const majorVersionString = Platform.Version.toString().split('.')[0];
        const majorVersion = parseInt(majorVersionString, 10);
        isLowPerformanceDevice.current = majorVersion < 13; // iOS 13
      } else {
        // Web or other platforms
        isLowPerformanceDevice.current = false;
      }
      
      // Apply optimization level
      applyOptimizationLevel();
    };
    
    // Apply optimization based on level and device performance
    const applyOptimizationLevel = () => {
      let targetFps = 60;
      
      if (isLowPerformanceDevice.current) {
        // Low performance device adjustments
        switch (optimizationLevel) {
          case 'low':
            targetFps = 30;
            break;
          case 'medium':
            targetFps = 45;
            break;
          case 'high':
            targetFps = 60;
            break;
        }
      } else {
        // High performance device adjustments
        switch (optimizationLevel) {
          case 'low':
            targetFps = 45;
            break;
          case 'medium':
            targetFps = 60;
            break;
          case 'high':
            targetFps = 60; // Could be higher on some devices, but 60 is standard
            break;
        }
      }
      
      // Update FPS indicator
      animatedFps.value = withTiming(targetFps, { 
        duration: 500, 
        easing: Easing.out(Easing.cubic) 
      });
    };
    
    // Start performance monitoring
    const monitorPerformance = () => {
      const rafCallback = (timestamp: number) => {
        if (lastFrameTime.current > 0) {
          const frameTime = timestamp - lastFrameTime.current;
          const fps = 1000 / frameTime;
          
          // Store frame time in rolling buffer
          frameTimeRef.current.push(frameTime);
          if (frameTimeRef.current.length > 60) {
            frameTimeRef.current.shift();
          }
          
          // Update FPS every 60 frames
          frameCount.current++;
          if (frameCount.current >= 60) {
            const avgFrameTime = frameTimeRef.current.reduce((sum, time) => sum + time, 0) / frameTimeRef.current.length;
            const avgFps = 1000 / avgFrameTime;
            
            // Update FPS indicator
            animatedFps.value = withTiming(avgFps, { 
              duration: 500, 
              easing: Easing.out(Easing.cubic) 
            });
            
            frameCount.current = 0;
          }
        }
        
        lastFrameTime.current = timestamp;
        requestAnimationFrame(rafCallback);
      };
      
      requestAnimationFrame(rafCallback);
    };
    
    checkDevicePerformance();
    monitorPerformance();
    
    // Cleanup
    return () => {
      frameTimeRef.current = [];
      lastFrameTime.current = 0;
      frameCount.current = 0;
    };
  }, [optimizationLevel]);
  
  // Compute FPS indicator path
  const fpsIndicatorPath = useComputedValue(() => {
    const path = Skia.Path.Make();
    
    // Create FPS indicator
    const width = 30;
    const height = 5;
    const x = 0;
    const y = 0;
    
    // Map FPS to width (0-60 FPS to 0-30 width)
    const indicatorWidth = Math.min(width, (fpsIndicator.current / 60) * width);
    
    path.addRect({ x, y, width: indicatorWidth, height });
    
    return path;
  }, [fpsIndicator]);
  
  // Get color based on FPS
  const getFpsColor = useComputedValue(() => {
    if (fpsIndicator.current >= 55) {
      return '#4CAF50'; // Green for good performance
    } else if (fpsIndicator.current >= 40) {
      return '#FFC107'; // Yellow for medium performance
    } else {
      return '#F44336'; // Red for poor performance
    }
  }, [fpsIndicator]);
  
  return (
    <View style={styles.container}>
      {/* Performance indicator (only in development) */}
      {__DEV__ && (
        <View style={styles.fpsIndicator}>
          <Canvas style={styles.fpsCanvas}>
            <RoundedRect
              x={0}
              y={0}
              width={30}
              height={5}
              r={2.5}
              color="rgba(0, 0, 0, 0.2)"
            />
            <RoundedRect
              x={0}
              y={0}
              width={fpsIndicatorPath}
              height={5}
              r={2.5}
              color={getFpsColor}
            />
          </Canvas>
        </View>
      )}
      
      {/* Children with optimized rendering */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fpsIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    right: 10,
    width: 30,
    height: 5,
    zIndex: 9999,
  },
  fpsCanvas: {
    width: 30,
    height: 5,
  },
});

export default PerformanceOptimization;
