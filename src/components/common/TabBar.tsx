import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

interface TabBarProps {
  tabs: {
    key: string;
    label: string;
    icon: React.ReactNode;
  }[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.tabContent, isActive && styles.activeTabContent]}>
              <View style={isActive ? styles.activeIconContainer : styles.iconContainer}>
                {tab.icon}
              </View>
              <Text style={[
                styles.tabLabel,
                isActive && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: colors.deepBlack,
    borderTopWidth: 1,
    borderTopColor: colors.darkBlue,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  activeTabContent: {
    // Additional styles for active tab content
  },
  iconContainer: {
    marginBottom: 4,
  },
  activeIconContainer: {
    marginBottom: 4,
  },
  tabLabel: {
    ...globalStyles.captionText,
    fontSize: 10,
    color: colors.textMuted,
  },
  activeTabLabel: {
    color: colors.vibrantPurple,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 3,
    backgroundColor: colors.vibrantPurple,
    borderRadius: 1.5,
  },
});

export default TabBar;
