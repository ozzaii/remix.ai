/**
 * Social Sharing Component for REMIX.AI
 * 
 * This component provides functionality to share beats and musical creations
 * with the community and on social media platforms.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBeats, useAuth } from '../state';
import { ComponentErrorBoundary } from '../core';
import { Beat } from '../state/types';

// Share options component
const ShareOptions = ({ 
  onShare, 
  onClose 
}: { 
  onShare: (platform: string) => void, 
  onClose: () => void 
}) => {
  const platforms = [
    { id: 'remix', name: 'REMIX.AI Community', icon: 'people-outline', color: '#0A84FF' },
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
    { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#4267B2' },
    { id: 'tiktok', name: 'TikTok', icon: 'musical-notes-outline', color: '#000000' },
    { id: 'link', name: 'Copy Link', icon: 'link-outline', color: '#999999' }
  ];
  
  return (
    <View style={styles.shareOptionsContainer}>
      <View style={styles.shareOptionsHeader}>
        <Text style={styles.shareOptionsTitle}>Share Your Beat</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.platformList}>
        {platforms.map(platform => (
          <TouchableOpacity
            key={platform.id}
            style={styles.platformItem}
            onPress={() => onShare(platform.id)}
          >
            <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
              <Ionicons name={platform.icon} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.platformName}>{platform.name}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Community share form component
const CommunityShareForm = ({ 
  beat, 
  onShare, 
  onCancel, 
  isSharing 
}: { 
  beat: Beat, 
  onShare: (caption: string, isPublic: boolean) => void, 
  onCancel: () => void,
  isSharing: boolean
}) => {
  const [caption, setCaption] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  return (
    <View style={styles.communityFormContainer}>
      <View style={styles.shareOptionsHeader}>
        <Text style={styles.shareOptionsTitle}>Share to Community</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Beat preview */}
      <View style={styles.beatPreview}>
        <LinearGradient
          colors={['rgba(10, 132, 255, 0.8)', 'rgba(94, 92, 230, 0.8)']}
          style={styles.beatPreviewGradient}
        >
          <Text style={styles.beatPreviewName}>{beat.name}</Text>
          <Text style={styles.beatPreviewDetails}>{beat.bpm} BPM</Text>
          
          {/* Simplified waveform visualization */}
          <View style={styles.previewWaveform}>
            {Array(16).fill(0).map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.previewWaveformBar,
                  { height: 5 + Math.random() * 15 }
                ]} 
              />
            ))}
          </View>
        </LinearGradient>
      </View>
      
      {/* Caption input */}
      <View style={styles.captionContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          placeholderTextColor="#999999"
          multiline
          maxLength={280}
          value={caption}
          onChangeText={setCaption}
        />
      </View>
      
      {/* Privacy toggle */}
      <View style={styles.privacyContainer}>
        <Text style={styles.privacyLabel}>Who can see this?</Text>
        <View style={styles.privacyOptions}>
          <TouchableOpacity
            style={[
              styles.privacyOption,
              isPublic && styles.privacyOptionSelected
            ]}
            onPress={() => setIsPublic(true)}
          >
            <Ionicons 
              name="globe-outline" 
              size={20} 
              color={isPublic ? '#0A84FF' : '#999999'} 
            />
            <Text 
              style={[
                styles.privacyOptionText,
                isPublic && styles.privacyOptionTextSelected
              ]}
            >
              Everyone
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.privacyOption,
              !isPublic && styles.privacyOptionSelected
            ]}
            onPress={() => setIsPublic(false)}
          >
            <Ionicons 
              name="lock-closed-outline" 
              size={20} 
              color={!isPublic ? '#0A84FF' : '#999999'} 
            />
            <Text 
              style={[
                styles.privacyOptionText,
                !isPublic && styles.privacyOptionTextSelected
              ]}
            >
              Only Me
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Share button */}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => onShare(caption, isPublic)}
        disabled={isSharing}
      >
        {isSharing ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share to Community</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Success message component
const ShareSuccess = ({ 
  platform, 
  onClose 
}: { 
  platform: string, 
  onClose: () => void 
}) => {
  let message = '';
  let icon = '';
  
  switch (platform) {
    case 'remix':
      message = 'Your beat has been shared to the REMIX.AI community!';
      icon = 'people-outline';
      break;
    case 'instagram':
      message = 'Your beat has been shared to Instagram!';
      icon = 'logo-instagram';
      break;
    case 'twitter':
      message = 'Your beat has been shared to Twitter!';
      icon = 'logo-twitter';
      break;
    case 'facebook':
      message = 'Your beat has been shared to Facebook!';
      icon = 'logo-facebook';
      break;
    case 'tiktok':
      message = 'Your beat has been shared to TikTok!';
      icon = 'musical-notes-outline';
      break;
    case 'link':
      message = 'Link copied to clipboard!';
      icon = 'link-outline';
      break;
    default:
      message = 'Your beat has been shared successfully!';
      icon = 'checkmark-circle-outline';
  }
  
  return (
    <View style={styles.successContainer}>
      <View style={styles.successIconContainer}>
        <Ionicons name={icon} size={64} color="#0A84FF" />
      </View>
      <Text style={styles.successMessage}>{message}</Text>
      <TouchableOpacity
        style={styles.successButton}
        onPress={onClose}
      >
        <Text style={styles.successButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main social sharing component
export const SocialSharing = ({ 
  beat, 
  isVisible, 
  onClose 
}: { 
  beat: Beat | null, 
  isVisible: boolean, 
  onClose: () => void 
}) => {
  const { isAuthenticated } = useAuth();
  const { shareBeat, isSharing } = useBeats();
  
  const [shareStep, setShareStep] = useState<'options' | 'community' | 'success'>('options');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  
  // Reset state when modal is closed
  React.useEffect(() => {
    if (!isVisible) {
      setShareStep('options');
      setSelectedPlatform(null);
    }
  }, [isVisible]);
  
  // Handle platform selection
  const handleSelectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
    
    if (platform === 'remix') {
      // For REMIX.AI community, show the community form
      setShareStep('community');
    } else if (platform === 'link') {
      // For link sharing, copy to clipboard and show success
      // In a real implementation, this would generate and copy a link
      console.log('Copying link to clipboard');
      setShareStep('success');
    } else {
      // For other platforms, simulate sharing and show success
      // In a real implementation, this would open the respective sharing SDK
      console.log(`Sharing to ${platform}`);
      setTimeout(() => {
        setShareStep('success');
      }, 1000);
    }
  };
  
  // Handle community share
  const handleCommunityShare = async (caption: string, isPublic: boolean) => {
    if (!beat) return;
    
    try {
      await shareBeat(beat.id, caption, isPublic);
      setShareStep('success');
    } catch (error) {
      console.error('Error sharing beat:', error);
      // In a real implementation, show an error message
    }
  };
  
  // Handle close
  const handleClose = () => {
    onClose();
  };
  
  // If no beat is selected, don't render anything
  if (!beat) {
    return null;
  }
  
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <ComponentErrorBoundary componentName="SocialSharing">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {shareStep === 'options' && (
              <ShareOptions
                onShare={handleSelectPlatform}
                onClose={handleClose}
              />
            )}
            
            {shareStep === 'community' && (
              <CommunityShareForm
                beat={beat}
                onShare={handleCommunityShare}
                onCancel={() => setShareStep('options')}
                isSharing={isSharing}
              />
            )}
            
            {shareStep === 'success' && selectedPlatform && (
              <ShareSuccess
                platform={selectedPlatform}
                onClose={handleClose}
              />
            )}
          </View>
        </View>
      </ComponentErrorBoundary>
    </Modal>
  );
};

// Beat sharing button component
export const ShareBeatButton = ({ 
  beat 
}: { 
  beat: Beat 
}) => {
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  
  const handleOpenShareModal = () => {
    setShareModalVisible(true);
  };
  
  const handleCloseShareModal = () => {
    setShareModalVisible(false);
  };
  
  return (
    <>
      <TouchableOpacity
        style={styles.shareBeatButton}
        onPress={handleOpenShareModal}
      >
        <Ionicons name="share-outline" size={20} color="#FFFFFF" />
        <Text style={styles.shareBeatButtonText}>Share</Text>
      </TouchableOpacity>
      
      <SocialSharing
        beat={beat}
        isVisible={isShareModalVisible}
        onClose={handleCloseShareModal}
      />
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '90%',
  },
  shareOptionsContainer: {
    padding: 20,
  },
  shareOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  shareOptionsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  platformList: {
    maxHeight: 400,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  platformName: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  communityFormContainer: {
    padding: 20,
  },
  beatPreview: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  beatPreviewGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  beatPreviewName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  beatPreviewDetails: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 12,
  },
  previewWaveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
  },
  previewWaveformBar: {
    width: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  captionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  captionInput: {
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  privacyContainer: {
    marginBottom: 20,
  },
  privacyLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  privacyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 0.48,
  },
  privacyOptionSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#0A84FF',
  },
  privacyOptionText: {
    color: '#999999',
    marginLeft: 8,
  },
  privacyOptionTextSelected: {
    color: '#0A84FF',
    fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 14,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  successContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successMessage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  successButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareBeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  shareBeatButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SocialSharing;
