"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MoreHorizontal, Pin, Plus, Search } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  initialPosts,
  statusLabel,
  statusOptions,
  statusTone,
} from "@/features/dashboard/content-posts-data";
import { cn } from "@/lib/utils";

export function ContentPostsManager() {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");

  const searchedPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return posts.filter((post) => {
      const keywordMatched =
        !keyword ||
        [post.title, post.summary, post.category, post.author]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return keywordMatched;
    });
  }, [posts, query]);

  const filteredPosts = useMemo(() => {
    return searchedPosts.filter((post) => {
      return activeStatus === "all" || post.status === activeStatus;
    });
  }, [activeStatus, searchedPosts]);

  function getStatusCount(statusValue: string) {
    if (statusValue === "all") return searchedPosts.length;
    return searchedPosts.filter((post) => post.status === statusValue).length;
  }

  function togglePinned(postId: number) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, pinned: !post.pinned } : post,
      ),
    );
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              콘텐츠 / 게시글
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              게시판
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              공지사항, 블로그, FAQ, 이벤트 글을 작성하고 사이트에 노출되는
              상태를 관리합니다.
            </p>
          </div>
          <Link
            className={buttonVariants({ size: "default", variant: "default" })}
            href="/dashboard/content/posts/new"
          >
            <Plus />
            새 게시물
          </Link>
        </div>

        <section className="space-y-4">
          <Card className="rounded-lg p-4 shadow-sm">
            <form
              className="flex flex-col gap-3 lg:flex-row lg:items-center"
              onSubmit={(event) => {
                event.preventDefault();
                setQuery(searchText);
              }}
            >
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="제목, 작성자, 카테고리 검색"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>
              <Button type="submit">
                <Search />
                검색
              </Button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  className={cn(
                    "h-8 rounded-full px-3 text-xs font-semibold transition-colors",
                    activeStatus === status.value
                      ? "bg-slate-950 text-white"
                      : "bg-muted text-muted-foreground hover:bg-slate-200",
                  )}
                  type="button"
                  onClick={() => setActiveStatus(status.value)}
                >
                  {status.label} ({getStatusCount(status.value)}건)
                </button>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden rounded-lg shadow-sm">
            <div className="grid grid-cols-[88px_minmax(260px,1fr)_110px_96px_92px] border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold text-muted-foreground">
              <span>게시판</span>
              <span>제목</span>
              <span>상태</span>
              <span>조회</span>
              <span className="text-right">관리</span>
            </div>

            <div className="divide-y divide-border">
              {filteredPosts.length ? (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className={cn(
                      "grid w-full cursor-pointer grid-cols-[88px_minmax(260px,1fr)_110px_96px_92px] items-center px-4 py-4 text-left transition-colors",
                      "bg-card hover:bg-blue-50/70",
                    )}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/dashboard/content/posts/${post.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/dashboard/content/posts/${post.id}`);
                      }
                    }}
                  >
                    <span className="text-sm font-medium text-blue-600">
                      {post.board}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        {post.pinned ? (
                          <Pin className="size-3.5 fill-blue-600 text-blue-600" />
                        ) : null}
                        <span className="truncate font-semibold">{post.title}</span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {post.category} · {post.summary}
                      </span>
                    </span>
                    <StatusBadge tone={statusTone(post.status)}>
                      {statusLabel(post.status)}
                    </StatusBadge>
                    <span className="text-sm text-muted-foreground">
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          togglePinned(post.id);
                        }}
                      >
                        <Pin />
                      </Button>
                      <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreHorizontal />
                      </Button>
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-16 text-center">
                  <p className="text-sm font-medium">
                    조건에 맞는 게시글이 없습니다.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    검색어를 바꾸거나 필터를 초기화해 주세요.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
