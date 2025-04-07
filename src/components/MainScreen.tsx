import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import ConversationalBeatCreator from './ConversationalBeatCreator';
import { ClaudeSoundDeploymentResponse } from '../services/claudeSoundDeploymentService';

interface MainScreenProps {}

const MainScreen: React.FC<MainScreenProps> = () => {
  const [currentBeat, setCurrentBeat] = useState<ClaudeSoundDeploymentResponse | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');

  const handleBeatCreated = (beat: ClaudeSoundDeploymentResponse) => {
    setCurrentBeat(beat);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>REMIX.AI</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'create' && styles.activeTab]}
            onPress={() => setActiveTab('create')}
          >
            <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
              Create
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'library' && styles.activeTab]}
            onPress={() => setActiveTab('library')}
          >
            <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>
              Library
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'create' ? (
          <ConversationalBeatCreator onBeatCreated={handleBeatCreated} />
        ) : (
          <View style={styles.libraryPlaceholder}>
            <Text style={styles.placeholderText}>
              Your saved beats will appear here
            </Text>
          </View>
        )}
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
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  activeTab: {
    backgroundColor: '#7C4DFF',
  },
  tabText: {
    fontSize: 14,
    color: '#BBBBBB',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  libraryPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#BBBBBB',
  },
});

export default MainScreen;
