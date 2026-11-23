import { useRef, useState } from 'react';
import { authErrorMessage } from '@/src/lib/api/apiError';

export function useAuthForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const running = useRef(false);

  async function submit(action: () => Promise<void>) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  return { busy, error, submit };
}
