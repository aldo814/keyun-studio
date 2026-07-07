import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  SESSION_LAST_ACTIVE_COOKIE,
  SESSION_MODE_COOKIE,
  SESSION_POLICY_COOKIE,
  SESSION_MODE_STANDARD,
  isStandardSessionExpired,
} from "@/features/auth/session-policy";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const SUPER_ADMIN_PREFIXES = ["/admin"];

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isSuperAdminPath(pathname: string) {
  return SUPER_ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getSafeNext(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", getSafeNext(request));

  return NextResponse.redirect(url);
}

function clearAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies.getAll().forEach((cookie) => {
    if (
      cookie.name === SESSION_MODE_COOKIE ||
      cookie.name === SESSION_LAST_ACTIVE_COOKIE ||
      cookie.name === SESSION_POLICY_COOKIE ||
      cookie.name.startsWith("sb-") ||
      cookie.name.toLowerCase().includes("supabase")
    ) {
      response.cookies.delete(cookie.name);
    }
  });
}

function redirectToContent(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/dashboard/content";
  url.search = "";

  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname) || !hasSupabaseEnv()) {
    return NextResponse.next();
  }

  const sessionMode = request.cookies.get(SESSION_MODE_COOKIE)?.value;
  const sessionPolicy = request.cookies.get(SESSION_POLICY_COOKIE)?.value;
  const lastActive = request.cookies.get(SESSION_LAST_ACTIVE_COOKIE)?.value;

  if (
    (sessionMode === SESSION_MODE_STANDARD && isStandardSessionExpired(lastActive)) ||
    (!sessionMode && sessionPolicy === SESSION_MODE_STANDARD)
  ) {
    const response = redirectToLogin(request);
    clearAuthCookies(request, response);

    return response;
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToLogin(request);
  }

  if (sessionMode === SESSION_MODE_STANDARD) {
    response.cookies.set(SESSION_LAST_ACTIVE_COOKIE, String(Date.now()), {
      path: "/",
      sameSite: "lax",
    });
  }

  if (!isSuperAdminPath(pathname)) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "super_admin") {
    return redirectToContent(request);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
