import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublishedSiteBySlug } from "@/features/dashboard/queries";
import { PublicSiteRenderer } from "@/features/site/public-site-renderer";

type PublishedSitePageProps = {
  params: Promise<{
    siteSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PublishedSitePageProps): Promise<Metadata> {
  const { siteSlug } = await params;
  const published = await getPublishedSiteBySlug(siteSlug);

  if (!published) {
    return {
      title: "Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { site, seo } = published;
  const title = seo?.title || site.name;
  const description = seo?.description || "";
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;

  return {
    title,
    description,
    alternates: seo?.canonicalUrl
      ? {
          canonical: seo.canonicalUrl,
        }
      : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: seo?.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
    robots: {
      index: seo?.robotsIndex ?? true,
      follow: seo?.robotsFollow ?? true,
    },
    icons: seo?.faviconUrl
      ? {
          icon: seo.faviconUrl,
        }
      : undefined,
  };
}

export default async function PublishedSitePage({
  params,
}: PublishedSitePageProps) {
  const { siteSlug } = await params;
  const published = await getPublishedSiteBySlug(siteSlug);

  if (!published || !published.page) {
    notFound();
  }

  return (
    <PublicSiteRenderer
      description={published.seo?.description ?? ""}
      publishedJson={published.page.publishedJson}
      siteName={published.site.name}
    />
  );
}
