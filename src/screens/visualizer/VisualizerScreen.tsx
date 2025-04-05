import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur'; // Temporarily commented out
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import Header from '../../components/common/Header';
import GradientCard from '../../components/common/GradientCard';
import Button from '../../components/common/Button';
import BeatVisualizer from '../../components/visualizer/BeatVisualizer';
import EnhancedPlaybackControls from '../../components/visualizer/EnhancedPlaybackControls';
import { useEnhancedAudioEngine, Track, EnhancedBeatPattern } from '../../services/audioEngine/enhancedAudioEngine';

// --- Define Interfaces Locally ---
// Remove locally defined Instruments if Track type is sufficient
// interface Instruments {
//   [instrument: string]: (boolean | number)[]; 
// }

interface EffectsState {
  reverb: number;
  delay: number;
}
// --- End Interfaces ---

// --- Navigation Types ---
type VisualizerStackParamList = {
  // Define beatPattern structure if possible, using 'any' for now if complex/unknown
  Visualizer: { beatPattern?: any; autoPlay?: boolean }; 
};
type VisualizerScreenRouteProp = RouteProp<VisualizerStackParamList, 'Visualizer'>;
type VisualizerScreenNavigationProp = StackNavigationProp<VisualizerStackParamList>;
// --- End Navigation Types ---

const { width, height } = Dimensions.get('window');

