import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getActivePopupsBySiteSlug,
  getPublishedPostsBySiteSlug,
  getPublishedSitePageBySlug,
} from "@/features/dashboard/queries";
import { PublicSiteRenderer } from "@/features/site/public-site-renderer";

type PublishedSubPageProps = {
  params: Promise<{
    pagePath: string[];
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

function pathFromSegments(segments: string[]) {
  return `/${segments.map((segment) => decodeURIComponent(segment)).join("/")}`;
}

export async function generateMetadata({
  params,
}: PublishedSubPageProps): Promise<Metadata> {
  const { pagePath, siteSlug } = await params;
  const published = await getPublishedSitePageBySlug(siteSlug, pathFromSegments(pagePath));

  if (!published || !published.page) {
    return {
      title: "Not Found",
      robots: {
        follow: false,
        index: false,
      },
    };
  }

  const { page, seo, site } = published;
  const title = page.title ? `${page.title} | ${site.name}` : seo?.title || site.name;
  const description = seo?.description || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: seo?.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
    robots: {
      follow: seo?.robotsFollow ?? true,
      index: seo?.robotsIndex ?? true,
    },
    icons: seo?.faviconUrl
      ? {
          icon: seo.faviconUrl,
        }
      : undefined,
  };
}

export default async function PublishedSubPage({
  params,
  searchParams,
}: PublishedSubPageProps) {
  const { pagePath, siteSlug } = await params;
  const query = await searchParams;
  const publicPath = pathFromSegments(pagePath);
  const [published, posts, popups] = await Promise.all([
    getPublishedSitePageBySlug(siteSlug, publicPath),
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
      popups={popups}
      posts={posts}
      publishedJson={published.page.publishedJson}
      siteName={published.site.name}
      siteSlug={published.site.slug}
    />
  );
}
