import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

interface BattleCardProps {
  theme: string;
  endTime: string;
  participants: number;
  description: string;
  isActive: boolean;
  onJoinPress?: () => void;
  onViewResultsPress?: () => void;
}

const BattleCard: React.FC<BattleCardProps> = ({
  theme,
  endTime,
  participants,
  description,
  isActive,
  onJoinPress,
  onViewResultsPress,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.purpleToBlue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.themeText}>{theme}</Text>
            {isActive && (
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>Aktif</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.descriptionText}>{description}</Text>
          
          <View style={styles.statsContainer}>
            {isActive ? (
              <Text style={styles.timeText}>Bitiş: {endTime}</Text>
            ) : (
              <Text style={styles.timeText}>Tamamlandı</Text>
            )}
            <Text style={styles.participantsText}>{participants} Katılımcı</Text>
          </View>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={isActive ? onJoinPress : onViewResultsPress}
          >
            <LinearGradient
              colors={[colors.deepBlack, colors.darkBlue]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isActive ? 'Yarışmaya Katıl' : 'Sonuçları Gör'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    ...globalStyles.shadow,
  },
  gradientBorder: {
    borderRadius: 16,
    padding: 2,
  },
  content: {
    backgroundColor: colors.deepBlack,
    borderRadius: 14,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeText: {
    ...globalStyles.heading2,
    color: colors.textPrimary,
    flex: 1,
  },
  activeIndicator: {
    backgroundColor: colors.success,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeText: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  descriptionText: {
    ...globalStyles.bodyText,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
  },
  participantsText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.vibrantPurple + '40',
  },
  buttonText: {
    ...globalStyles.buttonText,
    color: colors.vibrantPurple,
    fontWeight: '600',
  },
});

export default BattleCard;
