import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { authService } from '@/src/features/auth/services/authService';
import { configureSessionTransport } from '@/src/lib/api/axiosClient';
import { createTokenManager, type SessionState } from '@/src/lib/api/tokenManager';
import { secureStorage } from '@/src/lib/storage/secureStorage';

const refreshKey = 'chargeops.driver.refresh.v1';
const manager = createTokenManager({
  get: () => secureStorage.get(refreshKey),
  set: (token) => secureStorage.set(refreshKey, token),
  remove: () => secureStorage.remove(refreshKey),
}, authService);
configureSessionTransport(manager);

type AuthContextValue = { state: SessionState; login: typeof manager.login; logout: typeof manager.logout; restore: typeof manager.restore };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(manager.subscribe, manager.getSnapshot, manager.getSnapshot);
  useEffect(() => {
    if (Platform.OS !== 'web') void manager.restore().catch(() => undefined);
  }, []);

  return <AuthContext.Provider value={{ state, login: manager.login, logout: manager.logout, restore: manager.restore }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const session = useContext(AuthContext);
  if (!session) throw new Error('AuthProvider is missing');
  return session;
}
