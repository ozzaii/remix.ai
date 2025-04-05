import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import { SharedBeat } from '../../services/social/socialService';
import socialService from '../../services/social/socialService';
import { useAuth } from '../../services/auth/AuthContext';
import audioEngine from '../../services/audioEngine/audioEngine';
import beatPatternParser from '../../services/beatParser/beatPatternParser';

interface BeatListProps {
  title: string;
  beats: SharedBeat[];
  onBeatSelect: (beat: SharedBeat) => void;
  showUsername?: boolean;
  emptyMessage?: string;
}

const BeatList: React.FC<BeatListProps> = ({
  title,
  beats,
  onBeatSelect,
  showUsername = true,
  emptyMessage = 'No beats found',
}) => {
  const { user } = useAuth();
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null);
  
  // Handle play beat
  const handlePlayBeat = async (beat: SharedBeat) => {
    try {
      // If already playing this beat, stop it
      if (playingBeatId === beat.id) {
        audioEngine.stop();
        setPlayingBeatId(null);
        return;
      }
      
      // Stop any currently playing beat
      if (playingBeatId) {
        audioEngine.stop();
      }
      
      // Load and play the beat
      await audioEngine.initialize();
      audioEngine.loadBeat(beat.beatData);
      audioEngine.play();
      
      // Update state
      setPlayingBeatId(beat.id);
      
      // Increment play count
      socialService.incrementPlayCount(beat.id);
    } catch (error) {
      console.error('Error playing beat:', error);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Render beat item
  const renderBeatItem = ({ item }: { item: SharedBeat }) => {
    const isPlaying = playingBeatId === item.id;
    const isLiked = user ? item.likes.some(like => like.userId === user.id) : false;
    
    return (
      <TouchableOpacity
        style={styles.beatItem}
        onPress={() => onBeatSelect(item)}
      >
        <View style={styles.beatItemContent}>
          <View style={styles.beatItemHeader}>
            <Text style={styles.beatTitle}>{item.title}</Text>
            {showUsername && (
              <Text style={styles.beatUsername}>by {item.username}</Text>
            )}
          </View>
          
          <Text style={styles.beatDate}>{formatDate(item.createdAt)}</Text>
          
          <View style={styles.beatTags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.beatTag}>
                <Text style={styles.beatTagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.beatTagsMore}>+{item.tags.length - 3}</Text>
            )}
          </View>
          
          <View style={styles.beatStats}>
            <View style={styles.beatStat}>
              <Text style={styles.beatStatIcon}>👁️</Text>
              <Text style={styles.beatStatValue}>{item.playCount}</Text>
            </View>
            
            <View style={styles.beatStat}>
              <Text style={styles.beatStatIcon}>
                {isLiked ? '❤️' : '🤍'}
              </Text>
              <Text style={styles.beatStatValue}>{item.likes.length}</Text>
            </View>
            
            <View style={styles.beatStat}>
              <Text style={styles.beatStatIcon}>💬</Text>
              <Text style={styles.beatStatValue}>{item.comments.length}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.playButton,
            isPlaying && styles.stopButton,
          ]}
          onPress={() => handlePlayBeat(item)}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '■' : '▶'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {beats.length === 0 ? (
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      ) : (
        <FlatList
          data={beats}
          renderItem={renderBeatItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...globalStyles.heading3,
    marginBottom: 16,
  },
  emptyMessage: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 24,
  },
  listContent: {
    paddingBottom: 16,
  },
  beatItem: {
    flexDirection: 'row',
    backgroundColor: colors.deepBlack + '80',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.darkBlue,
    padding: 16,
    marginBottom: 12,
    ...globalStyles.shadow,
  },
  beatItemContent: {
    flex: 1,
  },
  beatItemHeader: {
    marginBottom: 8,
  },
  beatTitle: {
    ...globalStyles.bodyText,
    fontWeight: '600',
    fontSize: 16,
  },
  beatUsername: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  beatDate: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  beatTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  beatTag: {
    backgroundColor: colors.darkBlue + '40',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  beatTagText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    fontSize: 10,
  },
  beatTagsMore: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    fontSize: 10,
    marginLeft: 4,
  },
  beatStats: {
    flexDirection: 'row',
  },
  beatStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  beatStatIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  beatStatValue: {
    ...globalStyles.captionText,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.vibrantPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    ...globalStyles.shadow,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  playButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
  },
});

export default BeatList;
