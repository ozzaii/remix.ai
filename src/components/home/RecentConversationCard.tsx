import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

interface RecentConversationCardProps {
  prompt: string;
  timestamp: string;
  isComplete: boolean;
  onPress: () => void;
}

const RecentConversationCard: React.FC<RecentConversationCardProps> = ({
  prompt,
  timestamp,
  isComplete,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.deepBlack, colors.darkBlue]}
        style={[
          styles.card,
          !isComplete && styles.incompleteBorder
        ]}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={gradients.purpleToBlue}
            style={styles.iconBackground}
          >
            <Text style={styles.icon}>🎵</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.promptText} numberOfLines={2}>
            {prompt}
          </Text>
          
          <View style={styles.footer}>
            <Text style={styles.timestamp}>{timestamp}</Text>
            {!isComplete && (
              <View style={styles.statusIndicator}>
                <Text style={styles.statusText}>Devam Ediyor</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 120,
    marginRight: 12,
    borderRadius: 12,
    ...globalStyles.shadow,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.darkBlue,
  },
  incompleteBorder: {
    borderColor: colors.vibrantPurple + '60',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  promptText: {
    ...globalStyles.bodyText,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    ...globalStyles.captionText,
    fontSize: 10,
  },
  statusIndicator: {
    backgroundColor: colors.vibrantPurple + '30',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  statusText: {
    ...globalStyles.captionText,
    fontSize: 10,
    color: colors.vibrantPurple,
  },
});

export default RecentConversationCard;
