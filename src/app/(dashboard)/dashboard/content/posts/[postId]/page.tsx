import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Pencil, Pin } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  initialPosts,
  statusLabel,
  statusTone,
} from "@/features/dashboard/content-posts-data";
import { cn } from "@/lib/utils";

type DashboardPostViewPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function DashboardPostViewPage({
  params,
}: DashboardPostViewPageProps) {
  const { postId } = await params;
  const post = initialPosts.find((item) => String(item.id) === postId);

  if (!post) {
    notFound();
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              className={cn(
                buttonVariants({ size: "sm", variant: "ghost" }),
                "mb-5",
              )}
              href="/dashboard/content/posts"
            >
              <ArrowLeft />
              게시글 목록
            </Link>
            <p className="text-sm font-medium text-muted-foreground">
              콘텐츠 / 게시글 / 상세
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge tone={statusTone(post.status)}>
                {statusLabel(post.status)}
              </StatusBadge>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {post.board}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {post.category}
              </span>
              {post.pinned ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">
                  <Pin className="size-3" />
                  상단 고정
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-normal">
              {post.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {post.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              className={buttonVariants({ size: "default", variant: "outline" })}
              href="/dashboard/content/posts/new"
            >
              <Pencil />
              수정
            </Link>
            <Button variant="outline">
              <Eye />
              미리보기
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>본문</CardTitle>
              <CardDescription>사이트 게시판에 노출될 게시글 내용입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <article className="min-h-[360px] rounded-lg border border-border bg-white p-6 text-sm leading-7 text-foreground">
                {post.content.split("\n").map((line, index) => (
                  <p key={`${line}-${index}`} className={cn(index ? "mt-4" : "")}>
                    {line || "\u00a0"}
                  </p>
                ))}
              </article>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle>게시 정보</CardTitle>
                <CardDescription>운영자가 확인하는 기본 메타 정보입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <span className="text-muted-foreground">작성자</span>
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <span className="text-muted-foreground">수정일</span>
                  <span className="font-medium">{post.updatedAt}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <span className="text-muted-foreground">조회수</span>
                  <span className="font-medium">{post.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">고정</span>
                  <span className="font-medium">
                    {post.pinned ? "사용 중" : "미사용"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
