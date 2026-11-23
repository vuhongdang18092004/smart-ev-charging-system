export const AUTH_API = {
  register: '/auth/register', verify: '/auth/verify-email', resend: '/auth/resend-otp',
  login: '/auth/login', refresh: '/auth/refresh', logout: '/auth/logout',
  forgot: '/auth/forgot-password', reset: '/auth/reset-password', me: '/auth/me',
} as const;
export const MOBILE_CLIENT = 'mobile';
