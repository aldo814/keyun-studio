import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe2,
  MessageSquareText,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDashboardSite } from "@/features/dashboard/actions";
import { getDashboardTemplates } from "@/features/dashboard/queries";

const launchSteps = [
  {
    icon: Globe2,
    title: "사이트 기본 정보",
    description: "브랜드명과 주소를 먼저 정리합니다.",
  },
  {
    icon: Search,
    title: "검색 노출 정보",
    description: "검색 결과와 공유 카드에 들어갈 문구를 설정합니다.",
  },
  {
    icon: FileText,
    title: "운영 게시판 자동 생성",
    description: "공지사항, 블로그, FAQ 게시판을 바로 사용할 수 있게 만듭니다.",
  },
];

const businessTypes = ["병원/의료", "교육", "전문서비스", "브랜드/쇼핑", "포트폴리오", "기타"];
const launchGoals = ["회사 소개", "문의 수집", "콘텐츠 운영", "예약/상담", "서비스 홍보"];
const siteStyles = [
  {
    description: "불필요한 장식을 줄이고 정보 전달을 우선합니다.",
    label: "심플",
    value: "simple",
  },
  {
    description: "브랜드 첫인상과 신뢰감을 강하게 보여줍니다.",
    label: "브랜딩",
    value: "brand",
  },
  {
    description: "섹션 리듬과 CTA를 강조해 전환을 유도합니다.",
    label: "인터랙티브",
    value: "interactive",
  },
];
const siteFeatures = [
  { label: "공지사항", value: "notice" },
  { label: "블로그", value: "blog" },
  { label: "FAQ", value: "faq" },
  { label: "포트폴리오", value: "portfolio" },
  { label: "예약/상담", value: "booking" },
  { label: "오시는 길", value: "location" },
];

type NewSitePageProps = {
  searchParams?: Promise<{
    notice?: string | string[];
    templateId?: string | string[];
  }>;
};

function firstSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function RequiredLabel({ children }: { children: string }) {
  return (
    <span className="text-sm font-medium">
      {children}
      <span aria-hidden className="ml-1 text-red-500">
        *
      </span>
      <span className="sr-only"> 필수</span>
    </span>
  );
}

