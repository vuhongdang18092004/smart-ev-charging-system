import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { BaseButton } from '@/src/components/base/BaseButton';
import { BaseInput } from '@/src/components/base/BaseInput';
import { KeyboardAwareScreen } from '@/src/components/layout/KeyboardAwareScreen';
import { AUTH_COPY } from '@/src/constants/authCopy';
import { authErrorMessage } from '@/src/lib/api/apiError';
import { useAuthForm } from '../hooks/useAuthForm';
import { useChallengeClock } from '../hooks/useChallengeClock';
import { emailSchema, resetSchema, verificationSchema } from '../schemas/authSchemas';
import { authService } from '../services/authService';
import { clearChallenge, readChallenge, saveChallenge } from '../services/challengeStorage';
import type { PendingChallenge } from '../types/auth';

export function VerifyOtpScreen() {
  const [challenge, setChallenge] = useState<PendingChallenge>();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const { busy, error, submit } = useAuthForm();
  const matchesChallenge = challenge?.email.toLowerCase() === email.trim().toLowerCase();
  const { expiresIn, resendIn } = useChallengeClock(matchesChallenge ? challenge?.sentAt ?? 0 : 0);
  const isReset = challenge?.kind === 'reset';

  useEffect(() => {
    let active = true;
    void readChallenge().then((value) => {
      if (!active) return;
      setChallenge(value);
      setEmail(value?.email ?? '');
      setReady(true);
    }, (failure: unknown) => {
      if (!active) return;
      setLoadError(authErrorMessage(failure));
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  async function resend() {
    const fields = emailSchema.parse({ email });
    if (isReset) await authService.forgot(fields.email);
    else await authService.resend(fields.email);
    const next: PendingChallenge = { kind: isReset ? 'reset' : 'verify', email: fields.email, sentAt: Date.now() };
    setChallenge(next);
    await saveChallenge(next);
  }

  async function verify() {
    if (isReset) await authService.reset(resetSchema.parse({ email, otp: code, password }));
    else await authService.verify(verificationSchema.parse({ email, otp: code }));
    await clearChallenge();
    router.replace({ pathname: '/login', params: { result: isReset ? 'reset' : 'verified' } });
  }

  return (
    <KeyboardAwareScreen>
      <ThemedText type="title">{isReset ? AUTH_COPY.reset : AUTH_COPY.verify}</ThemedText>
      <BaseInput label={AUTH_COPY.email} value={email} onChangeText={setEmail} editable={ready && !busy}
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={255} />
      <BaseInput label={AUTH_COPY.otp} value={code} onChangeText={setCode} keyboardType="number-pad"
        autoComplete="one-time-code" maxLength={6} />
      {isReset && <BaseInput label={AUTH_COPY.newPassword} value={password} onChangeText={setPassword}
        autoComplete="new-password" secureTextEntry maxLength={72} />}
      {!!challenge?.sentAt && matchesChallenge && <ThemedText>{expiresIn ? AUTH_COPY.expiresIn(expiresIn) : AUTH_COPY.codeExpired}</ThemedText>}
      {!!challenge?.sentAt && matchesChallenge && <ThemedText>{AUTH_COPY.sent}</ThemedText>}
      {(error || loadError) && <ThemedText accessibilityRole="alert">{error || loadError}</ThemedText>}
      <BaseButton label={busy ? AUTH_COPY.submitting : isReset ? AUTH_COPY.reset : AUTH_COPY.verify}
        disabled={busy || !ready} onPress={() => void submit(verify)} />
      <BaseButton secondary label={resendIn ? AUTH_COPY.resendWait(resendIn) : AUTH_COPY.resend}
        disabled={busy || !ready || resendIn > 0} onPress={() => void submit(resend)} />
      <BaseButton secondary disabled={busy} label={AUTH_COPY.back} onPress={() => router.replace('/login')} />
    </KeyboardAwareScreen>
  );
}
