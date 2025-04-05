import React, { createContext, useContext, useState } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';
import { Ionicons } from '@expo/vector-icons';

// Define the types of feedback
export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

// Define the feedback message structure
interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  message: string;
  duration?: number;
}

// Define the feedback context interface
interface FeedbackContextType {
  showFeedback: (type: FeedbackType, message: string, duration?: number) => void;
  hideFeedback: (id: string) => void;
  messages: FeedbackMessage[];
}

// Create the feedback context
const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// Custom hook to use the feedback context
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

// Feedback provider component
export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  // Show feedback message
  const showFeedback = (type: FeedbackType, message: string, duration = 3000) => {
    const id = Date.now().toString();
    const newMessage = { id, type, message, duration };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        hideFeedback(id);
      }, duration);
    }
    
    return id;
  };

  // Hide feedback message
  const hideFeedback = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback, messages }}>
      {children}
      <FeedbackContainer messages={messages} onHide={hideFeedback} />
    </FeedbackContext.Provider>
  );
};

// Feedback message component
const FeedbackMessage: React.FC<{
  message: FeedbackMessage;
  onHide: (id: string) => void;
  index: number;
}> = ({ message, onHide, index }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;
  
  React.useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();
    
    // Exit animation when duration is about to end
    if (message.duration && message.duration > 0) {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, message.duration - 200);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Get icon based on message type
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'info':
        return 'information-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };
  
  // Get color based on message type
  const getColor = () => {
    switch (message.type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.info;
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.messageContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: `${getColor()}20`,
          borderLeftColor: getColor(),
          bottom: index * 70,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon()} size={24} color={getColor()} />
      </View>
      <Text style={styles.messageText}>{message.message}</Text>
      <Ionicons
        name="close-outline"
        size={20}
        color={colors.textSecondary}
        style={styles.closeIcon}
        onPress={() => onHide(message.id)}
      />
    </Animated.View>
  );
};

// Container for all feedback messages
const FeedbackContainer: React.FC<{
  messages: FeedbackMessage[];
  onHide: (id: string) => void;
}> = ({ messages, onHide }) => {
  return (
    <View style={styles.container}>
      {messages.map((message, index) => (
        <FeedbackMessage
          key={message.id}
          message={message}
          onHide={onHide}
          index={index}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    ...globalStyles.shadowLight,
  },
  iconContainer: {
    marginRight: 12,
  },
  messageText: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
    flex: 1,
  },
  closeIcon: {
    padding: 4,
  },
});

export default FeedbackProvider;
