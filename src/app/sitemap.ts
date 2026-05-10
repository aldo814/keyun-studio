import type { MetadataRoute } from "next";

import { getPublishedSitesForSitemap } from "@/features/dashboard/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://keyun-studio.vercel.app";
  const sites = await getPublishedSitesForSitemap();

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...sites.map((site) => ({
      url: `${baseUrl}/s/${site.slug}`,
      lastModified: new Date(site.lastModified),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
