import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import { useAuth } from '../../services/auth/AuthContext';
import socialService, { SharedBeat } from '../../services/social/socialService';
import BeatList from '../../components/social/BeatList';
import Button from '../../components/common/Button';

interface UserProfileProps {
  userId: string;
  onBeatSelect: (beat: SharedBeat) => void;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onBeatSelect,
  onClose,
}) => {
  const { user } = useAuth();
  const [userBeats, setUserBeats] = useState<SharedBeat[]>([]);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Load user data and beats
  useEffect(() => {
    // In a real app, we would fetch user data from an API
    // For now, we'll use mock data from the social service
    const mockUsers = [
      {
        id: '1',
        username: 'djmaster',
        bio: 'Electronic music producer and DJ from Istanbul',
        followers: 120,
        following: 45,
        profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      {
        id: '2',
        username: 'beatmaker',
        bio: 'Creating beats that make you move',
        followers: 85,
        following: 32,
        profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
      {
        id: '3',
        username: 'musiclover',
        bio: 'Just here for the music',
        followers: 42,
        following: 67,
        profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
    ];
    
    const foundUser = mockUsers.find(u => u.id === userId);
    if (foundUser) {
      setProfileUser(foundUser);
    }
    
    // Load user beats
    const beats = socialService.getUserBeats(userId);
    setUserBeats(beats);
    
    // Check if current user is following this user
    // In a real app, this would be fetched from an API
    setIsFollowing(false);
  }, [userId]);
  
  // Handle follow/unfollow
  const handleToggleFollow = () => {
    // In a real app, this would make an API call
    setIsFollowing(!isFollowing);
  };
  
  if (!profileUser) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>User Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading user profile...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: profileUser.profileImage }}
            style={styles.profileImage}
          />
          
          <Text style={styles.username}>{profileUser.username}</Text>
          <Text style={styles.bio}>{profileUser.bio}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{userBeats.length}</Text>
              <Text style={styles.statLabel}>Beats</Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profileUser.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profileUser.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
          
          {user && user.id !== userId && (
            <Button
              title={isFollowing ? "Unfollow" : "Follow"}
              onPress={handleToggleFollow}
              variant={isFollowing ? "outline" : "primary"}
              style={styles.followButton}
            />
          )}
        </View>
        
        <View style={styles.beatsSection}>
          <Text style={styles.sectionTitle}>Beats</Text>
          
          {userBeats.length === 0 ? (
            <Text style={styles.emptyMessage}>No beats shared yet</Text>
          ) : (
            <BeatList
              title=""
              beats={userBeats}
              onBeatSelect={onBeatSelect}
              showUsername={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepBlack,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBlue,
  },
  title: {
    ...globalStyles.heading2,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...globalStyles.heading2,
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBlue,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.vibrantPurple,
  },
  username: {
    ...globalStyles.heading2,
    marginBottom: 8,
  },
  bio: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...globalStyles.heading3,
    marginBottom: 4,
  },
  statLabel: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  followButton: {
    width: 150,
  },
  beatsSection: {
    padding: 16,
  },
  sectionTitle: {
    ...globalStyles.heading3,
    marginBottom: 16,
  },
  emptyMessage: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 24,
  },
});

export default UserProfile;
