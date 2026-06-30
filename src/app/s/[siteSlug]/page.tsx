import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getActivePopupsBySiteSlug,
  getPublishedPostsBySiteSlug,
  getPublishedSiteBySlug,
} from "@/features/dashboard/queries";
import { PublicSiteRenderer } from "@/features/site/public-site-renderer";

type PublishedSitePageProps = {
  params: Promise<{
    siteSlug: string;
  }>;
  searchParams?: Promise<{
    contact?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function hasEnglishLocale(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const i18n = (value as Record<string, unknown>).i18n;
  if (!i18n || typeof i18n !== "object" || Array.isArray(i18n)) return false;
  return Array.isArray((i18n as Record<string, unknown>).locales)
    && ((i18n as Record<string, unknown>).locales as unknown[]).includes("en");
}

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
    alternates: {
      canonical: seo?.canonicalUrl || `/s/${site.slug}`,
      languages: hasEnglishLocale(published.page?.publishedJson)
        ? {
            "en": `/s/${site.slug}/en`,
            "ko": `/s/${site.slug}`,
            "x-default": `/s/${site.slug}`,
          }
        : undefined,
    },
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
  searchParams,
}: PublishedSitePageProps) {
  const { siteSlug } = await params;
  const query = await searchParams;
  const [published, posts, popups] = await Promise.all([
    getPublishedSiteBySlug(siteSlug),
    getPublishedPostsBySiteSlug(siteSlug),
    getActivePopupsBySiteSlug(siteSlug),
  ]);

  if (!published || !published.page) {
    notFound();
  }

  return (
    <PublicSiteRenderer
      contactResult={firstSearchValue(query?.contact)}
      contactEnabled={!published.isDemo}
      description={published.seo?.description ?? ""}
      locale="ko"
      pagePath="/"
      popups={popups}
      posts={posts}
      publishedJson={published.page.publishedJson}
      siteName={published.site.name}
      siteSlug={published.site.slug}
    />
  );
}
