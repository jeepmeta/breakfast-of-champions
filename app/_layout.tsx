// Must be first — enables native gesture system before any navigator mounts
import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RoomProvider } from '../src/room/RoomContext';
import {
  stackScreenDefaults,
  playDiceOptions,
  playWheelOptions,
  roomFromLeftOptions,
  roomFromRightOptions,
  profileOptions,
  settingsOptions,
} from '../src/navigation/transitions';
import { affect } from '../src/theme/affect';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <RoomProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={stackScreenDefaults}>
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="play/dice" options={playDiceOptions} />
          <Stack.Screen name="play/wheel" options={playWheelOptions} />
          <Stack.Screen name="room/[code]" options={roomFromLeftOptions} />
          <Stack.Screen name="bracket/[code]" options={roomFromRightOptions} />
          <Stack.Screen name="profile" options={profileOptions} />
          <Stack.Screen name="settings" options={settingsOptions} />
          <Stack.Screen
            name="solo/wheel"
            options={{ animation: 'none', headerShown: false }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ animation: 'none', headerShown: false }}
          />
        </Stack>
      </RoomProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: affect.comfort.canvas,
  },
});
