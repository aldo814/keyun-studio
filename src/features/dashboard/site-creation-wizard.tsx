"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Globe2,
  LayoutTemplate,
  MessageSquareText,
  Palette,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDashboardSite } from "@/features/dashboard/actions";
import { cn } from "@/lib/utils";

type TemplateOption = {
  description: string;
  id: string;
  isFeatured: boolean;
  name: string;
  status: string;
  thumbnailUrl: string;
};

type SiteCreationWizardProps = {
  initialTemplateId?: string;
  notice?: string;
  templates: TemplateOption[];
};

const steps = [
  {
    description: "브랜드와 사이트 목적",
    icon: Globe2,
    label: "기본 정보",
  },
  {
    description: "업종별 시작 디자인",
    icon: LayoutTemplate,
    label: "템플릿",
  },
  {
    description: "스타일과 운영 기능",
    icon: Palette,
    label: "사이트 구성",
  },
  {
    description: "검색 정보와 최종 확인",
    icon: CheckCircle2,
    label: "확인",
  },
];

const businessTypes = [
  "병원/의료",
  "교육",
  "전문서비스",
  "브랜드/쇼핑",
  "포트폴리오",
  "외식/카페",
  "뷰티",
  "숙박/공간",
  "기타",
];
const launchGoals = ["회사 소개", "문의 수집", "콘텐츠 운영", "예약/상담", "서비스 홍보"];
const siteStyles = [
  {
    description: "정보 전달을 우선하는 절제된 구성",
    label: "심플",
    value: "simple",
  },
  {
    description: "브랜드의 분위기와 신뢰감을 강조",
    label: "브랜딩",
    value: "brand",
  },
  {
    description: "섹션 리듬과 CTA로 전환을 유도",
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

export function SiteCreationWizard({
  initialTemplateId,
  notice,
  templates,
}: SiteCreationWizardProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialTemplateId && templates.some((template) => template.id === initialTemplateId)
      ? initialTemplateId
      : templates[0]?.id ?? "",
  );

  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId,
  );

  function validateStep(step: number) {
    const section = formRef.current?.querySelector<HTMLElement>(`[data-step="${step}"]`);
    const requiredFields = section?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("[required]");

    for (const field of requiredFields ?? []) {
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }

    return true;
  }

  function moveToStep(nextStep: number) {
    if (nextStep > currentStep && !validateStep(currentStep)) return;
    setCurrentStep(nextStep);
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  return (
    <form action={createDashboardSite} ref={formRef}>
      <input name="completion_path" type="hidden" value="/dashboard/sites/:siteId" />

      {notice ? (
        <div
          className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{notice}</p>
        </div>
      ) : null}

      <nav
        aria-label="사이트 개설 단계"
        className="mb-6 grid overflow-hidden rounded-lg border border-border bg-white md:grid-cols-4"
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <button
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "relative flex min-h-20 items-center gap-3 border-b border-border px-4 text-left transition-colors last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0",
                isActive && "bg-zinc-950 text-white",
                !isActive && "hover:bg-muted/60",
                index > currentStep && "cursor-default opacity-55 hover:bg-white",
              )}
              disabled={index > currentStep}
              key={step.label}
              onClick={() => moveToStep(index)}
              type="button"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
                  isActive
                    ? "border-white/15 bg-white/10"
                    : isComplete
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-border bg-muted text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="size-4" /> : <Icon className="size-4" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {index + 1}. {step.label}
                </span>
                <span
                  className={cn(
                    "mt-1 block truncate text-xs",
                    isActive ? "text-zinc-400" : "text-muted-foreground",
                  )}
                >
                  {step.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="rounded-lg border border-border bg-white">
        <section
          className={cn("p-5 sm:p-7", currentStep !== 0 && "hidden")}
          data-step="0"
        >
          <div className="border-b border-border pb-5">
            <p className="text-xs font-semibold text-blue-600">STEP 01</p>
            <h2 className="mt-2 text-xl font-semibold">어떤 사이트를 만들까요?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              입력한 정보는 메인 문구와 초기 사이트 구조를 만드는 데 사용됩니다.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
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

            <label className="grid gap-2.5">
              <span className="text-sm font-medium">대표 연락처</span>
              <Input name="contact_phone" placeholder="예: 02-1234-5678" />
            </label>

            <label className="grid gap-2.5">
              <RequiredLabel>업종</RequiredLabel>
              <select
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
                name="business_type"
                required
              >
                <option disabled value="">
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
                defaultValue=""
                name="launch_goal"
                required
              >
                <option disabled value="">
                  목적 선택
                </option>
                {launchGoals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2.5 md:col-span-2">
              <span className="text-sm font-medium">한 줄 소개</span>
              <Input
                name="brand_message"
                placeholder="예: 고객의 시간을 아끼는 맞춤 웹사이트 운영 솔루션"
              />
            </label>

            <label className="grid gap-2.5 md:col-span-2">
              <span className="text-sm font-medium">주요 고객</span>
              <Input
                name="target_customer"
                placeholder="예: 예약 문의가 필요한 병원, 교육기관, 전문 서비스 브랜드"
              />
            </label>
          </div>
        </section>

        <section
          className={cn("p-5 sm:p-7", currentStep !== 1 && "hidden")}
          data-step="1"
        >
          <div className="border-b border-border pb-5">
            <p className="text-xs font-semibold text-blue-600">STEP 02</p>
            <h2 className="mt-2 text-xl font-semibold">업종에 맞는 시작 화면을 선택하세요</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              템플릿의 이미지와 문구는 에디터에서 자유롭게 교체할 수 있습니다.
            </p>
          </div>

          {templates.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
                const isSelected = template.id === selectedTemplateId;

                return (
                  <label
                    className={cn(
                      "group cursor-pointer overflow-hidden rounded-lg border bg-white transition-colors",
                      isSelected
                        ? "border-blue-600 ring-1 ring-blue-600"
                        : "border-border hover:border-zinc-400",
                    )}
                    key={template.id}
                  >
                    <input
                      checked={isSelected}
                      className="sr-only"
                      name="template_id"
                      onChange={() => setSelectedTemplateId(template.id)}
                      type="radio"
                      value={template.id}
                    />
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {template.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          height={750}
                          loading="lazy"
                          src={template.thumbnailUrl}
                          width={1200}
                        />
                      ) : (
                        <div className="h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_32%),linear-gradient(135deg,#f8fafc,#e2e8f0)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      {template.isFeatured ? (
                        <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                          추천
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "absolute right-3 top-3 flex size-7 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-white/70 bg-white/90 text-transparent",
                        )}
                      >
                        <Check className="size-4" />
                      </span>
                      <p className="absolute inset-x-4 bottom-3 text-base font-semibold text-white">
                        {template.name}
                      </p>
                    </div>
                    <div className="min-h-20 p-3.5">
                      <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {template.description || template.status}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              공개 템플릿이 아직 없습니다. 기본 사이트 구조로 생성됩니다.
            </div>
          )}
        </section>

        <section
          className={cn("p-5 sm:p-7", currentStep !== 2 && "hidden")}
          data-step="2"
        >
          <div className="border-b border-border pb-5">
            <p className="text-xs font-semibold text-blue-600">STEP 03</p>
            <h2 className="mt-2 text-xl font-semibold">사이트 분위기와 기능을 선택하세요</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              필요한 기능만 선택하면 관련 운영 메뉴가 함께 준비됩니다.
            </p>
          </div>

          <div className="mt-6 space-y-8">
            <div>
              <p className="text-sm font-medium">원하는 분위기</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {siteStyles.map((style, index) => (
                  <label
                    className="cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-muted/60 has-[:checked]:border-zinc-950 has-[:checked]:bg-zinc-50"
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

            <div>
              <p className="text-sm font-medium">필요한 구성</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {siteFeatures.map((feature) => (
                  <label
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm transition-colors hover:bg-muted/60 has-[:checked]:border-zinc-950 has-[:checked]:bg-zinc-50"
                    key={feature.value}
                  >
                    <input
                      className="size-4"
                      defaultChecked={["notice", "blog", "faq", "booking"].includes(
                        feature.value,
                      )}
                      name="site_features"
                      type="checkbox"
                      value={feature.value}
                    />
                    {feature.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={cn("p-5 sm:p-7", currentStep !== 3 && "hidden")}
          data-step="3"
        >
          <div className="border-b border-border pb-5">
            <p className="text-xs font-semibold text-blue-600">STEP 04</p>
            <h2 className="mt-2 text-xl font-semibold">마지막으로 검색 정보를 확인하세요</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              검색 정보는 비워두어도 사이트 이름과 소개를 바탕으로 자동 생성됩니다.
            </p>
          </div>

          <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
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
            </div>

            <aside className="rounded-lg bg-zinc-950 p-5 text-white">
              <p className="text-xs font-semibold text-blue-300">선택한 템플릿</p>
              {selectedTemplate?.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="mt-3 aspect-[16/10] w-full rounded-md object-cover"
                  height={750}
                  src={selectedTemplate.thumbnailUrl}
                  width={1200}
                />
              ) : null}
              <p className="mt-3 text-sm font-semibold">
                {selectedTemplate?.name ?? "기본 사이트"}
              </p>

              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="size-4 text-blue-300" />
                  페이지와 GNB 자동 연결
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

              <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-xs text-zinc-300">
                <p className="flex items-center gap-2">
                  <MessageSquareText className="size-4 text-blue-300" />
                  콘텐츠 운영 게시판 3개
                </p>
                <p className="flex items-center gap-2">
                  <Search className="size-4 text-blue-300" />
                  사이트 기본 SEO
                </p>
              </div>
            </aside>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {currentStep === 0 ? (
              <Button variant="ghost" render={<Link href="/dashboard/sites" />}>
                취소
              </Button>
            ) : (
              <Button
                onClick={() => moveToStep(currentStep - 1)}
                type="button"
                variant="outline"
              >
                <ArrowLeft />
                이전
              </Button>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <p className="hidden text-xs text-muted-foreground sm:block">
              {currentStep + 1} / {steps.length}
            </p>
            {currentStep < steps.length - 1 ? (
              <Button
                className="bg-zinc-950 text-white hover:bg-zinc-800"
                onClick={() => moveToStep(currentStep + 1)}
                type="button"
              >
                다음
                <ArrowRight />
              </Button>
            ) : (
              <Button className="bg-blue-600 text-white hover:bg-blue-500" type="submit">
                사이트 만들기
                <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
