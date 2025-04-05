import React from 'react';
import { ErrorBoundary as RNErrorBoundary } from 'react-native-error-boundary';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import { Ionicons } from '@expo/vector-icons';
import { useFeedback } from './FeedbackProvider';

// Custom fallback component to display when an error occurs
const ErrorFallback = ({ error, resetError }) => {
  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Ionicons name="alert-circle" size={48} color={colors.error} style={styles.icon} />
        <Text style={styles.title}>Oops! Something went wrong</Text>
        <Text style={styles.message}>{error.message || 'An unexpected error occurred'}</Text>
        <TouchableOpacity style={styles.button} onPress={resetError}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Error boundary component
const ErrorBoundary = ({ children }) => {
  const { showFeedback } = useFeedback();

  // Custom error handler
  const handleError = (error, stackTrace) => {
    console.error('Caught an error:', error, stackTrace);
    
    // Log error to analytics or monitoring service
    // This would be implemented with a real service in production
    logErrorToService(error, stackTrace);
    
    // Show feedback to user
    showFeedback('error', 'An unexpected error occurred. Our team has been notified.');
  };

  // Mock function to simulate logging to a service
  const logErrorToService = (error, stackTrace) => {
    console.log('[ERROR LOGGING SERVICE]', {
      error: error.toString(),
      stackTrace,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <RNErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
    >
      {children}
    </RNErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.deepBlack,
    padding: 20,
  },
  errorCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.error + '40',
    ...globalStyles.shadow,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    ...globalStyles.heading2,
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.vibrantPurple,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    ...globalStyles.shadowLight,
  },
  buttonText: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
