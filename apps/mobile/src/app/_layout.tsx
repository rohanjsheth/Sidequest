import {
  DarkTheme,
  DefaultTheme,
  router,
  Stack,
  ThemeProvider,
} from "expo-router";
import * as Notifications from "expo-notifications";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { SessionProvider, useSession } from "@/lib/session";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400: require("@/assets/fonts/Inter_400.ttf"),
    Inter_500: require("@/assets/fonts/Inter_500.ttf"),
    Inter_600: require("@/assets/fonts/Inter_600.ttf"),
    Inter_700: require("@/assets/fonts/Inter_700.ttf"),
    Recursive_400: require("@/assets/fonts/Recursive_400.ttf"),
    Recursive_500: require("@/assets/fonts/Recursive_500.ttf"),
    Recursive_600: require("@/assets/fonts/Recursive_600.ttf"),
    Recursive_700: require("@/assets/fonts/Recursive_700.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { token, user, isLoading } = useSession();

  const lastNotification = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const eventId =
      lastNotification?.notification.request.content.data?.eventId;
    if (typeof eventId === "string") router.push(`/plan/${eventId}`);
  }, [lastNotification]);

  if (isLoading) return null;

  const signedIn = !!token;
  const hasName = !!user?.name;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={signedIn && hasName}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="create" options={{ presentation: "modal" }} />
          <Stack.Screen name="plan/[id]/index" />
          <Stack.Screen
            name="plan/[id]/edit"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="list/[id]" />
          <Stack.Screen
            name="report/[id]"
            options={{ presentation: "modal" }}
          />
        </Stack.Protected>

        <Stack.Protected guard={signedIn && !hasName}>
          <Stack.Screen name="(auth)/set-name" />
        </Stack.Protected>

        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)/welcome" />
          <Stack.Screen name="(auth)/phone" />
          <Stack.Screen name="(auth)/verify" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
