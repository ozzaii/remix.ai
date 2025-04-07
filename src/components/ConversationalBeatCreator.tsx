import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useClaudeSoundDeployment, ClaudeSoundDeploymentResponse } from '../services/claudeSoundDeploymentService';
import AudioEngine from './AudioEngine';

interface ConversationalBeatCreatorProps {
  onBeatCreated?: (beat: ClaudeSoundDeploymentResponse) => void;
}

const ConversationalBeatCreator: React.FC<ConversationalBeatCreatorProps> = ({
  onBeatCreated
}) => {
  const claudeSoundDeployment = useClaudeSoundDeployment();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentBeat, setCurrentBeat] = useState<ClaudeSoundDeploymentResponse | undefined>(undefined);
  const [feedback, setFeedback] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(130);
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'claude', text: string}>>([]);

  // Update BPM when beat changes
  useEffect(() => {
    if (currentBeat) {
      setBpm(currentBeat.bpm);
    }
  }, [currentBeat]);

  // Generate a beat based on the prompt
  const handleGenerateBeat = async () => {
    if (!claudeSoundDeployment.isInitialized || !prompt.trim() || isGenerating) {
      return;
    }
    
    setIsGenerating(true);
    setConversation(prev => [...prev, { type: 'user', text: prompt }]);
    
    try {
      const beat = await claudeSoundDeployment.generateBeat!({
        prompt,
        constraints: {
          bpm,
          maxSamples: 8
        }
      });
      
      setCurrentBeat(beat);
      setConversation(prev => [...prev, { type: 'claude', text: beat.explanation }]);
      
      if (onBeatCreated) {
        onBeatCreated(beat);
      }
      
      setPrompt('');
    } catch (error) {
      console.error('Failed to generate beat:', error);
      setConversation(prev => [...prev, { 
        type: 'claude', 
        text: 'Sorry, I encountered an error while generating your beat. Please try again.' 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Modify the beat based on feedback
  const handleModifyBeat = async () => {
    if (!claudeSoundDeployment.isInitialized || !feedback.trim() || isGenerating || !currentBeat) {
      return;
    }
    
    setIsGenerating(true);
    setConversation(prev => [...prev, { type: 'user', text: feedback }]);
    
    try {
      const modifiedBeat = await claudeSoundDeployment.modifyBeat!(currentBeat, feedback);
      
      setCurrentBeat(modifiedBeat);
      setConversation(prev => [...prev, { type: 'claude', text: modifiedBeat.explanation }]);
      
      if (onBeatCreated) {
        onBeatCreated(modifiedBeat);
      }
      
      setFeedback('');
    } catch (error) {
      console.error('Failed to modify beat:', error);
      setConversation(prev => [...prev, { 
        type: 'claude', 
        text: 'Sorry, I encountered an error while modifying your beat. Please try again.' 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.conversationContainer}>
        <ScrollView style={styles.messagesContainer}>
          {conversation.length === 0 ? (
            <View style={styles.emptyConversation}>
              <Text style={styles.emptyConversationText}>
                Describe the beat you want to create. For example:
              </Text>
              <Text style={styles.examplePrompt}>
                "Create a dark techno beat with heavy kicks and atmospheric synths"
              </Text>
              <Text style={styles.examplePrompt}>
                "I want a minimal house beat with a groovy bassline at 125 BPM"
              </Text>
              <Text style={styles.examplePrompt}>
                "Make me an energetic beat with tribal drums and a catchy melody"
              </Text>
            </View>
          ) : (
            conversation.map((message, index) => (
              <View 
                key={index} 
                style={[
                  styles.message, 
                  message.type === 'user' ? styles.userMessage : styles.claudeMessage
                ]}
              >
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            ))
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          {!currentBeat ? (
            <>
              <TextInput
                style={styles.input}
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Describe the beat you want to create..."
                placeholderTextColor="#999999"
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, (!prompt.trim() || isGenerating) && styles.disabledButton]}
                onPress={handleGenerateBeat}
                disabled={!prompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <Text style={styles.sendButtonText}>...</Text>
                ) : (
                  <Text style={styles.sendButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Provide feedback to modify the beat..."
                placeholderTextColor="#999999"
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, (!feedback.trim() || isGenerating) && styles.disabledButton]}
                onPress={handleModifyBeat}
                disabled={!feedback.trim() || isGenerating}
              >
                {isGenerating ? (
                  <Text style={styles.sendButtonText}>...</Text>
                ) : (
                  <Text style={styles.sendButtonText}>Modify</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      
      <View style={styles.beatContainer}>
        {currentBeat ? (
          <AudioEngine
            beat={currentBeat}
            isPlaying={isPlaying}
            onPlayingChange={setIsPlaying}
            bpm={bpm}
            onBpmChange={setBpm}
          />
        ) : (
          <View style={styles.noBeatContainer}>
            <Text style={styles.noBeatText}>
              Your beat will appear here after you create it
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    flexDirection: 'row',
  },
  conversationContainer: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#333333',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  emptyConversation: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyConversationText: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 16,
    textAlign: 'center',
  },
  examplePrompt: {
    fontSize: 14,
    color: '#7C4DFF',
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
  },
  message: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196F3',
  },
  claudeMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#333333',
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    backgroundColor: '#1E1E1E',
  },
  input: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#7C4DFF',
    borderRadius: 24,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#555555',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  beatContainer: {
    flex: 1.5,
    padding: 16,
  },
  noBeatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  noBeatText: {
    fontSize: 16,
    color: '#BBBBBB',
    textAlign: 'center',
  },
});

export default ConversationalBeatCreator;
