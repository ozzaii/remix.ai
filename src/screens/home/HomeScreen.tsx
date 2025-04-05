import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import Header from '../../components/common/Header';
import GradientCard from '../../components/common/GradientCard';
import Button from '../../components/common/Button';
import { useAuth } from '../../services/auth/AuthContext';

interface Beat {
  id: string;
  title: string;
  description: string;
  bpm: number;
  created?: string;
  plays: number;
  likes: number;
  creator?: string;
}

type RootStackParamList = {
  Chat: undefined;
  Visualizer: { beatPattern: Beat | null };
  Profile: undefined;
  Community: undefined;
  Battles: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [recentBeats, setRecentBeats] = useState<Beat[]>([]);
  const [trendingBeats, setTrendingBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setRecentBeats([
        { id: '1', title: 'Istanbul Nights', description: 'A synthwave beat with Turkish influences', bpm: 128, created: '2 hours ago', plays: 42, likes: 18 },
        { id: '2', title: 'Chill Vibes', description: 'Lo-fi hip-hop with jazzy samples', bpm: 90, created: '1 day ago', plays: 156, likes: 64 },
        { id: '3', title: 'Future Trap', description: 'High-energy trap with futuristic sounds', bpm: 140, created: '3 days ago', plays: 89, likes: 32 }
      ]);
      
      setTrendingBeats([
        { id: '4', title: 'Neon Dreams', creator: 'beatmaster99', description: 'Synthwave with retro vibes', bpm: 120, plays: 1243, likes: 567 },
        { id: '5', title: 'Urban Flow', creator: 'rhythmking', description: 'Modern hip-hop with trap elements', bpm: 95, plays: 982, likes: 421 },
        { id: '6', title: 'Electric Soul', creator: 'melody_maker', description: 'Soul samples with electronic beats', bpm: 110, plays: 876, likes: 389 }
      ]);
      
      setIsLoading(false);
    }, 1000);
  };
  
  const handleCreateBeat = () => {
    navigation.navigate('Chat');
  };
  
  const handleViewBeat = (beat: Beat | null) => {
    navigation.navigate('Visualizer', { beatPattern: beat });
  };
  
  const renderRecentBeatCard = (beat: Beat) => {
    return (
      <TouchableOpacity
        key={beat.id}
        style={styles.recentBeatCard}
        onPress={() => handleViewBeat(beat)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradients.ultraPremium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.recentBeatContent}>
          <Text style={styles.recentBeatTitle}>{beat.title}</Text>
          <Text style={styles.recentBeatDescription}>{beat.description}</Text>
          
          <View style={styles.recentBeatMeta}>
            <View style={styles.recentBeatMetaItem}>
              <Ionicons name="speedometer-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.recentBeatMetaText}>{beat.bpm} BPM</Text>
            </View>
            
            <View style={styles.recentBeatMetaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.recentBeatMetaText}>{beat.created}</Text>
            </View>
          </View>
          
          <View style={styles.recentBeatStats}>
            <View style={styles.recentBeatStatItem}>
              <Ionicons name="play-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.recentBeatStatText}>{beat.plays}</Text>
            </View>
            
            <View style={styles.recentBeatStatItem}>
              <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.recentBeatStatText}>{beat.likes}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderTrendingBeatCard = (beat: Beat) => {
    return (
      <TouchableOpacity
        key={beat.id}
        style={styles.trendingBeatCard}
        onPress={() => handleViewBeat(beat)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradients.techGiant}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.trendingBeatContent}>
          <Text style={styles.trendingBeatTitle}>{beat.title}</Text>
          
          <View style={styles.trendingBeatCreator}>
            <View style={styles.trendingBeatCreatorIcon}>
              <Text style={styles.trendingBeatCreatorInitial}>
                {beat.creator?.charAt(0).toUpperCase() || 'G'}
              </Text>
            </View>
            <Text style={styles.trendingBeatCreatorName}>{beat.creator}</Text>
          </View>
          
          <View style={styles.trendingBeatMeta}>
            <View style={styles.trendingBeatMetaItem}>
              <Ionicons name="speedometer-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.trendingBeatMetaText}>{beat.bpm} BPM</Text>
            </View>
            
            <View style={styles.trendingBeatStats}>
              <View style={styles.trendingBeatStatItem}>
                <Ionicons name="play-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.trendingBeatStatText}>{beat.plays}</Text>
              </View>
              
              <View style={styles.trendingBeatStatItem}>
                <Ionicons name="heart-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.trendingBeatStatText}>{beat.likes}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <Header 
        title="REMIX.AI"
        showBackButton={false}
        rightComponent={
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>
                {user?.username?.charAt(0).toUpperCase() || 'G'}
              </Text>
            </View>
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
        <View style={styles.heroSection}>
          <LinearGradient
            colors={gradients.godTier}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBackground}
          />
          
          <Text style={styles.heroTitle}>
            <Text style={{color: colors.diamond}}>HARD TECHNO</Text> GOD ENGINE
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Create revolutionary beats with the power of AI
          </Text>
          
          <Button
            title="CREATE LEGENDARY BEAT"
            icon="flash"
            onPress={handleCreateBeat}
            style={styles.createBeatButton}
          />
        </View>
        
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <LinearGradient
              colors={gradients.diamondGlow}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sectionTitleGradient}
            >
              <Text style={{ opacity: 0 }}>.</Text>
            </LinearGradient>
            <Text style={styles.sectionTitle}>YOUR LEGENDARY BEATS</Text>
          </View>
          <TouchableOpacity
            style={styles.sectionAction}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={[styles.sectionActionText, {color: colors.diamond}]}>VIEW ALL</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.diamond} />
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.vibrantPurple} size="large" />
          </View>
        ) : recentBeats.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentBeatsContainer}
          >
            {recentBeats.map(renderRecentBeatCard)}
          </ScrollView>
        ) : (
          <GradientCard style={styles.emptyStateCard}>
            <Ionicons name="musical-notes" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No beats yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first beat by chatting with Claude
            </Text>
            <Button
              title="Create Beat"
              icon="add-circle"
              onPress={handleCreateBeat}
              style={styles.emptyStateButton}
            />
          </GradientCard>
        )}
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending in Community</Text>
          <TouchableOpacity
            style={styles.sectionAction}
            onPress={() => navigation.navigate('Community')}
          >
            <Text style={styles.sectionActionText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.vibrantPurple} />
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.vibrantPurple} size="large" />
          </View>
        ) : (
          <View style={styles.trendingBeatsGrid}>
            {trendingBeats.map(renderTrendingBeatCard)}
          </View>
        )}
        
        <GradientCard style={styles.battlesPromoCard}>
          <View style={styles.battlesPromoContent}>
            <Text style={styles.battlesPromoTitle}>Beat Battles</Text>
            <Text style={styles.battlesPromoText}>
              Compete with other creators in weekly beat battles
            </Text>
            <Button
              title="Join Battles"
              icon="trophy"
              variant="secondary"
              onPress={() => navigation.navigate('Battles')}
              style={styles.battlesPromoButton}
            />
          </View>
          
          <View style={styles.battlesPromoImageContainer}>
            <LinearGradient
              colors={[colors.vibrantPurple, colors.electricBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.battlesPromoImageBackground}
            />
            <Ionicons name="trophy" size={48} color={colors.textPrimary} />
          </View>
        </GradientCard>
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
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.vibrantPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  heroSection: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 24,
  },
  createBeatButton: {
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    ...globalStyles.bodyTextSmall,
    color: colors.vibrantPurple,
    marginRight: 4,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentBeatsContainer: {
    paddingBottom: 8,
  },
  recentBeatCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  recentBeatContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  recentBeatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recentBeatDescription: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  recentBeatMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recentBeatMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  recentBeatMetaText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  recentBeatStats: {
    flexDirection: 'row',
  },
  recentBeatStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  recentBeatStatText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  emptyStateTitle: {
    ...globalStyles.heading3,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    marginTop: 8,
  },
  trendingBeatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  trendingBeatCard: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  trendingBeatContent: {
    padding: 16,
  },
  trendingBeatTitle: {
    ...globalStyles.heading3,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '600',
  },
  trendingBeatCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingBeatCreatorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.vibrantPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  trendingBeatCreatorInitial: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  trendingBeatCreatorName: {
    ...globalStyles.captionText,
    color: colors.textPrimary,
  },
  trendingBeatMeta: {
    marginTop: 'auto',
  },
  trendingBeatMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingBeatMetaText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  trendingBeatStats: {
    flexDirection: 'row',
  },
  trendingBeatStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  trendingBeatStatText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  battlesPromoCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 24,
  },
  battlesPromoContent: {
    flex: 1,
    paddingRight: 16,
  },
  battlesPromoTitle: {
    ...globalStyles.heading2,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  battlesPromoText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  battlesPromoButton: {
    alignSelf: 'flex-start',
  },
  battlesPromoImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  battlesPromoImageBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  noBeatsText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 30,
  },
});

export default HomeScreen;
