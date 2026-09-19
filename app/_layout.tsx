import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { RoomProvider } from '../src/room/RoomContext';
import { SessionListsProvider } from '../src/session/SessionListsContext';

SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore if already prevented
});

/** Keep stack transitions snappy app-wide (~native iOS feel). */
const FAST_MS = 200;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // ignore
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SessionListsProvider>
        <RoomProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: '#FFF8EB',
              },
              animation: 'fade',
              animationDuration: FAST_MS,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="play/dice"
              options={{
                animation: 'slide_from_left',
                animationDuration: FAST_MS,
              }}
            />
            <Stack.Screen
              name="play/wheel"
              options={{
                animation: 'slide_from_right',
                animationDuration: FAST_MS,
              }}
            />
            <Stack.Screen
              name="room/[code]"
              options={{
                animation: 'slide_from_right',
                animationDuration: FAST_MS,
              }}
            />
            <Stack.Screen
              name="solo/wheel"
              options={{ presentation: 'modal', animationDuration: FAST_MS }}
            />
          </Stack>
        </RoomProvider>
      </SessionListsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF8EB',
  },
});
