import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../src/theme/colors';

type IconName = ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({
  name,
  focusedName,
  color,
  focused,
}: {
  name: IconName;
  focusedName: IconName;
  color: string;
  focused: boolean;
}) {
  return (
    <Ionicons
      name={focused ? focusedName : name}
      size={24}
      color={color}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.amber[600],
        tabBarInactiveTintColor: colors.brand.slate[400],
        tabBarStyle: {
          backgroundColor: '#FFFDF7',
          borderTopColor: colors.brand.amber[100],
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="home-outline"
              focusedName="home"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Rooms',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="people-outline"
              focusedName="people"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="brackets"
        options={{
          title: 'Brackets',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="trophy-outline"
              focusedName="trophy"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="settings-outline"
              focusedName="settings"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
