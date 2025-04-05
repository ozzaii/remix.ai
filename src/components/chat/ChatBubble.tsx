import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  hasBeat?: boolean;
  beatPattern?: {
    kick: number[];
    snare: number[];
    hihat: number[];
    bass: number[];
  };
  onPlayBeat?: () => void;
  onOpenVisualizer?: () => void;
  onEditBeat?: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  timestamp,
  hasBeat = false,
  beatPattern,
  onPlayBeat,
  onOpenVisualizer,
  onEditBeat,
}) => {
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.claudeContainer
    ]}>
      <LinearGradient
        colors={isUser ? [colors.electricBlue, colors.buttonSecondaryHover] : gradients.purpleToBlue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.claudeBubble
        ]}
      >
        <Text style={styles.messageText}>{message}</Text>
        
        {hasBeat && beatPattern && (
          <View style={styles.beatContainer}>
            <View style={styles.beatVisualization}>
              {/* Simplified beat visualization */}
              <View style={styles.beatPatternContainer}>
                {['kick', 'snare', 'hihat', 'bass'].map((instrument, instrumentIndex) => (
                  <View key={instrument} style={styles.beatRow}>
                    {beatPattern[instrument].slice(0, 16).map((step, stepIndex) => (
                      <View 
                        key={`${instrument}-${stepIndex}`}
                        style={[
                          styles.beatStep,
                          step === 1 && {
                            backgroundColor: 
                              instrument === 'kick' ? colors.kickDrum :
                              instrument === 'snare' ? colors.snare :
                              instrument === 'hihat' ? colors.hiHat :
                              colors.bass
                          }
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.beatControls}>
              <TouchableOpacity 
                style={styles.beatButton}
                onPress={onPlayBeat}
              >
                <Text style={styles.beatButtonText}>▶ Oynat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.beatButton}
                onPress={onOpenVisualizer}
              >
                <Text style={styles.beatButtonText}>Görüntüleyici'de Aç</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.beatButton}
                onPress={onEditBeat}
              >
                <Text style={styles.beatButtonText}>Düzenle</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>
      
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  claudeContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    ...globalStyles.shadow,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  claudeBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
  },
  timestamp: {
    ...globalStyles.captionText,
    marginTop: 4,
    marginHorizontal: 8,
  },
  beatContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.textPrimary + '20',
    paddingTop: 12,
  },
  beatVisualization: {
    backgroundColor: colors.deepBlack + '80',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  beatPatternContainer: {
    width: '100%',
  },
  beatRow: {
    flexDirection: 'row',
    height: 8,
    marginVertical: 2,
  },
  beatStep: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.inactiveStep,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  beatControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  beatButton: {
    backgroundColor: colors.deepBlack + '80',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.vibrantPurple + '40',
  },
  beatButtonText: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
    fontSize: 10,
  },
});

export default ChatBubble;
