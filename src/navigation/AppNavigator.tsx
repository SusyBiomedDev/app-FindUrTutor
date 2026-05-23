import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SavedScreen from '../screens/SavedScreen';
import HomeScreen from '../screens/HomeScreen';
import TableScreen from '../screens/TableScreen';
import SettingsScreen from '../screens/SettingScreen';
import MapScreen from '../screens/MapScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#d3d3d3',
        tabBarInactiveTintColor: '#000000',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home-outline" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen
        name="TableScreen"
        component={TableScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="magnify" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="bookmark-outline" color={color} size={26} />
          ),
        }}
      />



      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="map-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="cog-outline" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 50,
    marginHorizontal: 20,
    height: 60,
    backgroundColor: '#6246ea',
    borderRadius: 50,
    borderTopWidth: 0,
    paddingBottom: 0,
    paddingTop: 10,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarLabel: {
    display: 'none',
  },
});
