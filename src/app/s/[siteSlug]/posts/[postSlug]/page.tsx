import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getPublishedPostBySlug,
  getPublishedSiteBySlug,
} from "@/features/dashboard/queries";

type PublicPostDetailPageProps = {
  params: Promise<{
    postSlug: string;
    siteSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PublicPostDetailPageProps): Promise<Metadata> {
  const { postSlug, siteSlug } = await params;
  const [published, post] = await Promise.all([
    getPublishedSiteBySlug(siteSlug),
    getPublishedPostBySlug(siteSlug, postSlug),
  ]);

  if (!published || !post) {
    return {
      title: "Not Found",
      robots: {
        follow: false,
        index: false,
      },
    };
  }

  return {
    description: post.summary,
    openGraph: {
      description: post.summary,
      title: post.title,
      type: "article",
    },
    title: `${post.title} | ${published.site.name}`,
  };
}

export default async function PublicPostDetailPage({
  params,
}: PublicPostDetailPageProps) {
  const { postSlug, siteSlug } = await params;
  const [published, post] = await Promise.all([
    getPublishedSiteBySlug(siteSlug),
    getPublishedPostBySlug(siteSlug, postSlug),
  ]);

  if (!published || !post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-slate-950">
      <article className="mx-auto max-w-3xl">
        <Link
          className="text-sm font-semibold text-slate-500 hover:text-slate-950"
          href={`/s/${siteSlug}/posts`}
        >
          ← 게시글 목록
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <Link
              className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-600 hover:bg-blue-100"
              href={`/s/${siteSlug}/posts?board=${encodeURIComponent(post.board)}`}
            >
              {post.board}
            </Link>
            {post.category ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                {post.category}
              </span>
            ) : null}
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-normal">
            {post.title}
          </h1>
          {post.summary ? (
            <p className="mt-4 text-lg leading-8 text-slate-500">{post.summary}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.updatedAt}</span>
          </div>
        </header>

        <div
          className="prose prose-slate mt-10 max-w-none [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:leading-8 [&_p+_p]:mt-5 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: post.contentHtml || "<p>본문이 없습니다.</p>" }}
        />
      </article>
    </main>
  );
}
