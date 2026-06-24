import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SiteSitemapForm } from "@/features/dashboard/site-sitemap-form";
import {
  getDashboardSite,
  getDashboardSitePages,
} from "@/features/dashboard/queries";

type NewSitemapPageProps = {
  params: Promise<{
    siteId: string;
  }>;
  searchParams?: Promise<{ parent?: string | string[] }>;
};

function firstSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewSitemapPage({
  params,
  searchParams,
}: NewSitemapPageProps) {
  const { siteId } = await params;
  const query = await searchParams;
  const [site, pages] = await Promise.all([
    getDashboardSite(siteId),
    getDashboardSitePages(siteId),
  ]);

  if (!site) {
    notFound();
  }

  const parentId = firstSearchValue(query?.parent);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sitemap</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              페이지 추가
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              메뉴 구조에 새 페이지를 추가합니다.
            </p>
          </div>
          <Button variant="outline" render={<Link href={`/dashboard/sites/${site.id}/sitemap`} />}>
            사이트맵 목록
          </Button>
        </div>

        <SiteSitemapForm
          mode="create"
          pages={pages}
          parentId={parentId === "0" ? "" : parentId}
          site={site}
        />
      </div>
    </main>
  );
}
