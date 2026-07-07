export const SESSION_MODE_COOKIE = "keyun_session_mode";
export const SESSION_LAST_ACTIVE_COOKIE = "keyun_last_active";
export const SESSION_POLICY_COOKIE = "keyun_session_policy";

export const SESSION_MODE_PERSISTENT = "persistent";
export const SESSION_MODE_STANDARD = "standard";

export const STANDARD_SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const PERSISTENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function isStandardSessionExpired(lastActiveValue?: string | null) {
  const lastActive = Number(lastActiveValue);

  if (!Number.isFinite(lastActive) || lastActive <= 0) {
    return true;
  }

  return Date.now() - lastActive > STANDARD_SESSION_IDLE_TIMEOUT_MS;
}
