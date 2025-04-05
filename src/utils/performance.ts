import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

// Get device dimensions for responsive layout
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width > 768;

// Optimize performance with responsive grid sizing
const getGridItemSize = () => {
  if (isTablet) return 60;
  if (isSmallDevice) return 28;
  return 40;
};

// Memoize grid size calculations
const gridItemSize = getGridItemSize();
const gridSpacing = isSmallDevice ? 2 : 4;

// Performance optimization utilities
const shouldComponentUpdate = (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.instruments !== nextProps.instruments ||
    prevProps.currentStep !== nextProps.currentStep ||
    prevProps.isEditing !== nextProps.isEditing
  );
};

// Optimize memory usage with shared styles
const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isSmallDevice ? 8 : 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
  },
});

// Optimize animations with transform instead of layout changes
const getAnimationStyle = (isActive) => ({
  transform: [{ scale: isActive ? 1 : 0.8 }],
  opacity: isActive ? 1 : 0.6,
});

// Optimize rendering with virtualized lists for large datasets
const renderOptimizedList = (items, renderItem) => {
  // Only render visible items plus a buffer
  const visibleCount = Math.ceil(width / gridItemSize) + 2;
  return items.slice(0, visibleCount).map(renderItem);
};

// Optimize image loading and caching
const preloadAssets = async (assetUrls) => {
  // Implementation would depend on specific asset loading library
  console.log('Preloading assets:', assetUrls);
};

// Optimize network requests with batching and caching
const optimizedFetch = async (url, options = {}) => {
  // Add caching headers
  const optimizedOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Cache-Control': 'max-age=3600',
    },
  };
  
  try {
    const response = await fetch(url, optimizedOptions);
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Debounce function to limit expensive operations
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for events that fire rapidly
const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Export performance utilities
export {
  gridItemSize,
  gridSpacing,
  shouldComponentUpdate,
  sharedStyles,
  getAnimationStyle,
  renderOptimizedList,
  preloadAssets,
  optimizedFetch,
  debounce,
  throttle,
  isSmallDevice,
  isTablet
};
