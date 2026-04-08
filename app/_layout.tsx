import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './context/ThemeContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false, gestureEnabled: false, animation: 'none' }}>
          <Stack.Screen name="index" options={{ gestureEnabled: false, animation: 'none' }} />
          <Stack.Screen name="signup" options={{ gestureEnabled: false, animation: 'none' }} />
          <Stack.Screen name="login" options={{ gestureEnabled: false, animation: 'none' }} />
          <Stack.Screen name="home" options={{ gestureEnabled: false, animation: 'none' }} />
          <Stack.Screen name="wallet" options={{ gestureEnabled: false, animation: 'none' }} />
          <Stack.Screen name="scan" options={{ gestureEnabled: false, animation: 'none' }} />
          <Stack.Screen name="profile" options={{ gestureEnabled: false, animation: 'none' }} />
          <Stack.Screen name="create" options={{ gestureEnabled: true, presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="card-ready" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="edit-card" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="group-detail" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
          <Stack.Screen name="settings" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
          <Stack.Screen name="edit-profile" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
          <Stack.Screen name="privacy-policy" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
          <Stack.Screen name="terms-of-service" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
          <Stack.Screen name="about" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
          <Stack.Screen name="user-profile" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}