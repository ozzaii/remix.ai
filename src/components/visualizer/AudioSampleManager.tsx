import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

interface AudioSampleManagerProps {
  onSampleSelect?: (category: string, sampleIndex: number) => void;
}

const AudioSampleManager: React.FC<AudioSampleManagerProps> = ({
  onSampleSelect,
}) => {
  // Sample categories and their descriptions
  const sampleCategories = [
    {
      id: 'kick',
      name: 'Kick Drums',
      description: 'Powerful, punchy bass drums that form the foundation of your beat',
      samples: [
        { id: 'kick_808', name: '808 Kick', description: 'Deep, sub-heavy kick popular in hip-hop and trap' },
        { id: 'kick_acoustic', name: 'Acoustic Kick', description: 'Natural drum sound with warm tone' },
        { id: 'kick_electronic', name: 'Electronic Kick', description: 'Synthesized kick for electronic music' },
        { id: 'kick_layered', name: 'Layered Kick', description: 'Complex kick with multiple elements for extra punch' },
      ],
    },
    {
      id: 'snare',
      name: 'Snares',
      description: 'Sharp, cutting sounds that provide the backbeat',
      samples: [
        { id: 'snare_acoustic', name: 'Acoustic Snare', description: 'Traditional drum kit snare sound' },
        { id: 'snare_electronic', name: 'Electronic Snare', description: 'Synthesized snare with digital character' },
        { id: 'snare_clap', name: 'Clap', description: 'Hand clap sound often used in place of or layered with snares' },
        { id: 'snare_rimshot', name: 'Rimshot', description: 'Snare hit that emphasizes the rim of the drum' },
      ],
    },
    {
      id: 'hihat',
      name: 'Hi-Hats',
      description: 'Crisp, metallic sounds that add rhythm and texture',
      samples: [
        { id: 'hihat_closed', name: 'Closed Hi-Hat', description: 'Tight, short sound for rhythmic patterns' },
        { id: 'hihat_open', name: 'Open Hi-Hat', description: 'Longer, sustained sound with more decay' },
        { id: 'hihat_pedal', name: 'Pedal Hi-Hat', description: 'Softer sound created by the foot pedal' },
        { id: 'hihat_electronic', name: 'Electronic Hi-Hat', description: 'Synthesized version with digital character' },
      ],
    },
    {
      id: 'bass',
      name: 'Bass',
      description: 'Deep, low-frequency sounds that provide harmonic foundation',
      samples: [
        { id: 'bass_808', name: '808 Bass', description: 'Sub-bass sound derived from the Roland TR-808' },
        { id: 'bass_synth', name: 'Synth Bass', description: 'Synthesized bass line with character' },
        { id: 'bass_acoustic', name: 'Acoustic Bass', description: 'Recorded bass instrument with natural tone' },
        { id: 'bass_oneshot', name: 'One-Shot Bass', description: 'Single bass hit for punctuation' },
      ],
    },
  ];

  // Handle sample selection
  const handleSampleSelect = (categoryId: string, sampleIndex: number) => {
    if (onSampleSelect) {
      onSampleSelect(categoryId, sampleIndex);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Audio Sample Library</Text>
      <Text style={styles.description}>
        Select high-quality samples to use in your beats
      </Text>

      {sampleCategories.map((category) => (
        <View key={category.id} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>

          <View style={styles.samplesContainer}>
            {category.samples.map((sample, index) => (
              <View key={sample.id} style={styles.sampleItem}>
                <View style={styles.sampleHeader}>
                  <Text style={styles.sampleName}>{sample.name}</Text>
                  <View style={styles.sampleControls}>
                    <Text 
                      style={styles.playButton}
                      onPress={() => console.log(`Play ${sample.id}`)}
                    >
                      ▶
                    </Text>
                    <Text 
                      style={styles.selectButton}
                      onPress={() => handleSampleSelect(category.id, index)}
                    >
                      Select
                    </Text>
                  </View>
                </View>
                <Text style={styles.sampleDescription}>{sample.description}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepBlack,
    padding: 16,
  },
  title: {
    ...globalStyles.heading2,
    marginBottom: 8,
  },
  description: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    ...globalStyles.heading3,
    color: colors.vibrantPurple,
    marginBottom: 4,
  },
  categoryDescription: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  samplesContainer: {
    backgroundColor: colors.deepBlack + '80',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.darkBlue,
  },
  sampleItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBlue + '50',
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sampleName: {
    ...globalStyles.bodyText,
    fontWeight: '600',
  },
  sampleControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    ...globalStyles.bodyText,
    color: colors.electricBlue,
    marginRight: 12,
    fontSize: 18,
  },
  selectButton: {
    ...globalStyles.bodyText,
    color: colors.vibrantPurple,
  },
  sampleDescription: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
  },
});

export default AudioSampleManager;
