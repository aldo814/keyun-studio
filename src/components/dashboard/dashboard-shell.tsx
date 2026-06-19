"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Bell, Check, ChevronDown, CreditCard, Globe2, Image as ImageIcon, Inbox,
  LogOut, Megaphone, Menu, Newspaper, Palette, Plus, Search, Settings, Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const mockSites = [
  { id: "demo_site_keyun", name: "KEYUN Official", url: "https://keyun.io", active: true },
  { id: "site_2", name: "키운 블로그", url: "https://blog.keyun.io", active: false },
];

const dashboardNavItems = [
  { label: "개요", href: "/dashboard", icon: Globe2 },
  { label: "사이트", href: "/dashboard/sites", icon: Globe2 },
  { label: "디자인", href: "/dashboard/design", icon: Palette, badge: "추후 오픈" },
  {
    label: "콘텐츠",
    href: "/dashboard/content",
    icon: Newspaper,
    children: [
      { label: "게시글", href: "/dashboard/content/posts", icon: Newspaper },
      { label: "게시판", href: "/dashboard/content/boards", icon: Newspaper },
      { label: "문의폼", href: "/dashboard/content/forms", icon: Inbox },
      { label: "미디어", href: "/dashboard/content/media", icon: ImageIcon },
      { label: "팝업", href: "/dashboard/content/popups", icon: Megaphone },
    ],
  },
  { label: "멤버", href: "/dashboard/members", icon: Users },
  { label: "구독", href: "/dashboard/billing", icon: CreditCard },
  { label: "설정", href: "/dashboard/settings", icon: Settings },
];

type DashboardShellProps = {
  canAccessDesign?: boolean;
  children: React.ReactNode;
  profile?: {
    email: string;
    name: string;
    role: string;
  } | null;
};

const roleLabelMap: Record<string, string> = {
  super_admin: "슈퍼관리자",
  workspace_owner: "소유자",
  workspace_admin: "관리자",
  editor: "편집자",
  viewer: "뷰어",
  user: "사용자",
};

function getRoleLabel(role?: string | null) {
  if (!role) return "사용자";

  return roleLabelMap[role] ?? role;
}

export function DashboardShell({ canAccessDesign = false, children, profile }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [siteOpen, setSiteOpen] = useState(false);
  const [activeSite, setActiveSite] = useState(mockSites[0]);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayName = profile?.name || profile?.email || "사용자";
  const displayEmail = profile?.email || "로그인 계정";
  const roleLabel = getRoleLabel(profile?.role);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSiteOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login?next=/dashboard");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  if (pathname.startsWith("/dashboard/editor")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-muted/60 text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="keyun" className="h-8 w-auto" src="/keyun-logo.svg" />
          </Link>
        </div>

        {/* 사이트 스위처 */}
        <div className="relative border-b border-border px-4 py-4" ref={dropdownRef}>
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3 transition-colors hover:bg-blue-100/60"
            onClick={() => setSiteOpen((v) => !v)}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Globe2 className="size-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold">{activeSite.name}</p>
              <p className="truncate text-xs text-muted-foreground">{activeSite.url}</p>
            </div>
            <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", siteOpen && "rotate-180")} />
          </button>

          {siteOpen && (
            <div className="absolute left-4 right-4 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-white shadow-xl">
              <div className="p-1.5">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">내 사이트</p>
                {mockSites.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-blue-50"
                    onClick={() => {
                      setActiveSite(site);
                      setSiteOpen(false);
                    }}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50">
                      <Globe2 className="size-4 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{site.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{site.url}</p>
                    </div>
                    {activeSite.id === site.id && <Check className="size-4 shrink-0 text-blue-500" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-border p-1.5">
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                  onClick={() => {
                    setSiteOpen(false);
                    router.push("/dashboard/sites/new");
                  }}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-blue-200 bg-blue-50/50">
                    <Plus className="size-4 text-blue-400" />
                  </div>
                  새 사이트 추가
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {dashboardNavItems
            .filter((item) => item.href !== "/dashboard/design" || canAccessDesign)
            .map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {"badge" in item && item.badge ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>

                {"children" in item && item.children && isActive ? (
                  <div className="mt-1 space-y-1 pl-5">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = pathname.startsWith(child.href);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors",
                            childActive
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <ChildIcon className="size-3.5" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{displayEmail}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                {roleLabel}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSigningOut}
                onClick={handleSignOut}
              >
                <LogOut className="size-3.5" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-border bg-card">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="outline" size="icon-lg" className="lg:hidden">
              <Menu className="size-5" />
            </Button>
            <div className="hidden h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 text-sm text-muted-foreground md:flex">
              <Search className="size-4" />
              게시글, 문의, 미디어, 사이트 설정 검색
            </div>
            <Button variant="outline" size="icon-lg" className="ml-auto md:ml-0">
              <Bell className="size-5" />
            </Button>
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              disabled={isSigningOut}
              onClick={handleSignOut}
              aria-label="로그아웃"
            >
              <LogOut className="size-5" />
            </Button>
            <Button render={<Link href="/dashboard/content/posts/new" />}>
              새 게시물
              <ArrowRight />
            </Button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
