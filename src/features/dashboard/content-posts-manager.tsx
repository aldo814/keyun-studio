"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  CalendarClock,
  CheckCircle2,
  DraftingCompass,
  Eye,
  FileText,
  Pencil,
  Pin,
  Plus,
  Search,
} from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { ActionFeedback } from "@/components/dashboard/action-feedback";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleContentPostPinned } from "@/features/dashboard/actions";
import {
  type DashboardPost,
  statusLabel,
  statusOptions,
  statusTone,
} from "@/features/dashboard/content-posts-data";
import { usePosts } from "@/lib/posts-store";
import { cn } from "@/lib/utils";

type Props = {
  notice?: string;
  posts: DashboardPost[];
  useLocalFallback?: boolean;
};

export function ContentPostsManager({ notice, posts, useLocalFallback = false }: Props) {
  const router = useRouter();
  const localPosts = usePosts();
  const visiblePosts = useLocalFallback ? localPosts.posts : posts;
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const summary = useMemo(() => {
    return {
      all: visiblePosts.length,
      draft: visiblePosts.filter((post) => post.status === "draft").length,
      pinned: visiblePosts.filter((post) => post.pinned).length,
      published: visiblePosts.filter((post) => post.status === "published").length,
      scheduled: visiblePosts.filter((post) => post.status === "scheduled").length,
      views: visiblePosts.reduce((total, post) => total + post.views, 0),
    };
  }, [visiblePosts]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return visiblePosts.filter((post) => {
      const matchesKeyword =
        !keyword ||
        [post.title, post.summary, post.category, post.author, post.board]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const matchesStatus =
        activeStatus === "all" || post.status === activeStatus;
      return matchesKeyword && matchesStatus;
    });
  }, [visiblePosts, search, activeStatus]);

  function getStatusCount(statusValue: string) {
    const keyword = search.trim().toLowerCase();
    const base = visiblePosts.filter((post) => {
      const matchesKeyword =
        !keyword ||
        [post.title, post.summary, post.category, post.author, post.board]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      return matchesKeyword;
    });
    if (statusValue === "all") return base.length;
    return base.filter((p) => p.status === statusValue).length;
  }

  const columns = useMemo<ColumnDef<DashboardPost>[]>(
    () => [
      {
        accessorKey: "title",
        header: "제목",
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                {post.pinned && (
                  <Pin className="size-3 shrink-0 fill-blue-500 text-blue-500" />
                )}
                <span className="truncate text-sm font-semibold text-foreground">
                  {post.title}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-blue-500">{post.board}</span>
                {post.category && (
                  <>
                    <span className="text-border">·</span>
                    <span>{post.category}</span>
                  </>
                )}
                {post.summary && (
                  <>
                    <span className="text-border">·</span>
                    <span className="truncate">{post.summary}</span>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "author",
        header: "작성자",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.author}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "상태",
        cell: ({ row }) => (
          <StatusBadge tone={statusTone(row.original.status)}>
            {statusLabel(row.original.status)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "views",
        header: "조회",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {row.original.views.toLocaleString("ko-KR")}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "수정일",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {row.original.updatedAt}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
          const post = row.original;
          const publicHref =
            post.status === "published" && post.siteSlug
              ? `/s/${post.siteSlug}/posts/${post.slug || post.id}`
              : "";

          return (
            <div
              className="flex items-center justify-end gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {publicHref ? (
                <Link
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  href={publicHref}
                  target="_blank"
                  title="공개 글 보기"
                >
                  <Eye className="size-3.5" />
                </Link>
              ) : null}
              {useLocalFallback ? (
                <button
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted",
                    post.pinned ? "text-blue-500" : "text-muted-foreground",
                  )}
                  title="상단 고정"
                  type="button"
                  onClick={() => localPosts.togglePinned(post.id)}
                >
                  <Pin className={cn("size-3.5", post.pinned && "fill-blue-500")} />
                </button>
              ) : (
                <form action={toggleContentPostPinned}>
                  <input name="post_id" type="hidden" value={post.id} />
                  <input name="pinned" type="hidden" value={String(!post.pinned)} />
                  <button
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted",
                      post.pinned ? "text-blue-500" : "text-muted-foreground",
                    )}
                    title="상단 고정"
                    type="submit"
                  >
                    <Pin className={cn("size-3.5", post.pinned && "fill-blue-500")} />
                  </button>
                </form>
              )}
              <button
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="수정"
                type="button"
                onClick={() =>
                  router.push("/dashboard/content/posts/" + post.id + "/edit")
                }
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    [router, useLocalFallback, localPosts],
  );

  const table = useReactTable({
    data: filteredPosts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">콘텐츠 / 게시글</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">게시글 관리</h1>
          </div>
          <Link
            className={buttonVariants({ size: "sm" })}
            href="/dashboard/content/posts/new"
          >
            <Plus className="size-4" />
            새 게시물
          </Link>
        </div>

        <ActionFeedback notice={notice} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            className={cn(
              "rounded-xl border bg-white p-4 text-left transition-colors hover:border-foreground",
              activeStatus === "all" ? "border-foreground" : "border-border",
            )}
            type="button"
            onClick={() => setActiveStatus("all")}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">전체 글</p>
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {summary.all.toLocaleString("ko-KR")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              고정글 {summary.pinned.toLocaleString("ko-KR")}개
            </p>
          </button>

          <button
            className={cn(
              "rounded-xl border bg-white p-4 text-left transition-colors hover:border-foreground",
              activeStatus === "published" ? "border-foreground" : "border-border",
            )}
            type="button"
            onClick={() => setActiveStatus("published")}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">게시 중</p>
              <CheckCircle2 className="size-5 text-emerald-500" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {summary.published.toLocaleString("ko-KR")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              방문자에게 공개된 글
            </p>
          </button>

          <button
            className={cn(
              "rounded-xl border bg-white p-4 text-left transition-colors hover:border-foreground",
              activeStatus === "draft" ? "border-foreground" : "border-border",
            )}
            type="button"
            onClick={() => setActiveStatus("draft")}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">임시저장</p>
              <DraftingCompass className="size-5 text-slate-500" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {summary.draft.toLocaleString("ko-KR")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              아직 공개하지 않은 글
            </p>
          </button>

          <button
            className={cn(
              "rounded-xl border bg-white p-4 text-left transition-colors hover:border-foreground",
              activeStatus === "scheduled" ? "border-foreground" : "border-border",
            )}
            type="button"
            onClick={() => setActiveStatus("scheduled")}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">예약</p>
              <CalendarClock className="size-5 text-amber-500" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {summary.scheduled.toLocaleString("ko-KR")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              총 조회 {summary.views.toLocaleString("ko-KR")}
            </p>
          </button>
        </div>

        {/* 검색 + 필터 */}
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 bg-white pl-9"
              placeholder="제목, 작성자, 카테고리 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 border-b border-border">
            {statusOptions.map((s) => (
              <button
                key={s.value}
                className={cn(
                  "relative -mb-px flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                  activeStatus === s.value
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                type="button"
                onClick={() => setActiveStatus(s.value)}
              >
                {s.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                    activeStatus === s.value
                      ? "bg-blue-50 text-blue-600"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {getStatusCount(s.value)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-10 px-4 text-xs font-semibold text-muted-foreground",
                        header.column.id === "title" && "min-w-[320px]",
                        header.column.id === "actions" && "w-[100px]",
                        header.column.id === "views" && "w-[80px]",
                        header.column.id === "status" && "w-[100px]",
                        header.column.id === "author" && "w-[100px]",
                        header.column.id === "updatedAt" && "w-[100px]",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-blue-50/40"
                    role="link"
                    tabIndex={0}
                    onClick={() =>
                      router.push("/dashboard/content/posts/" + row.original.id)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push("/dashboard/content/posts/" + row.original.id);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="py-20 text-center"
                    colSpan={columns.length}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="size-8 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {search ? "검색 결과가 없습니다" : "게시글이 없습니다"}
                      </p>
                      {!search && (
                        <Link
                          className={buttonVariants({ size: "sm", variant: "outline" })}
                          href="/dashboard/content/posts/new"
                        >
                          <Plus className="size-4" />
                          첫 게시물 작성하기
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
