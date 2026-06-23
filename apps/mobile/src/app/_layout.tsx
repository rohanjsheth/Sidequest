import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Inter_400: require('@/assets/fonts/Inter_400.ttf'),
    Inter_500: require('@/assets/fonts/Inter_500.ttf'),
    Inter_600: require('@/assets/fonts/Inter_600.ttf'),
    Inter_700: require('@/assets/fonts/Inter_700.ttf'),
    Recursive_400: require('@/assets/fonts/Recursive_400.ttf'),
    Recursive_500: require('@/assets/fonts/Recursive_500.ttf'),
    Recursive_600: require('@/assets/fonts/Recursive_600.ttf'),
    Recursive_700: require('@/assets/fonts/Recursive_700.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="create" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
