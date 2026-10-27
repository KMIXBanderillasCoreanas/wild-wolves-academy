// lib/security/bruteForceShield.ts
const FAILED_ATTEMPTS_STORE = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

export function checkBruteForceLimit(identifier: string): { isLocked: boolean; remainingSec: number } {
  const record = FAILED_ATTEMPTS_STORE.get(identifier);
  if (!record) return { isLocked: false, remainingSec: 0 };

  const now = Date.now();
  if (record.lockedUntil > now) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSec };
  }

  if (record.lockedUntil <= now && record.count >= MAX_ATTEMPTS) {
    FAILED_ATTEMPTS_STORE.delete(identifier);
  }

  return { isLocked: false, remainingSec: 0 };
}

export function recordFailedLogin(identifier: string) {
  const now = Date.now();
  const record = FAILED_ATTEMPTS_STORE.get(identifier) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  FAILED_ATTEMPTS_STORE.set(identifier, record);
  return record;
}

export function resetFailedLogin(identifier: string) {
  FAILED_ATTEMPTS_STORE.delete(identifier);
}
