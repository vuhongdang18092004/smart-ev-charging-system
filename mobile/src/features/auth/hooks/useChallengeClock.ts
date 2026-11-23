import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { OTP_LIFETIME_MS, OTP_RESEND_DELAY_MS } from '@/src/constants/config';

export function useChallengeClock(sentAt: number) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = setInterval(update, 1000);
    const subscription = AppState.addEventListener('change', update);
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  const remaining = (window: number) => Math.max(0, Math.ceil((sentAt + window - now) / 1000));
  return { expiresIn: sentAt ? remaining(OTP_LIFETIME_MS) : 0, resendIn: sentAt ? remaining(OTP_RESEND_DELAY_MS) : 0 };
}
