import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthStatusScreen } from '@/src/features/auth/screens/AuthStatusScreen';
import { VEHICLE_COPY } from '@/src/features/vehicles/constants';
import { AuthProvider, useAuth } from '@/src/providers/AuthProvider';

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { state, restore } = useAuth();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {Platform.OS === 'web' ? <AuthStatusScreen web /> : state.status === 'loading' ? <AuthStatusScreen /> :
        state.status === 'error' ? <AuthStatusScreen error={state.error} retry={() => void restore().catch(() => undefined)} /> : (
          <Stack>
            <Stack.Protected guard={state.status === 'anonymous'}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={state.status === 'authenticated'}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="vehicles" options={{ title: VEHICLE_COPY.title }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack.Protected>
          </Stack>
        )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <AuthProvider><RootNavigator /></AuthProvider>;
}
