import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import React from "react";

/**
 * Root layout component
 * Handles font loading and splash screen management
 */
export default function RootLayout() {
  // Prevent auto hiding the splash screen
  SplashScreen.preventAutoHideAsync();

  // Load fonts
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  // Prevent rendering until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      {/* Status bar with black icons */}
      <StatusBar style="dark" />

      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerTitle: "", headerShown: false }}
        />
      </Stack>
    </>
  );
}
