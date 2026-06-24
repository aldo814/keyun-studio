import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Clock,
  FileText,
  ImageIcon,
  Inbox,
  LayoutTemplate,
  Megaphone,
  Send,
  Settings,
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
import {
  getDashboardContactSubmissions,
  getDashboardOverview,
  getDashboardSitePages,
} from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";

const chartBars = [
  { day: "월", value: 38 },
  { day: "화", value: 56 },
  { day: "수", value: 44 },
  { day: "목", value: 72 },
  { day: "금", value: 88 },
  { day: "토", value: 63 },
  { day: "일", value: 79 },
];

const quickActions = [
  { label: "새 게시물", href: "/dashboard/content/posts/new", icon: FileText },
  { label: "문의 확인", href: "/dashboard/content/forms", icon: Inbox },
  { label: "미디어 관리", href: "/dashboard/content/media", icon: ImageIcon },
  { label: "팝업 관리", href: "/dashboard/content/popups", icon: Megaphone },
  { label: "사이트 설정", href: "/dashboard/settings", icon: Settings },
];

const recentEdits = [
  { date: "06.05", title: "공지사항 게시", type: "게시글", typeKey: "content" },
  { date: "06.04", title: "문의폼 응답 처리", type: "문의", typeKey: "form" },
  { date: "06.03", title: "이벤트 팝업 노출 설정", type: "팝업", typeKey: "popup" },
];

const dotColorMap: Record<string, string> = {
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-blue-500",
};

const editIconBgMap: Record<string, string> = {
  content: "bg-emerald-100",
  form: "bg-amber-100",
  popup: "bg-blue-100",
};

