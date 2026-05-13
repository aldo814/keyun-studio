import Link from "next/link";

import { AdminTable } from "@/components/admin/admin-table";
import { MetricCard } from "@/components/admin/metric-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { getDashboardOverview } from "@/features/dashboard/queries";

export default async function DashboardPage() {
  const { sites, stats } = await getDashboardOverview();

  return (
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
          <Button variant="outline" render={<Link href="/dashboard/sites" />}>
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
              <Button size="sm" render={<Link href="/dashboard/sites/new" />}>
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
  );
}
