import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Clock,
  Edit3,
  FileText,
  ImageIcon,
  LayoutTemplate,
  Search,
  Send,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardOverview } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";

const operationMetrics = [
  {
    id: "visitors",
    label: "방문자수",
    value: "1,245",
    caption: "최근 7일",
    href: "#visitors",
    delta: "+12%",
    positive: true,
  },
  {
    id: "inquiries",
    label: "문의현황",
    value: "12",
    caption: "미확인 3건",
    href: "#inquiries",
    delta: "3건 대기",
    positive: false,
  },
  {
    id: "pages",
    label: "페이지수",
    value: "18",
    caption: "게시 14개",
    href: "#pages",
    delta: "+2",
    positive: true,
  },
  {
    id: "storage",
    label: "저장공간",
    value: "2.3GB",
    caption: "전체 10GB",
    href: "#storage",
    delta: "23% 사용",
    positive: true,
  },
];

const chartBars = [
  { day: "월", value: 38 },
  { day: "화", value: 56 },
  { day: "수", value: 44 },
  { day: "목", value: 72 },
  { day: "금", value: 88 },
  { day: "토", value: 63 },
  { day: "일", value: 79 },
];

const notifications = [
  { title: "새 문의 3건", description: "문의폼 확인이 필요합니다.", type: "danger", href: "#inquiries" },
  { title: "도메인 만료 D-30", description: "연결된 도메인 갱신 일정을 확인하세요.", type: "warning", href: "/dashboard/settings" },
  { title: "업데이트 안내", description: "게시글 관리 화면이 개선되었습니다.", type: "info", href: "/dashboard/content/posts" },
];

const quickActions = [
  { label: "텍스트 수정", href: "/dashboard/editor/demo_site_keyun", icon: Edit3 },
  { label: "이미지 관리", href: "/dashboard/content/media", icon: ImageIcon },
  { label: "게시판", href: "/dashboard/content/posts", icon: FileText },
  { label: "SEO", href: "/dashboard/sites/demo_site_keyun/settings", icon: Search },
  { label: "도메인", href: "/dashboard/settings", icon: Settings },
];

const recentEdits = [
  { date: "06.05", title: "메인 비주얼 수정", type: "디자인 편집", typeKey: "design" },
  { date: "06.04", title: "회사소개 섹션 추가", type: "페이지", typeKey: "page" },
  { date: "06.03", title: "문의폼 생성", type: "콘텐츠", typeKey: "content" },
];

const dotColorMap: Record<string, string> = {
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-blue-500",
};

const editIconBgMap: Record<string, string> = {
  design: "bg-blue-100",
  page: "bg-violet-100",
  content: "bg-emerald-100",
};

const editIconColorMap: Record<string, string> = {
  design: "text-blue-600",
  page: "text-violet-600",
  content: "text-emerald-600",
};

