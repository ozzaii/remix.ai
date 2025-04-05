import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './theme/colors';
import { globalStyles } from './theme/styles';
import BeatVisualizer from './components/visualizer/BeatVisualizer';
import PlaybackControls from './components/visualizer/PlaybackControls';
import { useAudioEngine } from './services/audioEngine/audioEngine';
import Header from './components/common/Header';
import GradientCard from './components/common/GradientCard';
import Button from './components/common/Button';
import { isSmallDevice, isTablet } from './utils/performance';
import { useFeedback } from './components/feedback/FeedbackProvider';
import useAppState from './hooks/useAppState';

// For testing purposes, we'll create a simple app that directly shows the visualizer screen
export default function TestApp() {
  const { showFeedback } = useFeedback();
  const appState = useAppState();
  
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [bpm, setBpm] = React.useState(120);
  const [effects, setEffects] = React.useState({ reverb: 0.3, delay: 0.2 });
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [orientation, setOrientation] = React.useState('portrait');
  
  // Get current window dimensions for responsive layout
  const { width, height } = useWindowDimensions();
  
  // Update orientation on dimension change
  useEffect(() => {
    setOrientation(width > height ? 'landscape' : 'portrait');
  }, [width, height]);
  
  const [instruments, setInstruments] = React.useState({
    kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    bass: [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]
  });
  
  const audioEngine = useAudioEngine();
  
  // Handle app state changes (background/foreground)
  useEffect(() => {
    if (appState === 'active') {
      // App came to foreground
      if (isPlaying) {
        // Resume playback if it was playing
        showFeedback('info', 'Playback resumed');
      }
    } else if (appState === 'background') {
      // App went to background
      if (isPlaying) {
        // Pause playback
        setIsPlaying(false);
        showFeedback('info', 'Playback paused while app in background');
      }
    }
  }, [appState]);
  
  // Initialize audio engine
  useEffect(() => {
    const initAudio = async () => {
      try {
        setIsLoading(true);
        await audioEngine.initialize();
        setIsLoading(false);
        showFeedback('success', 'Audio engine initialized successfully');
      } catch (err) {
        console.error('Failed to initialize audio engine:', err);
        setError('Failed to initialize audio. Please restart the app.');
        setIsLoading(false);
        showFeedback('error', 'Failed to initialize audio engine');
      }
    };
    
    initAudio();
    
    return () => {
      audioEngine.cleanup();
    };
  }, []);
  
  // Update audio engine when beat pattern changes
  useEffect(() => {
    try {
      audioEngine.updateBeatPattern({
        bpm,
        instruments,
        effects
      });
    } catch (err) {
      console.error('Failed to update beat pattern:', err);
      showFeedback('error', 'Failed to update beat pattern');
    }
  }, [bpm, instruments, effects]);
  
  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      try {
        const interval = audioEngine.play((step) => {
          setCurrentStep(step);
        });
        
        return () => {
          audioEngine.stop();
          clearInterval(interval);
        };
      } catch (err) {
        console.error('Failed to start playback:', err);
        setIsPlaying(false);
        showFeedback('error', 'Failed to start playback');
      }
    } else {
      audioEngine.stop();
      setCurrentStep(0);
    }
  }, [isPlaying]);
  
  // Toggle play/pause
  const handlePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    showFeedback(newState ? 'success' : 'info', newState ? 'Playback started' : 'Playback stopped');
  };
  
  // Toggle edit mode
  const handleEditToggle = () => {
    const newEditState = !isEditing;
    setIsEditing(newEditState);
    
    if (isPlaying && newEditState) {
      setIsPlaying(false);
      showFeedback('info', 'Playback stopped for editing');
    }
    
    showFeedback('info', newEditState ? 'Edit mode enabled' : 'View mode enabled');
  };
  
  // Handle instrument step toggle
  const handleStepToggle = (instrument, stepIndex) => {
    if (!isEditing) return;
    
    try {
      const newInstruments = { ...instruments };
      newInstruments[instrument][stepIndex] = newInstruments[instrument][stepIndex] ? 0 : 1;
      setInstruments(newInstruments);
    } catch (err) {
      console.error('Failed to toggle step:', err);
      showFeedback('error', 'Failed to update beat pattern');
    }
  };
  
  // Handle BPM change
  const handleBpmChange = (newBpm) => {
    try {
      setBpm(newBpm);
      if (newBpm < 80) {
        showFeedback('info', 'Slow tempo selected');
      } else if (newBpm > 160) {
        showFeedback('info', 'Fast tempo selected');
      }
    } catch (err) {
      console.error('Failed to change BPM:', err);
      showFeedback('error', 'Failed to update tempo');
    }
  };
  
  // Handle effects change
  const handleEffectsChange = (type, value) => {
    try {
      setEffects({
        ...effects,
        [type]: value
      });
      
      if (value > 0.8) {
        showFeedback('info', `High ${type} effect applied`);
      }
    } catch (err) {
      console.error('Failed to change effects:', err);
      showFeedback('error', 'Failed to update effects');
    }
  };
  
  // Reset to default pattern
  const handleReset = () => {
    try {
      setIsPlaying(false);
      setCurrentStep(0);
      setBpm(120);
      setEffects({ reverb: 0.3, delay: 0.2 });
      setInstruments({
        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        bass: [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]
      });
      showFeedback('success', 'Beat pattern reset to default');
    } catch (err) {
      console.error('Failed to reset pattern:', err);
      showFeedback('error', 'Failed to reset beat pattern');
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing REMIX.AI...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Try Again" 
          onPress={() => window.location.reload()} 
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  // Responsive layout based on orientation and device size
  const getResponsiveLayout = () => {
    if (orientation === 'landscape' && !isSmallDevice) {
      return (
        <View style={styles.landscapeContainer}>
          <View style={styles.landscapeLeft}>
            <GradientCard style={styles.infoCard}>
              <Text style={styles.infoTitle}>Beat Creator</Text>
              <Text style={styles.infoDescription}>
                Create your own beats by toggling steps in edit mode. Adjust BPM and effects to customize your sound.
              </Text>
            </GradientCard>
            
            <PlaybackControls
              isPlaying={isPlaying}
              bpm={bpm}
              effects={effects}
              onPlayPause={handlePlayPause}
              onBpmChange={handleBpmChange}
              onEffectsChange={handleEffectsChange}
              isEditing={isEditing}
            />
            
            <View style={styles.actionButtons}>
              <Button
                title="Reset Pattern"
                icon="refresh-outline"
                variant="secondary"
                onPress={handleReset}
                style={styles.resetButton}
              />
            </View>
          </View>
          
          <View style={styles.landscapeRight}>
            <View style={styles.visualizerContainer}>
              <BeatVisualizer
                instruments={instruments}
                currentStep={currentStep}
                isEditing={isEditing}
                onStepToggle={handleStepToggle}
              />
            </View>
          </View>
        </View>
      );
    }
    
    // Default portrait layout
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && styles.tabletScrollContent
        ]}
        showsVerticalScrollIndicator={false}
      >
        <GradientCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>Beat Creator</Text>
          <Text style={styles.infoDescription}>
            Create your own beats by toggling steps in edit mode. Adjust BPM and effects to customize your sound.
          </Text>
        </GradientCard>
        
        <View style={styles.visualizerContainer}>
          <BeatVisualizer
            instruments={instruments}
            currentStep={currentStep}
            isEditing={isEditing}
            onStepToggle={handleStepToggle}
          />
        </View>
        
        <PlaybackControls
          isPlaying={isPlaying}
          bpm={bpm}
          effects={effects}
          onPlayPause={handlePlayPause}
          onBpmChange={handleBpmChange}
          onEffectsChange={handleEffectsChange}
          isEditing={isEditing}
        />
        
        <View style={styles.actionButtons}>
          <Button
            title="Reset Pattern"
            icon="refresh-outline"
            variant="secondary"
            onPress={handleReset}
            style={styles.resetButton}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            REMIX.AI - The Ultimate Beat Creation Experience
          </Text>
        </View>
      </ScrollView>
    );
  };
  
  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        <Header 
          title={isEditing ? "Edit Beat" : "REMIX.AI"}
          showBackButton={false}
          rightComponent={
            <Button
              title={isEditing ? "View" : "Edit"}
              variant="outline"
              size="small"
              icon={isEditing ? "eye-outline" : "create-outline"}
              onPress={handleEditToggle}
            />
          }
        />
        
        {getResponsiveLayout()}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepBlack,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.deepBlack,
  },
  loadingText: {
    ...globalStyles.heading2,
    color: colors.textPrimary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.deepBlack,
    padding: 20,
  },
  errorText: {
    ...globalStyles.bodyText,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabletScrollContent: {
    paddingHorizontal: 64,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  infoCard: {
    marginBottom: 24,
  },
  infoTitle: {
    ...globalStyles.heading2,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  infoDescription: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
  },
  visualizerContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    marginTop: 24,
    alignItems: 'center',
  },
  resetButton: {
    width: isSmallDevice ? '100%' : '80%',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
  // Landscape layout styles
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  landscapeLeft: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'space-between',
  },
  landscapeRight: {
    flex: 1,
    justifyContent: 'center',
  },
});
