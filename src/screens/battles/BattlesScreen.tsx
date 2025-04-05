import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import Header from '../../components/common/Header';
import GradientCard from '../../components/common/GradientCard';
import Button from '../../components/common/Button';
import { BattleCard, LeaderboardItem } from '../../components/battles/BattleComponents';

const { width, height } = Dimensions.get('window');

const BattlesScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('battles'); // 'battles' or 'leaderboard'
  const [battles, setBattles] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock battles data
      const mockBattles = [
        {
          id: '1',
          title: 'Future Nostalgia',
          description: 'Create a beat that combines retro sounds with futuristic elements.',
          status: 'active',
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
          participants: 48,
          theme: 'Future Nostalgia',
        },
        {
          id: '2',
          title: 'Minimal Techno Challenge',
          description: 'Less is more. Create a minimal techno beat using only essential elements.',
          status: 'upcoming',
          startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days from now
          participants: 12,
          theme: 'Minimal Techno',
        },
        {
          id: '3',
          title: 'Istanbul Nights',
          description: 'Create a beat inspired by the vibrant nightlife of Istanbul.',
          status: 'completed',
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
          endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          participants: 64,
          theme: 'Istanbul Nights',
          winner: {
            id: '3',
            username: 'DreamScape',
          },
        },
      ];
      
      // Mock leaderboard data
      const mockLeaderboard = [
        {
          rank: 1,
          user: {
            id: '3',
            username: 'DreamScape',
          },
          points: 1250,
          wins: 3,
        },
        {
          rank: 2,
          user: {
            id: '2',
            username: 'NeonBeats',
          },
          points: 980,
          wins: 2,
        },
        {
          rank: 3,
          user: {
            id: '4',
            username: 'FunkMaster',
          },
          points: 820,
          wins: 1,
        },
        {
          rank: 4,
          user: {
            id: '5',
            username: 'BassQueen',
          },
          points: 750,
          wins: 1,
        },
        {
          rank: 5,
          user: {
            id: '6',
            username: 'SynthWizard',
          },
          points: 680,
          wins: 0,
        },
        {
          rank: 6,
          user: {
            id: '7',
            username: 'LoopMaster',
          },
          points: 620,
          wins: 0,
        },
        {
          rank: 7,
          user: {
            id: '8',
            username: 'BeatCrafter',
          },
          points: 580,
          wins: 0,
        },
        {
          rank: 8,
          user: {
            id: '1',
            username: 'You',
          },
          points: 450,
          wins: 0,
          isCurrentUser: true,
        },
      ];
      
      setBattles(mockBattles);
      setLeaderboard(mockLeaderboard);
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle battle press
  const handleBattlePress = (battle) => {
    // Navigate to battle details
    console.log('Navigate to battle details:', battle.id);
  };
  
  // Handle join battle press
  const handleJoinBattlePress = (battle) => {
    // Navigate to battle join flow
    console.log('Join battle:', battle.id);
  };
  
  // Handle view results press
  const handleViewResultsPress = (battle) => {
    // Navigate to battle results
    console.log('View battle results:', battle.id);
  };
  
  // Handle user profile press
  const handleUserProfilePress = (user) => {
    // Navigate to user profile
    console.log('View user profile:', user.id);
  };
  
  // Render tab selector
  const renderTabSelector = () => {
    return (
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'battles' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('battles')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'battles' && styles.activeTabButtonText
          ]}>
            Battles
          </Text>
          {activeTab === 'battles' && (
            <LinearGradient
              colors={[colors.vibrantPurple, colors.neonBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeTabIndicator}
            />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'leaderboard' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('leaderboard')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'leaderboard' && styles.activeTabButtonText
          ]}>
            Leaderboard
          </Text>
          {activeTab === 'leaderboard' && (
            <LinearGradient
              colors={[colors.vibrantPurple, colors.neonBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeTabIndicator}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render battles content
  const renderBattlesContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.vibrantPurple} size="large" />
        </View>
      );
    }
    
    return (
      <View style={styles.battlesContainer}>
        <Text style={styles.sectionTitle}>Active & Upcoming Battles</Text>
        
        {battles.filter(b => b.status !== 'completed').length > 0 ? (
          battles
            .filter(b => b.status !== 'completed')
            .map(battle => (
              <BattleCard
                key={battle.id}
                battle={battle}
                onPress={() => handleBattlePress(battle)}
                onJoinPress={() => handleJoinBattlePress(battle)}
                style={styles.battleCard}
              />
            ))
        ) : (
          <GradientCard style={styles.emptyStateCard}>
            <Ionicons name="trophy" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              No active or upcoming battles at the moment. Check back soon!
            </Text>
          </GradientCard>
        )}
        
        <Text style={[styles.sectionTitle, styles.pastBattlesTitle]}>Past Battles</Text>
        
        {battles.filter(b => b.status === 'completed').length > 0 ? (
          battles
            .filter(b => b.status === 'completed')
            .map(battle => (
              <BattleCard
                key={battle.id}
                battle={battle}
                onPress={() => handleBattlePress(battle)}
                onViewResultsPress={() => handleViewResultsPress(battle)}
                style={styles.battleCard}
              />
            ))
        ) : (
          <GradientCard style={styles.emptyStateCard}>
            <Ionicons name="time" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              No past battles yet. Join an active battle to participate!
            </Text>
          </GradientCard>
        )}
      </View>
    );
  };
  
  // Render leaderboard content
  const renderLeaderboardContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.vibrantPurple} size="large" />
        </View>
      );
    }
    
    return (
      <View style={styles.leaderboardContainer}>
        <View style={styles.leaderboardHeader}>
          <Text style={styles.leaderboardTitle}>Weekly Leaderboard</Text>
          
          <View style={styles.leaderboardTabs}>
            <TouchableOpacity
              style={[styles.leaderboardTabButton, styles.activeLeaderboardTabButton]}
              activeOpacity={0.7}
            >
              <Text style={[styles.leaderboardTabText, styles.activeLeaderboardTabText]}>Weekly</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.leaderboardTabButton}
              activeOpacity={0.7}
            >
              <Text style={styles.leaderboardTabText}>Monthly</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.leaderboardTabButton}
              activeOpacity={0.7}
            >
              <Text style={styles.leaderboardTabText}>All Time</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <GradientCard style={styles.leaderboardCard}>
          <View style={styles.leaderboardContent}>
            {leaderboard.map((item) => (
              <LeaderboardItem
                key={item.rank}
                rank={item.rank}
                user={item.user}
                points={item.points}
                wins={item.wins}
                isCurrentUser={item.isCurrentUser}
                onPress={() => handleUserProfilePress(item.user)}
              />
            ))}
          </View>
        </GradientCard>
        
        <View style={styles.pointsInfoContainer}>
          <Text style={styles.pointsInfoTitle}>How to Earn Points</Text>
          <View style={styles.pointsInfoItem}>
            <View style={styles.pointsInfoBullet}>
              <LinearGradient
                colors={[colors.vibrantPurple, colors.neonBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <Text style={styles.pointsInfoText}>Win a battle: 500 points</Text>
          </View>
          <View style={styles.pointsInfoItem}>
            <View style={styles.pointsInfoBullet}>
              <LinearGradient
                colors={[colors.vibrantPurple, colors.neonBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <Text style={styles.pointsInfoText}>Participate in a battle: 100 points</Text>
          </View>
          <View style={styles.pointsInfoItem}>
            <View style={styles.pointsInfoBullet}>
              <LinearGradient
                colors={[colors.vibrantPurple, colors.neonBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <Text style={styles.pointsInfoText}>Each vote your beat receives: 10 points</Text>
          </View>
          <View style={styles.pointsInfoItem}>
            <View style={styles.pointsInfoBullet}>
              <LinearGradient
                colors={[colors.vibrantPurple, colors.neonBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <Text style={styles.pointsInfoText}>Daily app usage: 5 points</Text>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Header 
        title="Battles & Leaderboard"
        showBackButton={false}
      />
      
      {renderTabSelector()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'battles' ? renderBattlesContent() : renderLeaderboardContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepBlack,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTabButton: {
    // Active state is shown with indicator
  },
  tabButtonText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 1.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  battlesContainer: {
    width: '100%',
  },
  sectionTitle: {
    ...globalStyles.heading3,
    color: colors.white,
    marginBottom: 16,
  },
  pastBattlesTitle: {
    marginTop: 24,
  },
  battleCard: {
    marginBottom: 16,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 16,
  },
  emptyStateText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  leaderboardContainer: {
    width: '100%',
  },
  leaderboardHeader: {
    marginBottom: 16,
  },
  leaderboardTitle: {
    ...globalStyles.heading3,
    color: colors.white,
    marginBottom: 12,
  },
  leaderboardTabs: {
    flexDirection: 'row',
    backgroundColor: colors.darkBlue + '40',
    borderRadius: 20,
    padding: 4,
  },
  leaderboardTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeLeaderboardTabButton: {
    backgroundColor: colors.deepPurple + '80',
  },
  leaderboardTabText: {
    ...globalStyles.bodyTextSmall,
    color: colors.textSecondary,
  },
  activeLeaderboardTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  leaderboardCard: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  leaderboardContent: {
    width: '100%',
  },
  pointsInfoContainer: {
    marginBottom: 24,
  },
  pointsInfoTitle: {
    ...globalStyles.heading3,
    color: colors.white,
    marginBottom: 16,
  },
  pointsInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsInfoBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  pointsInfoText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
  },
});

export default BattlesScreen;
