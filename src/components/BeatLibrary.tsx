/**
 * Beat Library Management Component for REMIX.AI
 * 
 * This component provides functionality to browse, save, and manage beats
 * created by the user and the community.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBeats, useAuth } from '../state';
import { ComponentErrorBoundary } from '../core';
import { Beat } from '../state/types';

// Beat card component to display individual beats
const BeatCard = ({ 
  beat, 
  onSelect, 
  onPlay, 
  isPlaying 
}: { 
  beat: Beat, 
  onSelect: () => void, 
  onPlay: () => void,
  isPlaying: boolean
}) => {
  return (
    <TouchableOpacity 
      style={styles.beatCard}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#2C2C2E', '#1C1C1E']}
        style={styles.beatCardContent}
      >
        {/* Beat thumbnail/waveform */}
        <View style={styles.beatThumbnail}>
          <LinearGradient
            colors={['rgba(10, 132, 255, 0.8)', 'rgba(94, 92, 230, 0.8)']}
            style={styles.thumbnailGradient}
          >
            {/* Simplified waveform visualization */}
            <View style={styles.waveform}>
              {Array(8).fill(0).map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.waveformBar,
                    { height: 10 + Math.random() * 20 }
                  ]} 
                />
              ))}
            </View>
          </LinearGradient>
        </View>
        
        {/* Beat info */}
        <View style={styles.beatInfo}>
          <Text style={styles.beatName} numberOfLines={1}>{beat.name}</Text>
          <Text style={styles.beatDetails}>
            {beat.bpm} BPM • Created {new Date(beat.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        {/* Play button */}
        <TouchableOpacity 
          style={styles.playButton}
          onPress={onPlay}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={20} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Filter bar component
const FilterBar = ({ 
  onFilterChange 
}: { 
  onFilterChange: (filter: string) => void 
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'All Beats' },
    { id: 'my', label: 'My Beats' },
    { id: 'popular', label: 'Popular' },
    { id: 'recent', label: 'Recent' }
  ];
  
  const handleFilterSelect = (filterId: string) => {
    setActiveFilter(filterId);
    onFilterChange(filterId);
  };
  
  return (
    <View style={styles.filterBar}>
      {filters.map(filter => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterButton,
            activeFilter === filter.id && styles.activeFilterButton
          ]}
          onPress={() => handleFilterSelect(filter.id)}
        >
          <Text 
            style={[
              styles.filterButtonText,
              activeFilter === filter.id && styles.activeFilterButtonText
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Search bar component
const SearchBar = ({ 
  onSearch 
}: { 
  onSearch: (query: string) => void 
}) => {
  const [query, setQuery] = useState('');
  
  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch(text);
  };
  
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search beats..."
        placeholderTextColor="#999999"
        value={query}
        onChangeText={handleSearch}
      />
      {query.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => handleSearch('')}
        >
          <Ionicons name="close-circle" size={18} color="#999999" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Empty state component
const EmptyState = ({ 
  filter 
}: { 
  filter: string 
}) => {
  let message = 'No beats found';
  let subMessage = 'Try creating a new beat or changing your search';
  
  if (filter === 'my') {
    message = 'You haven\'t created any beats yet';
    subMessage = 'Start a conversation with REMIX.AI to create your first beat';
  }
  
  return (
    <View style={styles.emptyState}>
      <Ionicons name="musical-notes" size={64} color="#555555" />
      <Text style={styles.emptyStateTitle}>{message}</Text>
      <Text style={styles.emptyStateText}>{subMessage}</Text>
    </View>
  );
};

// Main beat library component
export const BeatLibrary = () => {
  const { 
    beats, 
    loadBeats, 
    isLoading, 
    currentBeat, 
    setCurrentBeat,
    error
  } = useBeats();
  
  const { isAuthenticated } = useAuth();
  const [filteredBeats, setFilteredBeats] = useState<Beat[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null);
  
  // Load beats on component mount
  useEffect(() => {
    loadBeats();
  }, []);
  
  // Apply filters and search
  useEffect(() => {
    if (!beats) return;
    
    let result = [...beats];
    
    // Apply filter
    if (filter === 'my') {
      result = result.filter(beat => beat.isOwner);
    } else if (filter === 'popular') {
      result = result.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    } else if (filter === 'recent') {
      result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(beat => 
        beat.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredBeats(result);
  }, [beats, filter, searchQuery]);
  
  // Handle beat selection
  const handleSelectBeat = (beat: Beat) => {
    setCurrentBeat(beat);
  };
  
  // Handle beat playback
  const handlePlayBeat = (beatId: string) => {
    if (playingBeatId === beatId) {
      // Stop playback
      setPlayingBeatId(null);
    } else {
      // Start playback
      setPlayingBeatId(beatId);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={styles.loadingText}>Loading beats...</Text>
      </View>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadBeats}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ComponentErrorBoundary componentName="BeatLibrary">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Beat Library</Text>
          
          {/* Create new beat button (only for authenticated users) */}
          {isAuthenticated && (
            <TouchableOpacity style={styles.newBeatButton}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.newBeatButtonText}>New Beat</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Search bar */}
        <SearchBar onSearch={handleSearch} />
        
        {/* Filter bar */}
        <FilterBar onFilterChange={handleFilterChange} />
        
        {/* Beat list */}
        {filteredBeats.length > 0 ? (
          <FlatList
            data={filteredBeats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BeatCard
                beat={item}
                onSelect={() => handleSelectBeat(item)}
                onPlay={() => handlePlayBeat(item.id)}
                isPlaying={playingBeatId === item.id}
              />
            )}
            contentContainerStyle={styles.beatList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState filter={filter} />
        )}
      </View>
    </ComponentErrorBoundary>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  newBeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  newBeatButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
  },
  filterButtonText: {
    color: '#999999',
    fontSize: 14,
  },
  activeFilterButtonText: {
    color: '#0A84FF',
    fontWeight: 'bold',
  },
  beatList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  beatCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  beatCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  beatThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 1,
    borderRadius: 1,
  },
  beatInfo: {
    flex: 1,
  },
  beatName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  beatDetails: {
    color: '#999999',
    fontSize: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#999999',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default BeatLibrary;
