import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { setTimeout } from "node:timers/promises";

const user = (role) => ({
  id: "10000000-0000-4000-8000-000000000001",
  name: "Fixture",
  email: "fixture@example.test",
  role,
  email_verified: true,
});
const token = (role) => `fixture-${role}-access-token`;
const initialRefresh = "a".repeat(43);
const rotatedRefresh = "b".repeat(43);
const envelope = (data) => ({ success: true, data });
const session = (role, refreshToken = initialRefresh) => ({
  access_token: token(role),
  refresh_token: refreshToken,
  expires_in: 900,
  user: user(role),
});
let refreshes = 0;
let logouts = 0;
let writes = 0;
let mockFailure;

const mock = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    const parts = [];
    for await (const part of request) parts.push(part);
    const body = parts.length
      ? JSON.parse(Buffer.concat(parts).toString())
      : {};
    const auth = request.headers.authorization;
    function send(status, value) {
      response.statusCode = status;
      if (value === undefined) return response.end();
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify(value));
    }
    if (url.pathname === "/api/auth/login") {
      assert.equal(body.client, "web");
      return send(200, envelope(session(body.email.split("@")[0])));
    }
    if (url.pathname === "/api/auth/me") {
      const role = ["admin", "operator", "driver"].find(
        (item) => auth === `Bearer ${token(item)}`,
      );
      return role ? send(200, envelope(user(role))) : send(401);
    }
    if (url.pathname === "/api/auth/refresh") {
      refreshes += 1;
      assert.equal(body.refresh_token, initialRefresh);
      assert.equal(body.client, "web");
      await setTimeout(200);
      return send(200, envelope(session("operator", rotatedRefresh)));
    }
    if (url.pathname === "/api/auth/logout") {
      logouts += 1;
      assert.equal(body.refresh_token, rotatedRefresh);
      return send(204);
    }
    if (url.pathname.startsWith("/api/auth/"))
      return send(url.pathname.endsWith("forgot-password") ? 202 : 204);
    if (url.pathname.startsWith("/api/stations/") && request.method === "PUT") {
      writes += 1;
      return send(404, { success: false, code: "error.not-found" });
    }
    if (
      url.pathname === "/api/stations" &&
      auth === `Bearer ${token("operator")}`
    )
      return send(200, envelope({ owner: "operator" }));
    return send(403);
  } catch (error) {
    mockFailure = error;
    response.writeHead(500).end();
  }
});

await new Promise((resolve) => mock.listen(0, "127.0.0.1", resolve));
const portProbe = createServer();
await new Promise((resolve) => portProbe.listen(0, "127.0.0.1", resolve));
const sitePort = portProbe.address().port;
await new Promise((resolveResolve) => portProbe.close(resolveResolve));
const origin = `http://127.0.0.1:${sitePort}`;
const next = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(sitePort),
  ],
  {
    env: {
      ...process.env,
      WEB_AUTH_ORIGIN: origin,
      WEB_BACKEND_API_URL: `http://127.0.0.1:${mock.address().port}/api`,
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);
let output = "";
next.stdout.on("data", (chunk) => {
  output += chunk;
});
next.stderr.on("data", (chunk) => {
  output += chunk;
});

function action(name, { cookies, body, requestOrigin = origin } = {}) {
  return fetch(`${origin}/api/auth/${name}`, {
    method: "POST",
    headers: {
      Origin: requestOrigin,
      ...(cookies ? { Cookie: cookies } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body && JSON.stringify(body),
  });
}

function cookieHeader(reply) {
  return reply.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

async function assertRedirect(path, cookies, destination) {
  const reply = await fetch(origin + path, {
    headers: cookies ? { Cookie: cookies } : {},
    redirect: "manual",
  });
  if (reply.status === 307 || reply.status === 308) {
    assert.equal(
      new URL(reply.headers.get("location"), origin).pathname,
      destination,
    );
  } else {
    assert.match(
      await reply.text(),
      new RegExp(`NEXT_REDIRECT[^<]*${destination}`),
    );
  }
}

try {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if ((await fetch(origin + "/login").catch(() => undefined))?.ok) break;
    if (attempt === 49 || next.exitCode !== null)
      throw new Error("Next.js failed to start");
    await setTimeout(200);
  }
  await assertRedirect("/stations", undefined, "/login");
  assert.equal(
    (
      await action("login", {
        requestOrigin: "https://wrong.example",
        body: { email: "admin@example.test", password: "fixture" },
      })
    ).status,
    403,
  );
  const rejected = await action("login", {
    body: { email: "driver@example.test", password: "fixture" },
  });
  assert.equal(rejected.status, 403);
  assert.deepEqual(rejected.headers.getSetCookie(), []);
  const login = await action("login", {
    body: { email: "operator@example.test", password: "fixture" },
  });
  assert.equal(login.status, 200);
  const body = await login.json();
  assert.deepEqual(body, envelope(user("operator")));
  assert.equal(login.headers.get("cache-control"), "no-store");
  assert.equal(login.headers.getSetCookie().length, 2);
  for (const cookie of login.headers.getSetCookie()) {
    assert.match(cookie, /^__Host-/);
    for (const flag of ["HttpOnly", "Secure", "SameSite=lax", "Path=/"])
      assert.ok(cookie.includes(flag));
  }
  const cookies = cookieHeader(login);
  await assertRedirect("/operators", cookies, "/stations");
  const admin = await action("login", {
    body: { email: "admin@example.test", password: "fixture" },
  });
  assert.equal(
    (
      await fetch(origin + "/operators", {
        headers: { Cookie: cookieHeader(admin) },
      })
    ).status,
    200,
  );
  assert.deepEqual(
    await (
      await fetch(origin + "/api/bff/stations", {
        headers: { Cookie: cookies },
      })
    ).json(),
    envelope({ owner: "operator" }),
  );
  const target = origin + "/api/bff/stations/" + user("operator").id;
  const mutation = {
    method: "PUT",
    body: "{}",
    headers: { Cookie: cookies, "Content-Type": "application/json" },
  };
  assert.equal(
    (
      await fetch(target, {
        ...mutation,
        headers: { ...mutation.headers, Origin: "https://wrong.example" },
      })
    ).status,
    403,
  );
  assert.equal(writes, 0);
  assert.equal(
    (
      await fetch(target, {
        ...mutation,
        headers: { ...mutation.headers, Origin: origin },
      })
    ).status,
    404,
  );
  assert.equal(writes, 1);
  const expired = cookies.replace(token("operator"), "expired");
  await assertRedirect("/stations", expired, "/session-renew");
  const responses = await Promise.all([
    action("refresh", { cookies: expired }),
    action("refresh", { cookies: expired }),
  ]);
  assert.equal(refreshes, 1);
  for (const reply of responses) assert.equal(reply.status, 200);
  assert.ok(cookieHeader(responses[0]).includes(rotatedRefresh));
  assert.equal(
    (await action("refresh", { cookies: cookieHeader(responses[0]) })).status,
    200,
  );
  assert.equal(refreshes, 1);
  const logout = await action("logout", {
    cookies: cookieHeader(responses[0]),
  });
  assert.equal(logout.status, 204);
  assert.equal(logouts, 1);
  assert.ok(
    logout.headers
      .getSetCookie()
      .every((cookie) => cookie.includes("Max-Age=0")),
  );
  assert.equal(
    (
      await action("forgot-password", {
        body: { email: "operator@example.test" },
      })
    ).status,
    202,
  );
  assert.equal(
    (
      await action("verify-email", {
        body: { email: "operator@example.test", otp: "123456" },
      })
    ).status,
    204,
  );
  assert.equal(
    (
      await action("reset-password", {
        body: {
          email: "operator@example.test",
          otp: "123456",
          password: "new-password",
        },
      })
    ).status,
    204,
  );
  if (mockFailure) throw mockFailure;
  console.log("Web BFF smoke test passed.");
} catch (error) {
  console.error(output);
  throw error;
} finally {
  if (next.exitCode === null) {
    next.kill();
    await once(next, "exit");
  }
  mock.closeAllConnections();
  await new Promise((resolve) => mock.close(resolve));
}
