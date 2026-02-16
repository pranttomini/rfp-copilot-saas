type LoginAttempt = {
  count: number;
  firstAttemptAt: number;
};

const WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const MAX_ATTEMPTS = Number(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS || 8);

const loginAttempts = new Map<string, LoginAttempt>();

function normalizeKey(email: string): string {
  return email.trim().toLowerCase();
}

export function checkLoginRateLimit(email: string): { allowed: boolean; retryAfterMs: number } {
  const key = normalizeKey(email);
  const now = Date.now();
  const current = loginAttempts.get(key);

  if (!current) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  const elapsed = now - current.firstAttemptAt;

  if (elapsed >= WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (current.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: WINDOW_MS - elapsed };
  }

  current.count += 1;
  loginAttempts.set(key, current);
  return { allowed: true, retryAfterMs: 0 };
}

export function clearLoginRateLimit(email: string) {
  loginAttempts.delete(normalizeKey(email));
}
