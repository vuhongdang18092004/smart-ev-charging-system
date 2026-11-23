import { router } from 'expo-router';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { BaseButton } from '@/src/components/base/BaseButton';
import { BaseInput } from '@/src/components/base/BaseInput';
import { KeyboardAwareScreen } from '@/src/components/layout/KeyboardAwareScreen';
import { AUTH_COPY } from '@/src/constants/authCopy';
import { useAuthForm } from '../hooks/useAuthForm';
import { emailSchema } from '../schemas/authSchemas';
import { authService } from '../services/authService';
import { saveChallenge } from '../services/challengeStorage';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const { busy, error, submit } = useAuthForm();

  async function requestCode() {
    const fields = emailSchema.parse({ email });
    await authService.forgot(fields.email);
    await saveChallenge({ kind: 'reset', email: fields.email, sentAt: Date.now() });
    router.replace('/verify-otp');
  }

  return (
    <KeyboardAwareScreen>
      <ThemedText type="title">{AUTH_COPY.forgot}</ThemedText>
      <BaseInput label={AUTH_COPY.email} value={email} onChangeText={setEmail} autoComplete="email"
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={255} />
      {!!error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
      <BaseButton label={busy ? AUTH_COPY.submitting : AUTH_COPY.requestCode} disabled={busy}
        onPress={() => void submit(requestCode)} />
      <BaseButton secondary disabled={busy} label={AUTH_COPY.back} onPress={() => router.replace('/login')} />
    </KeyboardAwareScreen>
  );
}
