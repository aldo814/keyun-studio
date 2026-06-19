export const FALLBACK_DASHBOARD_PATH = "/dashboard";
export const USER_CONTENT_PATH = "/dashboard/content";
export const SITE_ONBOARDING_PATH = "/dashboard/sites/new";

function isAuthPath(path: string) {
  return (
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/auth/callback")
  );
}

function isAllowedDashboardPath(path: string) {
  return (
    path === "/dashboard" ||
    path.startsWith("/dashboard/") ||
    path === "/admin" ||
    path.startsWith("/admin/")
  );
}

export function sanitizeDashboardNext(next?: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return FALLBACK_DASHBOARD_PATH;
  }

  if (isAuthPath(next) || !isAllowedDashboardPath(next)) {
    return FALLBACK_DASHBOARD_PATH;
  }

  return next;
}

type ResolvePostLoginPathOptions = {
  hasSites: boolean;
  requestedNext?: string | null;
  role?: string | null;
};

export function resolvePostLoginPath({
  hasSites,
  requestedNext,
  role,
}: ResolvePostLoginPathOptions) {
  const safeNext = sanitizeDashboardNext(requestedNext);
  const isSuperAdmin = role === "super_admin";

  if (isSuperAdmin) {
    return safeNext;
  }

  if (safeNext.startsWith("/dashboard/design") || safeNext.startsWith("/admin")) {
    return hasSites ? USER_CONTENT_PATH : SITE_ONBOARDING_PATH;
  }

  if (!hasSites) {
    return SITE_ONBOARDING_PATH;
  }

  return safeNext === FALLBACK_DASHBOARD_PATH ? USER_CONTENT_PATH : safeNext;
}
