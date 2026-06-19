import Link from "next/link";
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
import { statusLabel, statusTone } from "@/features/dashboard/content-posts-data";
import { getDashboardPost } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ postId: string }>;
};

export default async function DashboardPostViewPage({ params }: Props) {
  const { postId } = await params;
  const post = await getDashboardPost(postId);

  if (!post) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <Link
            className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "mb-5")}
            href="/dashboard/content/posts"
          >
            <ArrowLeft />
            게시글 목록
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">게시글을 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "mb-5")}
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
                {post.category || "일반"}
              </span>
              {post.pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">
                  <Pin className="size-3" />
                  상단 고정
                </span>
              )}
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
              href={"/dashboard/content/posts/" + post.id + "/edit"}
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
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>본문</CardTitle>
              <CardDescription>사이트 게시판에 노출될 게시글 내용입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <article
                className="min-h-[360px] rounded-lg border border-border bg-white p-6 text-sm leading-7 text-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p+_p]:mt-4 [&_ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: post.contentHtml || "<p>본문이 없습니다.</p>" }}
              />
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>게시 정보</CardTitle>
                <CardDescription>운영자가 확인하는 기본 메타 정보입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { label: "작성자", value: post.author },
                  { label: "수정일", value: post.updatedAt },
                  { label: "조회수", value: post.views.toLocaleString("ko-KR") },
                  { label: "고정", value: post.pinned ? "사용 중" : "미사용" },
                ].map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center justify-between gap-3",
                      i < arr.length - 1 && "border-b border-border pb-3",
                    )}
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
