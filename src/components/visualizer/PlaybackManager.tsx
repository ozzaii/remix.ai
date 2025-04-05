import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import { ParsedBeat } from '../../services/beatParser/beatPatternParser';
import audioEngine from '../../services/audioEngine/audioEngine';
import PlaybackControls from '../../components/visualizer/PlaybackControls';

interface PlaybackManagerProps {
  beat: ParsedBeat;
  onBeatUpdate?: (updatedBeat: ParsedBeat) => void;
  style?: object;
}

const PlaybackManager: React.FC<PlaybackManagerProps> = ({
  beat,
  onBeatUpdate,
  style,
}) => {
  const [currentBeat, setCurrentBeat] = useState<ParsedBeat>(beat);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize audio engine
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioEngine.initialize();
        audioEngine.loadBeat(currentBeat);
        setIsReady(true);
      } catch (err) {
        setError('Failed to initialize audio engine');
        console.error('Audio engine initialization error:', err);
      }
    };
    
    initAudio();
    
    // Cleanup on unmount
    return () => {
      audioEngine.stop();
      audioEngine.cleanup();
    };
  }, []);

  // Update audio engine when beat changes
  useEffect(() => {
    setCurrentBeat(beat);
    if (isReady) {
      audioEngine.loadBeat(beat);
    }
  }, [beat, isReady]);

  // Handle BPM change
  const handleBpmChange = (bpm: number) => {
    const updatedBeat = {
      ...currentBeat,
      bpm,
      metadata: {
        ...currentBeat.metadata,
        modified: new Date().toISOString(),
      },
    };
    
    setCurrentBeat(updatedBeat);
    
    if (onBeatUpdate) {
      onBeatUpdate(updatedBeat);
    }
  };

  // Handle volume change
  const handleVolumeChange = (volume: number) => {
    // In a real implementation, we would adjust the audio engine volume here
    // This doesn't update the beat since volume isn't part of the beat pattern
  };

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            // Retry initialization
            audioEngine.initialize()
              .then(() => {
                audioEngine.loadBeat(currentBeat);
                setIsReady(true);
              })
              .catch(err => {
                setError('Failed to initialize audio engine');
                console.error('Audio engine initialization error:', err);
              });
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <Text style={styles.loadingText}>Loading audio engine...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <PlaybackControls
        beat={currentBeat}
        onBpmChange={handleBpmChange}
        onVolumeChange={handleVolumeChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: colors.deepBlack + '80',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: colors.deepBlack + '80',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...globalStyles.bodyText,
    color: colors.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.deepBlack,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.vibrantPurple,
  },
  retryButtonText: {
    ...globalStyles.bodyText,
    color: colors.vibrantPurple,
  },
});

export default PlaybackManager;
