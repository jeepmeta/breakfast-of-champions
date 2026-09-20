import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

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

function tabHaptic() {
  void Haptics.selectionAsync().catch(() => undefined);
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Detach inactive tabs — less JS work when switching
        freezeOnBlur: true,
        lazy: true,
        tabBarActiveTintColor: colors.brand.amber[600],
        tabBarInactiveTintColor: colors.brand.slate[400],
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#FFFDF7',
          borderTopColor: colors.brand.amber[100],
          height: Platform.select({ ios: 84, default: 64 }),
          paddingTop: 6,
          paddingBottom: Platform.select({ ios: 28, default: 8 }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
      screenListeners={{
        tabPress: () => {
          tabHaptic();
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
