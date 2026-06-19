import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSeoSettings } from "@/features/dashboard/actions";
import {
  getDashboardSite,
  getSiteSeoSettings,
} from "@/features/dashboard/queries";

type SiteSettingsPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function SiteSettingsPage({
  params,
}: SiteSettingsPageProps) {
  const { siteId } = await params;
  const [site, seo] = await Promise.all([
    getDashboardSite(siteId),
    getSiteSeoSettings(siteId),
  ]);

  if (!site) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Site Settings</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              {site.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">/s/{site.slug}</p>
          </div>
          <Button variant="outline" render={<Link href="/dashboard/sites" />}>
            목록
          </Button>
        </div>

        <Card className="rounded-lg border-border bg-card">
          <CardHeader>
            <CardTitle>SEO 설정</CardTitle>
            <CardDescription>
              검색 결과, 공유 카드, 크롤러 노출 방식을 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateSiteSeoSettings} className="space-y-5">
              <input name="site_id" type="hidden" value={site.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Meta title</span>
                  <Input defaultValue={seo?.title ?? site.name} name="title" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Canonical URL</span>
                  <Input
                    defaultValue={seo?.canonicalUrl ?? ""}
                    name="canonical_url"
                    placeholder="https://..."
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium">Meta description</span>
                  <Textarea
                    className="min-h-28"
                    defaultValue={seo?.description ?? ""}
                    name="description"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">OG title</span>
                  <Input defaultValue={seo?.ogTitle ?? seo?.title ?? site.name} name="og_title" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">OG image URL</span>
                  <Input defaultValue={seo?.ogImageUrl ?? ""} name="og_image_url" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium">OG description</span>
                  <Textarea
                    className="min-h-28"
                    defaultValue={seo?.ogDescription ?? seo?.description ?? ""}
                    name="og_description"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Favicon URL</span>
                  <Input defaultValue={seo?.faviconUrl ?? ""} name="favicon_url" />
                </label>
                <div className="flex items-end gap-5">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      defaultChecked={seo?.robotsIndex ?? true}
                      name="robots_index"
                      type="checkbox"
                    />
                    index
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      defaultChecked={seo?.robotsFollow ?? true}
                      name="robots_follow"
                      type="checkbox"
                    />
                    follow
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="reset" variant="outline">
                  변경 취소
                </Button>
                <Button type="submit">SEO 저장</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
