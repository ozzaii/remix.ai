import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import GradientCard from '../common/GradientCard';

const { width } = Dimensions.get('window');

interface BattleCardProps {
  battle: {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'upcoming' | 'completed';
    startDate: Date;
    endDate: Date;
    participants: number;
    theme: string;
    prizes?: string[];
    winner?: {
      id: string;
      username: string;
      avatar?: string;
    };
  };
  onPress?: () => void;
  onJoinPress?: () => void;
  onViewResultsPress?: () => void;
  style?: any;
}

const BattleCard: React.FC<BattleCardProps> = ({
  battle,
  onPress,
  onJoinPress,
  onViewResultsPress,
  style,
}) => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Start pulse animation for active battles
  useEffect(() => {
    if (battle.status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [battle.status, pulseAnim, glowAnim]);
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate time remaining or time passed
  const getTimeText = () => {
    const now = new Date();
    
    if (battle.status === 'upcoming') {
      const diffMs = battle.startDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `Starts in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else {
        return `Starts in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      }
    } else if (battle.status === 'active') {
      const diffMs = battle.endDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `Ends in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else {
        return `Ends in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      }
    } else {
      const diffMs = now.getTime() - battle.endDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      return `Ended ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };
  
  // Get status colors
  const getStatusColors = () => {
    switch (battle.status) {
      case 'active':
        return ['#4CAF50', '#2E7D32'];
      case 'upcoming':
        return ['#2196F3', '#1565C0'];
      case 'completed':
        return ['#9E9E9E', '#616161'];
      default:
        return ['#9E9E9E', '#616161'];
    }
  };
  
  // Get status text
  const getStatusText = () => {
    switch (battle.status) {
      case 'active':
        return 'Active';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      default:
        return '';
    }
  };
  
  // Get action button based on status
  const renderActionButton = () => {
    if (battle.status === 'completed') {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onViewResultsPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.darkBlue, colors.deepPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.actionButtonText}>View Results</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onJoinPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.vibrantPurple, colors.neonBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.actionButtonText}>Join Battle</Text>
        </TouchableOpacity>
      );
    }
  };
  
  return (
    <Animated.View style={[
      styles.container,
      battle.status === 'active' && { transform: [{ scale: pulseAnim }] },
      style
    ]}>
      <GradientCard
        onPress={onPress}
        elevation={battle.status === 'active' ? 5 : 3}
        animated={false}
        gradientColors={[
          colors.darkBlue + '40',
          colors.deepPurple + '40'
        ]}
      >
        {battle.status === 'active' && (
          <Animated.View style={[
            styles.glowEffect,
            { opacity: glowAnim }
          ]}>
            <LinearGradient
              colors={['transparent', colors.vibrantPurple + '30']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
        
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{battle.title}</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator}>
                <LinearGradient
                  colors={getStatusColors()}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
          
          <View style={styles.statusBadge}>
            <LinearGradient
              colors={getStatusColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.statusBadgeText}>{getStatusText()}</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{battle.description}</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{battle.participants} participants</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{getTimeText()}</Text>
          </View>
        </View>
        
        {battle.status === 'completed' && battle.winner && (
          <View style={styles.winnerContainer}>
            <Text style={styles.winnerLabel}>Winner:</Text>
            <View style={styles.winnerInfo}>
              <View style={styles.winnerAvatar}>
                <LinearGradient
                  colors={[colors.vibrantPurple, colors.neonBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.winnerAvatarText}>{battle.winner.username.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.winnerName}>{battle.winner.username}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.footer}>
          <View style={styles.themeContainer}>
            <Text style={styles.themeLabel}>Theme:</Text>
            <Text style={styles.themeText}>{battle.theme}</Text>
          </View>
          
          {renderActionButton()}
        </View>
      </GradientCard>
    </Animated.View>
  );
};

interface LeaderboardItemProps {
  rank: number;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  points: number;
  wins: number;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  rank,
  user,
  points,
  wins,
  isCurrentUser = false,
  onPress,
}) => {
  // Get medal icon for top 3 ranks
  const getMedalIcon = () => {
    switch (rank) {
      case 1:
        return (
          <View style={[styles.medal, styles.goldMedal]}>
            <Ionicons name="trophy" size={14} color="#FFD700" />
          </View>
        );
      case 2:
        return (
          <View style={[styles.medal, styles.silverMedal]}>
            <Ionicons name="trophy" size={14} color="#C0C0C0" />
          </View>
        );
      case 3:
        return (
          <View style={[styles.medal, styles.bronzeMedal]}>
            <Ionicons name="trophy" size={14} color="#CD7F32" />
          </View>
        );
      default:
        return null;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isCurrentUser && (
        <View style={styles.currentUserHighlight}>
          <LinearGradient
            colors={[colors.vibrantPurple + '20', colors.neonBlue + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      
      <View style={styles.rankContainer}>
        {getMedalIcon()}
        <Text style={[
          styles.rankText,
          rank <= 3 && styles.topRankText
        ]}>
          {rank}
        </Text>
      </View>
      
      <View style={styles.userContainer}>
        <View style={styles.userAvatar}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <>
              <LinearGradient
                colors={[colors.vibrantPurple, colors.neonBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
            </>
          )}
        </View>
        <Text style={styles.username}>{user.username}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>PTS</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{wins}</Text>
          <Text style={styles.statLabel}>WINS</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  glowEffect: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    ...globalStyles.heading3,
    color: colors.vibrantPurple,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    overflow: 'hidden',
  },
  statusText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusBadgeText: {
    ...globalStyles.captionText,
    color: colors.white,
    fontWeight: '600',
  },
  description: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.darkBlue + '30',
  },
  winnerLabel: {
    ...globalStyles.bodyTextSmall,
    color: colors.textSecondary,
    marginRight: 8,
  },
  winnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 8,
  },
  winnerAvatarText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  winnerName: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.darkBlue + '40',
  },
  themeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeLabel: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginRight: 4,
  },
  themeText: {
    ...globalStyles.bodyTextSmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButtonText: {
    ...globalStyles.bodyTextSmall,
    color: colors.white,
    fontWeight: '600',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBlue + '40',
    position: 'relative',
  },
  currentUserItem: {
    borderRadius: 8,
    marginVertical: 4,
  },
  currentUserHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rankText: {
    ...globalStyles.heading3,
    color: colors.textSecondary,
  },
  topRankText: {
    color: colors.vibrantPurple,
  },
  medal: {
    position: 'absolute',
    top: -8,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.deepBlack,
  },
  goldMedal: {
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  silverMedal: {
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  bronzeMedal: {
    borderColor: '#CD7F32',
    borderWidth: 1,
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: 16,
    width: 50,
  },
  statValue: {
    ...globalStyles.heading3,
    color: colors.vibrantPurple,
  },
  statLabel: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
});

export { BattleCard, LeaderboardItem };
