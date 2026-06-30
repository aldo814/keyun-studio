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

function resolveLocalizedPath(segments: string[]) {
  const locale = segments[0] === "en" ? "en" as const : "ko" as const;
  const contentSegments = locale === "en" ? segments.slice(1) : segments;

  return {
    locale,
    publicPath: contentSegments.length ? pathFromSegments(contentSegments) : "/",
  };
}

function readI18n(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const i18n = (value as Record<string, unknown>).i18n;
  return i18n && typeof i18n === "object" && !Array.isArray(i18n)
    ? (i18n as Record<string, unknown>)
    : null;
}

function isEnglishEnabled(value: unknown) {
  const locales = readI18n(value)?.locales;
  return Array.isArray(locales) && locales.includes("en");
}

function localizedMeta(value: unknown, locale: "ko" | "en") {
  if (locale === "ko") return null;
  const seo = readI18n(value)?.seo;
  if (!seo || typeof seo !== "object" || Array.isArray(seo)) return null;
  const entry = (seo as Record<string, unknown>)[locale];
  return entry && typeof entry === "object" && !Array.isArray(entry)
    ? (entry as Record<string, unknown>)
    : null;
}

function localizedPageTitle(value: unknown, publicPath: string, fallback: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const pages = (value as Record<string, unknown>).pages;
  if (!Array.isArray(pages)) return fallback;
  const page = pages.find(
    (item) =>
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      (item as Record<string, unknown>).path === publicPath,
  );
  if (!page || typeof page !== "object" || Array.isArray(page)) return fallback;
  const translations = (page as Record<string, unknown>).translations;
  if (!translations || typeof translations !== "object" || Array.isArray(translations)) {
    return fallback;
  }
  const english = (translations as Record<string, unknown>).en;
  if (!english || typeof english !== "object" || Array.isArray(english)) return fallback;
  const title = (english as Record<string, unknown>).title;
  return typeof title === "string" && title ? title : fallback;
}

export async function generateMetadata({
  params,
}: PublishedSubPageProps): Promise<Metadata> {
  const { pagePath, siteSlug } = await params;
  const { locale, publicPath } = resolveLocalizedPath(pagePath);
  const published = await getPublishedSitePageBySlug(siteSlug, publicPath);

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
  if (locale === "en" && !isEnglishEnabled(page.publishedJson)) {
    return {
      title: "Not Found",
      robots: { follow: false, index: false },
    };
  }
  const translatedSeo = localizedMeta(page.publishedJson, locale);
  const seoTitle =
    typeof translatedSeo?.title === "string" ? translatedSeo.title : "";
  const description =
    typeof translatedSeo?.description === "string"
      ? translatedSeo.description
      : seo?.description || "";
  const pageTitle =
    locale === "en"
      ? localizedPageTitle(page.publishedJson, publicPath, page.title)
      : page.title;
  const title = seoTitle || (pageTitle ? `${pageTitle} | ${site.name}` : seo?.title || site.name);
  const localePrefix = locale === "en" ? `/s/${site.slug}/en` : `/s/${site.slug}`;
  const localizedUrl = publicPath === "/" ? localePrefix : `${localePrefix}${publicPath}`;
  const koreanUrl = publicPath === "/" ? `/s/${site.slug}` : `/s/${site.slug}${publicPath}`;
  const englishUrl =
    publicPath === "/" ? `/s/${site.slug}/en` : `/s/${site.slug}/en${publicPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: localizedUrl,
      languages: isEnglishEnabled(page.publishedJson)
        ? { en: englishUrl, ko: koreanUrl, "x-default": koreanUrl }
        : undefined,
    },
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
  const { locale, publicPath } = resolveLocalizedPath(pagePath);
  const [published, posts, popups] = await Promise.all([
    getPublishedSitePageBySlug(siteSlug, publicPath),
    getPublishedPostsBySiteSlug(siteSlug),
    getActivePopupsBySiteSlug(siteSlug),
  ]);

  if (
    !published ||
    !published.page ||
    (locale === "en" && !isEnglishEnabled(published.page.publishedJson))
  ) {
    notFound();
  }

  return (
    <PublicSiteRenderer
      contactResult={firstSearchValue(query?.contact)}
      contactEnabled={!published.isDemo}
      description={published.seo?.description ?? ""}
      locale={locale}
      pagePath={publicPath}
      popups={popups}
      posts={posts}
      publishedJson={published.page.publishedJson}
      siteName={published.site.name}
      siteSlug={published.site.slug}
    />
  );
}