export default async function NewSitePage({ searchParams }: NewSitePageProps) {
  const query = await searchParams;
  const notice = firstSearchValue(query?.notice);
  const selectedTemplateId = firstSearchValue(query?.templateId);
  const templates = await getDashboardTemplates();
  const selectedTemplateIndex = Math.max(
    0,
    templates.findIndex((template) => template.id === selectedTemplateId),
  );

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-2xl bg-zinc-950 text-white">
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_360px] md:p-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-blue-200">
                <Sparkles className="size-4" />
                첫 사이트 만들기
              </p>
              <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-normal sm:text-5xl">
                몇 가지 정보만 입력하면 바로 운영을 시작할 수 있어요.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
                사이트 구조, 기본 SEO, 콘텐츠 게시판을 한 번에 준비합니다.
                디자인 편집 없이도 게시글과 문의 운영부터 시작할 수 있게 맞춰둘게요.
              </p>
            </div>

            <div className="grid gap-3">
              {launchSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-950">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {index + 1}. {step.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {notice ? (
          <div
            className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            role="alert"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{notice}</p>
          </div>
        ) : null}

        <form action={createDashboardSite} className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <input name="completion_path" type="hidden" value="/dashboard/sites/:siteId" />

          <div className="space-y-6">
            <Card className="rounded-xl border-border bg-card">
              <CardHeader>
                <CardTitle>사이트 기본 정보</CardTitle>
                <CardDescription>
                  관리자와 방문자에게 보일 사이트 이름과 기본 주소를 설정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <label className="grid gap-2.5 md:col-span-2">
                  <RequiredLabel>사이트 이름</RequiredLabel>
                  <Input name="name" placeholder="예: 키운 스튜디오" required />
                </label>

                <label className="grid gap-2.5">
                  <span className="text-sm font-medium">사이트 주소</span>
                  <div className="flex overflow-hidden rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                    <span className="flex items-center border-r border-border bg-muted px-3 text-sm text-muted-foreground">
                      /s/
                    </span>
                    <Input
                      className="border-0 focus-visible:ring-0"
                      name="slug"
                      placeholder="keyun-studio"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    비워두면 사이트 이름으로 자동 생성됩니다.
                  </p>
                </label>

                <label className="grid gap-2.5 md:col-span-2">
                  <span className="text-sm font-medium">한 줄 소개</span>
                  <Input
                    name="brand_message"
                    placeholder="예: 고객의 시간을 아끼는 맞춤 웹사이트 운영 솔루션"
                  />
                  <p className="text-xs text-muted-foreground">
                    메인 비주얼과 검색 설명의 기본 문구로 사용됩니다.
                  </p>
                </label>

                <label className="grid gap-2.5 md:col-span-2">
                  <span className="text-sm font-medium">주요 고객</span>
                  <Input
                    name="target_customer"
                    placeholder="예: 예약 문의가 필요한 병원, 교육기관, 전문 서비스 브랜드"
                  />
                </label>

                <label className="grid gap-2.5">
                  <span className="text-sm font-medium">대표 연락처</span>
                  <Input name="contact_phone" placeholder="예: 02-1234-5678" />
                </label>

                <label className="grid gap-2.5">
                  <RequiredLabel>업종</RequiredLabel>
                  <select
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                    name="business_type"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      업종 선택
                    </option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2.5">
                  <RequiredLabel>주요 목적</RequiredLabel>
                  <select
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                    name="launch_goal"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      목적 선택
                    </option>
                    {launchGoals.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                </label>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border bg-card">
              <CardHeader>
                <CardTitle>초기 화면 방향</CardTitle>
                <CardDescription>
                  선택값에 맞춰 메인 문구, 색상, 섹션 구성을 자동으로 잡습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium">원하는 분위기</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {siteStyles.map((style, index) => (
                      <label
                        className="cursor-pointer rounded-xl border border-border p-4 transition-colors hover:bg-muted/60 has-[:checked]:border-zinc-950 has-[:checked]:bg-zinc-50"
                        key={style.value}
                      >
                        <input
                          className="sr-only"
                          defaultChecked={index === 1}
                          name="site_style"
                          type="radio"
                          value={style.value}
                        />
                        <span className="text-sm font-semibold">{style.label}</span>
                        <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                          {style.description}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">필요한 구성</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {siteFeatures.map((feature) => (
                      <label
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm transition-colors hover:bg-muted/60 has-[:checked]:border-zinc-950 has-[:checked]:bg-zinc-50"
                        key={feature.value}
                      >
                        <input
                          className="size-4"
                          defaultChecked={["notice", "blog", "faq", "booking"].includes(feature.value)}
                          name="site_features"
                          type="checkbox"
                          value={feature.value}
                        />
                        {feature.label}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    추후 페이지 관리에서 숨김/추가/순서 변경이 가능합니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border bg-card">
              <CardHeader>
                <CardTitle>검색 노출 정보</CardTitle>
                <CardDescription>
                  나중에 설정에서 바꿀 수 있어요. 지금은 첫 게시에 필요한 기본값만 받습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <label className="grid gap-2.5">
                  <span className="text-sm font-medium">검색 제목</span>
                  <Input name="seo_title" placeholder="예: 키운 스튜디오 | 쉬운 웹사이트 운영" />
                </label>

                <label className="grid gap-2.5">
                  <span className="text-sm font-medium">검색 설명</span>
                  <Textarea
                    className="min-h-28"
                    name="seo_description"
                    placeholder="검색 결과와 공유 카드에 표시될 짧은 설명을 입력해주세요."
                  />
                </label>

                <label className="grid gap-2.5">
                  <span className="text-sm font-medium">대표 이미지 URL</span>
                  <Input name="og_image_url" placeholder="https://..." />
                </label>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="rounded-xl border-border bg-card">
              <CardHeader>
                <CardTitle>템플릿 선택</CardTitle>
                <CardDescription>
                  첫 사이트는 안정적인 기본 레이아웃으로 시작합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.length ? (
                  templates.map((template, index) => (
                    <label
                      key={template.id}
                      className="block cursor-pointer rounded-xl border border-border p-3 transition-colors hover:bg-muted/60 has-[:checked]:border-zinc-950 has-[:checked]:bg-zinc-50"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          className="mt-1"
                          defaultChecked={index === selectedTemplateIndex}
                          name="template_id"
                          type="radio"
                          value={template.id}
                        />
                        <div>
                          <p className="text-sm font-semibold">{template.name}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {template.description || template.status}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    공개 템플릿이 아직 없습니다. 기본 사이트 구조로 생성됩니다.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border-zinc-200 bg-zinc-950 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-300" />
                  생성 후 준비되는 것
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <div>
                  <p className="flex items-center gap-2 font-medium text-white">
                    <FileText className="size-4 text-blue-300" />
                    기본 페이지와 GNB 자동 연결
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                    {["홈", "회사소개", "서비스", "문의"].map((page, index) => (
                      <div className="contents" key={page}>
                        {index > 0 ? (
                          <ArrowRight className="size-3 text-zinc-600" />
                        ) : null}
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-zinc-200">
                          {page}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="flex items-center gap-2">
                  <MessageSquareText className="size-4 text-blue-300" />
                  콘텐츠 운영용 게시판 3개
                </p>
                <p className="flex items-center gap-2">
                  <Search className="size-4 text-blue-300" />
                  사이트 기본 SEO 설정
                </p>
                <p className="flex items-center gap-2">
                  <Globe2 className="size-4 text-blue-300" />
                  공개 전 초안 사이트
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" render={<Link href="/dashboard/sites" />}>
                취소
              </Button>
              <Button className="flex-1 bg-zinc-950 text-white hover:bg-zinc-800" type="submit">
                사이트 만들기
                <ArrowRight />
              </Button>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
