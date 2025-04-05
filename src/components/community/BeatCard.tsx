import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

interface BeatCardProps {
  username: string;
  profileImage?: string;
  beatName: string;
  description?: string;
  timestamp: string;
  likes: number;
  comments: number;
  remixes: number;
  tags?: string[];
  onPress?: () => void;
  onPlayPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onRemixPress?: () => void;
  onSharePress?: () => void;
  onUserPress?: () => void;
}

const BeatCard: React.FC<BeatCardProps> = ({
  username,
  profileImage,
  beatName,
  description,
  timestamp,
  likes,
  comments,
  remixes,
  tags = [],
  onPress,
  onPlayPress,
  onLikePress,
  onCommentPress,
  onRemixPress,
  onSharePress,
  onUserPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.deepBlack, colors.darkBlue]}
        style={styles.card}
      >
        {/* User info */}
        <TouchableOpacity 
          style={styles.userContainer}
          onPress={onUserPress}
          activeOpacity={0.8}
        >
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profilePlaceholderText}>{username.charAt(0)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </TouchableOpacity>
        
        {/* Beat info */}
        <View style={styles.beatInfoContainer}>
          <Text style={styles.beatName}>{beatName}</Text>
          {description && (
            <Text style={styles.description} numberOfLines={2}>{description}</Text>
          )}
        </View>
        
        {/* Beat visualization */}
        <TouchableOpacity 
          style={styles.visualizationContainer}
          onPress={onPlayPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.deepBlack + '80', colors.vibrantPurple + '20']}
            style={styles.visualization}
          >
            {/* Waveform visualization placeholder */}
            <View style={styles.waveformContainer}>
              {Array.from({ length: 30 }).map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.waveformBar,
                    { 
                      height: 5 + Math.random() * 20,
                      backgroundColor: `rgba(${168}, ${85}, ${247}, ${0.4 + Math.random() * 0.6})` 
                    }
                  ]} 
                />
              ))}
            </View>
            
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>▶</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Social interactions */}
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={onLikePress}
          >
            <Text style={styles.socialIcon}>♥</Text>
            <Text style={styles.socialCount}>{likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={onCommentPress}
          >
            <Text style={styles.socialIcon}>💬</Text>
            <Text style={styles.socialCount}>{comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={onRemixPress}
          >
            <Text style={styles.socialIcon}>🔄</Text>
            <Text style={styles.socialCount}>{remixes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={onSharePress}
          >
            <Text style={styles.socialIcon}>↗️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    ...globalStyles.shadow,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.vibrantPurple + '30',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.vibrantPurple,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.vibrantPurple + '50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    ...globalStyles.bodyText,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  username: {
    ...globalStyles.bodyText,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    ...globalStyles.captionText,
  },
  beatInfoContainer: {
    marginBottom: 12,
  },
  beatName: {
    ...globalStyles.heading3,
    marginBottom: 4,
  },
  description: {
    ...globalStyles.bodyText,
  },
  visualizationContainer: {
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  visualization: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
  playButtonContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.vibrantPurple + '80',
    justifyContent: 'center',
    alignItems: 'center',
    ...globalStyles.shadow,
  },
  playButtonText: {
    color: colors.textPrimary,
    fontSize: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: colors.vibrantPurple + '30',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  socialIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  socialCount: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
});

export default BeatCard;
