import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionFeedback } from "@/components/dashboard/action-feedback";
import { Button } from "@/components/ui/button";
import { SiteSitemapManager } from "@/features/dashboard/site-sitemap-manager";
import {
  getDashboardSite,
  getDashboardSitePages,
} from "@/features/dashboard/queries";

type SiteSitemapPageProps = {
  params: Promise<{
    siteId: string;
  }>;
  searchParams?: Promise<{ notice?: string | string[] }>;
};

function firstSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SiteSitemapPage({
  params,
  searchParams,
}: SiteSitemapPageProps) {
  const { siteId } = await params;
  const query = await searchParams;
  const [site, pages] = await Promise.all([
    getDashboardSite(siteId),
    getDashboardSitePages(siteId),
  ]);

  if (!site) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="space-y-6">
        <ActionFeedback notice={firstSearchValue(query?.notice)} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Page Settings</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              사이트맵 설정
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {site.name} · /s/{site.slug}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href={`/dashboard/sites/${site.id}`} />}>
              사이트 상세
            </Button>
            <Button variant="outline" render={<Link href={`/dashboard/sites/${site.id}/settings`} />}>
              기본 설정
            </Button>
          </div>
        </div>

        <SiteSitemapManager pages={pages} site={site} />
      </div>
    </main>
  );
}
