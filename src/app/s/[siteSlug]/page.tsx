import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublishedSiteBySlug } from "@/features/dashboard/queries";

type PublishedSitePageProps = {
  params: Promise<{
    siteSlug: string;
  }>;
};

function getSections(publishedJson: unknown) {
  if (
    publishedJson &&
    typeof publishedJson === "object" &&
    "sections" in publishedJson &&
    Array.isArray(publishedJson.sections)
  ) {
    return publishedJson.sections.map((section) => String(section));
  }

  return ["hero", "content", "cta"];
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

  const sections = getSections(published.page.publishedJson);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative isolate overflow-hidden px-6 py-24 sm:px-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(37,99,235,0.55),transparent_34%),linear-gradient(180deg,#020617,#000)]" />
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-blue-300">Published Site</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-normal sm:text-7xl">
            {published.site.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            {published.seo?.description ||
              "키운 스튜디오에서 게시한 사이트입니다."}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-16 sm:px-10 md:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-6"
          >
            <p className="text-sm font-medium text-blue-300">{section}</p>
            <div className="mt-8 h-28 rounded-lg bg-blue-500/10" />
          </div>
        ))}
      </section>
    </main>
  );
}
