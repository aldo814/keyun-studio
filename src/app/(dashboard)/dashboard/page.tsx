import Link from "next/link";
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

import { AdminTable } from "@/components/admin/admin-table";
import { MetricCard } from "@/components/admin/metric-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { getDashboardOverview } from "@/features/dashboard/queries";

const navItems = [
  { label: "개요", href: "/dashboard", icon: Globe2 },
  { label: "내 사이트", href: "/dashboard/sites", icon: FileText },
  { label: "템플릿", href: "/dashboard/templates", icon: Layers3 },
  { label: "멤버", href: "/dashboard/members", icon: Users },
  { label: "구독", href: "/dashboard/billing", icon: CreditCard },
  { label: "설정", href: "/dashboard/settings", icon: Settings },
];

export default async function DashboardPage() {
  const { sites, stats } = await getDashboardOverview();

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
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-primary p-4 text-primary-foreground">
            <p className="text-sm font-semibold">제작 플로우</p>
            <p className="mt-1 text-xs leading-5 text-primary-foreground/70">
              템플릿 선택, SEO 설정, 게시까지 이어서 진행합니다.
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

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 text-sm font-medium text-muted-foreground">
                  Dashboard / Keyun Studio
                </div>
                <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                  내 사이트 운영 개요
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                  제작 중인 사이트, 공개 상태, 최근 작업을 한 화면에서 관리합니다.
                </p>
              </div>
              <Button
                variant="outline"
                render={<Link href="/dashboard/sites" />}
              >
                전체 사이트 보기
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <MetricCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">최근 사이트</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      사이트를 열어 에디터, SEO, 게시 작업을 이어갑니다.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    render={<Link href="/dashboard/sites/new" />}
                  >
                    새 사이트
                  </Button>
                </div>
                <AdminTable
                  columns={["사이트", "상태", "수정일", "게시일", "관리"]}
                  rows={sites.slice(0, 5).map((site) => [
                    <div key={site.id}>
                      <Link
                        className="font-medium text-foreground hover:underline"
                        href={`/dashboard/sites/${site.id}`}
                      >
                        {site.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">/s/{site.slug}</p>
                    </div>,
                    <StatusBadge key={site.status} tone={site.status}>
                      {site.status}
                    </StatusBadge>,
                    site.updatedAt,
                    site.publishedAt,
                    <Button
                      key={`${site.id}-editor`}
                      size="sm"
                      variant="outline"
                      render={<Link href={`/dashboard/editor/${site.id}`} />}
                    >
                      편집
                    </Button>,
                  ])}
                />
              </section>

              <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold">다음 작업</h2>
                <div className="mt-5 space-y-3">
                  {[
                    ["템플릿 선택", "업종에 맞는 구조를 고릅니다."],
                    ["섹션 편집", "Hero, Features, CTA 문구를 수정합니다."],
                    ["SEO 설정", "검색 제목과 설명, OG 이미지를 정리합니다."],
                    ["게시", "초안을 공개 사이트로 반영합니다."],
                  ].map(([title, description], index) => (
                    <div
                      key={title}
                      className="rounded-lg border border-border bg-muted/40 p-4"
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        STEP {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-2 font-semibold">{title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
