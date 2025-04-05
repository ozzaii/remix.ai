import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import { useAuth } from '../../services/auth/AuthContext';
import socialService, { SharedBeat } from '../../services/social/socialService';
import BeatList from '../../components/social/BeatList';
import UserProfile from '../../components/social/UserProfile';
import BeatDetail from '../../components/social/BeatDetail';

const ActivityFeedScreen: React.FC = () => {
  const { user } = useAuth();
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [selectedBeat, setSelectedBeat] = useState<SharedBeat | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Load activity feed on mount
  useEffect(() => {
    loadActivityFeed();
  }, []);
  
  // Load activity feed
  const loadActivityFeed = () => {
    // In a real app, this would fetch from an API
    // For now, we'll generate mock activity data
    
    const allBeats = socialService.getPublicBeats();
    
    // Generate mock activity items
    const mockActivities = [
      {
        id: '1',
        type: 'new_beat',
        userId: '1',
        username: 'djmaster',
        beatId: allBeats[0].id,
        beat: allBeats[0],
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: '2',
        type: 'like',
        userId: '2',
        username: 'beatmaker',
        targetUserId: '1',
        targetUsername: 'djmaster',
        beatId: allBeats[0].id,
        beat: allBeats[0],
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      },
      {
        id: '3',
        type: 'comment',
        userId: '3',
        username: 'musiclover',
        beatId: allBeats[0].id,
        beat: allBeats[0],
        comment: 'Love the bass line!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      },
      {
        id: '4',
        type: 'new_beat',
        userId: '2',
        username: 'beatmaker',
        beatId: allBeats[1].id,
        beat: allBeats[1],
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
      },
      {
        id: '5',
        type: 'like',
        userId: '1',
        username: 'djmaster',
        targetUserId: '2',
        targetUsername: 'beatmaker',
        beatId: allBeats[1].id,
        beat: allBeats[1],
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      },
    ];
    
    // Sort by timestamp (newest first)
    const sortedActivities = mockActivities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setActivityFeed(sortedActivities);
  };
  
  // Handle beat selection
  const handleBeatSelect = (beat: SharedBeat) => {
    setSelectedBeat(beat);
    setSelectedUser(null);
    
    // Increment play count
    socialService.incrementPlayCount(beat.id);
  };
  
  // Handle user selection
  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    setSelectedBeat(null);
  };
  
  // Handle close detail views
  const handleCloseDetail = () => {
    setSelectedBeat(null);
    setSelectedUser(null);
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay}d ago`;
    } else if (diffHour > 0) {
      return `${diffHour}h ago`;
    } else if (diffMin > 0) {
      return `${diffMin}m ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Render activity item
  const renderActivityItem = ({ item }: { item: any }) => {
    let content;
    
    switch (item.type) {
      case 'new_beat':
        content = (
          <View style={styles.activityContent}>
            <TouchableOpacity onPress={() => handleUserSelect(item.userId)}>
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
            <Text style={styles.activityText}> shared a new beat </Text>
            <TouchableOpacity onPress={() => handleBeatSelect(item.beat)}>
              <Text style={styles.beatName}>{item.beat.title}</Text>
            </TouchableOpacity>
          </View>
        );
        break;
      
      case 'like':
        content = (
          <View style={styles.activityContent}>
            <TouchableOpacity onPress={() => handleUserSelect(item.userId)}>
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
            <Text style={styles.activityText}> liked </Text>
            <TouchableOpacity onPress={() => handleUserSelect(item.targetUserId)}>
              <Text style={styles.username}>{item.targetUsername}</Text>
            </TouchableOpacity>
            <Text style={styles.activityText}>'s beat </Text>
            <TouchableOpacity onPress={() => handleBeatSelect(item.beat)}>
              <Text style={styles.beatName}>{item.beat.title}</Text>
            </TouchableOpacity>
          </View>
        );
        break;
      
      case 'comment':
        content = (
          <View style={styles.activityContent}>
            <TouchableOpacity onPress={() => handleUserSelect(item.userId)}>
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
            <Text style={styles.activityText}> commented on </Text>
            <TouchableOpacity onPress={() => handleBeatSelect(item.beat)}>
              <Text style={styles.beatName}>{item.beat.title}</Text>
            </TouchableOpacity>
            <Text style={styles.comment}>"{item.comment}"</Text>
          </View>
        );
        break;
      
      default:
        content = null;
    }
    
    return (
      <View style={styles.activityItem}>
        {content}
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
    );
  };
  
  // If a beat or user is selected, show the detail view
  if (selectedBeat) {
    return (
      <BeatDetail
        beat={selectedBeat}
        onPlay={() => {/* Play beat */}}
        onClose={handleCloseDetail}
      />
    );
  }
  
  if (selectedUser) {
    return (
      <UserProfile
        userId={selectedUser}
        onBeatSelect={handleBeatSelect}
        onClose={handleCloseDetail}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Feed</Text>
      </View>
      
      <FlatList
        data={activityFeed}
        renderItem={renderActivityItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.feedContainer}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>No activity yet</Text>
        }
      />
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
  },
  feedContainer: {
    padding: 16,
  },
  activityItem: {
    backgroundColor: colors.deepBlack + '80',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.darkBlue,
    padding: 16,
    marginBottom: 12,
  },
  activityContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  username: {
    ...globalStyles.bodyText,
    color: colors.vibrantPurple,
    fontWeight: '600',
  },
  activityText: {
    ...globalStyles.bodyText,
  },
  beatName: {
    ...globalStyles.bodyText,
    color: colors.electricBlue,
  },
  comment: {
    ...globalStyles.bodyText,
    fontStyle: 'italic',
    marginTop: 8,
  },
  timestamp: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  emptyMessage: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 24,
  },
});

export default ActivityFeedScreen;
