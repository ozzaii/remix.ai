import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, Platform } from 'react-native';
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
import { useAuth } from '../../services/auth/AuthContext';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('beats'); // 'beats', 'battles', 'stats'
  const [userBeats, setUserBeats] = useState([]);
  const [userBattles, setUserBattles] = useState([]);
  const [userStats, setUserStats] = useState({
    totalBeats: 0,
    totalLikes: 0,
    totalComments: 0,
    battlesWon: 0,
    battlesParticipated: 0,
    rank: 0,
    points: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data on mount and when tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  
  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock user beats data
      const mockUserBeats = [
        {
          id: '1',
          title: 'Istanbul Synthwave',
          description: 'A fusion of Istanbul nightlife vibes with retro synthwave elements.',
          creator: {
            id: '1',
            username: user?.username || 'You',
          },
          bpm: 110,
          likes: 24,
          comments: 5,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          beatPattern: {
            bpm: 110,
            instruments: {
              kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
              snare: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
              hihat: [1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,1],
              bass: [1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0]
            },
            effects: {
              reverb: 0.3,
              delay: 0.2
            }
          }
        },
        {
          id: '2',
          title: 'Jazzy Lo-Fi',
          description: 'Smooth jazz samples with relaxed hip-hop rhythms.',
          creator: {
            id: '1',
            username: user?.username || 'You',
          },
          bpm: 85,
          likes: 17,
          comments: 3,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          beatPattern: {
            bpm: 85,
            instruments: {
              kick: [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
              snare: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
              hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
              bass: [1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0]
            },
            effects: {
              reverb: 0.4,
              delay: 0.1
            }
          }
        }
      ];
      
      // Mock user battles data
      const mockUserBattles = [
        {
          id: '1',
          title: 'Future Nostalgia',
          description: 'Create a beat that combines retro sounds with futuristic elements.',
          status: 'active',
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
          participants: 48,
          theme: 'Future Nostalgia',
          userParticipated: true,
          userRank: null, // Not finished yet
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
          userParticipated: true,
          userRank: 8,
        },
      ];
      
      // Mock user stats
      const mockUserStats = {
        totalBeats: 2,
        totalLikes: 41,
        totalComments: 8,
        battlesWon: 0,
        battlesParticipated: 2,
        rank: 8,
        points: 450,
      };
      
      setUserBeats(mockUserBeats);
      setUserBattles(mockUserBattles);
      setUserStats(mockUserStats);
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle beat press
  const handleBeatPress = (beat) => {
    navigation.navigate('Visualizer', { beatPattern: beat.beatPattern });
  };
  
  // Handle battle press
  const handleBattlePress = (battle) => {
    // Navigate to battle details
    console.log('Navigate to battle details:', battle.id);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigation.navigate('Auth');
  };
  
  // Render tab selector
  const renderTabSelector = () => {
    return (
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'beats' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('beats')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'beats' && styles.activeTabButtonText
          ]}>
            Beats
          </Text>
          {activeTab === 'beats' && (
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
            activeTab === 'stats' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('stats')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'stats' && styles.activeTabButtonText
          ]}>
            Stats
          </Text>
          {activeTab === 'stats' && (
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
  
  // Render profile header
  const renderProfileHeader = () => {
    return (
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatarContainer}>
          <LinearGradient
            colors={[colors.vibrantPurple, colors.neonBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.profileAvatarText}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.username || 'User'}</Text>
          <Text style={styles.profileBio}>Beat creator and music enthusiast</Text>
          
          <View style={styles.profileStats}>
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatValue}>{userStats.totalBeats}</Text>
              <Text style={styles.profileStatLabel}>Beats</Text>
            </View>
            
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatValue}>{userStats.totalLikes}</Text>
              <Text style={styles.profileStatLabel}>Likes</Text>
            </View>
            
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatValue}>#{userStats.rank}</Text>
              <Text style={styles.profileStatLabel}>Rank</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  // Render beats tab content
  const renderBeatsContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.vibrantPurple} size="large" />
        </View>
      );
    }
    
    if (userBeats.length === 0) {
      return (
        <GradientCard style={styles.emptyStateCard}>
          <Ionicons name="musical-notes" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>
            You haven't created any beats yet. Start by creating your first beat!
          </Text>
          <Button
            title="Create Beat"
            icon="add-circle"
            onPress={() => navigation.navigate('Chat')}
            style={styles.emptyStateButton}
          />
        </GradientCard>
      );
    }
    
    return (
      <View style={styles.beatsContainer}>
        {userBeats.map((beat) => (
          <GradientCard 
            key={beat.id}
            style={styles.beatCard}
            onPress={() => handleBeatPress(beat)}
          >
            <View style={styles.beatHeader}>
              <Text style={styles.beatTitle}>{beat.title}</Text>
              <View style={styles.beatMeta}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.beatMetaText}>
                  {formatTimeAgo(beat.createdAt)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.beatDescription}>{beat.description}</Text>
            
            <View style={styles.beatStats}>
              <View style={styles.beatStatItem}>
                <Ionicons name="musical-note" size={14} color={colors.textSecondary} />
                <Text style={styles.beatStatText}>{beat.bpm} BPM</Text>
              </View>
              
              <View style={styles.beatStatItem}>
                <Ionicons name="heart" size={14} color={colors.textSecondary} />
                <Text style={styles.beatStatText}>{beat.likes}</Text>
              </View>
              
              <View style={styles.beatStatItem}>
                <Ionicons name="chatbubble" size={14} color={colors.textSecondary} />
                <Text style={styles.beatStatText}>{beat.comments}</Text>
              </View>
            </View>
            
            <View style={styles.beatActions}>
              <Button
                title="Play"
                icon="play"
                size="small"
                onPress={() => handleBeatPress(beat)}
                style={styles.beatActionButton}
              />
              
              <Button
                title="Edit"
                icon="create"
                variant="secondary"
                size="small"
                onPress={() => handleBeatPress(beat)}
                style={styles.beatActionButton}
              />
            </View>
          </GradientCard>
        ))}
      </View>
    );
  };
  
  // Render battles tab content
  const renderBattlesContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.vibrantPurple} size="large" />
        </View>
      );
    }
    
    if (userBattles.length === 0) {
      return (
        <GradientCard style={styles.emptyStateCard}>
          <Ionicons name="trophy" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>
            You haven't participated in any battles yet. Join a battle to compete with other creators!
          </Text>
          <Button
            title="Join Battle"
            icon="trophy"
            onPress={() => navigation.navigate('Battles')}
            style={styles.emptyStateButton}
          />
        </GradientCard>
      );
    }
    
    return (
      <View style={styles.battlesContainer}>
        {userBattles.map((battle) => (
          <GradientCard 
            key={battle.id}
            style={styles.battleCard}
            onPress={() => handleBattlePress(battle)}
          >
            <View style={styles.battleHeader}>
              <Text style={styles.battleTitle}>{battle.title}</Text>
              <View style={styles.battleStatusBadge}>
                <LinearGradient
                  colors={getBattleStatusColors(battle.status)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.battleStatusText}>{getBattleStatusText(battle.status)}</Text>
              </View>
            </View>
            
            <Text style={styles.battleDescription}>{battle.description}</Text>
            
            <View style={styles.battleInfo}>
              <View style={styles.battleInfoItem}>
                <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.battleInfoText}>{battle.participants} participants</Text>
              </View>
              
              <View style={styles.battleInfoItem}>
                <Ionicons name="musical-notes" size={14} color={colors.textSecondary} />
                <Text style={styles.battleInfoText}>Theme: {battle.theme}</Text>
              </View>
            </View>
            
            {battle.status === 'completed' && (
              <View style={styles.battleResult}>
                <Text style={styles.battleResultText}>
                  Your Rank: {battle.userRank ? `#${battle.userRank}` : 'N/A'}
                </Text>
              </View>
            )}
          </GradientCard>
        ))}
      </View>
    );
  };
  
  // Render stats tab content
  const renderStatsContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.vibrantPurple} size="large" />
        </View>
      );
    }
    
    return (
      <View style={styles.statsContainer}>
        <GradientCard style={styles.statsCard}>
          <Text style={styles.statsCardTitle}>Beat Statistics</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalBeats}</Text>
              <Text style={styles.statLabel}>Total Beats</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalLikes}</Text>
              <Text style={styles.statLabel}>Total Likes</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalComments}</Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
          </View>
        </GradientCard>
        
        <GradientCard style={styles.statsCard}>
          <Text style={styles.statsCardTitle}>Battle Statistics</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.battlesParticipated}</Text>
              <Text style={styles.statLabel}>Battles</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.battlesWon}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>#{userStats.rank}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>
        </GradientCard>
        
        <GradientCard style={styles.statsCard}>
          <Text style={styles.statsCardTitle}>Points & Achievements</Text>
          
          <View style={styles.pointsContainer}>
            <View style={styles.pointsHeader}>
              <Text style={styles.pointsTitle}>Total Points</Text>
              <Text style={styles.pointsValue}>{userStats.points}</Text>
            </View>
            
            <View style={styles.pointsProgressContainer}>
              <View style={styles.pointsProgressBackground}>
                <LinearGradient
                  colors={[colors.darkBlue + '40', colors.deepPurple + '40']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              
              <View style={[styles.pointsProgressFill, { width: `${Math.min(userStats.points / 10, 100)}%` }]}>
                <LinearGradient
                  colors={[colors.vibrantPurple, colors.neonBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            </View>
            
            <Text style={styles.pointsNextLevel}>
              {userStats.points < 500 
                ? `${500 - userStats.points} points to next level`
                : userStats.points < 1000
                  ? `${1000 - userStats.points} points to next level`
                  : 'Max level reached!'}
            </Text>
          </View>
        </GradientCard>
        
        <Button
          title="Logout"
          icon="log-out"
          variant="secondary"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>
    );
  };
  
  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Helper function to get battle status colors
  const getBattleStatusColors = (status) => {
    switch (status) {
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
  
  // Helper function to get battle status text
  const getBattleStatusText = (status) => {
    switch (status) {
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
  
  return (
    <View style={styles.container}>
      <Header 
        title="Profile"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderTabSelector()}
        
        {activeTab === 'beats' && renderBeatsContent()}
        {activeTab === 'battles' && renderBattlesContent()}
        {activeTab === 'stats' && renderStatsContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  profileAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  profileAvatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...globalStyles.heading2,
    color: colors.white,
    marginBottom: 4,
  },
  profileBio: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  profileStats: {
    flexDirection: 'row',
  },
  profileStatItem: {
    marginRight: 16,
  },
  profileStatValue: {
    ...globalStyles.heading3,
    color: colors.vibrantPurple,
  },
  profileStatLabel: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  tabSelector: {
    flexDirection: 'row',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyStateButton: {
    marginTop: 8,
    width: '80%',
  },
  beatsContainer: {
    width: '100%',
  },
  beatCard: {
    marginBottom: 16,
  },
  beatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  beatTitle: {
    ...globalStyles.heading3,
    color: colors.vibrantPurple,
    flex: 1,
    marginRight: 8,
  },
  beatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beatMetaText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  beatDescription: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  beatStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  beatStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  beatStatText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  beatActions: {
    flexDirection: 'row',
  },
  beatActionButton: {
    marginRight: 8,
  },
  battlesContainer: {
    width: '100%',
  },
  battleCard: {
    marginBottom: 16,
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  battleTitle: {
    ...globalStyles.heading3,
    color: colors.vibrantPurple,
    flex: 1,
    marginRight: 8,
  },
  battleStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  battleStatusText: {
    ...globalStyles.captionText,
    color: colors.white,
    fontWeight: '600',
  },
  battleDescription: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  battleInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  battleInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  battleInfoText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  battleResult: {
    padding: 8,
    backgroundColor: colors.darkBlue + '40',
    borderRadius: 8,
  },
  battleResultText: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsCardTitle: {
    ...globalStyles.heading3,
    color: colors.vibrantPurple,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...globalStyles.heading2,
    color: colors.white,
  },
  statLabel: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  pointsContainer: {
    width: '100%',
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsTitle: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
  },
  pointsValue: {
    ...globalStyles.heading3,
    color: colors.vibrantPurple,
  },
  pointsProgressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  pointsProgressBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  pointsProgressFill: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  pointsNextLevel: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  logoutButton: {
    marginTop: 16,
  },
});

export default ProfileScreen;
