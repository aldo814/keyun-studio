import Link from "next/link";
import { ChevronRight, ImageIcon, Inbox, Megaphone, Newspaper } from "lucide-react";

import {
  getDashboardContactSubmissions,
  getDashboardContentBoards,
  getDashboardMediaAssets,
  getDashboardPopups,
  getDashboardPosts,
} from "@/features/dashboard/queries";

export default async function DashboardContentPage() {
  const [posts, boards, submissions, mediaAssets, popups] = await Promise.all([
    getDashboardPosts(),
    getDashboardContentBoards(),
    getDashboardContactSubmissions(),
    getDashboardMediaAssets(),
    getDashboardPopups(),
  ]);
  const publishedPosts = posts.filter((post) => post.status === "published").length;
  const newSubmissions = submissions.filter((submission) => submission.status === "new").length;
  const activePopups = popups.filter((popup) => popup.status === "active").length;
  const contentItems = [
    {
      title: "게시글",
      description: "공지사항, 블로그, FAQ 등 사이트에 노출되는 글",
      href: "/dashboard/content/posts",
      icon: Newspaper,
      metric: `${posts.length.toLocaleString("ko-KR")}개`,
      metricLabel: `게시 ${publishedPosts.toLocaleString("ko-KR")}개`,
    },
    {
      title: "게시판",
      description: "공지사항, 블로그, FAQ 등 게시글을 담는 공간",
      href: "/dashboard/content/boards",
      icon: Newspaper,
      metric: `${boards.length.toLocaleString("ko-KR")}개`,
      metricLabel: "분류",
    },
    {
      title: "문의폼",
      description: "상담 신청, 견적 문의, 일반 문의 응답",
      href: "/dashboard/content/forms",
      icon: Inbox,
      metric: `${submissions.length.toLocaleString("ko-KR")}개`,
      metricLabel: `신규 ${newSubmissions.toLocaleString("ko-KR")}개`,
      badge: newSubmissions,
    },
    {
      title: "미디어",
      description: "이미지, 파일 업로드 및 섹션 재사용",
      href: "/dashboard/content/media",
      icon: ImageIcon,
      metric: `${mediaAssets.length.toLocaleString("ko-KR")}개`,
      metricLabel: "파일",
    },
    {
      title: "팝업",
      description: "기간·노출 위치·링크 설정이 있는 운영 팝업",
      href: "/dashboard/content/popups",
      icon: Megaphone,
      metric: `${popups.length.toLocaleString("ko-KR")}개`,
      metricLabel: `활성 ${activePopups.toLocaleString("ko-KR")}개`,
    },
  ];

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">콘텐츠</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">콘텐츠 관리</h1>
          </div>
          <Link
            href="/dashboard/content/posts/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            새 게시물
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white">
          {contentItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 border-b border-border/60 px-5 py-4 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.title}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-sm font-semibold tabular-nums text-foreground">{item.metric}</span>
                  <p className="text-xs text-muted-foreground">{item.metricLabel}</p>
                </div>

                <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
