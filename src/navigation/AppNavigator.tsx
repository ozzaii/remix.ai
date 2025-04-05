import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import BattlesScreen from '../screens/battles/BattlesScreen';
import VisualizerScreen from '../screens/visualizer/VisualizerScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TestScreen from '../screens/test/TestScreen';

// Theme
import { colors } from '../theme/colors';
import { styles as globalStyles } from '../theme/styles';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom tab bar
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <LinearGradient
      colors={[colors.backgroundDark, colors.backgroundDarker]}
      style={styles.tabBarContainer}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Get icon name based on route
        let iconName;
        if (route.name === 'Home') {
          iconName = isFocused ? 'home' : 'home-outline';
        } else if (route.name === 'Chat') {
          iconName = isFocused ? 'chatbubble' : 'chatbubble-outline';
        } else if (route.name === 'Community') {
          iconName = isFocused ? 'people' : 'people-outline';
        } else if (route.name === 'Battles') {
          iconName = isFocused ? 'flame' : 'flame-outline';
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                isFocused
                  ? [colors.primaryDark, colors.primary]
                  : ['transparent', 'transparent']
              }
              style={[
                styles.tabIconContainer,
                isFocused && styles.tabIconContainerActive,
              ]}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? colors.textPrimary : colors.textSecondary}
              />
            </LinearGradient>
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Battles" component={BattlesScreen} />
    </Tab.Navigator>
  );
};

// Main Navigator
const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Visualizer" component={VisualizerScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 80,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  tabIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  tabIconContainerActive: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 4,
  },
  tabLabel: {
    ...globalStyles.text,
    fontSize: 12,
    marginTop: 4,
  },
  tabLabelActive: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  tabLabelInactive: {
    color: colors.textSecondary,
  },
});

export default AppNavigator;
