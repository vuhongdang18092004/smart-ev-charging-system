import { z } from 'zod';
import { AUTH_COPY } from '@/src/constants/authCopy';

const email = z.string().trim().max(255).pipe(z.email({ error: AUTH_COPY.invalid }));
const password = z.string().min(1).max(72).refine((value) => {
  // Encode Unicode code points as UTF-8, matching the backend BCrypt byte limit.
  let bytes = 0;
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
  }
  return bytes <= 72;
}, AUTH_COPY.invalid);
const newPassword = password.refine((value) => value.length >= 8 && value.trim().length > 0, AUTH_COPY.invalid);
export const emailSchema = z.object({ email });
export const loginSchema = emailSchema.extend({ password });
export const registrationSchema = emailSchema.extend({ name: z.string().trim().min(1).max(100), password: newPassword });
export const verificationSchema = emailSchema.extend({ otp: z.string().trim().regex(/^[0-9]{6}$/) });
export const resetSchema = verificationSchema.extend({ password: newPassword });

export const driverSchema = z.object({
  id: z.uuid(), name: z.string(), email: z.string(), role: z.literal('driver'),
  email_verified: z.literal(true),
});
export const driverSessionSchema = z.object({
  access_token: z.string().min(1), refresh_token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  expires_in: z.int().positive(), user: driverSchema,
});
export const challengeSchema = z.object({
  kind: z.enum(['verify', 'reset']), email, sentAt: z.number().nonnegative(),
});
