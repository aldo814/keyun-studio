import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Check,
  Layers3,
  MousePointer2,
  Palette,
  Rocket,
  Sparkles,
} from "lucide-react";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ProductPreview } from "@/components/marketing/product-preview";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const assemblySteps = [
  {
    icon: Boxes,
    label: "페이지 구조",
    description: "업종과 목적을 바탕으로 필요한 페이지를 먼저 구성합니다.",
  },
  {
    icon: Layers3,
    label: "디자인 섹션",
    description: "히어로, 서비스, 후기, 문의 모듈이 자연스럽게 연결됩니다.",
  },
  {
    icon: Palette,
    label: "브랜드 스타일",
    description: "색상과 폰트를 선택하면 모든 페이지에 일관되게 적용됩니다.",
  },
  {
    icon: Rocket,
    label: "반응형 게시",
    description: "모바일 결과를 확인하고 준비된 사이트를 바로 공개합니다.",
  },
];

export function Interactive3DLanding() {
  return (
    <div className="bg-white text-slate-950">
      <MarketingHeader />
      <main>
        <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden border-b border-slate-200">
          <div className="mx-auto flex max-w-7xl flex-col items-center px-4 pt-14 text-center sm:px-6 sm:pt-20 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <Sparkles className="size-3.5" />
              선택하는 순간, 사이트가 조립됩니다
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.12] tracking-normal sm:text-6xl">
              KEYUN 웹사이트 빌더
            </h1>
            <p className="mt-4 text-xl font-semibold text-slate-700 sm:text-2xl">
              쉬운데, 결과물은 예쁜 웹사이트
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              페이지와 섹션이 하나씩 맞물리며 내 브랜드의 사이트가 완성됩니다.
              어렵게 그리지 말고, 좋은 구성을 선택하세요.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
                  "h-12 px-5",
                )}
                href="#templates"
              >
                템플릿 둘러보기
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-6 h-[360px] max-w-6xl sm:h-[470px] lg:mt-0 lg:h-[520px]">
            <Image
              alt="페이지와 섹션이 공간에서 조립되는 KEYUN 웹사이트 빌더"
              className="h-full w-full object-contain"
              height={960}
              priority
              src="/keyun-builder-hero.png"
              width={1694}
            />
            <div className="keyun-float-slow absolute left-[4%] top-[18%] hidden rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm sm:block">
              페이지 구조
            </div>
            <div className="keyun-float-fast absolute right-[6%] top-[22%] hidden rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm sm:block">
              모바일 자동 생성
            </div>
            <div className="keyun-float-slow absolute bottom-[12%] left-[10%] hidden rounded-lg border border-slate-200 bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm sm:block">
              브랜드 스타일 적용
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.68fr_1.32fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold text-blue-300">직접 움직여보세요</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-5xl">
                  선택할 때마다
                  <br />
                  결과가 바로 보입니다.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                  디바이스와 섹션, 브랜드 색상을 바꿔보세요. KEYUN은 복잡한
                  설정을 제품 안에서 직관적인 선택으로 바꿉니다.
                </p>
                <div className="mt-8 space-y-3 text-sm text-slate-300">
                  {[
                    "선택한 요소에 맞는 설정만 표시",
                    "페이지 전체에 브랜드 스타일 즉시 반영",
                    "데스크톱과 모바일 결과를 같은 화면에서 확인",
                  ].map((item) => (
                    <p className="flex items-center gap-2" key={item}>
                      <Check className="size-4 text-emerald-300" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-white p-1">
                <ProductPreview />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-600">조립되는 제작 과정</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                빈 캔버스 대신 완성되는 흐름
              </h2>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-4">
              {assemblySteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div className="bg-white p-6" key={step.label}>
                    <div className="flex items-center justify-between">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon className="size-4" />
                      </span>
                      <span className="font-mono text-xs text-slate-400">0{index + 1}</span>
                    </div>
                    <h3 className="mt-10 text-lg font-semibold">{step.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-blue-50 py-20" id="templates">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-semibold text-blue-600">추천 템플릿</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                업종에 맞는 조합을
                <br />
                먼저 준비했습니다.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                기업, 전문 서비스, 브랜드, 포트폴리오에 필요한 섹션 조합을
                선택하고 내 콘텐츠로 바꾸세요.
              </p>
              <Link
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-600"
                href="/signup?next=/dashboard/sites/new"
              >
                전체 템플릿 보기
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["기업", "전문 서비스", "브랜드", "포트폴리오"].map((item, index) => (
                <div
                  className="keyun-float-slow overflow-hidden rounded-lg border border-blue-100 bg-white p-2"
                  key={item}
                  style={{ animationDelay: `${index * -0.6}s` }}
                >
                  <div className="aspect-[3/4] rounded bg-white p-2 ring-1 ring-slate-100">
                    <div className="h-1.5 w-8 rounded-full bg-slate-800" />
                    <div
                      className="mt-4 h-14 rounded"
                      style={{ backgroundColor: index % 2 ? "#ecfdf5" : "#eff6ff" }}
                    />
                    <div className="mt-2 h-1.5 w-3/4 rounded-full bg-slate-200" />
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      <div className="h-8 rounded bg-slate-50" />
                      <div className="h-8 rounded bg-slate-50" />
                    </div>
                  </div>
                  <p className="px-1 pb-1 pt-2 text-xs font-semibold text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-sm font-semibold text-blue-300">오늘 시작하기</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal">
                아직도 웹사이트 제작을 미루고 있나요?
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                템플릿을 선택하면 오늘 바로 시작할 수 있습니다.
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

        <section className="py-20 text-center sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <MousePointer2 className="size-5" />
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-normal sm:text-5xl">
              내가 원하는 웹사이트,
              <br />
              이제 직접 시작해보세요.
            </h2>
            <Link
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 h-12 bg-blue-600 px-6 text-white hover:bg-blue-700",
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
