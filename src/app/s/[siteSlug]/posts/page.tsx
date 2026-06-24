import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getPublishedPostsBySiteSlug,
  getPublishedSiteBySlug,
} from "@/features/dashboard/queries";

type PublicPostsPageProps = {
  params: Promise<{
    siteSlug: string;
  }>;
  searchParams?: Promise<{
    board?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export async function generateMetadata({
  params,
}: PublicPostsPageProps): Promise<Metadata> {
  const { siteSlug } = await params;
  const published = await getPublishedSiteBySlug(siteSlug);

  if (!published) {
    return {
      title: "Not Found",
      robots: {
        follow: false,
        index: false,
      },
    };
  }

  return {
    description: `${published.site.name}의 게시글 목록입니다.`,
    title: `게시글 | ${published.site.name}`,
  };
}

export default async function PublicPostsPage({
  params,
  searchParams,
}: PublicPostsPageProps) {
  const { siteSlug } = await params;
  const query = await searchParams;
  const [published, posts] = await Promise.all([
    getPublishedSiteBySlug(siteSlug),
    getPublishedPostsBySiteSlug(siteSlug),
  ]);

  if (!published) {
    notFound();
  }

  const boardCounts = new Map<string, number>();

  posts.forEach((post) => {
    boardCounts.set(post.board, (boardCounts.get(post.board) ?? 0) + 1);
  });

  const boardItems = Array.from(boardCounts.entries());
  const requestedBoard = firstSearchValue(query?.board);
  const activeBoard = requestedBoard && boardCounts.has(requestedBoard) ? requestedBoard : "";
  const filteredPosts = activeBoard
    ? posts.filter((post) => post.board === activeBoard)
    : posts;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              className="text-sm font-semibold text-slate-500 hover:text-slate-950"
              href={`/s/${siteSlug}`}
            >
              ← 사이트로 돌아가기
            </Link>
            <h1 className="mt-5 text-4xl font-bold tracking-normal">
              {activeBoard || "게시글"}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {activeBoard
                ? `${published.site.name}의 ${activeBoard} 게시글입니다.`
                : `${published.site.name}에서 공개한 소식과 콘텐츠입니다.`}
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-500">
            총 {filteredPosts.length.toLocaleString("ko-KR")}건
          </span>
        </div>

        {posts.length ? (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              <Link
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  activeBoard
                    ? "border-slate-200 bg-white text-slate-500 hover:text-slate-950"
                    : "border-slate-950 bg-slate-950 text-white"
                }`}
                href={`/s/${siteSlug}/posts`}
              >
                전체 ({posts.length.toLocaleString("ko-KR")}건)
              </Link>
              {boardItems.map(([board, count]) => (
                <Link
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    activeBoard === board
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-500 hover:text-slate-950"
                  }`}
                  href={`/s/${siteSlug}/posts?board=${encodeURIComponent(board)}`}
                  key={board}
                >
                  {board} ({count.toLocaleString("ko-KR")}건)
                </Link>
              ))}
            </div>

            {filteredPosts.length ? (
              <div className="grid gap-4">
                {filteredPosts.map((post) => (
                  <Link
                    className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:bg-blue-50/30"
                    href={`/s/${siteSlug}/posts/${post.slug || post.id}`}
                    key={post.id}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-600">
                        {post.board}
                      </span>
                      {post.category ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                          {post.category}
                        </span>
                      ) : null}
                      {post.pinned ? (
                        <span className="rounded-full bg-slate-950 px-2.5 py-1 text-white">
                          고정
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-4 text-2xl font-bold tracking-normal group-hover:text-blue-600">
                      {post.title}
                    </h2>
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-500">
                      {post.summary || post.content}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{post.updatedAt}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="text-lg font-bold">선택한 게시판에 공개된 글이 없습니다.</p>
                <p className="mt-3 text-sm text-slate-500">
                  다른 게시판을 선택하거나 전체 목록을 확인해 주세요.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-bold">아직 공개된 게시글이 없습니다.</p>
            <p className="mt-3 text-sm text-slate-500">
              관리자에서 게시 상태로 저장하면 이곳에 노출됩니다.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
