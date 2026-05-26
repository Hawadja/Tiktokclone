// src/navigation/TabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import FeedScreen from '../screens/feed/FeedScreen';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import UploadScreen from '../screens/upload/UploadScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, focused && styles.iconFocused]}>
      {label}
    </Text>
  </View>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="🔍" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="➕" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="🔔" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000',
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});

export default TabNavigator;