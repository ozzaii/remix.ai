import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import Header from '../../components/common/Header';
import GradientCard from '../../components/common/GradientCard';
import Button from '../../components/common/Button';
import { BeatCard } from '../../components/social/BeatComponents';

const { width, height } = Dimensions.get('window');

const CommunityScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('trending'); // 'trending', 'latest', 'following'
  const [beats, setBeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedBeatIds, setLikedBeatIds] = useState(['3', '5']);
  
  // Fetch data on mount and when tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  
  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock data
      const mockBeats = [
        {
          id: '3',
          title: 'Cyberpunk Trap',
          description: 'Futuristic trap beat with cyberpunk aesthetics and glitchy elements.',
          creator: {
            id: '2',
            username: 'NeonBeats',
          },
          bpm: 140,
          likes: 156,
          comments: 32,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          beatPattern: {
            bpm: 140,
            instruments: {
              kick: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
              snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
              hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
              bass: [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]
            },
            effects: {
              reverb: 0.2,
              delay: 0.3
            }
          }
        },
        {
          id: '4',
          title: 'Ethereal Ambient',
          description: 'Atmospheric ambient beat with ethereal pads and subtle percussion.',
          creator: {
            id: '3',
            username: 'DreamScape',
          },
          bpm: 70,
          likes: 89,
          comments: 14,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
          beatPattern: {
            bpm: 70,
            instruments: {
              kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
              snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
              hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
              bass: [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]
            },
            effects: {
              reverb: 0.7,
              delay: 0.5
            }
          }
        },
        {
          id: '5',
          title: 'Retro Funk',
          description: 'Groovy funk beat with vintage synths and soulful basslines.',
          creator: {
            id: '4',
            username: 'FunkMaster',
          },
          bpm: 105,
          likes: 72,
          comments: 8,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          beatPattern: {
            bpm: 105,
            instruments: {
              kick: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
              snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
              hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
              bass: [1,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0]
            },
            effects: {
              reverb: 0.2,
              delay: 0.1
            }
          }
        },
        {
          id: '6',
          title: 'Chill Lofi',
          description: 'Relaxed lofi hip-hop beat with jazzy samples and warm textures.',
          creator: {
            id: '5',
            username: 'ChillVibes',
          },
          bpm: 85,
          likes: 64,
          comments: 7,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
          beatPattern: {
            bpm: 85,
            instruments: {
              kick: [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
              snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
              hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
              bass: [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0]
            },
            effects: {
              reverb: 0.5,
              delay: 0.2
            }
          }
        },
        {
          id: '7',
          title: 'Drum & Bass Energy',
          description: 'High-energy drum & bass beat with rolling breaks and deep sub bass.',
          creator: {
            id: '6',
            username: 'BassRunner',
          },
          bpm: 174,
          likes: 48,
          comments: 5,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 48 hours ago
          beatPattern: {
            bpm: 174,
            instruments: {
              kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
              snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
              hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
              bass: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
            },
            effects: {
              reverb: 0.1,
              delay: 0.3
            }
          }
        }
      ];
      
      // Filter based on active tab
      let filteredBeats = [...mockBeats];
      
      if (activeTab === 'trending') {
        // Sort by likes
        filteredBeats.sort((a, b) => b.likes - a.likes);
      } else if (activeTab === 'latest') {
        // Sort by creation date
        filteredBeats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else if (activeTab === 'following') {
        // Filter to only show beats from followed creators (IDs 2 and 4)
        filteredBeats = filteredBeats.filter(beat => ['2', '4'].includes(beat.creator.id));
      }
      
      setBeats(filteredBeats);
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle beat press
  const handleBeatPress = (beat) => {
    navigation.navigate('Visualizer', { beatPattern: beat.beatPattern });
  };
  
  // Handle play press
  const handlePlayPress = (beat) => {
    navigation.navigate('Visualizer', { beatPattern: beat.beatPattern, autoPlay: true });
  };
  
  // Handle like press
  const handleLikePress = (beat) => {
    if (likedBeatIds.includes(beat.id)) {
      setLikedBeatIds(prev => prev.filter(id => id !== beat.id));
    } else {
      setLikedBeatIds(prev => [...prev, beat.id]);
    }
  };
  
  // Handle comment press
  const handleCommentPress = (beat) => {
    // Navigate to comments screen
    console.log('Navigate to comments for beat:', beat.id);
  };
  
  // Handle share press
  const handleSharePress = (beat) => {
    // Open share modal
    console.log('Share beat:', beat.id);
  };
  
  // Render tab selector
  const renderTabSelector = () => {
    return (
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'trending' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('trending')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'trending' && styles.activeTabButtonText
          ]}>
            Trending
          </Text>
          {activeTab === 'trending' && (
            <LinearGradient
              colors={[colors.vibrantPurple, colors.neonBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeTabIndicator}
            />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'latest' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('latest')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'latest' && styles.activeTabButtonText
          ]}>
            Latest
          </Text>
          {activeTab === 'latest' && (
            <LinearGradient
              colors={[colors.vibrantPurple, colors.neonBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeTabIndicator}
            />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'following' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('following')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'following' && styles.activeTabButtonText
          ]}>
            Following
          </Text>
          {activeTab === 'following' && (
            <LinearGradient
              colors={[colors.vibrantPurple, colors.neonBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeTabIndicator}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render search bar
  const renderSearchBar = () => {
    return (
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.8}
        onPress={() => console.log('Open search')}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <Text style={styles.searchPlaceholder}>Search beats, creators, genres...</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <Header 
        title="Community"
        showBackButton={false}
      />
      
      {renderSearchBar()}
      {renderTabSelector()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.vibrantPurple} size="large" />
          </View>
        ) : beats.length > 0 ? (
          <View style={styles.beatsContainer}>
            {beats.map((beat) => (
              <BeatCard
                key={beat.id}
                beat={beat}
                onPress={() => handleBeatPress(beat)}
                onPlayPress={() => handlePlayPress(beat)}
                onLikePress={() => handleLikePress(beat)}
                onCommentPress={() => handleCommentPress(beat)}
                onSharePress={() => handleSharePress(beat)}
                isLiked={likedBeatIds.includes(beat.id)}
                style={styles.beatCard}
              />
            ))}
          </View>
        ) : (
          <GradientCard style={styles.emptyStateCard}>
            <Ionicons name="people" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              {activeTab === 'following' 
                ? "You're not following any creators yet. Explore the community to find creators to follow!"
                : "No beats found. Check back later for new content!"}
            </Text>
            {activeTab === 'following' && (
              <Button
                title="Explore Community"
                icon="compass"
                onPress={() => setActiveTab('trending')}
                style={styles.emptyStateButton}
              />
            )}
          </GradientCard>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.darkBlue + '40',
    borderWidth: 1,
    borderColor: colors.vibrantPurple + '30',
    overflow: 'hidden',
  },
  searchPlaceholder: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTabButton: {
    // Active state is shown with indicator
  },
  tabButtonText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 1.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  beatsContainer: {
    width: '100%',
  },
  beatCard: {
    marginBottom: 16,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 16,
  },
  emptyStateText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  emptyStateButton: {
    marginTop: 8,
    width: '80%',
  },
});

export default CommunityScreen;
