import type { NextRequest } from "next/server";
import {
  allowedOrigin,
  backend,
  browserEmpty,
  browserJson,
  currentWebUser,
  failure,
  upstreamJson,
  webCookies,
} from "@/lib/server/web-session";

const uuid = "[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}";
const station = `stations/${uuid}`;
const knownRoutes: Record<string, RegExp> = {
  GET: new RegExp(
    `^(?:brands|connector-types|operators(?:/${uuid}/allowed-brands)?|stations|${station}(?:/(?:reviews|reports))?|reviews/${uuid}|station-reports/${uuid}|vehicles-infor(?:/${uuid})?)$`,
    "i",
  ),
  POST: new RegExp(
    `^(?:brands|connector-types|admin/operators|stations|${station}/(?:images|connectors|reviews|reports)|vehicles-infor)$`,
    "i",
  ),
  PUT: new RegExp(
    `^(?:(?:brands|connector-types|operators|stations|connectors|reviews|vehicles-infor)/${uuid}|operators/${uuid}/allowed-brands)$`,
    "i",
  ),
  DELETE: new RegExp(
    `^(?:(?:stations|connectors|reviews|vehicles-infor)/${uuid}|${station}/images/${uuid})$`,
    "i",
  ),
};

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const method = request.method;
  if (method !== "GET" && !allowedOrigin(request))
    return failure(403, "error.invalid-origin");
  const path = (await params).path.join("/");
  if (!knownRoutes[method]?.test(path)) return failure(404, "error.not-found");

  const { access } = await webCookies();
  if (!access) return failure(401, "error.invalid-session");
  try {
    const identity = await currentWebUser(access);
    if (!identity.user) {
      return identity.status === 401 || identity.status === 403
        ? failure(identity.status, "error.invalid-session")
        : failure(502, "error.auth-unavailable");
    }
    const init: RequestInit = {
      method,
      headers: { Authorization: `Bearer ${access}` },
    };
    if (method === "POST" || method === "PUT") {
      if (
        !request.headers
          .get("content-type")
          ?.split(";")[0]
          .trim()
          .match(/^application\/json$/i)
      ) {
        return failure(415, "error.invalid-request");
      }
      init.headers = { ...init.headers, "Content-Type": "application/json" };
      init.body = await request.text();
    }
    const upstream = await backend("/" + path + request.nextUrl.search, init);
    if (upstream.status >= 300 && upstream.status < 400)
      return failure(502, "error.auth-unavailable");
    if (upstream.status === 204 || upstream.status === 205)
      return browserEmpty(upstream.status);
    const body = await upstreamJson(upstream);
    return body === undefined
      ? browserEmpty(upstream.status)
      : browserJson(body, upstream.status);
  } catch {
    return failure(503, "error.auth-unavailable");
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE };
