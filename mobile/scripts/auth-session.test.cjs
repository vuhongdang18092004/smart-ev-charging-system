const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');

const loaded = new Map();
function loadSource(relative) {
  const filename = path.resolve(__dirname, '..', relative);
  if (loaded.has(filename)) return loaded.get(filename).exports;
  const module = new Module(filename, require.main);
  loaded.set(filename, module);
  module.filename = filename;
  module.paths = Module._nodeModulePaths(path.dirname(filename));
  const fallback = module.require.bind(module);
  module.require = (id) => {
    if (id.startsWith('@/')) return loadSource(id.slice(2) + '.ts');
    if (id.startsWith('./') || id.startsWith('../')) return loadSource(path.join(path.dirname(filename), id + '.ts'));
    return fallback(id);
  };
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  module._compile(compiled.outputText, filename);
  return module.exports;
}

const { createTokenManager } = loadSource('src/lib/api/tokenManager.ts');
const { ApiError } = loadSource('src/lib/api/apiError.ts');
const user = {
  id: '10000000-0000-4000-8000-000000000001', name: 'Fixture', email: 'driver@example.test',
  role: 'driver', email_verified: true,
};
const payload = (suffix = '') => ({
  access_token: 'access' + suffix, refresh_token: 'refresh' + suffix, expires_in: 900, user,
});
const unauthorized = () => new ApiError(401, 'error.invalid-session');
function fixture(initial = null, overrides = {}) {
  let persisted = initial;
  const stats = { refresh: 0, profile: 0, logout: [] };
  const storage = {
    get: async () => persisted,
    set: async (value) => { persisted = value; },
    remove: async () => { persisted = null; },
  };
  const api = {
    login: async () => payload(),
    refresh: async () => { stats.refresh += 1; return payload('-rotated'); },
    logout: async (token) => { stats.logout.push(token); },
    me: async () => { stats.profile += 1; return user; },
    ...overrides,
  };
  const manager = createTokenManager(storage, api);
  return { manager, stats, persisted: () => persisted };
}

test('login persists only refresh, a new runtime restores and reads the driver profile', async () => {
  const current = fixture();
  await current.manager.restore();
  assert.equal(current.manager.getSnapshot().status, 'anonymous');
  await current.manager.login({ email: user.email, password: 'fixture-password' });
  assert.equal(current.persisted(), 'refresh');
  assert.equal(current.manager.accessToken(), 'access');
  const restarted = fixture(current.persisted());
  assert.equal(restarted.manager.accessToken(), undefined);
  await restarted.manager.restore();
  assert.deepEqual(restarted.manager.getSnapshot(), { status: 'authenticated', user });
  assert.equal(restarted.stats.profile, 1);
  assert.equal(restarted.persisted(), 'refresh-rotated');
});

test('concurrent refresh calls share one rotation', async () => {
  const { manager, stats, persisted } = fixture('refresh');
  const first = manager.refresh();
  assert.equal(first, manager.refresh());
  await first;
  assert.equal(stats.refresh, 1);
  assert.equal(persisted(), 'refresh-rotated');
});

test('invalid refresh clears storage; network failure preserves the token for retry', async () => {
  const expired = fixture('expired', { refresh: async () => { throw unauthorized(); } });
  await expired.manager.restore();
  assert.equal(expired.persisted(), null);
  assert.equal(expired.manager.getSnapshot().status, 'anonymous');
  const offline = fixture('retained', { refresh: async () => { throw new ApiError(undefined); } });
  await offline.manager.restore();
  assert.equal(offline.persisted(), 'retained');
  assert.equal(offline.manager.getSnapshot().status, 'error');
});

test('logout waits for rotation to revoke the replacement token and clears access', async () => {
  let resolveRefresh;
  const result = new Promise((resolve) => { resolveRefresh = resolve; });
  const { manager, stats, persisted } = fixture('refresh', { refresh: () => result });
  const refresh = manager.refresh();
  const logout = manager.logout();
  resolveRefresh(payload('-rotated'));
  await Promise.all([refresh, logout]);
  assert.deepEqual(stats.logout, ['refresh-rotated']);
  assert.equal(manager.accessToken(), undefined);
  assert.equal(persisted(), null);
  assert.equal(manager.getSnapshot().status, 'anonymous');
});

test('offline logout clears credentials and exposes the revocation warning', async () => {
  const { manager, persisted } = fixture('refresh', { logout: async () => { throw new ApiError(undefined); } });
  await manager.logout();
  assert.equal(persisted(), null);
  assert.deepEqual(manager.getSnapshot(), { status: 'anonymous', notice: 'offline-logout' });
});

test('auth schema rejects other roles and preserves leading zeros on OTP', () => {
  const { driverSessionSchema, verificationSchema, registrationSchema } = loadSource('src/features/auth/schemas/authSchemas.ts');
  const valid = { ...payload(), refresh_token: 'a'.repeat(43) };
  assert.equal(driverSessionSchema.safeParse(valid).success, true);
  assert.equal(driverSessionSchema.safeParse({ ...valid, user: { ...user, role: 'admin' } }).success, false);
  assert.equal(driverSessionSchema.safeParse({ ...valid, user: { ...user, email_verified: false } }).success, false);
  assert.equal(verificationSchema.parse({ email: user.email, otp: '001234' }).otp, '001234');
  assert.equal(registrationSchema.safeParse({ name: user.name, email: user.email, password: 'ệ'.repeat(25) }).success, false);
});

test('auth requests send the mobile client and protected API retries once', async () => {
  global.__DEV__ = true;
  process.env.EXPO_PUBLIC_API_BASE_URL = 'http://127.0.0.1:8080/api';
  const { AxiosError } = require('axios');
  const { axiosClient, configureSessionTransport } = loadSource('src/lib/api/axiosClient.ts');
  const { authService } = loadSource('src/features/auth/services/authService.ts');
  const calls = [];
  let active = 'old';
  let rotations = 0;
  configureSessionTransport({
    accessToken: () => active,
    refresh: async () => { rotations += 1; active = 'new'; },
  });
  axiosClient.defaults.adapter = async (config) => {
    const auth = config.headers.get('Authorization');
    calls.push({ path: config.url, auth, data: config.data && JSON.parse(config.data) });
    const response = { status: 200, data: {}, headers: {}, config };
    if (config.url === '/auth/login') {
      response.data = { success: true, data: { ...payload(), refresh_token: 'a'.repeat(43) } };
    }
    if (config.url === '/protected') {
      throw new AxiosError('Fixture unauthorized', undefined, config, undefined, { ...response, status: 401 });
    }
    return response;
  };
  await authService.register({ name: user.name, email: user.email, password: 'fixture-password' });
  await authService.resend(user.email);
  await authService.verify({ email: user.email, otp: '001234' });
  await authService.forgot(user.email);
  await authService.reset({ email: user.email, otp: '001234', password: 'fixture-password' });
  await authService.login({ email: user.email, password: 'fixture-password' });
  assert.deepEqual(calls.map((call) => call.path), [
    '/auth/register', '/auth/resend-otp', '/auth/verify-email',
    '/auth/forgot-password', '/auth/reset-password', '/auth/login',
  ]);
  assert.equal(calls[2].data.otp, '001234');
  assert.deepEqual(calls[5].data, { email: user.email, password: 'fixture-password', client: 'mobile' });
  assert.ok(calls.every((call) => !call.auth));
  await assert.rejects(() => axiosClient.get('/protected'), (error) => error.status === 401);
  assert.equal(rotations, 1);
  assert.deepEqual(calls.slice(-2).map((call) => call.auth), ['Bearer old', 'Bearer new']);
});