const VisualizerScreen = ({ route }: { route: VisualizerScreenRouteProp }) => {
  const navigation = useNavigation<VisualizerScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { beatPattern, autoPlay = false } = route.params || {};
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentStep, setCurrentStep] = useState<number | null>(0);
  const [bpm, setBpm] = useState(beatPattern?.bpm || 120);
  const [effects, setEffects] = useState<EffectsState>(beatPattern?.effects || { reverb: 0.3, delay: 0.2 });
  const [tracks, setTracks] = useState<Track[]>(beatPattern?.tracks || []);
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const audioEngine = useEnhancedAudioEngine();
  const [isLoading, setIsLoading] = useState(true);
  const initialBpm = beatPattern?.bpm || 140;
  
  // Initialize audio engine via hook
  useEffect(() => {
    const initAudio = async () => {
      setIsLoading(true);
      try {
        // Check if audioEngine and initialize method exist before calling
        if (audioEngine && typeof audioEngine.initialize === 'function') {
          await audioEngine.initialize();
          // Set initial BPM
          audioEngine.setBpm(initialBpm);
          // Get tracks
          const initialTracks = audioEngine.getTracks() || [];
          setTracks(initialTracks);
        } else {
          console.error('Audio engine or initialize method not available from hook.');
          // Handle the case where the engine isn't available
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
        setIsLoading(false);
      }
    };
    
    initAudio();
    
    // Cleanup via hook
    return () => {
      // Check if cleanup exists before calling
      audioEngine?.cleanup?.(); 
    };
    // Add audioEngine as a dependency if its identity is stable, 
    // otherwise, this might re-run unnecessarily or miss updates.
  }, [audioEngine, initialBpm]); 
  
  // Update audio engine when beat pattern changes
  useEffect(() => {
    // CORRECT: Pass tracks instead of instruments
    const patternData: Partial<EnhancedBeatPattern> = {
      bpm,
      tracks,
      // Include effects if they are part of EnhancedBeatPattern
      // masterEffects: { ... } // Adjust as needed
    };
    audioEngine?.updateBeatPattern?.(patternData as EnhancedBeatPattern);
  }, [audioEngine, bpm, tracks /*, effects */]); // Add effects if needed
  
  // Handle play/pause via hook
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isPlaying && audioEngine && typeof audioEngine.play === 'function') {
      // Assuming play returns an interval ID or similar handle
      intervalId = audioEngine.play((step: number) => {
        setCurrentStep(step);
      });
    } else {
      audioEngine?.stop?.();
      setCurrentStep(0);
    }
    
    // Cleanup function
    return () => {
      audioEngine?.stop?.();
      if (intervalId) {
        clearInterval(intervalId); // Clear interval if play returned one
      }
    };
  }, [isPlaying, audioEngine]);
  
  // Toggle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isPlaying) {
      setIsPlaying(false);
    }
  };
  
  // Handle instrument step toggle (Now operates on tracks state)
  const handleStepToggle = (trackId: string, stepIndex: number) => {
    if (!isEditing) return;
    
    setTracks(currentTracks => 
      currentTracks.map(track => {
        if (track.id === trackId) {
          const newSteps = [...track.steps];
          const currentStepState = newSteps[stepIndex];
          // Simple toggle for active state, adjust if velocity/etc. needs changing
          newSteps[stepIndex] = { ...currentStepState, active: !currentStepState.active }; 
          return { ...track, steps: newSteps };
        }
        return track;
      })
    );
  };
  
  // Handle BPM change
  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
  };
  
  // Handle effects change
  const handleEffectsChange = (type: keyof EffectsState, value: number) => {
    setEffects({
      ...effects,
      [type]: value
    });
  };
  
  // Handle share
  const handleShare = () => {
    setIsSharing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSharing(false);
      // Show success message or navigate to share confirmation
      console.log('Beat shared successfully');
    }, 1500);
  };
  
  // Handle save
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // Show success message or navigate back
      console.log('Beat saved successfully');
    }, 1500);
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.darkBackground}
        style={StyleSheet.absoluteFillObject}
      >
        <Text style={{ opacity: 0 }}>.</Text>
      </LinearGradient>
      
      <Header 
        title={isEditing ? "Edit Beat" : "Beat Visualizer"}
        showBackButton={navigation.canGoBack()}
        onBackPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
        rightComponent={
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditToggle}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={isEditing ? gradients.purpleToNeonBlue : gradients.glassEffect}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, styles.editButtonGradient]}
            >
              <Text style={{ opacity: 0 }}>.</Text>
            </LinearGradient>
            <Ionicons 
              name={isEditing ? "eye-outline" : "create-outline"} 
              size={24} 
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        }
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <GradientCard style={styles.beatInfoCard}>
          <Text style={styles.beatTitle}>
            {beatPattern?.title || "Custom Beat"}
          </Text>
          <Text style={styles.beatDescription}>
            {beatPattern?.description || "A custom beat created with REMIX.AI"}
          </Text>
          
          <View style={styles.beatMetaInfo}>
            <View style={styles.beatMetaItem}>
              <Ionicons name="speedometer-outline" size={16} color={colors.vibrantPurple} />
              <Text style={styles.beatMetaText}>{bpm} BPM</Text>
            </View>
            
            <View style={styles.beatMetaItem}>
              <Ionicons name="musical-notes-outline" size={16} color={colors.vibrantPurple} />
              <Text style={styles.beatMetaText}>
                {tracks.length} Instruments
              </Text>
            </View>
          </View>
        </GradientCard>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.vibrantPurple} />
            <Text style={styles.loadingText}>Loading Engine...</Text>
          </View>
        ) : (
          <View style={styles.visualizerContainer}>
            <BeatVisualizer
              tracks={tracks}
              currentStep={currentStep}
              isEditing={isEditing}
              onStepToggle={handleStepToggle}
            />
          </View>
        )}
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.vibrantPurple} />
            <Text style={styles.loadingText}>Loading audio engine...</Text>
          </View>
        ) : (
          <EnhancedPlaybackControls
            isPlaying={isPlaying}
            bpm={bpm}
            masterEffects={{
              limiter: 0.8,
              compressor: {
                threshold: 0.7,
                ratio: 4,
                attack: 0.01,
                release: 0.2
              },
              eq: {
                low: effects.reverb,
                mid: 0,
                high: effects.delay
              }
            }}
            isEditing={isEditing}
            onPlayPause={handlePlayPause}
            onStop={() => {
              setIsPlaying(false);
              setCurrentStep(0);
            }}
            onBpmChange={handleBpmChange}
            onMasterEffectsChange={(masterEffects) => {
              // Map master effects to our simpler effects model
              handleEffectsChange('reverb', masterEffects.eq?.low || 0);
              handleEffectsChange('delay', masterEffects.eq?.high || 0);
            }}
            onTempoTap={() => {
              // Implement tempo tap functionality if needed
            }}
          />
        )}
        
        <View style={styles.actionButtons}>
          <Button
            title="Save Beat"
            icon="save-outline"
            onPress={handleSave}
            loading={isSaving}
            style={styles.actionButton}
          />
          
          <Button
            title="Share Beat"
            icon="share-social-outline"
            variant="secondary"
            onPress={handleShare}
            loading={isSharing}
            style={styles.actionButton}
          />
        </View>
        
        {isEditing && (
          <View style={styles.editingTipsCardContainer}>
            <LinearGradient
              colors={gradients.glassEffect}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, styles.editingTipsCardGradient]}
            >
              <Text style={{ opacity: 0 }}>.</Text>
            </LinearGradient>
            <Text style={styles.editingTipsTitle}>Editing Tips</Text>
            <View style={styles.editingTip}>
              <Ionicons name="finger-print-outline" size={18} color={colors.neonBlue} />
              <Text style={styles.editingTipText}>
                Tap on grid cells to toggle steps on/off
              </Text>
            </View>
            <View style={styles.editingTip}>
              <Ionicons name="speedometer-outline" size={18} color={colors.neonBlue} />
              <Text style={styles.editingTipText}>
                Adjust BPM to change the tempo of your beat
              </Text>
            </View>
            <View style={styles.editingTip}>
              <Ionicons name="options-outline" size={18} color={colors.neonBlue} />
              <Text style={styles.editingTipText}>
                Experiment with effects to create unique sounds
              </Text>
            </View>
          </View>
        )}
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...globalStyles.shadowLight,
  },
  editButtonGradient: {
    borderRadius: 20,
  },
  beatInfoCard: {
    marginTop: 16,
    marginBottom: 24,
    ...globalStyles.shadow,
  },
  beatTitle: {
    ...globalStyles.heading2,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  beatDescription: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  beatMetaInfo: {
    flexDirection: 'row',
  },
  beatMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: colors.white10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  beatMetaText: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
    marginLeft: 8,
    fontWeight: '500',
  },
  visualizerContainer: {
    marginBottom: 24,
    ...globalStyles.shadowLight,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    ...globalStyles.shadow,
  },
  editingTipsCardContainer: {
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.white20,
    overflow: 'hidden',
    ...globalStyles.shadowLight,
  },
  editingTipsCardGradient: {
    borderRadius: 16,
  },
  editingTipsTitle: {
    ...globalStyles.heading3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  editingTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.white10,
    padding: 12,
    borderRadius: 12,
  },
  editingTipText: {
    ...globalStyles.bodyText,
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginTop: 16,
  },
});

export default VisualizerScreen;
