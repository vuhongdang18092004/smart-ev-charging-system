import { ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { BaseButton } from '@/src/components/base/BaseButton';
import { KeyboardAwareScreen } from '@/src/components/layout/KeyboardAwareScreen';
import { AUTH_COPY } from '@/src/constants/authCopy';
import { authErrorMessage } from '@/src/lib/api/apiError';

interface Props { error?: unknown; retry?: () => void; web?: boolean }

export function AuthStatusScreen({ error, retry, web }: Props) {
  return (
    <KeyboardAwareScreen>
      {web ? <ThemedText>{AUTH_COPY.webUnsupported}</ThemedText> : error ? <>
        <ThemedText accessibilityRole="alert">{authErrorMessage(error)}</ThemedText>
        {retry && <BaseButton label={AUTH_COPY.retry} onPress={retry} />}
      </> : <>
        <ActivityIndicator />
        <ThemedText accessibilityLiveRegion="polite">{AUTH_COPY.loading}</ThemedText>
      </>}
    </KeyboardAwareScreen>
  );
}
