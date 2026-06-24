import Link from "next/link";

import { ArrowDown, ArrowUp, Eye, EyeOff, ExternalLink, FilePlus2, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deleteSiteSitemapPages,
  moveSiteSitemapPage,
} from "@/features/dashboard/actions";
import type { DashboardSitePage } from "@/features/dashboard/queries";
import type { Json } from "@/types/database";

type SiteSummary = {
  id: string;
  name: string;
  slug: string;
};

type SiteSitemapManagerProps = {
  pages: DashboardSitePage[];
  site: SiteSummary;
};

function flattenPages(pages: DashboardSitePage[]) {
  const items: DashboardSitePage[] = [];

  function walk(pageItems: DashboardSitePage[]) {
    pageItems.forEach((page) => {
      items.push(page);
      walk(page.children);
    });
  }

  walk(pages);

  return items;
}

function pageTypeLabel(type: string) {
  const labels: Record<string, string> = {
    auto: "자동연결",
    board: "게시판",
    custom: "직접작성",
    external: "외부링크",
  };

  return labels[type] ?? type;
}

function levelLabel(level: number) {
  return `${level}차메뉴`;
}

function childAddHref(siteId: string, parentId?: string | null) {
  const search = parentId ? `?parent=${parentId}` : "?parent=0";

  return `/dashboard/sites/${siteId}/sitemap/new${search}`;
}

function SitemapTable({
  level,
  pages,
  siteId,
}: {
  level: number;
  pages: DashboardSitePage[];
  siteId: string;
}) {
  const deleteFormId = `delete-sitemap-level-${level}`;

  return (
    <Card className="rounded-lg border-border bg-card">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{levelLabel(level)}</CardTitle>
          <CardDescription>
            메뉴 노출, 주소, 제목을 관리합니다. 홈은 기본 생성되며 삭제할 수 없습니다.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            render={<Link href={childAddHref(siteId)} />}
          >
            <FilePlus2 />
            페이지 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form action={deleteSiteSitemapPages} id={deleteFormId}>
          <input name="site_id" type="hidden" value={siteId} />
        </form>
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-14 px-4 py-3">선택</th>
                  <th className="w-16 px-4 py-3">상태</th>
                  <th className="px-4 py-3">메뉴코드</th>
                  <th className="px-4 py-3">메뉴명</th>
                  <th className="px-4 py-3">종류</th>
                  <th className="px-4 py-3">주소</th>
                  <th className="w-72 px-4 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {pages.length > 0 ? (
                  pages.map((page, index) => {
                    const isHome = page.path === "/";
                    const isFirst = index === 0;
                    const isLast = index === pages.length - 1;

                    return (
                      <tr key={page.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <input
                            className="size-4 rounded border-border accent-zinc-950"
                            disabled={isHome}
                            form={deleteFormId}
                            name="page_id"
                            type="checkbox"
                            value={page.id}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {page.isHidden ? (
                            <EyeOff className="size-4 text-muted-foreground" />
                          ) : (
                            <Eye className="size-4 text-emerald-600" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {page.menuCode}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{page.menuName}</span>
                            {isHome ? <Badge variant="secondary">메인</Badge> : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {pageTypeLabel(page.pageType)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{page.path}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <form action={moveSiteSitemapPage}>
                              <input name="site_id" type="hidden" value={siteId} />
                              <input name="page_id" type="hidden" value={page.id} />
                              <input name="direction" type="hidden" value="up" />
                              <Button
                                aria-label={`${page.menuName} 위로 이동`}
                                disabled={isHome || isFirst}
                                size="icon"
                                type="submit"
                                variant="outline"
                              >
                                <ArrowUp />
                              </Button>
                            </form>
                            <form action={moveSiteSitemapPage}>
                              <input name="site_id" type="hidden" value={siteId} />
                              <input name="page_id" type="hidden" value={page.id} />
                              <input name="direction" type="hidden" value="down" />
                              <Button
                                aria-label={`${page.menuName} 아래로 이동`}
                                disabled={isHome || isLast}
                                size="icon"
                                type="submit"
                                variant="outline"
                              >
                                <ArrowDown />
                              </Button>
                            </form>
                            {level < 3 ? (
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                render={<Link href={childAddHref(siteId, page.id)} />}
                              >
                                하위 추가
                              </Button>
                            ) : null}
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              render={<Link href={`/dashboard/preview/${siteId}?pageId=${page.id}`} target="_blank" />}
                            >
                              <ExternalLink />
                              미리보기
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              render={<Link href={`/dashboard/sites/${siteId}/sitemap/${page.id}/edit`} />}
                            >
                              <Pencil />
                              수정
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center text-muted-foreground" colSpan={7}>
                      아직 등록된 {levelLabel(level)}가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              선택삭제는 하위 메뉴까지 함께 삭제될 수 있습니다. 메인 페이지는 보호됩니다.
            </p>
            <Button form={deleteFormId} size="sm" type="submit" variant="destructive">
              <Trash2 />
              선택삭제
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SiteSitemapManager({ pages, site }: SiteSitemapManagerProps) {
  const flatPages = flattenPages(pages);
  const levelOne = flatPages.filter((page) => page.level === 1);
  const levelTwo = flatPages.filter((page) => page.level === 2);
  const levelThree = flatPages.filter((page) => page.level === 3);

  return (
    <div className="space-y-5">
      <Card className="rounded-lg border-border bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>사이트맵 설정</CardTitle>
            <CardDescription>
              {site.name}의 메뉴 구조를 관리합니다. 디자인 편집 오픈 후에도 이 구조가 헤더 메뉴와 페이지 목록의 기준이 됩니다.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<Link href={`/s/${site.slug}`} target="_blank" />}>
              사이트 보기
            </Button>
            <Button render={<Link href={childAddHref(site.id)} />}>
              <FilePlus2 />
              페이지 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "1차 메뉴", value: levelOne.length },
              { label: "2차 메뉴", value: levelTwo.length },
              { label: "3차 메뉴", value: levelThree.length },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">{item.value}개</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SitemapTable level={1} pages={levelOne} siteId={site.id} />
      <SitemapTable level={2} pages={levelTwo} siteId={site.id} />
      <SitemapTable level={3} pages={levelThree} siteId={site.id} />

      <div className="flex justify-end">
        <Button render={<Link href={`/dashboard/sites/${site.id}`} />}>저장하기</Button>
      </div>
    </div>
  );
}

export function flattenSitemapPages(pages: DashboardSitePage[]) {
  return flattenPages(pages);
}

export function getLocaleValue(localeJson: Json, locale: "chn" | "eng", key: string) {
  if (!localeJson || typeof localeJson !== "object" || Array.isArray(localeJson)) {
    return "";
  }

  const localeValue = (localeJson as Record<string, Json>)[locale];

  if (!localeValue || typeof localeValue !== "object" || Array.isArray(localeValue)) {
    return "";
  }

  const rawValue = (localeValue as Record<string, Json>)[key];

  if (typeof rawValue === "boolean") {
    return rawValue ? "on" : "";
  }

  return typeof rawValue === "string" ? rawValue : "";
}
