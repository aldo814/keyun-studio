"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Command,
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { adminNavItems } from "@/features/admin/data";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function AdminShell({
  title,
  description,
  eyebrow = "Super Admin",
  children,
}: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted/60 text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Keyun Studio</p>
            <p className="text-xs text-muted-foreground">운영 콘솔</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-primary p-4 text-primary-foreground">
            <p className="text-sm font-semibold">운영 모드</p>
            <p className="mt-1 text-xs leading-5 text-primary-foreground/70">
              모든 액션은 관리자 로그에 기록됩니다.
            </p>
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
              사용자, 사이트, 워크스페이스 검색
              <span className="ml-auto inline-flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-xs">
                <Command className="size-3" /> K
              </span>
            </div>
            <Button variant="outline" size="icon-lg" className="ml-auto md:ml-0">
              <Bell className="size-5" />
            </Button>
            <Button
              className="gap-2"
              render={<Link href="/dashboard" />}
              variant="outline"
            >
              <LayoutDashboard className="size-4" />
              일반 관리자 보기
            </Button>
            <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
              <div className="size-8 rounded-full bg-primary" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Super Admin</p>
                <p className="text-xs text-muted-foreground">eunyo</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {eyebrow}
                <ChevronRight className="size-4" />
                Keyun Studio
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
