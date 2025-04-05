import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import GradientCard from '../common/GradientCard';

const { width } = Dimensions.get('window');

interface BeatCardProps {
  beat: {
    id: string;
    title: string;
    description: string;
    creator: {
      id: string;
      username: string;
      avatar?: string;
    };
    bpm: number;
    likes: number;
    comments: number;
    createdAt: Date;
    beatPattern: any;
  };
  onPress?: () => void;
  onPlayPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  isLiked?: boolean;
  style?: any;
}

const BeatCard: React.FC<BeatCardProps> = ({
  beat,
  onPress,
  onPlayPress,
  onLikePress,
  onCommentPress,
  onSharePress,
  isLiked = false,
  style,
}) => {
  // Animation values
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const likeRotateAnim = useRef(new Animated.Value(0)).current;
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  
  // Format date
  const formatDate = (date: Date) => {
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
  
  // Handle like press with animation
  const handleLikePress = () => {
    setLocalIsLiked(!localIsLiked);
    
    Animated.sequence([
      Animated.parallel([
        Animated.spring(likeScaleAnim, {
          toValue: 1.5,
          speed: 40,
          bounciness: 12,
          useNativeDriver: true,
        }),
        Animated.timing(likeRotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(likeScaleAnim, {
        toValue: 1,
        speed: 20,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (onLikePress) {
      onLikePress();
    }
  };
  
  // Rotation interpolation for like animation
  const rotateInterpolation = likeRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg'],
  });
  
  return (
    <GradientCard
      style={[styles.container, style]}
      onPress={onPress}
      elevation={4}
      animated={false}
    >
      <View style={styles.header}>
        <View style={styles.creatorInfo}>
          <View style={styles.avatar}>
            <LinearGradient
              colors={[colors.vibrantPurple, colors.neonBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.avatarText}>{beat.creator.username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.creatorText}>
            <Text style={styles.creatorName}>{beat.creator.username}</Text>
            <Text style={styles.createdTime}>{formatDate(beat.createdAt)}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{beat.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{beat.description}</Text>
        
        <View style={styles.beatInfo}>
          <View style={styles.beatInfoItem}>
            <Ionicons name="musical-note" size={16} color={colors.textSecondary} />
            <Text style={styles.beatInfoText}>{beat.bpm} BPM</Text>
          </View>
          
          <View style={styles.beatInfoItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.beatInfoText}>16 steps</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.waveformContainer}>
        <LinearGradient
          colors={[colors.vibrantPurple + '40', colors.neonBlue + '40']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.waveformGradient}
        />
        {/* Simulated waveform bars */}
        {Array.from({ length: 30 }).map((_, index) => {
          const height = 10 + Math.random() * 30;
          return (
            <View 
              key={index} 
              style={[
                styles.waveformBar,
                { height, backgroundColor: index % 4 === 0 ? colors.vibrantPurple : colors.neonBlue }
              ]} 
            />
          );
        })}
        
        <TouchableOpacity
          style={styles.playButton}
          onPress={onPlayPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.vibrantPurple, colors.neonBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="play" size={20} color={colors.white} style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLikePress}
          activeOpacity={0.7}
        >
          <Animated.View style={{ 
            transform: [
              { scale: likeScaleAnim },
              { rotate: rotateInterpolation }
            ] 
          }}>
            <Ionicons 
              name={localIsLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={localIsLiked ? colors.vibrantPurple : colors.textSecondary} 
            />
          </Animated.View>
          <Text style={[
            styles.actionText,
            localIsLiked && styles.actionTextActive
          ]}>
            {beat.likes + (localIsLiked && !isLiked ? 1 : 0) - (!localIsLiked && isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onCommentPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.actionText}>{beat.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSharePress}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </GradientCard>
  );
};

interface BeatListProps {
  beats: Array<any>;
  onBeatPress?: (beat: any) => void;
  onPlayPress?: (beat: any) => void;
  onLikePress?: (beat: any) => void;
  onCommentPress?: (beat: any) => void;
  onSharePress?: (beat: any) => void;
  likedBeatIds?: string[];
  loading?: boolean;
  emptyMessage?: string;
}

const BeatList: React.FC<BeatListProps> = ({
  beats,
  onBeatPress,
  onPlayPress,
  onLikePress,
  onCommentPress,
  onSharePress,
  likedBeatIds = [],
  loading = false,
  emptyMessage = "No beats found",
}) => {
  // Loading animation
  const loadingAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(loadingAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      loadingAnim.setValue(0);
    }
  }, [loading]);
  
  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        {Array.from({ length: 2 }).map((_, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.loadingCard,
              { opacity: loadingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 0.8],
              }) }
            ]}
          >
            <LinearGradient
              colors={[colors.darkBlue + '40', colors.deepPurple + '40']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        ))}
      </View>
    );
  };
  
  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="musical-notes" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };
  
  return (
    <View style={styles.listContainer}>
      {loading ? (
        renderLoading()
      ) : beats.length === 0 ? (
        renderEmpty()
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {beats.map((beat) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              onPress={() => onBeatPress && onBeatPress(beat)}
              onPlayPress={() => onPlayPress && onPlayPress(beat)}
              onLikePress={() => onLikePress && onLikePress(beat)}
              onCommentPress={() => onCommentPress && onCommentPress(beat)}
              onSharePress={() => onSharePress && onSharePress(beat)}
              isLiked={likedBeatIds.includes(beat.id)}
              style={styles.beatCard}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  creatorText: {
    justifyContent: 'center',
  },
  creatorName: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  createdTime: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginBottom: 16,
  },
  title: {
    ...globalStyles.heading3,
    color: colors.vibrantPurple,
    marginBottom: 4,
  },
  description: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  beatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beatInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  beatInfoText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  waveformContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  waveformGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
  playButton: {
    position: 'absolute',
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.vibrantPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.darkBlue + '40',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  actionTextActive: {
    color: colors.vibrantPurple,
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingVertical: 8,
  },
  beatCard: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingCard: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginTop: 16,
  },
});

export { BeatCard, BeatList };
