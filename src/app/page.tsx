import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  Layers3,
  MonitorSmartphone,
  MousePointer2,
  Palette,
  PenLine,
  Rocket,
  SearchCheck,
} from "lucide-react";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ProductPreview } from "@/components/marketing/product-preview";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "KEYUN | 쉬운데 결과물은 예쁜 웹사이트 빌더",
  description:
    "템플릿과 섹션을 선택하고 내용만 바꾸세요. 디자인과 코딩 없이 완성도 높은 웹사이트를 만들고 운영할 수 있습니다.",
};

const templates = [
  {
    category: "기업·스타트업",
    title: "신뢰를 만드는 기업형",
    accent: "#3b6ef0",
    background: "bg-[#edf3ff]",
  },
  {
    category: "브랜드·쇼핑",
    title: "제품이 돋보이는 브랜드형",
    accent: "#111827",
    background: "bg-[#f2f2f0]",
  },
  {
    category: "포트폴리오",
    title: "작업을 선명하게 보여주는 포트폴리오형",
    accent: "#10b981",
    background: "bg-[#ecfdf5]",
  },
];

const differences = [
  {
    number: "01",
    icon: Layers3,
    title: "섹션을 고르세요",
    description: "히어로, 서비스, 가격, 후기, 문의까지 검증된 구성에서 선택합니다.",
  },
  {
    number: "02",
    icon: PenLine,
    title: "내용만 바꾸세요",
    description: "텍스트와 이미지를 교체해도 전체 디자인의 균형은 그대로 유지됩니다.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "바로 게시하세요",
    description: "모바일 대응, SEO, 콘텐츠 운영까지 하나의 흐름으로 이어집니다.",
  },
];

const workflow = [
  { label: "업종 선택", description: "사이트 목적과 업종을 알려주세요." },
  { label: "구성 추천", description: "어울리는 페이지와 섹션을 준비합니다." },
  { label: "콘텐츠 입력", description: "텍스트와 이미지만 바꾸세요." },
  { label: "미리보기·게시", description: "모바일까지 확인하고 바로 공개합니다." },
];

