import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useEventBusService } from '../services/serviceLocator';
import { useConversation } from '../services/claude/ConversationContext';

/**
 * Enhanced Sound Deployment component for REMIX.AI
 * 
 * This component provides a polished user interface for deploying sounds
 * and managing sound packs. It includes responsive design, loading states,
 * and integration with the event bus.
 */
const SoundDeployment = () => {
  const eventBusService = useEventBusService();
  const { streamMessage } = useConversation();
  
  const [soundPacks, setSoundPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // Load sound packs on mount
  useEffect(() => {
    loadSoundPacks();
    
    // Subscribe to sound pack update events
    const unsubscribe = eventBusService.subscribe('teknovault:packs:updated', () => {
      loadSoundPacks();
    });
    
    return unsubscribe;
  }, [eventBusService]);
  
  // Load sound packs from TeknoVault
  const loadSoundPacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Publish event that we're loading sound packs
      eventBusService.publish('teknovault:packs:loading', {});
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock sound packs data
      const packs = [
        {
          id: 'pack1',
          name: 'Techno Essentials',
          description: 'Essential sounds for techno production',
          sampleCount: 64,
          imageUrl: 'https://example.com/techno.jpg',
          tags: ['techno', 'drums', 'synths']
        },
        {
          id: 'pack2',
          name: 'Lo-Fi Hip Hop',
          description: 'Warm and dusty sounds for lo-fi beats',
          sampleCount: 48,
          imageUrl: 'https://example.com/lofi.jpg',
          tags: ['lo-fi', 'hip-hop', 'drums', 'vinyl']
        },
        {
          id: 'pack3',
          name: 'Future Bass',
          description: 'Modern sounds for future bass production',
          sampleCount: 56,
          imageUrl: 'https://example.com/futurebass.jpg',
          tags: ['future bass', 'synths', 'vocals']
        }
      ];
      
      setSoundPacks(packs);
      
      // Publish event that sound packs are loaded
      eventBusService.publish('teknovault:packs:loaded', { packs });
    } catch (err) {
      console.error('Error loading sound packs:', err);
      setError('Failed to load sound packs. Please try again.');
      
      // Publish error event
      eventBusService.publish('teknovault:packs:error', { 
        error: err instanceof Error ? err : new Error('Unknown error') 
      });
    } finally {
      setIsLoading(false);
    }
  }, [eventBusService]);
  
  // Deploy a sound pack
  const deploySoundPack = useCallback(async (packId) => {
    if (!packId) return;
    
    setDeploymentStatus({ status: 'deploying', progress: 0 });
    setError(null);
    
    try {
      // Publish event that we're deploying a sound pack
      eventBusService.publish('teknovault:pack:deploying', { packId });
      
      // Find the pack
      const pack = soundPacks.find(p => p.id === packId);
      
      if (!pack) {
        throw new Error(`Sound pack with ID ${packId} not found`);
      }
      
      // Simulate deployment progress
      for (let i = 0; i <= 100; i += 10) {
        setDeploymentStatus({ status: 'deploying', progress: i });
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Deployment complete
      setDeploymentStatus({ status: 'deployed', packId });
      
      // Publish event that sound pack is deployed
      eventBusService.publish('teknovault:pack:deployed', { packId, pack });
      
      // Ask Claude for creative ideas with this sound pack
      streamMessage(
        `Give me 3 creative ideas for using the "${pack.name}" sound pack. This pack includes ${pack.tags.join(', ')} sounds.`,
        (chunk) => {
          // Update deployment status with Claude's suggestions
          setDeploymentStatus(prev => ({
            ...prev,
            suggestions: (prev.suggestions || '') + chunk
          }));
        }
      );
    } catch (err) {
      console.error('Error deploying sound pack:', err);
      setError('Failed to deploy sound pack. Please try again.');
      setDeploymentStatus({ status: 'error' });
      
      // Publish error event
      eventBusService.publish('teknovault:pack:error', { 
        error: err instanceof Error ? err : new Error('Unknown error'),
        packId
      });
    }
  }, [eventBusService, soundPacks, streamMessage]);
  
  // Render a sound pack card
  const renderSoundPack = useCallback((pack) => {
    const isSelected = selectedPack === pack.id;
    const isDeploying = deploymentStatus?.status === 'deploying' && deploymentStatus?.packId === pack.id;
    const isDeployed = deploymentStatus?.status === 'deployed' && deploymentStatus?.packId === pack.id;
    
    return (
      <TouchableOpacity
        key={pack.id}
        style={[
          styles.packCard,
          isSelected && styles.selectedPackCard
        ]}
        onPress={() => setSelectedPack(pack.id)}
      >
        <View style={styles.packImageContainer}>
          <View style={styles.packImage} />
          {isDeployed && (
            <View style={styles.deployedBadge}>
              <Text style={styles.deployedText}>Deployed</Text>
            </View>
          )}
        </View>
        
        <View style={styles.packInfo}>
          <Text style={styles.packName}>{pack.name}</Text>
          <Text style={styles.packDescription} numberOfLines={2}>
            {pack.description}
          </Text>
          
          <View style={styles.packMeta}>
            <Text style={styles.packSamples}>{pack.sampleCount} samples</Text>
            
            <View style={styles.packTags}>
              {pack.tags.slice(0, 2).map(tag => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {pack.tags.length > 2 && (
                <Text style={styles.moreTags}>+{pack.tags.length - 2}</Text>
              )}
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.deployButton,
            isDeploying && styles.deployingButton,
            isDeployed && styles.deployedButton
          ]}
          onPress={() => deploySoundPack(pack.id)}
          disabled={isDeploying}
        >
          {isDeploying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.deployButtonText}>
              {isDeployed ? 'Deployed' : 'Deploy'}
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [selectedPack, deploymentStatus, deploySoundPack]);
  
  // Render deployment status
  const renderDeploymentStatus = useCallback(() => {
    if (!deploymentStatus) return null;
    
    if (deploymentStatus.status === 'deploying') {
      return (
        <View style={styles.deploymentStatus}>
          <Text style={styles.deploymentTitle}>Deploying Sound Pack</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${deploymentStatus.progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {deploymentStatus.progress}% complete
          </Text>
        </View>
      );
    }
    
    if (deploymentStatus.status === 'deployed') {
      return (
        <View style={styles.deploymentStatus}>
          <Text style={styles.deploymentTitle}>Sound Pack Deployed!</Text>
          
          {deploymentStatus.suggestions ? (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Creative Ideas:</Text>
              <Text style={styles.suggestionsText}>
                {deploymentStatus.suggestions}
              </Text>
            </View>
          ) : (
            <Text style={styles.deploymentText}>
              The sound pack is now available for use in your beats.
            </Text>
          )}
          
          <TouchableOpacity
            style={styles.createBeatButton}
            onPress={() => {
              eventBusService.publish('navigation:navigate', { 
                screen: 'beatCreator',
                params: { packId: deploymentStatus.packId }
              });
            }}
          >
            <Text style={styles.createBeatButtonText}>
              Create Beat with This Pack
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (deploymentStatus.status === 'error') {
      return (
        <View style={styles.deploymentStatus}>
          <Text style={styles.deploymentTitle}>Deployment Failed</Text>
          <Text style={styles.errorText}>
            {error || 'An error occurred during deployment. Please try again.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => deploySoundPack(selectedPack)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  }, [deploymentStatus, error, selectedPack, deploySoundPack, eventBusService]);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TeknoVault Sound Packs</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadSoundPacks}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {error && !deploymentStatus?.status === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <ScrollView style={styles.packsList}>
          {isLoading && soundPacks.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C4DFF" />
              <Text style={styles.loadingText}>Loading sound packs...</Text>
            </View>
          ) : soundPacks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No sound packs available. Try refreshing or check your connection.
              </Text>
            </View>
          ) : (
            soundPacks.map(renderSoundPack)
          )}
        </ScrollView>
        
        <View style={styles.deploymentContainer}>
          {renderDeploymentStatus()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refreshButton: {
    backgroundColor: '#333333',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#CF6679',
    padding: 12,
    margin: 16,
    borderRadius: 4,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  packsList: {
    flex: 2,
    padding: 16,
  },
  deploymentContainer: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#333',
    padding: 16,
    backgroundColor: '#1E1E1E',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#BBBBBB',
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#BBBBBB',
    fontSize: 16,
    textAlign: 'center',
  },
  packCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  selectedPackCard: {
    borderColor: '#7C4DFF',
    borderWidth: 2,
  },
  packImageContainer: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  packImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333333',
  },
  deployedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deployedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  packInfo: {
    flex: 1,
    padding: 12,
  },
  packName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  packDescription: {
    fontSize: 12,
    color: '#BBBBBB',
    marginBottom: 8,
  },
  packMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packSamples: {
    fontSize: 12,
    color: '#BBBBBB',
  },
  packTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagPill: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tagText: {
    color: '#BBBBBB',
    fontSize: 10,
  },
  moreTags: {
    color: '#BBBBBB',
    fontSize: 10,
    marginLeft: 4,
  },
  deployButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7C4DFF',
  },
  deployingButton: {
    backgroundColor: '#555555',
  },
  deployedButton: {
    backgroundColor: '#4CAF50',
  },
  deployButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deploymentStatus: {
    padding: 16,
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
  },
  deploymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  deploymentText: {
    fontSize: 14,
    color: '#BBBBBB',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C4DFF',
  },
  progressText: {
    fontSize: 12,
    color: '#BBBBBB',
    marginBottom: 16,
  },
  suggestionsContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  suggestionsText: {
    fontSize: 14,
    color: '#BBBBBB',
    lineHeight: 20,
  },
  createBeatButton: {
    backgroundColor: '#7C4DFF',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createBeatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#7C4DFF',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SoundDeployment;
