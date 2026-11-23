import { secureStorage } from '@/src/lib/storage/secureStorage';
import { challengeSchema } from '../schemas/authSchemas';
import type { PendingChallenge } from '../types/auth';

const key = 'chargeops.driver.challenge.v1';

export async function readChallenge() {
  const stored = await secureStorage.get(key);
  if (!stored) return undefined;
  try {
    return challengeSchema.safeParse(JSON.parse(stored)).data;
  } catch {
    return undefined;
  }
}

export function saveChallenge(challenge: PendingChallenge) {
  return secureStorage.set(key, JSON.stringify(challenge));
}

export function clearChallenge() {
  return secureStorage.remove(key);
}
