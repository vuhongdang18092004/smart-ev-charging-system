import { WEB_AUTH_ROUTES } from "@/constants/web-auth";
import { ApiError } from "@/lib/api-error";
import type { ApiErrorResponse } from "@/types/api";
import type {
  WebAuthAction,
  WebLoginForm,
  WebResetForm,
  WebVerificationForm,
} from "@/types/web-auth";

export async function webAuth(
  action: WebAuthAction,
  body?: WebLoginForm | WebVerificationForm | WebResetForm | { email: string },
) {
  let reply: Response;
  try {
    reply = await fetch(`${WEB_AUTH_ROUTES.auth}/${action}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (cause) {
    throw new ApiError("", undefined, "error.auth-unavailable", cause);
  }
  if (!reply.ok) {
    const error: Partial<ApiErrorResponse> | undefined = await reply
      .json()
      .catch(() => undefined);
    throw new ApiError(
      error?.message ?? "",
      reply.status,
      error?.code,
      undefined,
    );
  }
}

let pending: Promise<void> | undefined;

export function refreshWebSession(): Promise<void> {
  if (pending) return pending;
  const renew = () => webAuth("refresh");
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  const operation = (async () => {
    if (locks) await locks.request("chargeops-session-refresh", renew);
    else await renew();
  })().finally(() => {
    pending = undefined;
  });
  pending = operation;
  return operation;
}
