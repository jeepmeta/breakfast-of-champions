import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, useColorScheme } from 'react-native';

import { RoomProvider } from '../src/room/RoomContext';
import { SessionListsProvider } from '../src/session/SessionListsContext';
import { colors } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore if already prevented
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: isDark
                  ? colors.canvas.dark
                  : colors.canvas.light,
              },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="play/dice"
              options={{ animation: 'slide_from_left' }}
            />
            <Stack.Screen
              name="play/wheel"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="room/[code]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="solo/wheel"
              options={{ presentation: 'modal' }}
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
  },
});
