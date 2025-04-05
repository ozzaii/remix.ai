import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import Button from '../../components/common/Button';
import { useAuth } from '../../services/auth/AuthContext';
import { SharedBeat } from '../../services/social/socialService';
import socialService from '../../services/social/socialService';

interface BeatDetailProps {
  beat: SharedBeat;
  onPlay: () => void;
  onEdit?: () => void;
  onClose: () => void;
}

const BeatDetail: React.FC<BeatDetailProps> = ({
  beat,
  onPlay,
  onEdit,
  onClose,
}) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(
    user ? beat.likes.some(like => like.userId === user.id) : false
  );
  const [currentBeat, setCurrentBeat] = useState<SharedBeat>(beat);
  
  // Handle like/unlike
  const handleToggleLike = () => {
    if (!user) return;
    
    if (isLiked) {
      // Unlike
      const updatedBeat = socialService.unlikeBeat(beat.id, user.id);
      if (updatedBeat) {
        setCurrentBeat(updatedBeat);
        setIsLiked(false);
      }
    } else {
      // Like
      const updatedBeat = socialService.likeBeat(beat.id, user.id, user.username);
      if (updatedBeat) {
        setCurrentBeat(updatedBeat);
        setIsLiked(true);
      }
    }
  };
  
  // Handle add comment
  const handleAddComment = () => {
    if (!user || !comment.trim()) return;
    
    const updatedBeat = socialService.addComment(
      beat.id,
      user.id,
      user.username,
      comment.trim()
    );
    
    if (updatedBeat) {
      setCurrentBeat(updatedBeat);
      setComment('');
    }
  };
  
  // Handle delete comment
  const handleDeleteComment = (commentId: string) => {
    if (!user) return;
    
    const updatedBeat = socialService.deleteComment(
      beat.id,
      commentId,
      user.id
    );
    
    if (updatedBeat) {
      setCurrentBeat(updatedBeat);
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
  
  const isOwner = user && user.id === beat.userId;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentBeat.title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.beatInfo}>
          <View style={styles.creatorInfo}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40' }}
              style={styles.creatorImage}
            />
            <View>
              <Text style={styles.creatorName}>{currentBeat.username}</Text>
              <Text style={styles.createdDate}>
                {formatDate(currentBeat.createdAt)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.description}>{currentBeat.description}</Text>
          
          <View style={styles.tagsContainer}>
            {currentBeat.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>👁️</Text>
              <Text style={styles.statValue}>{currentBeat.playCount}</Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statValue}>{currentBeat.likes.length}</Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statValue}>{currentBeat.comments.length}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <Button
            title="Play"
            onPress={onPlay}
            style={styles.actionButton}
          />
          
          {isOwner && onEdit && (
            <Button
              title="Edit"
              onPress={onEdit}
              variant="outline"
              style={styles.actionButton}
            />
          )}
          
          {user && (
            <TouchableOpacity
              onPress={handleToggleLike}
              style={[
                styles.likeButton,
                isLiked && styles.likeButtonActive,
              ]}
            >
              <Text style={styles.likeButtonText}>
                {isLiked ? '❤️ Liked' : '🤍 Like'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comments</Text>
          
          {user && (
            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Add a comment..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />
              <Button
                title="Post"
                onPress={handleAddComment}
                disabled={!comment.trim()}
                size="small"
                style={styles.postButton}
              />
            </View>
          )}
          
          {currentBeat.comments.length === 0 ? (
            <Text style={styles.noCommentsText}>No comments yet</Text>
          ) : (
            currentBeat.comments.map(comment => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUsername}>{comment.username}</Text>
                  <Text style={styles.commentDate}>
                    {formatDate(comment.createdAt)}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
                
                {user && (user.id === comment.userId || user.id === currentBeat.userId) && (
                  <TouchableOpacity
                    onPress={() => handleDeleteComment(comment.id)}
                    style={styles.deleteCommentButton}
                  >
                    <Text style={styles.deleteCommentText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
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
  beatInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBlue,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  creatorName: {
    ...globalStyles.bodyText,
    fontWeight: '600',
  },
  createdDate: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  description: {
    ...globalStyles.bodyText,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: colors.darkBlue + '40',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  statValue: {
    ...globalStyles.bodyText,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBlue,
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  likeButton: {
    flex: 1,
    backgroundColor: colors.deepBlack,
    borderWidth: 1,
    borderColor: colors.darkBlue,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  likeButtonActive: {
    borderColor: colors.vibrantPurple,
    backgroundColor: colors.vibrantPurple + '20',
  },
  likeButtonText: {
    ...globalStyles.bodyText,
  },
  commentsSection: {
    padding: 16,
  },
  sectionTitle: {
    ...globalStyles.heading3,
    marginBottom: 16,
  },
  addCommentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.deepBlack + '80',
    borderWidth: 1,
    borderColor: colors.darkBlue,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
    ...globalStyles.bodyText,
    marginRight: 8,
  },
  postButton: {
    width: 80,
  },
  noCommentsText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  commentItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.deepBlack + '80',
    borderWidth: 1,
    borderColor: colors.darkBlue,
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUsername: {
    ...globalStyles.bodyText,
    fontWeight: '600',
  },
  commentDate: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  commentText: {
    ...globalStyles.bodyText,
  },
  deleteCommentButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  deleteCommentText: {
    ...globalStyles.captionText,
    color: colors.error,
  },
});

export default BeatDetail;
