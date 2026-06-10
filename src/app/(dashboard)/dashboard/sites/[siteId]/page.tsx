import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { publishSite } from "@/features/dashboard/actions";
import { getDashboardSite } from "@/features/dashboard/queries";

type SiteDetailPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  const { siteId } = await params;
  const site = await getDashboardSite(siteId);

  if (!site) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Site</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              {site.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">/s/{site.slug}</p>
          </div>
          <div className="flex gap-2">
            <Button render={<Link href={`/dashboard/editor/${site.id}`} />}>
              디자인 편집
            </Button>
            <Button variant="outline" render={<Link href={`/dashboard/sites/${site.id}/settings`} />}>
              SEO 설정
            </Button>
            <Button variant="outline" render={<Link href="/dashboard/sites" />}>
              목록
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>상태</CardTitle>
              <CardDescription>현재 공개 상태</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusBadge tone={site.status}>{site.status}</StatusBadge>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>최근 수정</CardTitle>
              <CardDescription>마지막 저장 시각</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{site.updatedAt}</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>최근 게시</CardTitle>
              <CardDescription>published_at</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{site.publishedAt}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-lg border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>게시하기</CardTitle>
            <CardDescription>
              현재 draft 페이지 데이터를 published_json으로 복사하고 공개 상태로 전환합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={publishSite} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                게시 주소: <span className="font-medium text-foreground">/s/{site.slug}</span>
              </div>
              <input name="site_id" type="hidden" value={site.id} />
              <input name="slug" type="hidden" value={site.slug} />
              <Button type="submit">게시하기</Button>
            </form>
          </CardContent>
        </Card>

        {site.status === "published" ? (
          <div className="flex justify-end">
            <Button render={<Link href={`/s/${site.slug}`} target="_blank" />}>
              공개 사이트 보기
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
