import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Animated,
  ScrollViewProps,
  TextInputProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

// Enhanced components
import { ClaudePatternGenerator } from '../../services/claude/claudePatternGenerator';
import { useEnhancedAudioEngine } from '../../services/audioEngine/enhancedAudioEngine';
import ChatBubble from '../../components/chat/ChatBubble';

// Theme
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

// Types
import { PatternResponse, PatternRequest } from '../../services/claude/claudePatternGenerator';

// Define Message Type
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  pattern?: PatternResponse;
}

// Assuming useEnhancedAudioEngine hook returns an object with these methods
interface EnhancedAudioEngineInstance {
  initialize: () => Promise<void>;
  cleanup: () => void;
}

// Define navigation param list if possible (replace with actual params)
type RootStackParamList = {
  Visualizer: { patternId?: string; editMode?: boolean };
}

const EnhancedChatScreen = () => {
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'Create a hard techno beat with powerful kicks',
    'Make an acid techno pattern with 303-style bassline',
    'Generate an industrial techno beat with distorted percussion',
    'Create a minimal techno pattern with subtle variations',
  ]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const patternGeneratorRef = useRef<ClaudePatternGenerator | null>(null);
  const audioEngine = useEnhancedAudioEngine();
  const [lastRequest, setLastRequest] = useState<PatternRequest | null>(null);

  useEffect(() => {
    const initComponents = async () => {
      try {
        patternGeneratorRef.current = new ClaudePatternGenerator();
        await patternGeneratorRef.current.initialize();
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

      } catch (error) {
        console.error("Initialization Error:", error);
      }
    };
    
    initComponents();
    
    return () => {
      patternGeneratorRef.current?.cleanup?.();
    };
  }, []);
  
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (message.trim() === '' || !patternGeneratorRef.current) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);
    Keyboard.dismiss();
    
    let currentRequest: PatternRequest | null = null;
    try {
      currentRequest = {
        description: currentMessage,
        style: detectStyle(currentMessage),
        bpm: detectBpm(currentMessage) || 140,
        complexity: detectComplexity(currentMessage) || 7,
        intensity: detectIntensity(currentMessage) || 8,
        focus: detectFocus(currentMessage),
      };
      setLastRequest(currentRequest);
      
      if (!patternGeneratorRef.current) throw new Error("Pattern Generator not initialized");
      const patternResponse = await patternGeneratorRef.current.generatePattern(currentRequest);
      
      const claudeMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: patternResponse.description,
        isUser: false,
        timestamp: new Date(),
        pattern: patternResponse,
      };
      
      setMessages(prevMessages => [...prevMessages, claudeMessage]);
      setSuggestions(generateSuggestions(currentRequest));
      
    } catch (error: any) {
      console.error('Error generating pattern:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, error generating pattern: ${error.message || 'Please try again.'}`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionTap = (suggestion: string) => {
    setMessage(suggestion);
    inputRef.current?.focus();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handlePlayPattern = (pattern: PatternResponse | undefined) => {
    if (!pattern || !patternGeneratorRef.current) return;
    
    patternGeneratorRef.current.applyPatternToSequencer(pattern);
    
    navigation.navigate('Visualizer', { /* patternId: pattern.id */ });
  };

  const detectStyle = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('acid')) return 'Acid';
    if (lowerText.includes('industrial')) return 'Industrial';
    if (lowerText.includes('minimal')) return 'Minimal';
    return 'Hard Techno';
  };
  
  const detectBpm = (text: string): number | null => {
    const bpmMatch = text.match(/\b(\d{2,3})\s*bpm\b/i);
    if (bpmMatch) {
      const bpm = parseInt(bpmMatch[1]);
      return bpm >= 120 && bpm <= 180 ? bpm : null;
    }
    return null;
  };
  
  const detectComplexity = (text: string): number | null => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('simple') || lowerText.includes('basic')) return 3;
    if (lowerText.includes('complex') || lowerText.includes('intricate')) return 9;
    return null;
  };
  
  const detectIntensity = (text: string): number | null => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('soft') || lowerText.includes('gentle')) return 3;
    if (lowerText.includes('hard') || lowerText.includes('intense') || lowerText.includes('powerful')) return 9;
    return null;
  };
  
  const detectFocus = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    const focus: string[] = [];
    if (lowerText.includes('kick') || lowerText.includes('bass drum')) focus.push('kicks');
    if (lowerText.includes('bass') || lowerText.includes('acid')) focus.push('acid');
    if (lowerText.includes('percussion') || lowerText.includes('drums')) focus.push('percussion');
    if (lowerText.includes('synth') || lowerText.includes('lead')) focus.push('synths');
    if (lowerText.includes('fx') || lowerText.includes('effect')) focus.push('fx');
    return focus.length > 0 ? focus : ['kicks', 'acid'];
  };
  
  const generateSuggestions = (request: PatternRequest | null): string[] => {
    if (!request) return suggestions;
    return [
      `Make this pattern more ${request.intensity < 5 ? 'intense' : 'subtle'}`,
      `Add more ${request.focus.includes('acid') ? 'percussion' : 'acid'} elements`,
      `Create a variation with ${request.bpm + 10} BPM`,
      `Generate a ${request.style === 'Hard Techno' ? 'Minimal' : 'Hard Techno'} version of this`,
    ];
  };
  
  return (
    <LinearGradient
      colors={gradients.godTier}
      style={styles.container}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            <Text style={{color: colors.diamond}}>HARD TECHNO</Text> GOD ENGINE
          </Text>
        </View>
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <LinearGradient
                colors={gradients.diamondGlow}
                style={styles.emptyStateIcon}
              >
                <Ionicons name="flash" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.emptyStateTitle}>
                TECHNO BEAT CREATOR
              </Text>
              <Text style={styles.emptyStateText}>
                Describe your <Text style={{color: colors.diamond}}>legendary beat</Text> and watch the GOD ENGINE create it.
                Try one of the suggestions below or craft your own vision.
              </Text>
            </View>
          ) : (
            messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg.text}
                isUser={msg.isUser}
                timestamp={msg.timestamp.toLocaleTimeString()}
                hasBeat={!!msg.pattern}
                beatPattern={undefined}
                onPlayBeat={() => handlePlayPattern(msg.pattern)}
                onOpenVisualizer={() => navigation.navigate('Visualizer', { /* patternId: msg.pattern?.id */ })}
                onEditBeat={() => navigation.navigate('Visualizer', { /* patternId: msg.pattern?.id, */ editMode: true })}
              />
            ))
          )}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Claude düşünüyor...</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.suggestionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => handleSuggestionTap(suggestion)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.inputContainer}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Claude'a bir mesaj yazın..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() === '' && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={message.trim() === ''}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                message.trim() === ''
                  ? [colors.backgroundLight, colors.backgroundLight]
                  : [colors.primaryDark, colors.primary]
              }
              style={styles.sendButtonGradient}
            >
              <Ionicons
                name="send"
                size={20}
                color={message.trim() === '' ? colors.textSecondary : 'white'}
              />
            </LinearGradient>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    ...globalStyles.heading2,
    fontSize: 20,
    color: colors.textPrimary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 60,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    ...globalStyles.heading2,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptyStateText: {
    ...globalStyles.bodyText,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  suggestionsContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionsContent: {
    paddingHorizontal: 16,
  },
  suggestionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  suggestionText: {
    ...globalStyles.bodyText,
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    ...globalStyles.bodyText,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EnhancedChatScreen;
export { EnhancedChatScreen as ChatScreen };
