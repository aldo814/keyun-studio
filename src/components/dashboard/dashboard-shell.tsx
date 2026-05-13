"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Bell,
  CreditCard,
  FileText,
  Globe2,
  Layers3,
  Menu,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dashboardNavItems = [
  { label: "개요", href: "/dashboard", icon: Globe2 },
  { label: "내 사이트", href: "/dashboard/sites", icon: FileText },
  { label: "템플릿", href: "/dashboard/templates", icon: Layers3 },
  { label: "멤버", href: "/dashboard/members", icon: Users },
  { label: "구독", href: "/dashboard/billing", icon: CreditCard },
  { label: "설정", href: "/dashboard/settings", icon: Settings },
];

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted/60 text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Globe2 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Keyun Studio</p>
            <p className="text-xs text-muted-foreground">사용자 대시보드</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {dashboardNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
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
            <p className="text-sm font-semibold">선택형 웹빌더</p>
            <p className="mt-1 text-xs leading-5 text-primary-foreground/70">
              섹션 레이아웃을 고르고 텍스트와 이미지만 수정합니다.
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="outline" size="icon-lg" className="lg:hidden">
              <Menu className="size-5" />
            </Button>
            <div className="hidden h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 text-sm text-muted-foreground md:flex">
              <Search className="size-4" />
              사이트, 템플릿, SEO 설정 검색
            </div>
            <Button variant="outline" size="icon-lg" className="ml-auto md:ml-0">
              <Bell className="size-5" />
            </Button>
            <Button render={<Link href="/dashboard/sites/new" />}>
              홈페이지 제작
              <ArrowRight />
            </Button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
