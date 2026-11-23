import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { BaseButton } from '@/src/components/base/BaseButton';
import { BaseInput } from '@/src/components/base/BaseInput';
import { KeyboardAwareScreen } from '@/src/components/layout/KeyboardAwareScreen';
import { AUTH_COPY } from '@/src/constants/authCopy';
import { ApiError, authErrorMessage } from '@/src/lib/api/apiError';
import { useAuth } from '@/src/providers/AuthProvider';
import { useAuthForm } from '../hooks/useAuthForm';
import { loginSchema, registrationSchema } from '../schemas/authSchemas';
import { authService } from '../services/authService';
import { clearChallenge, readChallenge, saveChallenge } from '../services/challengeStorage';

const verificationRoute = '/verify-otp' satisfies Href;

export function CredentialsScreen({ mode }: { mode: 'login' | 'register' }) {
  const params = useLocalSearchParams<{ result?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [canResume, setCanResume] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const { login, state } = useAuth();
  const { busy, error, submit } = useAuthForm();
  const registering = mode === 'register';

  useEffect(() => {
    if (registering) return;
    let active = true;
    void readChallenge().then((challenge) => {
      if (active) setCanResume(Boolean(challenge));
    }, (failure: unknown) => {
      if (active) setPendingError(authErrorMessage(failure));
    });
    return () => { active = false; };
  }, [registering]);

  async function send() {
    if (registering) {
      const fields = registrationSchema.parse({ email, name, password });
      await authService.register(fields);
      await saveChallenge({ email: fields.email, kind: 'verify', sentAt: Date.now() });
      router.replace(verificationRoute);
      return;
    }
    const fields = loginSchema.parse({ email, password });
    try {
      await login(fields);
      await clearChallenge().catch((failure: unknown) => setPendingError(authErrorMessage(failure)));
    } catch (failure) {
      if (failure instanceof ApiError && failure.code === 'error.email-verification-required') {
        const current = await readChallenge();
        if (current?.email.toLowerCase() !== fields.email.toLowerCase() || current.kind !== 'verify') {
          await saveChallenge({ email: fields.email, kind: 'verify', sentAt: 0 });
        }
        router.push(verificationRoute);
        return;
      }
      throw failure;
    }
  }

  return (
    <KeyboardAwareScreen>
      <ThemedText type="subtitle">{AUTH_COPY.app}</ThemedText>
      <ThemedText type="title">{registering ? AUTH_COPY.register : AUTH_COPY.login}</ThemedText>
      {!registering && <ThemedText>{AUTH_COPY.intro}</ThemedText>}
      {params.result === 'verified' && <ThemedText accessibilityLiveRegion="polite">{AUTH_COPY.verified}</ThemedText>}
      {params.result === 'reset' && <ThemedText accessibilityLiveRegion="polite">{AUTH_COPY.passwordUpdated}</ThemedText>}
      {state.status === 'anonymous' && state.notice === 'offline-logout' &&
        <ThemedText accessibilityRole="alert">{AUTH_COPY.signedOutOffline}</ThemedText>}
      {registering && <BaseInput label={AUTH_COPY.name} value={name} onChangeText={setName} autoComplete="name" maxLength={100} />}
      <BaseInput label={AUTH_COPY.email} value={email} onChangeText={setEmail} keyboardType="email-address"
        autoComplete="email" autoCapitalize="none" autoCorrect={false} maxLength={255} />
      <BaseInput label={AUTH_COPY.password} value={password} onChangeText={setPassword} secureTextEntry
        autoComplete={registering ? 'new-password' : 'current-password'} maxLength={72} />
      {(error || pendingError) && <ThemedText accessibilityRole="alert">{error || pendingError}</ThemedText>}
      <BaseButton label={busy ? AUTH_COPY.submitting : registering ? AUTH_COPY.register : AUTH_COPY.login}
        disabled={busy} onPress={() => void submit(send)} />
      {registering ? <BaseButton secondary disabled={busy} label={AUTH_COPY.back} onPress={() => router.replace('/login')} /> : <>
        <BaseButton secondary disabled={busy} label={AUTH_COPY.register} onPress={() => router.push('/register')} />
        <BaseButton secondary disabled={busy} label={AUTH_COPY.forgot} onPress={() => router.push('/forgot-password')} />
        {canResume && <BaseButton secondary disabled={busy} label={AUTH_COPY.verify} onPress={() => router.push(verificationRoute)} />}
      </>}
    </KeyboardAwareScreen>
  );
}
