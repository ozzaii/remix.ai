import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import Button from '../../components/common/Button';
import { useAuth } from '../../services/auth/AuthContext';
import { ParsedBeat } from '../../services/beatParser/beatPatternParser';
import socialService from '../../services/social/socialService';

interface ShareBeatModalProps {
  beat: ParsedBeat;
  onClose: () => void;
  onSuccess: () => void;
}

const ShareBeatModal: React.FC<ShareBeatModalProps> = ({
  beat,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  
  const [title, setTitle] = useState(beat.metadata.name || 'Untitled Beat');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle share beat
  const handleShareBeat = async () => {
    if (!user) {
      setError('You must be logged in to share beats');
      return;
    }
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Process tags
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Share beat
      const sharedBeat = socialService.shareBeat(
        user.id,
        user.username,
        beat,
        title,
        description,
        tagArray,
        isPublic
      );
      
      // Success
      onSuccess();
    } catch (error) {
      console.error('Error sharing beat:', error);
      setError('Failed to share beat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Text style={styles.title}>Share Your Beat</Text>
        
        <ScrollView style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Give your beat a name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your beat (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="Separate tags with commas (e.g. trap, electronic, chill)"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Visibility</Text>
            <View style={styles.visibilityOptions}>
              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  isPublic && styles.visibilityOptionSelected,
                ]}
                onPress={() => setIsPublic(true)}
              >
                <Text
                  style={[
                    styles.visibilityOptionText,
                    isPublic && styles.visibilityOptionTextSelected,
                  ]}
                >
                  Public
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  !isPublic && styles.visibilityOptionSelected,
                ]}
                onPress={() => setIsPublic(false)}
              >
                <Text
                  style={[
                    styles.visibilityOptionText,
                    !isPublic && styles.visibilityOptionTextSelected,
                  ]}
                >
                  Private
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.button}
          />
          
          <Button
            title="Share Beat"
            onPress={handleShareBeat}
            disabled={isLoading}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.deepBlack,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.vibrantPurple + '30',
    ...globalStyles.shadow,
  },
  title: {
    ...globalStyles.heading2,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...globalStyles.bodyText,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.deepBlack + '80',
    borderWidth: 1,
    borderColor: colors.darkBlue,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
    ...globalStyles.bodyText,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  visibilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visibilityOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.darkBlue,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  visibilityOptionSelected: {
    borderColor: colors.vibrantPurple,
    backgroundColor: colors.vibrantPurple + '20',
  },
  visibilityOptionText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
  },
  visibilityOptionTextSelected: {
    color: colors.vibrantPurple,
  },
  errorText: {
    ...globalStyles.bodyText,
    color: colors.error,
    marginTop: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ShareBeatModal;
