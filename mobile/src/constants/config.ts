const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');
export const MOBILE_API_URL =
  baseUrl && (baseUrl.startsWith('https://') || (__DEV__ && baseUrl.startsWith('http://'))) ? baseUrl : undefined;
export const API_TIMEOUT_MS = 15000;
export const OTP_LIFETIME_MS = 5 * 60 * 1000;
export const OTP_RESEND_DELAY_MS = 60 * 1000;
