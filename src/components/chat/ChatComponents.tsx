import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

const { width, height } = Dimensions.get('window');

interface ChatBubbleProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    beatPattern?: any;
  };
  onBeatPatternPress?: (pattern: any) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onBeatPatternPress }) => {
  const [expanded, setExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate chat bubble appearance
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const handleBeatPatternPress = () => {
    if (message.beatPattern && onBeatPatternPress) {
      onBeatPatternPress(message.beatPattern);
    }
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Detect if message contains a beat pattern
  const hasBeatPattern = message.text.includes('```json') && message.text.includes('```');
  
  // Extract beat pattern from message
  const extractBeatPattern = () => {
    if (!hasBeatPattern) return null;
    
    const jsonStart = message.text.indexOf('```json') + 7;
    const jsonEnd = message.text.indexOf('```', jsonStart);
    const jsonString = message.text.substring(jsonStart, jsonEnd).trim();
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse beat pattern JSON:', error);
      return null;
    }
  };
  
  // Format message text (remove JSON code blocks for display)
  const formatMessageText = () => {
    if (!hasBeatPattern) return message.text;
    
    const parts = message.text.split('```');
    return parts.filter((_, index) => index % 2 === 0).join('').trim();
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        message.isUser ? styles.userContainer : styles.aiContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <View 
        style={[
          styles.bubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {!message.isUser && (
          <View style={styles.aiIconContainer}>
            <LinearGradient
              colors={[colors.vibrantPurple, colors.neonBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiIconGradient}
            />
            <Text style={styles.aiIconText}>AI</Text>
          </View>
        )}
        
        <View style={styles.messageContent}>
          <Text 
            style={[
              styles.messageText,
              message.isUser ? styles.userText : styles.aiText,
              expanded ? {} : (hasBeatPattern && { maxHeight: 100 })
            ]}
            numberOfLines={expanded || !hasBeatPattern ? undefined : 5}
          >
            {formatMessageText()}
          </Text>
          
          {hasBeatPattern && (
            <View style={styles.beatPatternContainer}>
              <TouchableOpacity
                style={styles.beatPatternButton}
                onPress={handleBeatPatternPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.vibrantPurple + '80', colors.neonBlue + '80']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.beatPatternButtonContent}>
                  <Ionicons name="musical-notes" size={18} color={colors.white} />
                  <Text style={styles.beatPatternButtonText}>View Beat Pattern</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          
          {hasBeatPattern && !expanded && (
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={toggleExpanded}
              activeOpacity={0.7}
            >
              <Text style={styles.expandButtonText}>Read more</Text>
              <Ionicons name="chevron-down" size={16} color={colors.vibrantPurple} />
            </TouchableOpacity>
          )}
          
          {hasBeatPattern && expanded && (
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={toggleExpanded}
              activeOpacity={0.7}
            >
              <Text style={styles.expandButtonText}>Show less</Text>
              <Ionicons name="chevron-up" size={16} color={colors.vibrantPurple} />
            </TouchableOpacity>
          )}
          
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

interface ChatInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  placeholder = "Type your message...",
  disabled = false
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const inputContainerAnim = useRef(new Animated.Value(1)).current;
  
  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };
  
  const handleFocus = () => {
    Animated.spring(inputContainerAnim, {
      toValue: 1.03,
      speed: 20,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
  };
  
  const handleBlur = () => {
    Animated.spring(inputContainerAnim, {
      toValue: 1,
      speed: 20,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
      style={styles.inputContainer}
    >
      <Animated.View 
        style={[
          styles.inputWrapper,
          { transform: [{ scale: inputContainerAnim }] }
        ]}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!text.trim() || disabled) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[colors.vibrantPurple, colors.neonBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    padding: 12,
    minHeight: 40,
    shadowColor: colors.deepBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.vibrantPurple,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.darkBlue,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIconGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  aiIconText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
  },
  aiText: {
    color: colors.white,
  },
  timestamp: {
    fontSize: 12,
    color: colors.white + '80',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  beatPatternContainer: {
    marginTop: 12,
  },
  beatPatternButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.vibrantPurple + '40',
  },
  beatPatternButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  beatPatternButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  expandButtonText: {
    color: colors.vibrantPurple,
    fontSize: 14,
    marginRight: 4,
  },
  inputContainer: {
    width: '100%',
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkBlue + '80',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.vibrantPurple + '30',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    color: colors.white,
    fontSize: 16,
    paddingRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export { ChatBubble, ChatInput };
