import { z } from 'zod';
import { AUTH_API, MOBILE_CLIENT } from '@/src/constants/apiEndpoints';
import { ApiError } from '@/src/lib/api/apiError';
import { axiosClient } from '@/src/lib/api/axiosClient';
import { driverSchema, driverSessionSchema } from '../schemas/authSchemas';
import type { LoginFields, RegistrationFields, ResetFields, VerificationFields } from '../types/auth';

function readSession(value: unknown) {
  const result = z.object({ success: z.literal(true), data: driverSessionSchema }).safeParse(value);
  if (!result.success) throw new ApiError(403, 'error.invalid-session');
  return result.data.data;
}

export const authService = {
  async login(fields: LoginFields) {
    return readSession((await axiosClient.post<unknown>(AUTH_API.login, { ...fields, client: MOBILE_CLIENT })).data);
  },
  async refresh(token: string) {
    return readSession((await axiosClient.post<unknown>(AUTH_API.refresh, { refresh_token: token, client: MOBILE_CLIENT })).data);
  },
  async logout(token: string) {
    await axiosClient.post(AUTH_API.logout, { refresh_token: token, client: MOBILE_CLIENT });
  },
  async me() {
    const response = await axiosClient.get<unknown>(AUTH_API.me);
    const result = z.object({ success: z.literal(true), data: driverSchema }).safeParse(response.data);
    if (!result.success) throw new ApiError(403, 'error.invalid-session');
    return result.data.data;
  },
  async register(fields: RegistrationFields) { await axiosClient.post(AUTH_API.register, fields); },
  async verify(fields: VerificationFields) { await axiosClient.post(AUTH_API.verify, fields); },
  async resend(email: string) { await axiosClient.post(AUTH_API.resend, { email }); },
  async forgot(email: string) { await axiosClient.post(AUTH_API.forgot, { email }); },
  async reset(fields: ResetFields) { await axiosClient.post(AUTH_API.reset, fields); },
};
