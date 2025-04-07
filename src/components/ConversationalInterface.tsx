import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useConversation } from '../services/claude/ConversationContext';
import { StreamingResponse } from '../services/claude/streamingResponseHandler';
import { useEventBusService } from '../services/serviceLocator';
import { eventBus } from '../services/eventBus';

/**
 * Enhanced Conversational Interface component for REMIX.AI
 * 
 * This component provides a polished user interface for interacting with
 * Claude AI for music creation. It includes streaming responses, visual
 * feedback, and integration with the event bus.
 */
const ConversationalInterface = () => {
  const { currentConversation, sendMessage, streamMessage, isLoading, error } = useConversation();
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const eventBusService = useEventBusService();
  
  // Scroll view reference for auto-scrolling
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // Effect to scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentConversation?.messages, streamedResponse]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userInput = inputText.trim();
    setInputText('');
    
    try {
      setIsStreaming(true);
      setStreamedResponse('');
      
      // Publish event that user is sending a message
      eventBusService.publish('conversation:message:send', { content: userInput });
      
      // Use streaming response
      await streamMessage(
        userInput,
        (chunk) => {
          setStreamedResponse(prev => prev + chunk);
        }
      );
      
      // Reset streaming state
      setIsStreaming(false);
      setStreamedResponse('');
      
      // Publish event that message exchange is complete
      eventBusService.publish('conversation:message:complete', {});
    } catch (err) {
      console.error('Error sending message:', err);
      setIsStreaming(false);
      
      // Publish error event
      eventBusService.publish('conversation:message:error', { 
        error: err instanceof Error ? err : new Error('Unknown error') 
      });
    }
  };
  
  // Render a message bubble
  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    
    return (
      <View 
        key={index} 
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.assistantMessage
        ]}
      >
        <Text style={styles.messageText}>{message.content}</Text>
      </View>
    );
  };
  
  // Render the streaming response
  const renderStreamingResponse = () => {
    if (!isStreaming || !streamedResponse) return null;
    
    return (
      <View style={[styles.messageBubble, styles.assistantMessage]}>
        <Text style={styles.messageText}>{streamedResponse}</Text>
        <View style={styles.typingIndicator}>
          <Text style={styles.typingDot}>•</Text>
          <Text style={styles.typingDot}>•</Text>
          <Text style={styles.typingDot}>•</Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REMIX.AI Assistant</Text>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {/* Welcome message if no messages */}
        {(!currentConversation?.messages || currentConversation.messages.length <= 1) && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to REMIX.AI</Text>
            <Text style={styles.welcomeText}>
              I'm your AI music assistant. I can help you create beats, explore sounds,
              and learn about music production. What would you like to create today?
            </Text>
          </View>
        )}
        
        {/* Conversation messages */}
        {currentConversation?.messages
          .filter(msg => msg.role !== 'system') // Don't show system messages
          .map(renderMessage)}
        
        {/* Streaming response */}
        {renderStreamingResponse()}
        
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Error: {error.message || 'Something went wrong'}
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about music or describe a beat..."
          placeholderTextColor="#999"
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (isLoading || !inputText.trim()) && styles.disabledButton
          ]}
          onPress={handleSendMessage}
          disabled={isLoading || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>
            {isLoading ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Quick suggestion buttons */}
      <ScrollView 
        horizontal 
        style={styles.suggestionsContainer}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setInputText('Create a techno beat with heavy kicks')}
        >
          <Text style={styles.suggestionText}>Techno Beat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setInputText('Help me make a lo-fi hip hop track')}
        >
          <Text style={styles.suggestionText}>Lo-Fi Hip Hop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setInputText('Suggest some drum patterns for house music')}
        >
          <Text style={styles.suggestionText}>House Drums</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setInputText('How do I create a good bassline?')}
        >
          <Text style={styles.suggestionText}>Bassline Tips</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  welcomeContainer: {
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7C4DFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2D2D2D',
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    marginTop: 4,
  },
  typingDot: {
    fontSize: 16,
    color: '#CCCCCC',
    marginRight: 2,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1E1E1E',
  },
  input: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#7C4DFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#555555',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#CF6679',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  suggestionsContainer: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  suggestionButton: {
    backgroundColor: '#333333',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  suggestionText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
});

export default ConversationalInterface;