export default function Home() {
  return (
    <div className="bg-white text-slate-950">
      <MarketingHeader />

      <main>
        <section className="relative isolate min-h-[calc(100svh-7rem)] overflow-hidden border-b border-slate-200 lg:min-h-[calc(100svh-4rem)]">
          <Image
            alt="웹사이트 섹션과 반응형 화면이 조립되는 KEYUN 빌더"
            className="absolute -right-[12%] bottom-0 top-0 -z-20 hidden h-full w-[76%] object-contain object-right lg:block xl:-right-[6%] xl:w-[72%]"
            height={960}
            priority
            sizes="76vw"
            src="/keyun-builder-hero.png"
            width={1694}
          />
          <Image
            alt=""
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-20 h-[56%] w-full object-cover object-center opacity-30 lg:hidden"
            height={960}
            src="/keyun-builder-hero.png"
            width={1694}
          />
          <div className="absolute inset-0 -z-10 bg-white/70 lg:bg-transparent" />

          <div className="mx-auto flex min-h-[calc(100svh-7rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:px-8 lg:py-16">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <span className="size-1.5 rounded-full bg-blue-600" />
                프리셋 기반 노코드 웹 빌더
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.12] tracking-normal text-slate-950 sm:text-6xl">
                KEYUN
                <span className="mt-2 block">웹사이트 빌더</span>
              </h1>
              <p className="mt-6 text-xl font-semibold text-slate-800 sm:text-2xl">
                쉬운데, 결과물은 예쁘게.
              </p>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
                검증된 템플릿과 섹션을 선택하고 내용만 바꾸세요. 디자인이나
                코딩 없이 브랜드 사이트를 완성할 수 있습니다.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 bg-blue-600 px-5 text-white hover:bg-blue-700",
                  )}
                  href="/signup?next=/dashboard/sites/new"
                >
                  무료로 내 사이트 만들기
                  <ArrowRight />
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "h-12 border-slate-300 bg-white/85 px-5",
                  )}
                  href="#templates"
                >
                  템플릿 둘러보기
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                신용카드 등록 없이 시작 · 언제든 직접 수정
              </p>
            </div>
          </div>

          <a
            className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-medium text-slate-500 lg:flex"
            href="#templates"
          >
            결과물 먼저 보기
            <ChevronRight className="size-3.5 rotate-90" />
          </a>
        </section>

        <section className="border-b border-slate-200 py-10 sm:py-24" id="templates">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">추천 템플릿</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                  시작부터 완성된 디자인
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
                  업종과 목적에 맞는 구성을 고르면 페이지와 메뉴까지 함께 준비됩니다.
                </p>
              </div>
              <Link
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-blue-600"
                href="/signup?next=/dashboard/sites/new"
              >
                전체 템플릿 보기
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {templates.map((template, index) => (
                <Link
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-blue-300"
                  href="/signup?next=/dashboard/sites/new"
                  key={template.title}
                >
                  <div className={cn("aspect-[4/3] p-4", template.background)}>
                    <div className="h-full overflow-hidden rounded-md border border-white/90 bg-white">
                      <div className="flex h-9 items-center justify-between border-b border-slate-100 px-3">
                        <span className="h-2 w-14 rounded-full bg-slate-900" />
                        <div className="flex gap-2">
                          <span className="h-1.5 w-8 rounded-full bg-slate-200" />
                          <span className="h-1.5 w-8 rounded-full bg-slate-200" />
                          <span
                            className="h-5 w-10 rounded"
                            style={{ backgroundColor: template.accent }}
                          />
                        </div>
                      </div>
                      <div
                        className={cn(
                          "grid min-h-32 items-center gap-3 p-4",
                          index !== 2 && "grid-cols-[1fr_0.8fr]",
                        )}
                      >
                        <div>
                          <span className="block h-2.5 w-4/5 rounded-full bg-slate-900" />
                          <span className="mt-2 block h-2.5 w-3/5 rounded-full bg-slate-900" />
                          <span className="mt-3 block h-1.5 w-full rounded-full bg-slate-200" />
                          <span
                            className="mt-4 block h-6 w-16 rounded"
                            style={{ backgroundColor: template.accent }}
                          />
                        </div>
                        {index !== 2 && (
                          <div
                            className="aspect-square rounded"
                            style={{ backgroundColor: `${template.accent}18` }}
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 p-3">
                        {[0, 1, 2].map((item) => (
                          <div className="h-12 rounded bg-slate-50" key={item} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-3 border-t border-slate-200 p-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        {template.category}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        {template.title}
                      </p>
                    </div>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-600">KEYUN 방식</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-5xl">
                복잡한 디자인은
                <br />
                KEYUN이 정리했습니다.
              </h2>
            </div>

            <div className="mt-12 grid border-y border-slate-200 md:grid-cols-3">
              {differences.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    className={cn(
                      "py-8 md:px-8 md:py-10",
                      index > 0 && "border-t border-slate-200 md:border-l md:border-t-0",
                      index === 0 && "md:pl-0",
                    )}
                    key={item.number}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-400">{item.number}</span>
                      <Icon className="size-5 text-blue-600" />
                    </div>
                    <h3 className="mt-12 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold text-blue-600">실제 편집 경험</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                  자유롭게 헤매지 않고,
                  <br />
                  좋은 선택만 하도록.
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
                  섹션을 선택하면 필요한 설정만 보여줍니다. 디바이스를 바꾸고
                  브랜드 색상을 눌러보며 KEYUN의 편집 방식을 직접 확인하세요.
                </p>
                <div className="mt-7 grid gap-3">
                  {[
                    { icon: MousePointer2, text: "선택한 요소에 맞는 설정만 표시" },
                    { icon: Palette, text: "브랜드 스타일을 전체 사이트에 적용" },
                    { icon: MonitorSmartphone, text: "모바일 화면까지 즉시 확인" },
                    { icon: SearchCheck, text: "SEO와 게시를 한 흐름으로 관리" },
                  ].map(({ icon: Icon, text }) => (
                    <div className="flex items-center gap-3 text-sm text-slate-700" key={text}>
                      <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon className="size-4" />
                      </span>
                      {text}
                    </div>
                  ))}
                </div>
                <Link
                  className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  href="/product"
                >
                  제품 자세히 보기
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <ProductPreview />
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white sm:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-sm font-semibold text-blue-300">지금 시작하세요</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-normal sm:text-4xl">
                아직도 웹사이트 제작을 미루고 있나요?
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                템플릿을 선택하면 오늘 바로 내 사이트를 만들 수 있습니다.
              </p>
            </div>
            <Link
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 shrink-0 bg-blue-600 px-5 text-white hover:bg-blue-500",
              )}
              href="/signup?next=/dashboard/sites/new"
            >
              무료로 사이트 만들기
              <ArrowRight />
            </Link>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <Image
                  alt="KEYUN의 모듈형 웹사이트 제작 방식"
                  className="h-auto w-full"
                  height={960}
                  src="/keyun-builder-hero.png"
                  width={1694}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-600">제작 흐름</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                  네 단계면 충분합니다.
                </h2>
                <div className="mt-8 border-t border-slate-200">
                  {workflow.map((item, index) => (
                    <div
                      className="grid grid-cols-[40px_1fr] gap-4 border-b border-slate-200 py-5"
                      key={item.label}
                    >
                      <span className="font-mono text-sm text-blue-600">
                        0{index + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold">{item.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24" id="pricing">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-600">요금제</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                작게 시작하고, 필요할 때 확장하세요.
              </h2>
            </div>
            <div className="mt-10 grid overflow-hidden rounded-lg border border-slate-200 bg-white md:grid-cols-2">
              <div className="p-6 sm:p-8">
                <p className="text-sm font-semibold">Basic</p>
                <p className="mt-2 text-sm text-slate-500">개인과 작은 팀의 첫 사이트</p>
                <p className="mt-7 text-3xl font-semibold">무료로 시작</p>
                <div className="mt-7 space-y-3 text-sm text-slate-600">
                  {["사이트 1개", "기본 템플릿", "콘텐츠 관리", "반응형 미리보기"].map(
                    (item) => (
                      <p className="flex items-center gap-2" key={item}>
                        <Check className="size-4 text-emerald-600" />
                        {item}
                      </p>
                    ),
                  )}
                </div>
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-8 w-full",
                  )}
                  href="/signup?next=/dashboard/sites/new"
                >
                  Basic으로 시작
                </Link>
              </div>
              <div className="border-t border-slate-200 bg-blue-600 p-6 text-white md:border-l md:border-t-0 sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Pro</p>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                    추천
                  </span>
                </div>
                <p className="mt-2 text-sm text-blue-100">운영이 중요한 비즈니스 사이트</p>
                <p className="mt-7 text-3xl font-semibold">비즈니스 운영</p>
                <div className="mt-7 space-y-3 text-sm text-blue-50">
                  {["확장 템플릿", "도메인·SEO", "문의·팝업 관리", "멤버 협업"].map(
                    (item) => (
                      <p className="flex items-center gap-2" key={item}>
                        <Check className="size-4" />
                        {item}
                      </p>
                    ),
                  )}
                </div>
                <Link
                  className={cn(
                    buttonVariants(),
                    "mt-8 w-full bg-white text-blue-700 hover:bg-blue-50",
                  )}
                  href="/contact"
                >
                  도입 문의하기
                  <ArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-blue-600 py-20 text-white sm:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-white/15">
              <Code2 className="size-5" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-normal sm:text-5xl">
              내가 원하는 웹사이트,
              <br />
              이제 직접 시작해보세요.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-blue-100">
              빈 화면에서 시작할 필요 없습니다. 업종을 선택하면 KEYUN이 좋은
              시작점을 준비합니다.
            </p>
            <Link
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 h-12 bg-white px-6 text-blue-700 hover:bg-blue-50",
              )}
              href="/signup?next=/dashboard/sites/new"
            >
              무료로 내 사이트 만들기
              <ArrowRight />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
