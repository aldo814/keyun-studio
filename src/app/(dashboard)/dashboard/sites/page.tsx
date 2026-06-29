import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSites } from "@/features/dashboard/queries";

export default async function SitesPage() {
  const sites = await getDashboardSites();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">내 사이트</h1>
          </div>
          <Button render={<Link href="/dashboard/sites/new" />}>새 사이트</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>전체 사이트</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{sites.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>공개</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {sites.filter((site) => site.status === "published").length}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>초안</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {sites.filter((site) => site.status === "draft").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {sites.length ? (
          <AdminTable
            columns={["사이트", "주소", "상태", "수정일", "최근 게시", "관리"]}
            rows={sites.map((site) => [
              <Link
                key={site.id}
                className="font-medium text-foreground hover:underline"
                href={`/dashboard/sites/${site.id}`}
              >
                {site.name}
              </Link>,
              `/s/${site.slug}`,
              <StatusBadge key={site.status} tone={site.status}>
                {site.status}
              </StatusBadge>,
              site.updatedAt,
              site.publishedAt,
              <div key={`${site.id}-actions`} className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  render={<Link href={`/dashboard/editor/${site.id}`} />}
                >
                  에디터
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href="/dashboard/content/posts" />}
                >
                  콘텐츠
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={`/dashboard/sites/${site.id}/sitemap`} />}
                >
                  페이지
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={`/dashboard/sites/${site.id}/settings`} />}
                >
                  설정
                </Button>
              </div>,
            ])}
          />
        ) : (
          <Card className="rounded-xl border-dashed">
            <CardContent className="flex flex-col items-center px-6 py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-950 text-white">
                <Globe2 className="size-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold">아직 만든 사이트가 없습니다.</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                첫 사이트를 만들면 메인 페이지, 기본 게시판, SEO 설정이 함께 준비됩니다.
                이후 페이지 관리에서 메뉴와 서브페이지를 추가할 수 있습니다.
              </p>
              <Button
                className="mt-6 bg-zinc-950 text-white hover:bg-zinc-800"
                render={<Link href="/dashboard/sites/new" />}
              >
                첫 사이트 만들기
                <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
