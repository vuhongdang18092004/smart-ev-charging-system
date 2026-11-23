import { z } from "zod";
import { WEB_AUTH_LIMITS } from "@/constants/web-auth";
import { COPY } from "@/constants/management";

const email = z
  .string({ error: COPY.required })
  .trim()
  .max(WEB_AUTH_LIMITS.email, COPY.invalid)
  .pipe(z.email({ error: COPY.invalid }));
const password = z
  .string({ error: COPY.required })
  .min(1, COPY.required)
  .refine(
    (value) =>
      new TextEncoder().encode(value).length <= WEB_AUTH_LIMITS.passwordBytes,
    COPY.passwordLength,
  );
const otp = z
  .string({ error: COPY.required })
  .trim()
  .regex(new RegExp(`^[0-9]{${WEB_AUTH_LIMITS.otp}}$`), COPY.invalid);

export const webEmailSchema = z.object({ email });
export const webLoginSchema = webEmailSchema.extend({ password });
export const webVerifySchema = webEmailSchema.extend({ otp });
export const webResetSchema = webVerifySchema.extend({
  password: z
    .string({ error: COPY.required })
    .min(WEB_AUTH_LIMITS.passwordMin, COPY.passwordLength)
    .pipe(password),
});
