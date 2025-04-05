import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import premium components
import SkiaHeader from './components/common/SkiaHeader';
import SkiaCard from './components/common/SkiaCard';
import SkiaButton from './components/common/SkiaButton';
import SkiaBeatVisualizer from './components/visualizer/SkiaBeatVisualizer';
import AudioInteractionLayer from './components/visualizer/AudioInteractionLayer';
import SkiaPlaybackControls from './components/visualizer/SkiaPlaybackControls';

// Import optimization and error handling
import PerformanceOptimization from './components/performance/PerformanceOptimization';
import ErrorHandler, { useErrorHandler } from './components/feedback/ErrorHandler';
import VisualEffects from './components/effects/VisualEffects';

// Import services
import { AudioEngine } from './services/audioEngine/audioEngine';

// Import styles
import { colors } from './theme/colors';
import { globalStyles } from './theme/styles';

// Define initial state
const initialInstruments = {
  kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  snare: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
  hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
  bass: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, true],
};

const TestApp = () => {
  // State
  const [instruments, setInstruments] = useState(initialInstruments);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [isEditing, setIsEditing] = useState(true);
  const [audioInteractionActive, setAudioInteractionActive] = useState(false);
  const [visualEffectsActive, setVisualEffectsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get error handler
  const { showToast, handleError } = useErrorHandler();
  
  // Audio engine ref
  const audioEngineRef = React.useRef<AudioEngine | null>(null);
  
  // Initialize audio engine
  useEffect(() => {
    const initAudio = async () => {
      setIsLoading(true);
      
      try {
        audioEngineRef.current = new AudioEngine();
        await audioEngineRef.current.init();
        console.log('Audio engine initialized successfully');
        showToast('Ses motoru başarıyla başlatıldı', 'success');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
        handleError(error instanceof Error ? error : new Error('Ses motoru başlatılamadı'));
        setIsLoading(false);
      }
    };
    
    initAudio();
    
    // Show welcome toast
    setTimeout(() => {
      showToast('Remix.AI\'ye Hoş Geldiniz!', 'info');
    }, 1000);
    
    // Cleanup
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.cleanup();
      }
    };
  }, []);
  
  // Handle step toggle
  const handleStepToggle = (instrument: string, stepIndex: number) => {
    try {
      setInstruments(prev => {
        const newInstruments = { ...prev };
        newInstruments[instrument] = [...prev[instrument]];
        newInstruments[instrument][stepIndex] = !newInstruments[instrument][stepIndex];
        
        // Play sound when toggling
        if (audioEngineRef.current && newInstruments[instrument][stepIndex]) {
          audioEngineRef.current.playSound(instrument);
        }
        
        return newInstruments;
      });
      
      // Trigger visual effects briefly
      setVisualEffectsActive(true);
      setTimeout(() => setVisualEffectsActive(false), 500);
      
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Adım değiştirilemedi'));
    }
  };
  
  // Handle play/pause
  const handlePlayPause = () => {
    try {
      if (isPlaying) {
        // Stop playback
        setIsPlaying(false);
        setCurrentStep(null);
        setVisualEffectsActive(false);
        
        if (audioEngineRef.current) {
          audioEngineRef.current.stopSequence();
        }
        
        showToast('Oynatma durduruldu', 'info');
      } else {
        // Start playback
        setIsPlaying(true);
        setVisualEffectsActive(true);
        
        if (audioEngineRef.current) {
          audioEngineRef.current.playSequence(instruments, bpm, (step) => {
            setCurrentStep(step);
          });
        }
        
        showToast('Oynatma başlatıldı', 'success');
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Oynatma kontrolü başarısız oldu'));
    }
  };
  
  // Handle BPM change
  const handleBpmChange = (newBpm: number) => {
    try {
      setBpm(newBpm);
      
      if (isPlaying && audioEngineRef.current) {
        audioEngineRef.current.updateBpm(newBpm);
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('BPM değiştirilemedi'));
    }
  };
  
  // Handle reset
  const handleReset = () => {
    try {
      setInstruments(initialInstruments);
      setIsPlaying(false);
      setCurrentStep(null);
      setVisualEffectsActive(false);
      
      if (audioEngineRef.current) {
        audioEngineRef.current.stopSequence();
      }
      
      showToast('Beat sıfırlandı', 'info');
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Beat sıfırlanamadı'));
    }
  };
  
  // Handle parameter change
  const handleParameterChange = (parameter: string, value: number) => {
    try {
      if (audioEngineRef.current) {
        switch (parameter) {
          case 'frequency':
            audioEngineRef.current.setParameter('frequency', value * 2);
            break;
          case 'amplitude':
            audioEngineRef.current.setParameter('amplitude', value);
            break;
        }
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Parametre değiştirilemedi'));
    }
  };
  
  // Handle trigger sample
  const handleTriggerSample = (x: number, y: number) => {
    try {
      if (audioEngineRef.current) {
        // Map x position to instrument
        const width = Platform.OS === 'web' ? window.innerWidth : require('react-native').Dimensions.get('window').width;
        const normalizedX = x / width;
        
        let instrument = 'kick';
        if (normalizedX < 0.25) {
          instrument = 'kick';
        } else if (normalizedX < 0.5) {
          instrument = 'snare';
        } else if (normalizedX < 0.75) {
          instrument = 'hihat';
        } else {
          instrument = 'bass';
        }
        
        audioEngineRef.current.playSound(instrument);
        
        // Trigger visual effects briefly
        setVisualEffectsActive(true);
        setTimeout(() => setVisualEffectsActive(false), 300);
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Örnek tetiklenemedi'));
    }
  };
  
  // Toggle editing mode
  const toggleEditingMode = () => {
    setIsEditing(!isEditing);
    showToast(isEditing ? 'Görüntüleme moduna geçildi' : 'Düzenleme moduna geçildi', 'info');
  };
  
  // Toggle audio interaction
  const toggleAudioInteraction = () => {
    setAudioInteractionActive(!audioInteractionActive);
    showToast(
      audioInteractionActive 
        ? 'Ses etkileşimi devre dışı bırakıldı' 
        : 'Ses etkileşimi etkinleştirildi', 
      'info'
    );
  };
  
  // Handle share
  const handleShare = () => {
    showToast('Beat paylaşılıyor...', 'info');
    
    // Simulate API call
    setTimeout(() => {
      showToast('Beat başarıyla paylaşıldı!', 'success');
    }, 1500);
  };
  
  // Handle save
  const handleSave = () => {
    showToast('Beat kaydediliyor...', 'info');
    
    // Simulate API call
    setTimeout(() => {
      showToast('Beat başarıyla kaydedildi!', 'success');
    }, 1500);
  };
  
  return (
    <ErrorHandler>
      <PerformanceOptimization optimizationLevel="high">
        <VisualEffects 
          effectType="particles"
          intensity={0.5}
          triggerEffect={visualEffectsActive}
          color1="#7C4DFF"
          color2="#2196F3"
        >
          <GestureHandlerRootView style={styles.container}>
            <StatusBar style="light" />
            <SafeAreaView style={styles.safeArea}>
              <SkiaHeader 
                title="Beat Görüntüleyici"
                subtitle="Remix.AI"
                animationVariant="energetic"
                rightComponent={
                  <SkiaButton
                    label={isEditing ? "Görüntüle" : "Düzenle"}
                    size="small"
                    variant="outline"
                    onPress={toggleEditingMode}
                  />
                }
              />
              
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <SkiaCard style={styles.visualizerCard}>
                  <SkiaBeatVisualizer
                    instruments={instruments}
                    currentStep={currentStep}
                    isEditing={isEditing}
                    onStepToggle={handleStepToggle}
                  />
                </SkiaCard>
                
                <View style={styles.controlsContainer}>
                  <SkiaPlaybackControls
                    isPlaying={isPlaying}
                    bpm={bpm}
                    onPlayPause={handlePlayPause}
                    onBpmChange={handleBpmChange}
                    onReset={handleReset}
                    onShare={handleShare}
                  />
                </View>
                
                <SkiaCard 
                  style={styles.interactionCard}
                  gradientColors={['#7C4DFF', '#2196F3']}
                  glowIntensity={0.4}
                  animationVariant="energetic"
                  onPress={toggleAudioInteraction}
                >
                  <Text style={styles.interactionTitle}>Ses Etkileşimi</Text>
                  <Text style={styles.interactionSubtitle}>
                    {audioInteractionActive 
                      ? "Etkileşimli ses kontrollerini kullanın" 
                      : "Etkileşimli ses kontrollerini etkinleştirmek için dokunun"}
                  </Text>
                  
                  {audioInteractionActive && (
                    <View style={styles.audioInteractionContainer}>
                      <AudioInteractionLayer
                        isActive={audioInteractionActive}
                        onParameterChange={handleParameterChange}
                        onTriggerSample={handleTriggerSample}
                      />
                    </View>
                  )}
                </SkiaCard>
                
                <View style={styles.buttonRow}>
                  <SkiaButton
                    label="Kaydet"
                    icon={<Text style={styles.buttonIcon}>💾</Text>}
                    onPress={handleSave}
                    style={styles.actionButton}
                    isLoading={isLoading}
                  />
                  
                  <SkiaButton
                    label="Paylaş"
                    icon={<Text style={styles.buttonIcon}>🔗</Text>}
                    variant="secondary"
                    onPress={handleShare}
                    style={styles.actionButton}
                    isLoading={isLoading}
                  />
                </View>
              </ScrollView>
            </SafeAreaView>
          </GestureHandlerRootView>
        </VisualEffects>
      </PerformanceOptimization>
    </ErrorHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  visualizerCard: {
    marginBottom: 16,
  },
  controlsContainer: {
    height: 120,
    marginBottom: 16,
  },
  interactionCard: {
    marginBottom: 16,
  },
  interactionTitle: {
    ...globalStyles.heading3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  interactionSubtitle: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  audioInteractionContainer: {
    marginTop: 16,
    height: 200,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 0.48,
  },
  buttonIcon: {
    fontSize: 16,
  },
});

export default TestApp;
