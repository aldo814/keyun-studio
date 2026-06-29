import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink, Globe2 } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { ActionFeedback } from "@/components/dashboard/action-feedback";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PublishSiteButton } from "@/features/dashboard/publish-site-button";
import { getDashboardSite } from "@/features/dashboard/queries";

type SiteDetailPageProps = {
  params: Promise<{
    siteId: string;
  }>;
  searchParams?: Promise<{ notice?: string | string[] }>;
};

function firstSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SiteDetailPage({ params, searchParams }: SiteDetailPageProps) {
  const { siteId } = await params;
  const query = await searchParams;
  const site = await getDashboardSite(siteId);

  if (!site) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="space-y-6">
        <ActionFeedback notice={firstSearchValue(query?.notice)} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Site</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              {site.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">/s/{site.slug}</p>
          </div>
          <div className="flex gap-2">
            <Button render={<Link href="/dashboard/content/posts" />}>
              콘텐츠 관리
            </Button>
            <Button variant="outline" render={<Link href={`/dashboard/sites/${site.id}/sitemap`} />}>
              사이트맵 설정
            </Button>
            <Button variant="outline" render={<Link href={`/dashboard/sites/${site.id}/settings`} />}>
              사이트 설정
            </Button>
            <Button variant="outline" render={<Link href="/dashboard/sites" />}>
              목록
            </Button>
          </div>
        </div>

        <Card className="rounded-lg border-border bg-card">
          <CardHeader>
            <CardTitle>다음 단계</CardTitle>
            <CardDescription>
              사이트 생성 후 운영을 시작하기 위한 기본 순서입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              {
                description: "사이트명, 공개 주소, 검색 노출 문구를 확인합니다.",
                href: `/dashboard/sites/${site.id}/settings`,
                label: "기본 설정 확인",
              },
              {
                description: "메인 외 회사소개, 제품소개, 고객지원 같은 메뉴와 페이지를 추가합니다.",
                href: `/dashboard/sites/${site.id}/sitemap`,
                label: "사이트맵 구성",
              },
              {
                description: "공지사항과 블로그 글을 작성해 공개 페이지에 연결합니다.",
                href: "/dashboard/content/posts/new",
                label: "첫 게시글 작성",
              },
            ].map((item) => (
              <Link
                key={item.label}
                className="rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:border-zinc-950 hover:bg-muted"
                href={item.href}
                target={item.href.startsWith("/s/") ? "_blank" : undefined}
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>상태</CardTitle>
              <CardDescription>현재 공개 상태</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusBadge tone={site.status}>{site.status}</StatusBadge>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>최근 수정</CardTitle>
              <CardDescription>마지막 저장 시각</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{site.updatedAt}</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>최근 게시</CardTitle>
              <CardDescription>published_at</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{site.publishedAt}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-lg border-border bg-card" id="publish-site">
          <CardHeader>
            <CardTitle>게시하기</CardTitle>
            <CardDescription>
              디자인 에디터에서 저장한 사이트 데이터를 공개 상태로 전환합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PublishSiteButton
              returnTo={`/dashboard/sites/${site.id}`}
              siteId={site.id}
              siteName={site.name}
              slug={site.slug}
            />
          </CardContent>
        </Card>

        {site.status === "published" ? (
          <div className="flex justify-end">
            <Button render={<Link href={`/s/${site.slug}`} target="_blank" />}>
              공개 사이트 보기
            </Button>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-lg border-border bg-card">
            <CardHeader>
              <CardTitle>고객 전달 전 확인</CardTitle>
              <CardDescription>
                제작자가 사이트를 세팅한 뒤 고객에게 관리자 접근을 넘기기 전 확인할 항목입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[
                "사이트맵에 필요한 1차 메뉴가 모두 등록됨",
                "메인/서브페이지 초안 미리보기 확인",
                "게시글 기본 게시판 확인",
                "문의폼 접수 후 관리자 노출 확인",
                "SEO 제목과 설명 입력",
                "게시 후 공개 주소 확인",
              ].map((item) => (
                <div
                  className="flex items-start gap-2 rounded-lg border border-border bg-white p-3 text-sm"
                  key={item}
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="size-5" />
                도메인 연결
              </CardTitle>
              <CardDescription>
                기본 공개 주소는 즉시 사용할 수 있고, 커스텀 도메인은 별도 연결 단계가 필요합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="text-xs font-medium text-muted-foreground">기본 공개 주소</p>
                <p className="mt-1 font-semibold">/s/{site.slug}</p>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                고객 도메인을 연결하려면 도메인 구매처, DNS 접근 권한, 연결할 주소를 확인해야 합니다.
                자동 연결 기능 전까지는 제작자가 설정 후 고객에게 안내하는 흐름을 권장합니다.
              </p>
              <Button
                className="w-full"
                variant="outline"
                render={<Link href={`/s/${site.slug}`} target="_blank" />}
              >
                현재 공개 주소 확인
                <ExternalLink />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
