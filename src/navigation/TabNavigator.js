import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Shadows } from '../theme/tokens';
import PeriodsScreen from '../screens/Periods/PeriodsScreen';
import FoodScreen from '../screens/Food/FoodScreen';
import WorkoutsScreen from '../screens/Workouts/WorkoutsScreen';
import StepsScreen from '../screens/Steps/StepsScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Periods: '🌸',
  Food: '🍽️',
  Workouts: '💪',
  Steps: '👟',
};

function TabIcon({ name, focused }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{TAB_ICONS[name]}</Text>
    </View>
  );
}

export default function TabNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => (
          <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
            {route.name.toUpperCase()}
          </Text>
        ),
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView tint="light" intensity={60} style={StyleSheet.absoluteFill} />
        ),
        tabBarItemStyle: styles.tabItem,
        headerShown: true,
        headerTitle: () => (
          <View style={styles.headerTitle}>
            <Image source={require('../../assets/logo.png')} style={{ width: 100, height: 35 }} resizeMode="contain" />
          </View>
        ),
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ),
        headerStyle: styles.header,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Periods" component={PeriodsScreen} />
      <Tab.Screen name="Food" component={FoodScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Steps" component={StepsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    height: 72,
    paddingBottom: 8,
    paddingTop: 6,
    ...Shadows.sm,
    shadowColor: Colors.pink500,
    shadowOpacity: 0.04,
  },
  tabItem: {
    paddingTop: 4,
  },
  iconContainer: {
    width: 36,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: Colors.pink500,
    width: 42,
    ...Shadows.glow,
  },
  icon: {
    fontSize: 18,
  },
  iconActive: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.pink600,
    fontWeight: '700',
  },
  header: {
    backgroundColor: Colors.bg,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLogo: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.pink600,
    fontStyle: 'italic',
  },
  headerDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 12,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.pink600,
  },
});
