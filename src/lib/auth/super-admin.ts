const DEFAULT_SUPER_ADMIN_EMAIL = "keyun@keyun.kr";

export function getConfiguredSuperAdminEmail() {
  return process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || DEFAULT_SUPER_ADMIN_EMAIL;
}

export function isConfiguredSuperAdminEmail(email?: string | null) {
  if (!email) return false;

  return email.trim().toLowerCase() === getConfiguredSuperAdminEmail().toLowerCase();
}

export function resolveEffectiveRole(role?: string | null, email?: string | null) {
  if (isConfiguredSuperAdminEmail(email)) {
    return "super_admin";
  }

  return role ?? "user";
}
