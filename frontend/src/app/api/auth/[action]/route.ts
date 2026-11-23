import type { NextRequest } from "next/server";
import {
  webEmailSchema,
  webLoginSchema,
  webResetSchema,
  webVerifySchema,
} from "@/schemas/web-auth";
import {
  allowedOrigin,
  backend,
  browserEmpty,
  browserJson,
  clearSession,
  currentWebUser,
  failure,
  parseSession,
  rotateWebSession,
  sessionResponse,
  upstreamJson,
  webCookies,
} from "@/lib/server/web-session";

const forms = {
  login: webLoginSchema,
  "verify-email": webVerifySchema,
  "resend-otp": webEmailSchema,
  "forgot-password": webEmailSchema,
  "reset-password": webResetSchema,
} as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  if (!allowedOrigin(request)) return failure(403, "error.invalid-origin");
  const { action } = await params;
  try {
    if (action === "refresh" || action === "logout") {
      const { access, refresh } = await webCookies();
      if (action === "logout") {
        if (refresh) {
          const upstream = await backend("/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refresh, client: "web" }),
          });
          if (!upstream.ok && upstream.status !== 401)
            return failure(502, "error.auth-unavailable");
        }
        return clearSession(browserEmpty(204));
      }
      if (access) {
        const result = await currentWebUser(access);
        if (result.user)
          return browserJson({ success: true, data: result.user });
        if (result.status === 403)
          return clearSession(failure(403, "error.invalid-session"));
        if (result.status !== 401)
          return failure(502, "error.auth-unavailable");
      }
      if (!refresh) return clearSession(failure(401, "error.invalid-session"));
      const result = await rotateWebSession(refresh);
      if (result.session) return sessionResponse(result.session);
      return result.status === 401 || result.status === 403
        ? clearSession(failure(result.status, "error.invalid-session"))
        : failure(502, "error.auth-unavailable");
    }
    if (!Object.hasOwn(forms, action)) return failure(404, "error.not-found");
    if (
      !request.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .match(/^application\/json$/i)
    ) {
      return failure(415, "error.invalid-request");
    }
    const form = forms[action as keyof typeof forms].safeParse(
      await request.json().catch(() => undefined),
    );
    if (!form.success) return failure(400, "error.invalid-request");
    const upstream = await backend("/auth/" + action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        action === "login" ? { ...form.data, client: "web" } : form.data,
      ),
    });
    if (!upstream.ok) {
      const details = await upstreamJson(upstream);
      const code =
        details &&
        typeof details === "object" &&
        "code" in details &&
        typeof details.code === "string"
          ? details.code
          : "error.auth-unavailable";
      return failure(upstream.status >= 400 ? upstream.status : 502, code);
    }
    if (action !== "login") return browserEmpty(upstream.status);
    const session = parseSession(await upstreamJson(upstream));
    return session
      ? sessionResponse(session)
      : failure(403, "error.invalid-session");
  } catch {
    return failure(503, "error.auth-unavailable");
  }
}
