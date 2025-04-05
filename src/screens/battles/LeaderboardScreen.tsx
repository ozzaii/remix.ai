import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import { useAuth } from '../../services/auth/AuthContext';
import socialService from '../../services/social/socialService';

// Define leaderboard user interface
interface LeaderboardUser {
  id: string;
  username: string;
  profileImage: string;
  points: number;
  wins: number;
  beatsCreated: number;
  rank: number;
}

const LeaderboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [activeTab, setActiveTab] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [userRank, setUserRank] = useState<LeaderboardUser | null>(null);
  
  // Load leaderboard data on mount and when tab changes
  useEffect(() => {
    loadLeaderboardData();
  }, [activeTab]);
  
  // Load leaderboard data
  const loadLeaderboardData = () => {
    // In a real app, this would fetch from an API with the appropriate time period
    // For now, we'll use mock data
    
    // Mock leaderboard users
    const mockUsers: LeaderboardUser[] = [
      {
        id: '1',
        username: 'djmaster',
        profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
        points: 1250,
        wins: 5,
        beatsCreated: 28,
        rank: 1,
      },
      {
        id: '2',
        username: 'beatmaker',
        profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
        points: 980,
        wins: 3,
        beatsCreated: 15,
        rank: 2,
      },
      {
        id: '3',
        username: 'musiclover',
        profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
        points: 820,
        wins: 2,
        beatsCreated: 12,
        rank: 3,
      },
      {
        id: '4',
        username: 'synthmaster',
        profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
        points: 750,
        wins: 2,
        beatsCreated: 10,
        rank: 4,
      },
      {
        id: '5',
        username: 'beatwizard',
        profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
        points: 680,
        wins: 1,
        beatsCreated: 8,
        rank: 5,
      },
      {
        id: '6',
        username: 'rhythmqueen',
        profileImage: 'https://randomuser.me/api/portraits/women/6.jpg',
        points: 620,
        wins: 1,
        beatsCreated: 7,
        rank: 6,
      },
      {
        id: '7',
        username: 'bassking',
        profileImage: 'https://randomuser.me/api/portraits/men/7.jpg',
        points: 580,
        wins: 1,
        beatsCreated: 9,
        rank: 7,
      },
      {
        id: '8',
        username: 'melodymaven',
        profileImage: 'https://randomuser.me/api/portraits/women/8.jpg',
        points: 520,
        wins: 0,
        beatsCreated: 6,
        rank: 8,
      },
      {
        id: '9',
        username: 'beatcreator',
        profileImage: 'https://randomuser.me/api/portraits/men/9.jpg',
        points: 480,
        wins: 0,
        beatsCreated: 5,
        rank: 9,
      },
      {
        id: '10',
        username: 'soundsmith',
        profileImage: 'https://randomuser.me/api/portraits/women/10.jpg',
        points: 450,
        wins: 0,
        beatsCreated: 4,
        rank: 10,
      },
    ];
    
    // Adjust data based on selected time period
    let adjustedUsers = [...mockUsers];
    
    if (activeTab === 'monthly') {
      adjustedUsers = adjustedUsers.map(u => ({
        ...u,
        points: Math.floor(u.points * 0.4),
        wins: Math.floor(u.wins * 0.5),
        beatsCreated: Math.floor(u.beatsCreated * 0.3),
      }));
      
      // Shuffle the order a bit for monthly
      adjustedUsers.sort((a, b) => b.points - a.points);
      adjustedUsers = adjustedUsers.map((u, index) => ({
        ...u,
        rank: index + 1,
      }));
    } else if (activeTab === 'weekly') {
      adjustedUsers = adjustedUsers.map(u => ({
        ...u,
        points: Math.floor(u.points * 0.15),
        wins: Math.floor(u.wins * 0.2),
        beatsCreated: Math.floor(u.beatsCreated * 0.1),
      }));
      
      // Shuffle the order more significantly for weekly
      adjustedUsers.sort((a, b) => b.points - a.points);
      adjustedUsers = adjustedUsers.map((u, index) => ({
        ...u,
        rank: index + 1,
      }));
    }
    
    setLeaderboardUsers(adjustedUsers);
    
    // Set user's rank if logged in
    if (user) {
      const currentUser = adjustedUsers.find(u => u.id === user.id);
      if (currentUser) {
        setUserRank(currentUser);
      } else {
        // If user is not in top 10, create a mock entry
        setUserRank({
          id: user.id,
          username: user.username,
          profileImage: user.profileImage || 'https://via.placeholder.com/150',
          points: 120,
          wins: 0,
          beatsCreated: 2,
          rank: 24, // Some arbitrary rank outside top 10
        });
      }
    } else {
      setUserRank(null);
    }
  };
  
  // Render leaderboard item
  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardUser, index: number }) => {
    const isCurrentUser = user && item.id === user.id;
    const isTopThree = item.rank <= 3;
    
    return (
      <View style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem,
      ]}>
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <View style={[
              styles.topRankBadge,
              item.rank === 1 && styles.firstRankBadge,
              item.rank === 2 && styles.secondRankBadge,
              item.rank === 3 && styles.thirdRankBadge,
            ]}>
              <Text style={styles.topRankText}>{item.rank}</Text>
            </View>
          ) : (
            <Text style={styles.rankText}>{item.rank}</Text>
          )}
        </View>
        
        <Image
          source={{ uri: item.profileImage }}
          style={styles.userImage}
        />
        
        <View style={styles.userInfo}>
          <Text style={[
            styles.username,
            isCurrentUser && styles.currentUsername,
          ]}>
            {item.username}
            {isCurrentUser && ' (You)'}
          </Text>
          
          <View style={styles.userStats}>
            <Text style={styles.userStat}>{item.wins} wins</Text>
            <Text style={styles.userStat}>{item.beatsCreated} beats</Text>
          </View>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{item.points}</Text>
          <Text style={styles.pointsLabel}>points</Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'all-time' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('all-time')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'all-time' && styles.activeTabText,
            ]}>
              All-Time
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'monthly' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('monthly')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'monthly' && styles.activeTabText,
            ]}>
              Monthly
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'weekly' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('weekly')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'weekly' && styles.activeTabText,
            ]}>
              Weekly
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.leaderboardHeader}>
          <Text style={styles.leaderboardTitle}>Top Producers</Text>
          <Text style={styles.leaderboardSubtitle}>
            {activeTab === 'all-time' && 'All-Time Rankings'}
            {activeTab === 'monthly' && 'This Month\'s Rankings'}
            {activeTab === 'weekly' && 'This Week\'s Rankings'}
          </Text>
        </View>
        
        <FlatList
          data={leaderboardUsers}
          renderItem={renderLeaderboardItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.leaderboardList}
          ListEmptyComponent={
            <Text style={styles.emptyMessage}>No leaderboard data available</Text>
          }
        />
        
        {userRank && !leaderboardUsers.some(u => u.id === userRank.id) && (
          <View style={styles.userRankContainer}>
            <View style={styles.userRankDivider} />
            <Text style={styles.userRankTitle}>Your Ranking</Text>
            {renderLeaderboardItem({ item: userRank, index: -1 })}
          </View>
        )}
        
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsInfoTitle}>How to Earn Points</Text>
          <View style={styles.pointsInfoItem}>
            <Text style={styles.pointsInfoValue}>+100</Text>
            <Text style={styles.pointsInfoText}>Win a battle</Text>
          </View>
          <View style={styles.pointsInfoItem}>
            <Text style={styles.pointsInfoValue}>+50</Text>
            <Text style={styles.pointsInfoText}>Participate in a battle</Text>
          </View>
          <View style={styles.pointsInfoItem}>
            <Text style={styles.pointsInfoValue}>+20</Text>
            <Text style={styles.pointsInfoText}>Create and share a beat</Text>
          </View>
          <View style={styles.pointsInfoItem}>
            <Text style={styles.pointsInfoValue}>+5</Text>
            <Text style={styles.pointsInfoText}>Receive a like on your beat</Text>
          </View>
          <View style={styles.pointsInfoItem}>
            <Text style={styles.pointsInfoValue}>+2</Text>
            <Text style={styles.pointsInfoText}>Receive a comment on your beat</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepBlack,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBlue,
  },
  title: {
    ...globalStyles.heading2,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.vibrantPurple,
  },
  tabText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.vibrantPurple,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  leaderboardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBlue,
  },
  leaderboardTitle: {
    ...globalStyles.heading3,
  },
  leaderboardSubtitle: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  leaderboardList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.deepBlack + '80',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.darkBlue,
    padding: 12,
    marginTop: 8,
  },
  currentUserItem: {
    borderColor: colors.vibrantPurple,
    backgroundColor: colors.vibrantPurple + '10',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    ...globalStyles.heading3,
  },
  topRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.darkBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstRankBadge: {
    backgroundColor: '#FFD700', // Gold
  },
  secondRankBadge: {
    backgroundColor: '#C0C0C0', // Silver
  },
  thirdRankBadge: {
    backgroundColor: '#CD7F32', // Bronze
  },
  topRankText: {
    ...globalStyles.bodyText,
    fontWeight: 'bold',
    color: colors.deepBlack,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...globalStyles.bodyText,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentUsername: {
    color: colors.vibrantPurple,
  },
  userStats: {
    flexDirection: 'row',
  },
  userStat: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginRight: 8,
  },
  pointsContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  pointsValue: {
    ...globalStyles.heading3,
    color: colors.vibrantPurple,
  },
  pointsLabel: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  emptyMessage: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 24,
  },
  userRankContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  userRankDivider: {
    height: 1,
    backgroundColor: colors.darkBlue,
    marginVertical: 16,
  },
  userRankTitle: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pointsInfo: {
    padding: 16,
    backgroundColor: colors.deepBlack + '80',
    borderTopWidth: 1,
    borderTopColor: colors.darkBlue,
  },
  pointsInfoTitle: {
    ...globalStyles.heading3,
    marginBottom: 12,
  },
  pointsInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsInfoValue: {
    ...globalStyles.bodyText,
    color: colors.vibrantPurple,
    fontWeight: '600',
    width: 50,
  },
  pointsInfoText: {
    ...globalStyles.bodyText,
  },
});

export default LeaderboardScreen;
