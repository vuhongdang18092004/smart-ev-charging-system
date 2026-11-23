import { AUTH_COPY } from '@/src/constants/authCopy';

export class ApiError extends Error {
  constructor(readonly status: number | undefined, readonly code?: string) {
    super(code ?? AUTH_COPY.unavailable);
    this.name = 'ApiError';
  }
}

export function invalidSession(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export function authErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return AUTH_COPY.invalid;
  switch (error.code) {
    case 'error.api-config': return AUTH_COPY.config;
    case 'error.invalid-credentials': return AUTH_COPY.invalidCredentials;
    case 'error.invalid-otp': return AUTH_COPY.invalidOtp;
    case 'error.too-many-attempts': return AUTH_COPY.limited;
    case 'error.email-verification-required': return AUTH_COPY.verifyRequired;
    case 'error.account-disabled': return AUTH_COPY.accountDisabled;
    case 'error.invalid-session': return AUTH_COPY.expired;
    case 'error.secure-storage': return AUTH_COPY.secureStorage;
    default:
      if (error.status === 401) return AUTH_COPY.expired;
      if (error.status === 429) return AUTH_COPY.limited;
      return AUTH_COPY.unavailable;
  }
}
