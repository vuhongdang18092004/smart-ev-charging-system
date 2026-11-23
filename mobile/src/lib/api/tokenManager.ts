import type { DriverProfile, DriverSession, LoginFields } from '@/src/features/auth/types/auth';
import { ApiError, invalidSession } from './apiError';

export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous'; notice?: 'offline-logout' }
  | { status: 'authenticated'; user: DriverProfile }
  | { status: 'error'; error: unknown };

export interface RefreshStorage {
  get(): Promise<string | null>;
  set(value: string): Promise<void>;
  remove(): Promise<void>;
}

export interface SessionApi {
  login(fields: LoginFields): Promise<DriverSession>;
  refresh(token: string): Promise<DriverSession>;
  logout(token: string): Promise<void>;
  me(): Promise<DriverProfile>;
}

export function createTokenManager(storage: RefreshStorage, api: SessionApi) {
  let access: string | undefined;
  let state: SessionState = { status: 'loading' };
  let pendingRefresh: Promise<DriverProfile> | undefined;
  let pendingRestore: Promise<void> | undefined;
  let pendingLogin: Promise<void> | undefined;
  let signingOut = false;
  const listeners = new Set<() => void>();

  function publish(next: SessionState) {
    state = next;
    listeners.forEach((notify) => notify());
  }

  async function install(session: DriverSession) {
    try {
      await storage.set(session.refresh_token);
    } catch (error) {
      access = undefined;
      publish({ status: 'error', error });
      try { await api.logout(session.refresh_token); } catch { /* No usable local session was installed. */ }
      throw error;
    }
    if (!signingOut) {
      access = session.access_token;
      if (!pendingRestore) publish({ status: 'authenticated', user: session.user });
    }
    return session.user;
  }

  async function clear() {
    access = undefined;
    try {
      await storage.remove();
      publish({ status: 'anonymous' });
    } catch (error) {
      publish({ status: 'error', error });
      throw error;
    }
  }

  function refresh(): Promise<DriverProfile> {
    if (signingOut) return Promise.reject(new ApiError(401, 'error.invalid-session'));
    if (pendingRefresh) return pendingRefresh;
    pendingRefresh = (async () => {
      const token = await storage.get();
      if (!token) {
        await clear();
        throw new ApiError(401, 'error.invalid-session');
      }
      try {
        return await install(await api.refresh(token));
      } catch (error) {
        if (invalidSession(error) && !signingOut) await clear();
        throw error;
      }
    })().finally(() => { pendingRefresh = undefined; });
    return pendingRefresh;
  }

  function restore(): Promise<void> {
    if (pendingRestore) return pendingRestore;
    publish({ status: 'loading' });
    pendingRestore = (async () => {
      try {
        if (!(await storage.get())) {
          publish({ status: 'anonymous' });
          return;
        }
        await refresh();
        const user = await api.me();
        if (!signingOut && access) publish({ status: 'authenticated', user });
      } catch (error) {
        if (signingOut) return;
        if (invalidSession(error)) {
          if (state.status !== 'anonymous') await clear();
        } else {
          access = undefined;
          publish({ status: 'error', error });
        }
      }
    })().finally(() => { pendingRestore = undefined; });
    return pendingRestore;
  }

  function login(fields: LoginFields): Promise<void> {
    if (pendingLogin) return pendingLogin;
    if (signingOut) return Promise.reject(new ApiError(401, 'error.invalid-session'));
    pendingLogin = (async () => {
      await install(await api.login(fields));
    })().finally(() => { pendingLogin = undefined; });
    return pendingLogin;
  }

  async function logout() {
    if (signingOut) return;
    signingOut = true;
    access = undefined;
    publish({ status: 'loading' });
    let notice: 'offline-logout' | undefined;
    try {
      await Promise.allSettled([pendingRefresh, pendingLogin]);
      const token = await storage.get();
      if (token) {
        try {
          await api.logout(token);
        } catch (error) {
          if (!invalidSession(error)) notice = 'offline-logout';
        }
      }
    } catch {
      notice = 'offline-logout';
    } finally {
      try {
        await clear();
        publish({ status: 'anonymous', notice });
      } finally {
        signingOut = false;
      }
    }
  }

  return {
    accessToken: () => access,
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    login, logout, refresh, restore,
  };
}
