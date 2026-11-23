import { useRouter } from 'expo-router';
import { VEHICLE_COPY, VEHICLES_ROUTE } from '@/src/features/vehicles/constants';
import { ThemedText } from '@/components/themed-text';
import { BaseButton } from '@/src/components/base/BaseButton';
import { KeyboardAwareScreen } from '@/src/components/layout/KeyboardAwareScreen';
import { AUTH_COPY } from '@/src/constants/authCopy';
import { useAuth } from '@/src/providers/AuthProvider';
import { useAuthForm } from '@/src/features/auth/hooks/useAuthForm';

export function ProfileScreen() {
  const router = useRouter();
  const { state, logout } = useAuth();
  const { busy, error, submit } = useAuthForm();
  if (state.status !== 'authenticated') return null;
  return (
    <KeyboardAwareScreen>
      <ThemedText type="title">{AUTH_COPY.profile}</ThemedText>
      <ThemedText type="subtitle">{state.user.name}</ThemedText>
      <ThemedText>{state.user.email}</ThemedText>
      <ThemedText>{AUTH_COPY.driver}</ThemedText>
      <BaseButton label={VEHICLE_COPY.title} onPress={() => router.push(VEHICLES_ROUTE)} />
      {!!error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
      <BaseButton disabled={busy} label={busy ? AUTH_COPY.submitting : AUTH_COPY.logout}
        onPress={() => void submit(logout)} />
    </KeyboardAwareScreen>
  );
}
