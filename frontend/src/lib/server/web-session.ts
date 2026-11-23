import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { WEB_ROLE } from "@/constants/web-auth";
import type { WebSession, WebUser } from "@/types/web-auth";

const secure = process.env.NODE_ENV === "production";
const cookiePrefix = secure ? "__Host-" : "";
export const accessCookie = cookiePrefix + "chargeops-access";
export const refreshCookie = cookiePrefix + "chargeops-refresh";
const baseCookie = {
  httpOnly: true,
  secure,
  sameSite: "lax",
  path: "/",
} as const;
const configuredRefreshAge = Number(
  process.env.WEB_AUTH_REFRESH_MAX_AGE ?? 604800,
);
const refreshAge =
  Number.isSafeInteger(configuredRefreshAge) && configuredRefreshAge > 0
    ? configuredRefreshAge
    : 604800;

const webUser = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  role: z.enum([WEB_ROLE.admin, WEB_ROLE.operator]),
  email_verified: z.literal(true),
});
const webSession = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  expires_in: z.int().positive(),
  user: webUser,
});

export function parseSession(value: unknown): WebSession | undefined {
  return z
    .object({ success: z.literal(true), data: webSession })
    .safeParse(value).data?.data;
}

export async function backend(path: string, init: RequestInit = {}) {
  const base = process.env.WEB_BACKEND_API_URL ?? "http://localhost:8080/api";
  return fetch(base.replace(/\/$/, "") + path, {
    ...init,
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
}

export async function upstreamJson(response: Response): Promise<unknown> {
  if (!response.headers.get("content-type")?.includes("application/json"))
    return undefined;
  return response.json().catch(() => undefined);
}

export function browserJson(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function browserEmpty(status: number) {
  return new NextResponse(null, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function failure(status: number, code: string) {
  return browserJson({ success: false, code }, status);
}

export function allowedOrigin(request: Request) {
  const configured = process.env.WEB_AUTH_ORIGIN;
  if (secure && !configured) return false;
  const origin = request.headers.get("origin");
  return (
    origin === (configured ?? new URL(request.url).origin) &&
    request.headers.get("sec-fetch-site") !== "cross-site"
  );
}

export function sessionResponse(session: WebSession) {
  const result = browserJson({ success: true, data: session.user });
  result.cookies.set(accessCookie, session.access_token, {
    ...baseCookie,
    maxAge: session.expires_in,
  });
  result.cookies.set(refreshCookie, session.refresh_token, {
    ...baseCookie,
    maxAge: refreshAge,
  });
  return result;
}

export function clearSession(result: NextResponse) {
  result.cookies.set(accessCookie, "", { ...baseCookie, maxAge: 0 });
  result.cookies.set(refreshCookie, "", { ...baseCookie, maxAge: 0 });
  return result;
}

export async function currentWebUser(
  token: string,
): Promise<{ user?: WebUser; status: number }> {
  const upstream = await backend("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!upstream.ok) return { status: upstream.status };
  const user = z
    .object({ success: z.literal(true), data: webUser })
    .safeParse(await upstreamJson(upstream)).data?.data;
  return user ? { user, status: 200 } : { status: 403 };
}

export async function webCookies() {
  const jar = await cookies();
  return {
    access: jar.get(accessCookie)?.value,
    refresh: jar.get(refreshCookie)?.value,
  };
}

const rotations = new Map<
  string,
  Promise<{ session?: WebSession; status: number }>
>();

export async function rotateWebSession(refresh: string) {
  const key = createHash("sha256").update(refresh).digest("hex");
  const existing = rotations.get(key);
  if (existing) return existing;
  const pending = (async () => {
    const reply = await backend("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh, client: "web" }),
    });
    if (!reply.ok) return { status: reply.status };
    const session = parseSession(await upstreamJson(reply));
    return session ? { status: 200, session } : { status: 502 };
  })();
  rotations.set(key, pending);
  try {
    return await pending;
  } finally {
    rotations.delete(key);
  }
}
