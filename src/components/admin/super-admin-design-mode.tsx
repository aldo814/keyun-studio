"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LayoutDashboard, Palette } from "lucide-react";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const hiddenPrefixes = ["/admin", "/auth", "/dashboard", "/login", "/reset-password", "/signup"];

function isHiddenPath(pathname: string) {
  return hiddenPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getPublishedSiteSlug(pathname: string) {
  const match = pathname.match(/^\/s\/([^/]+)/);

  if (!match?.[1]) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

export function SuperAdminDesignMode() {
  const pathname = usePathname();
  const [editorHref, setEditorHref] = useState(
    "/dashboard/editor/demo_site_keyun",
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (isHiddenPath(pathname) || !hasSupabaseEnv()) {
      return;
    }

    async function checkAccess() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted || profile?.role !== "super_admin") {
        return;
      }

      const siteSlug = getPublishedSiteSlug(pathname);

      if (siteSlug) {
        const { data: site } = await supabase
          .from("sites")
          .select("id")
          .eq("slug", siteSlug)
          .maybeSingle();

        if (site?.id) {
          setEditorHref(`/dashboard/editor/${site.id}`);
        } else {
          setEditorHref("/dashboard/sites");
        }
      } else {
        setEditorHref("/dashboard/editor/demo_site_keyun");
      }

      setIsVisible(true);
    }

    void checkAccess();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  if (!isVisible || isHiddenPath(pathname)) {
    return null;
  }

  return (
    <aside
      aria-label="슈퍼관리자 디자인 도구"
      className="fixed bottom-4 right-4 z-[100] flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-950 p-1.5 text-white sm:bottom-6 sm:right-6"
    >
      <Link
        className="flex size-9 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        href="/admin"
        title="관리자 콘솔"
      >
        <LayoutDashboard className="size-4" />
        <span className="sr-only">관리자 콘솔</span>
      </Link>
      <Link
        className="flex h-9 items-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
        href={editorHref}
      >
        <Palette className="size-4" />
        디자인 모드
        <ArrowUpRight className="size-3.5 text-white/70" />
      </Link>
    </aside>
  );
}