const editIconColorMap: Record<string, string> = {
  content: "text-emerald-600",
  form: "text-amber-600",
  popup: "text-blue-600",
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
  const [submissions, sitemapPages] = await Promise.all([
    getDashboardContactSubmissions(),
    getDashboardSitePages(site.id),
  ]);
  const flatPages = sitemapPages.flatMap(function flatten(page): typeof sitemapPages {
    return [page, ...page.children.flatMap(flatten)];
  });
  const newInquiryCount = submissions.filter((submission) => submission.status === "new").length;
  const inProgressInquiryCount = submissions.filter((submission) => submission.status === "in_progress").length;
  const publicPageCount = flatPages.filter((page) => !page.isHidden).length;
  const operationMetrics = [
    {
      id: "sites",
      label: "사이트수",
      value: sites.length.toLocaleString("ko-KR"),
      caption: site.status === "published" ? "대표 사이트 공개 중" : "대표 사이트 초안",
      href: "/dashboard/sites",
      delta: site.status,
      positive: site.status === "published",
    },
    {
      id: "inquiries",
      label: "문의현황",
      value: submissions.length.toLocaleString("ko-KR"),
      caption: `신규 ${newInquiryCount.toLocaleString("ko-KR")}건 · 처리 중 ${inProgressInquiryCount.toLocaleString("ko-KR")}건`,
      href: "/dashboard/content/forms",
      delta: newInquiryCount ? `${newInquiryCount}건 확인` : "대기 없음",
      positive: newInquiryCount === 0,
    },
    {
      id: "pages",
      label: "페이지수",
      value: flatPages.length.toLocaleString("ko-KR"),
      caption: `노출 ${publicPageCount.toLocaleString("ko-KR")}개`,
      href: `/dashboard/sites/${site.id}/sitemap`,
      delta: "+ 관리",
      positive: true,
    },
    {
      id: "storage",
      label: "운영상태",
      value: site.status === "published" ? "공개" : "초안",
      caption: `최근 수정 ${site.updatedAt}`,
      href: `/dashboard/sites/${site.id}`,
      delta: site.publishedAt === "-" ? "게시 필요" : "게시 완료",
      positive: site.status === "published",
    },
  ];
  const notifications = [
    {
      title: newInquiryCount ? `새 문의 ${newInquiryCount}건` : "새 문의 없음",
      description: newInquiryCount
        ? "문의폼 확인 후 처리 상태를 변경하세요."
        : "신규 문의가 접수되면 이 영역과 문의폼 메뉴에서 바로 확인됩니다.",
      type: newInquiryCount ? "danger" : "info",
      href: "/dashboard/content/forms",
    },
    {
      title: site.status === "published" ? "공개 사이트 점검" : "게시 전 초안 확인",
      description:
        site.status === "published"
          ? "공개 페이지와 문의폼이 정상 동작하는지 확인하세요."
          : "사이트맵 페이지별 초안 미리보기 후 게시하세요.",
      type: site.status === "published" ? "info" : "warning",
      href: site.status === "published" ? `/s/${site.slug}` : `/dashboard/sites/${site.id}/sitemap`,
    },
    {
      title: "고객 운영 안내",
      description: "게시글, 문의, 미디어, 팝업은 콘텐츠 메뉴에서 관리합니다.",
      type: "info",
      href: "/dashboard/content",
    },
  ];
  const launchChecklist = [
    {
      title: "권한 확인",
      description: "고객 계정으로 로그인했을 때 내 사이트와 콘텐츠만 보이는지 확인하세요.",
      href: "/dashboard/settings",
      done: true,
    },
    {
      title: "문의 관리",
      description: newInquiryCount
        ? `신규 문의 ${newInquiryCount}건을 처리하세요.`
        : "문의 접수 후 상태 변경과 메모 저장이 가능한지 확인하세요.",
      href: "/dashboard/content/forms",
      done: newInquiryCount === 0,
    },
    {
      title: "공개 페이지 QA",
      description: "메인, 회사소개, 게시글, 문의폼, 팝업을 모바일/PC에서 확인하세요.",
      href: `/dashboard/sites/${site.id}/sitemap`,
      done: site.status === "published",
    },
    {
      title: "고객 운영 안내",
      description: "고객에게 게시글 작성, 문의 처리, 이미지 업로드 위치를 안내하세요.",
      href: "/dashboard/content",
      done: true,
    },
  ];

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-5">
        {/* 섹션 0: 운영 지표 카드 (최상단) */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {operationMetrics.map((metric, idx) => (
            <Link key={metric.id} href={metric.href} className="group" id={metric.id}>
              <Card className={cn(
                "relative overflow-hidden rounded-xl transition-all group-hover:-translate-y-0.5",
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
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
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
                오늘도 사이트를 성장시켜보세요. 게시글, 문의, 팝업, 미디어를
                한 화면에서 빠르게 운영할 수 있습니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  className={buttonVariants({ size: "lg", variant: "default" })}
                  href={`/dashboard/sites/${site.id}/sitemap`}
                >
                  오픈 전 확인하기
                  <ArrowRight />
                </Link>
                <Link
                  className={buttonVariants({ size: "lg", variant: "outline" })}
                  href="/dashboard/content/forms"
                >
                  <Inbox />
                  문의 확인
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
              <div className="mt-5 aspect-[16/10] overflow-hidden rounded-xl border border-white bg-white">
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
                  <div className="self-center rounded-2xl border border-blue-100 bg-white/70 p-4">
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

        <section className="grid gap-4 lg:grid-cols-4">
          {launchChecklist.map((item) => (
            <Link
              className="group rounded-xl border border-border bg-white p-4 transition-colors hover:border-zinc-950 hover:bg-zinc-50"
              href={item.href}
              key={item.title}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <span
                  className={cn(
                    "mt-0.5 rounded-full px-2 py-1 text-[11px] font-semibold",
                    item.done
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600",
                  )}
                >
                  {item.done ? "확인" : "필요"}
                </span>
              </div>
            </Link>
          ))}
        </section>

        {/* 섹션 3: 운영 현황 + 알림 */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-lg">
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

          <Card className="rounded-xl border-0 bg-gradient-to-b from-slate-950 to-slate-900 text-white">
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
          <Card className="rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>사이트 미리보기</CardTitle>
                <CardDescription className="mt-1">현재 대표 사이트의 PC 화면 기준 미리보기입니다.</CardDescription>
              </div>
              <Button render={<Link href="/dashboard/content/posts" />} size="sm">
                게시글 관리
                <ArrowRight />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border bg-white">
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
                  <div className="self-center rounded-3xl border border-blue-100 bg-white/70 p-8">
                    <LayoutTemplate className="size-16 text-blue-600" />
                    <div className="mt-8 h-3 w-full rounded bg-blue-100" />
                    <div className="mt-3 h-3 w-2/3 rounded bg-blue-100" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-blue-100/60 bg-gradient-to-b from-blue-50/40 to-white">
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
                    className="group flex h-11 items-center justify-between rounded-lg border border-border bg-white px-3 text-sm font-medium transition-all hover:border-blue-200 hover:bg-blue-50/60 hover:shadow"
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
          <Card className="relative overflow-hidden rounded-lg bg-slate-950 text-white" id="ai-helper">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_60%,rgba(59,110,240,0.18),transparent)]" />
            <CardHeader className="relative">
              <div className="flex items-center gap-2">
                <Bot className="size-5 text-blue-300" />
                <CardTitle>AI 도우미</CardTitle>
              </div>
              <CardDescription className="text-white/60">
                공지사항, 블로그, FAQ 초안을 빠르게 요청합니다.
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
                {["공지사항", "블로그 제목", "FAQ 생성"].map((item) => (
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

          <Card className="rounded-lg">
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
