import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ApiError } from '@/src/lib/api/apiError';

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

async function withStorage<T>(operation: () => Promise<T>): Promise<T> {
  if (Platform.OS === 'web') throw new ApiError(undefined, 'error.secure-storage');
  try { return await operation(); }
  catch { throw new ApiError(undefined, 'error.secure-storage'); }
}

export const secureStorage = {
  get: (key: string) => withStorage(() => SecureStore.getItemAsync(key, options)),
  set: (key: string, value: string) => withStorage(() => SecureStore.setItemAsync(key, value, options)),
  remove: (key: string) => withStorage(() => SecureStore.deleteItemAsync(key, options)),
};
