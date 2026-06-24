import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Globe2, MessageSquareText, Search, Sparkles } from "lucide-react";

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

type NewSitePageProps = {
  searchParams?: Promise<{ templateId?: string | string[] }>;
};

function firstSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewSitePage({ searchParams }: NewSitePageProps) {
  const query = await searchParams;
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
              <CardContent className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium">사이트 이름</span>
                  <Input name="name" placeholder="예: 키운 스튜디오" required />
                </label>

                <label className="space-y-2">
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

                <label className="space-y-2">
                  <span className="text-sm font-medium">대표 연락처</span>
                  <Input name="contact_phone" placeholder="예: 02-1234-5678" />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">업종</span>
                  <select
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                    name="business_type"
                    defaultValue=""
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

                <label className="space-y-2">
                  <span className="text-sm font-medium">주요 목적</span>
                  <select
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                    name="launch_goal"
                    defaultValue=""
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
                <CardTitle>검색 노출 정보</CardTitle>
                <CardDescription>
                  나중에 설정에서 바꿀 수 있어요. 지금은 첫 게시에 필요한 기본값만 받습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium">검색 제목</span>
                  <Input name="seo_title" placeholder="예: 키운 스튜디오 | 쉬운 웹사이트 운영" />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">검색 설명</span>
                  <Textarea
                    className="min-h-28"
                    name="seo_description"
                    placeholder="검색 결과와 공유 카드에 표시될 짧은 설명을 입력해주세요."
                  />
                </label>

                <label className="space-y-2">
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
