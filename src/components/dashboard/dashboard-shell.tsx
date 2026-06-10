"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Bell from "lucide-react/dist/esm/icons/bell";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Globe2 from "lucide-react/dist/esm/icons/globe-2";
import ImageIcon from "lucide-react/dist/esm/icons/image";
import Inbox from "lucide-react/dist/esm/icons/inbox";
import Layers3 from "lucide-react/dist/esm/icons/layers-3";
import Megaphone from "lucide-react/dist/esm/icons/megaphone";
import Menu from "lucide-react/dist/esm/icons/menu";
import Newspaper from "lucide-react/dist/esm/icons/newspaper";
import Palette from "lucide-react/dist/esm/icons/palette";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Search from "lucide-react/dist/esm/icons/search";
import Settings from "lucide-react/dist/esm/icons/settings";
import Users from "lucide-react/dist/esm/icons/users";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dashboardNavItems = [
  { label: "개요", href: "/dashboard", icon: Globe2 },
  { label: "내 사이트", href: "/dashboard/sites", icon: FileText },
  {
    label: "디자인",
    href: "/dashboard/design",
    icon: Palette,
    children: [
      { label: "테마", href: "/dashboard/design/theme", icon: Palette },
      { label: "디자인 편집", href: "/dashboard/editor/demo_site_keyun", icon: Pencil },
      { label: "템플릿", href: "/dashboard/design/templates", icon: Layers3 },
    ],
  },
  {
    label: "콘텐츠",
    href: "/dashboard/content",
    icon: Newspaper,
    children: [
      { label: "게시글", href: "/dashboard/content/posts", icon: Newspaper },
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
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

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

        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-white shadow-sm">
              <Globe2 className="size-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">KEYUN Official</p>
              <p className="truncate text-xs text-muted-foreground">
                https://keyun.io
              </p>
            </div>
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
                  {item.label}
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
          <div className="rounded-lg bg-blue-600 p-4 text-white">
            <p className="text-sm font-semibold">선택형 웹빌더</p>
            <p className="mt-1 text-xs leading-5 text-white/70">
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
