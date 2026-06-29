import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSiteEditorState } from "@/features/dashboard/queries";
import { PublicSiteRenderer } from "@/features/site/public-site-renderer";

type DraftPreviewPageProps = {
  params: Promise<{
    siteId: string;
  }>;
  searchParams?: Promise<{
    pageId?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "초안 미리보기",
  robots: {
    index: false,
    follow: false,
  },
};

function firstSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DraftPreviewPage({
  params,
  searchParams,
}: DraftPreviewPageProps) {
  const { siteId } = await params;
  const query = await searchParams;
  const pageId = firstSearchValue(query?.pageId);
  const state = await getSiteEditorState(siteId, pageId);

  if (!state) {
    notFound();
  }

  const publicPath =
    state.page.path === "/"
      ? `/s/${state.site.slug}`
      : `/s/${state.site.slug}${state.page.path}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Draft Preview
            </p>
            <h1 className="text-sm font-semibold text-slate-950">
              {state.site.name} · {state.page.title} 초안
            </h1>
            <p className="mt-1 text-xs text-slate-500">{publicPath}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              href={`/dashboard/sites/${state.site.id}/sitemap`}
            >
              사이트맵으로
            </Link>
            <Link
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              href={`/dashboard/editor/${state.site.id}`}
            >
              편집기로 돌아가기
            </Link>
            {state.site.status === "published" ? (
              <Link
                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-950 px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                href={publicPath}
                target="_blank"
              >
                게시된 페이지 보기
              </Link>
            ) : null}
          </div>
        </div>
      </div>
      <PublicSiteRenderer
        publishedJson={state.page.draftJson}
        siteName={state.site.name}
        siteSlug={state.site.slug}
      />
    </div>
  );
}
