import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { BaseButton } from '@/src/components/base/BaseButton';
import { KeyboardAwareScreen } from '@/src/components/layout/KeyboardAwareScreen';
import { AUTH_COPY } from '@/src/constants/authCopy';
import { useAuth } from '@/src/providers/AuthProvider';

export function DriverHomeScreen() {
  const { state } = useAuth();
  if (state.status !== 'authenticated') return null;
  return (
    <KeyboardAwareScreen>
      <ThemedText type="subtitle">{AUTH_COPY.app}</ThemedText>
      <ThemedText type="title">{AUTH_COPY.greeting(state.user.name)}</ThemedText>
      <BaseButton label={AUTH_COPY.profile} onPress={() => router.push('/profile')} />
    </KeyboardAwareScreen>
  );
}
