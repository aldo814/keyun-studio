import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SiteSitemapForm } from "@/features/dashboard/site-sitemap-form";
import { flattenSitemapPages } from "@/features/dashboard/site-sitemap-manager";
import {
  getDashboardSite,
  getDashboardSitePages,
} from "@/features/dashboard/queries";

type EditSitemapPageProps = {
  params: Promise<{
    pageId: string;
    siteId: string;
  }>;
};

export default async function EditSitemapPage({ params }: EditSitemapPageProps) {
  const { pageId, siteId } = await params;
  const [site, pages] = await Promise.all([
    getDashboardSite(siteId),
    getDashboardSitePages(siteId),
  ]);

  if (!site) {
    notFound();
  }

  const page = flattenSitemapPages(pages).find((item) => item.id === pageId);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sitemap</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              {page.menuName} 수정
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{page.path}</p>
          </div>
          <Button variant="outline" render={<Link href={`/dashboard/sites/${site.id}/sitemap`} />}>
            사이트맵 목록
          </Button>
        </div>

        <SiteSitemapForm mode="edit" page={page} pages={pages} site={site} />
      </div>
    </main>
  );
}