export default async function DashboardPage() {
  const { sites } = await getDashboardOverview();
  const site = sites[0] ?? {
    id: "demo_site_keyun",
    name: "키운 스튜디오 데모",
    slug: "keyun-demo",
    status: "draft",
    updatedAt: "2026.06.05",
    publishedAt: "-",
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* 섹션 0: 운영 지표 카드 (최상단) */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {operationMetrics.map((metric, idx) => (
            <Link key={metric.id} href={metric.href} className="group" id={metric.id}>
              <Card className={cn(
                "relative overflow-hidden rounded-xl shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-0.5",
                idx === 0 && "bg-gradient-to-br from-blue-600 to-blue-500 text-white border-blue-500",
              )}>
                {idx === 0 && (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_-20%,rgba(255,255,255,0.15),transparent)]" />
                )}
                <CardContent className="relative p-5">
                  <p className={cn(
                    "text-sm font-medium",
                    idx === 0 ? "text-blue-100" : "text-muted-foreground",
                  )}>
                    {metric.label}
                  </p>
                  <p className={cn(
                    "mt-4 text-3xl font-semibold tracking-normal transition-colors",
                    idx === 0 ? "text-white" : "group-hover:text-blue-600",
                  )}>
                    {metric.value}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className={cn("text-xs", idx === 0 ? "text-blue-200" : "text-muted-foreground")}>
                      {metric.caption}
                    </p>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      idx === 0
                        ? "bg-white/20 text-white"
                        : metric.positive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600",
                    )}>
                      {metric.positive && <TrendingUp className="size-3" />}
                      {metric.delta}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        {/* 섹션 1: 히어로 배너 */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(59,110,240,0.08),transparent)]" />
          <div className="relative grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-100">
                <span className="size-1.5 rounded-full bg-blue-500" />
                KEYUN Dashboard
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
                안녕하세요 은영님
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                오늘도 사이트를 성장시켜보세요. 편집, 콘텐츠, 문의, 게시 상태를
                한 화면에서 빠르게 확인할 수 있습니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  className={buttonVariants({ size: "lg", variant: "default" })}
                  href={`/dashboard/editor/${site.id}`}
                >
                  사이트 편집하기
                  <ArrowRight />
                </Link>
                <Link
                  className={buttonVariants({ size: "lg", variant: "outline" })}
                  href="#ai-helper"
                >
                  <Sparkles />
                  AI로 콘텐츠 생성
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{site.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">/s/{site.slug}</p>
                </div>
                <StatusBadge tone={site.status}>{site.status}</StatusBadge>
              </div>
              <div className="mt-5 aspect-[16/10] overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                <div className="flex h-8 items-center gap-1.5 border-b border-border px-3">
                  <span className="size-2 rounded-full bg-red-300" />
                  <span className="size-2 rounded-full bg-amber-300" />
                  <span className="size-2 rounded-full bg-emerald-300" />
                  <span className="ml-2 flex-1 rounded-full bg-slate-100 px-3 py-0.5 text-[10px] text-slate-400">
                    keyun.studio/s/{site.slug}
                  </span>
                </div>
                <div className="grid h-[calc(100%-2rem)] grid-cols-[1fr_0.8fr] gap-4 bg-gradient-to-br from-white via-blue-50 to-white p-5">
                  <div className="self-center">
                    <div className="h-3 w-20 rounded-full bg-blue-100" />
                    <div className="mt-4 h-5 w-36 rounded bg-slate-950" />
                    <div className="mt-2 h-5 w-28 rounded bg-blue-600" />
                    <div className="mt-4 h-2 w-44 rounded bg-slate-200" />
                    <div className="mt-2 h-2 w-32 rounded bg-slate-200" />
                  </div>
                  <div className="self-center rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-sm">
                    <LayoutTemplate className="size-10 text-blue-600" />
                    <div className="mt-4 h-2 w-full rounded bg-blue-100" />
                    <div className="mt-2 h-2 w-2/3 rounded bg-blue-100" />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">마지막 수정: {site.updatedAt}</p>
                <a
                  className="text-[11px] text-blue-600 hover:underline"
                  href={`/s/${site.slug}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  사이트 보기 ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 3: 운영 현황 + 알림 */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>운영 현황</CardTitle>
              <CardDescription>
                위에는 흐름을, 아래 표에서는 숫자를 눌러 관련 영역으로 이동합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* SVG 그라디언트 차트 */}
              <div className="relative h-52 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white px-5 pb-7 pt-4">
                <svg
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 700 180"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3b6ef0" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#3b6ef0" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#6d9ef7" />
                      <stop offset="100%" stopColor="#3b6ef0" />
                    </linearGradient>
                  </defs>
                  {/* 격자선 */}
                  {[40, 80, 120, 160].map((y) => (
                    <line key={y} stroke="#e8eef8" strokeWidth="1" x1="0" x2="700" y1={y} y2={y} />
                  ))}
                  {/* 면적 채우기 */}
                  <path
                    d="M0,180 L0,149 C100,149 100,110 200,122 C300,133 300,68 400,50 C500,32 500,60 600,81 C650,92 700,37 700,37 L700,180 Z"
                    fill="url(#areaGrad)"
                  />
                  {/* 라인 */}
                  <path
                    d="M0,149 C100,149 100,110 200,122 C300,133 300,68 400,50 C500,32 500,60 600,81 C650,92 700,37 700,37"
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  />
                  {/* 데이터 포인트 */}
                  {[
                    [0, 149], [100, 110], [200, 122], [300, 68], [400, 50], [500, 81], [600, 37],
                  ].map(([cx, cy], i) => (
                    <circle
                      key={i}
                      cx={cx === 0 ? 4 : cx === 600 ? 696 : cx}
                      cy={cy}
                      fill={i === 6 ? "#3b6ef0" : "white"}
                      r="4"
                      stroke="#3b6ef0"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
                {/* X축 레이블 */}
                <div className="absolute bottom-1.5 left-0 right-0 flex justify-around px-2">
                  {chartBars.map((bar) => (
                    <span key={bar.day} className="text-[10px] text-muted-foreground">{bar.day}</span>
                  ))}
                </div>
                {/* 최댓값 뱃지 */}
                <div className="absolute right-4 top-3 flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                  <TrendingUp className="size-3" />
                  이번 주 최고 79
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-lg border border-border">
                <div className="grid grid-cols-[1fr_140px_100px] bg-muted/50 px-4 py-3 text-xs font-semibold text-muted-foreground">
                  <span>항목</span>
                  <span>수치</span>
                  <span>이동</span>
                </div>
                {operationMetrics.map((metric) => (
                  <div
                    key={`${metric.id}-row`}
                    className="grid grid-cols-[1fr_140px_100px] border-t border-border px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{metric.label}</span>
                    <Link className="font-semibold text-blue-600" href={metric.href}>
                      {metric.value}
                    </Link>
                    <Link className="text-muted-foreground hover:text-foreground" href={metric.href}>
                      이동 →
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 bg-gradient-to-b from-slate-950 to-slate-900 text-white shadow-md">
            <CardHeader>
              <CardTitle className="text-white">최근 알림</CardTitle>
              <CardDescription className="text-white/50">오늘 확인하면 좋은 운영 이슈입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.map((notif) => (
                <Link
                  key={notif.title}
                  href={notif.href}
                  className="group flex items-start gap-3 rounded-lg border border-white/8 bg-white/5 p-3.5 transition-colors hover:border-blue-400/30 hover:bg-white/10"
                >
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", dotColorMap[notif.type])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white transition-colors group-hover:text-blue-300">{notif.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-white/50">{notif.description}</p>
                  </div>
                  <ArrowRight className="size-3.5 shrink-0 text-white/30 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
              <Link
                href="#"
                className="mt-1 flex h-9 w-full items-center justify-center rounded-lg border border-white/10 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
              >
                전체 알림 보기
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* 섹션 4: 사이트 미리보기 + 빠른 작업 */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>사이트 미리보기</CardTitle>
                <CardDescription className="mt-1">현재 대표 사이트의 PC 화면 기준 미리보기입니다.</CardDescription>
              </div>
              <Button render={<Link href={`/dashboard/editor/${site.id}`} />} size="sm">
                편집하기
                <ArrowRight />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <div className="flex h-10 items-center justify-between border-b border-border px-4">
                  <span className="text-xs font-semibold">KEYUN Preview</span>
                  <span className="text-xs text-muted-foreground">PC</span>
                </div>
                <div className="grid h-[calc(100%-2.5rem)] grid-cols-2 gap-6 bg-gradient-to-br from-white via-blue-50 to-white p-8">
                  <div className="self-center">
                    <div className="h-3 w-28 rounded-full bg-blue-100" />
                    <div className="mt-6 h-7 w-56 rounded bg-slate-950" />
                    <div className="mt-3 h-7 w-40 rounded bg-blue-600" />
                    <div className="mt-6 h-2 w-64 rounded bg-slate-200" />
                    <div className="mt-2 h-2 w-48 rounded bg-slate-200" />
                    <div className="mt-8 h-10 w-32 rounded-lg bg-blue-600" />
                  </div>
                  <div className="self-center rounded-3xl border border-blue-100 bg-white/70 p-8 shadow-sm">
                    <LayoutTemplate className="size-16 text-blue-600" />
                    <div className="mt-8 h-3 w-full rounded bg-blue-100" />
                    <div className="mt-3 h-3 w-2/3 rounded bg-blue-100" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-blue-100/60 bg-gradient-to-b from-blue-50/40 to-white shadow-sm">
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
              <CardDescription>자주 쓰는 기능으로 바로 이동합니다.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    className="group flex h-11 items-center justify-between rounded-lg border border-border bg-white px-3 text-sm font-medium shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/60 hover:shadow"
                    href={action.href}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={cn(
                        "flex size-7 items-center justify-center rounded-md transition-colors group-hover:bg-blue-100",
                        idx === 0 ? "bg-blue-100" : "bg-muted",
                      )}>
                        <Icon className={cn(
                          "size-4 transition-colors group-hover:text-blue-600",
                          idx === 0 ? "text-blue-600" : "text-muted-foreground",
                        )} />
                      </span>
                      {action.label}
                    </span>
                    <ArrowRight className="size-4 translate-x-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>

        {/* 섹션 5: AI 도우미 + 최근 수정 내역 */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="relative overflow-hidden rounded-lg bg-slate-950 text-white shadow-sm" id="ai-helper">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_60%,rgba(59,110,240,0.18),transparent)]" />
            <CardHeader className="relative">
              <div className="flex items-center gap-2">
                <Bot className="size-5 text-blue-300" />
                <CardTitle>AI 도우미</CardTitle>
              </div>
              <CardDescription className="text-white/60">
                문구 작성, 섹션 아이디어, SEO 초안을 빠르게 요청합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-white/70">무엇을 도와드릴까요?</p>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1 pl-4">
                <span className="flex-1 text-sm text-white/50">회사소개 문구 작성해줘</span>
                <Button
                  size="sm"
                  className="border-0 bg-blue-600 text-white hover:bg-blue-500"
                >
                  <Send className="size-4" />
                  요청
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["히어로 문구", "블로그 제목", "FAQ 생성"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition-colors hover:border-blue-400/40 hover:bg-blue-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <p className="mt-5 text-[11px] text-white/30">✦ AI 응답 기능은 곧 지원 예정입니다.</p>
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>최근 수정 내역</CardTitle>
              <CardDescription>최근 작업한 변경 사항입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentEdits.map((edit) => (
                <div key={`${edit.date}-${edit.title}`} className="flex gap-3 rounded-lg border border-border p-3">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg",
                      editIconBgMap[edit.typeKey],
                    )}
                  >
                    <Clock className={cn("size-4", editIconColorMap[edit.typeKey])} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{edit.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {edit.date} · {edit.type}
                    </p>
                  </div>
                </div>
              ))}
              <Link
                href="#"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-1 w-full")}
              >
                전체 내역 보기
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
