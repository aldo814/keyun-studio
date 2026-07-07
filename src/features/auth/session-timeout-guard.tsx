"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { createClient } from "@/lib/supabase/client";

import {
  SESSION_LAST_ACTIVE_COOKIE,
  SESSION_MODE_COOKIE,
  SESSION_POLICY_COOKIE,
  SESSION_MODE_STANDARD,
  isStandardSessionExpired,
} from "./session-policy";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"];

function getCookieValue(name: string) {
  if (typeof document === "undefined") return "";

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] ?? ""
  );
}

function getStandardCookieAttributes() {
  const attributes = ["path=/", "SameSite=Lax"];

  if (window.location.protocol === "https:") {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

function touchLastActive() {
  document.cookie = `${SESSION_LAST_ACTIVE_COOKIE}=${Date.now()}; ${getStandardCookieAttributes()}`;
}

function clearClientSessionPolicy() {
  const expiredAttributes = "path=/; Max-Age=0; SameSite=Lax";

  document.cookie = `${SESSION_MODE_COOKIE}=; ${expiredAttributes}`;
  document.cookie = `${SESSION_LAST_ACTIVE_COOKIE}=; ${expiredAttributes}`;
  document.cookie = `${SESSION_POLICY_COOKIE}=; ${expiredAttributes}`;
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function SessionTimeoutGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const isSigningOutRef = useRef(false);
  const lastTouchRef = useRef(0);

  useEffect(() => {
    if (!isProtectedPath(pathname)) return;

    function isStandardSession() {
      return (
        getCookieValue(SESSION_MODE_COOKIE) === SESSION_MODE_STANDARD ||
        getCookieValue(SESSION_POLICY_COOKIE) === SESSION_MODE_STANDARD
      );
    }

    async function signOutForTimeout() {
      if (isSigningOutRef.current) return;

      isSigningOutRef.current = true;
      clearClientSessionPolicy();

      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } finally {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        router.refresh();
      }
    }

    function checkSession() {
      if (!isStandardSession()) return;

      if (isStandardSessionExpired(getCookieValue(SESSION_LAST_ACTIVE_COOKIE))) {
        void signOutForTimeout();
      }
    }

    function handleActivity() {
      if (!isStandardSession()) return;

      const now = Date.now();

      if (now - lastTouchRef.current < 10_000) return;

      lastTouchRef.current = now;
      touchLastActive();
    }

    checkSession();
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    const timer = window.setInterval(checkSession, 60_000);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.clearInterval(timer);
    };
  }, [pathname, router]);

  return null;
}
