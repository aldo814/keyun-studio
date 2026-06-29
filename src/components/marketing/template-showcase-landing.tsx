import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  MonitorSmartphone,
  Paintbrush,
  SearchCheck,
} from "lucide-react";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ProductPreview } from "@/components/marketing/product-preview";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const templateSet = [
  { category: "기업·스타트업", name: "Nordic Works", color: "#3b6ef0", tint: "#eff6ff" },
  { category: "전문 서비스", name: "Studio Line", color: "#111827", tint: "#f3f4f6" },
  { category: "브랜드·쇼핑", name: "Object Market", color: "#059669", tint: "#ecfdf5" },
  { category: "포트폴리오", name: "Frame Archive", color: "#e11d48", tint: "#fff1f2" },
  { category: "교육·콘텐츠", name: "Learn Better", color: "#7c3aed", tint: "#f5f3ff" },
  { category: "예약·상담", name: "Quiet Clinic", color: "#0f766e", tint: "#f0fdfa" },
];

function TemplateMockup({
  category,
  color,
  name,
  tint,
}: (typeof templateSet)[number]) {
  return (
    <Link
      className="group block overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-400"
      href="/signup?next=/dashboard/sites/new"
    >
      <div className="relative aspect-[4/3] overflow-hidden p-3" style={{ backgroundColor: tint }}>
        <div className="absolute inset-3 origin-center overflow-hidden rounded-md border border-white bg-white transition-transform duration-500 group-hover:scale-[0.84] group-hover:-translate-x-[18%]">
          <div className="flex h-7 items-center justify-between border-b border-slate-100 px-2">
            <span className="h-1.5 w-8 rounded-full bg-slate-800" />
            <span className="h-1.5 w-12 rounded-full bg-slate-200" />
          </div>
          <div className="grid min-h-20 grid-cols-[1fr_0.8fr] items-center gap-2 p-3">
            <div>
              <span className="block h-2 w-4/5 rounded-full bg-slate-800" />
              <span className="mt-1.5 block h-1.5 w-3/5 rounded-full bg-slate-300" />
              <span
                className="mt-3 block h-4 w-10 rounded"
                style={{ backgroundColor: color }}
              />
            </div>
            <span className="block aspect-square rounded" style={{ backgroundColor: `${color}20` }} />
          </div>
          <div className="grid grid-cols-3 gap-1 border-t border-slate-100 p-2">
            <span className="h-7 rounded bg-slate-50" />
            <span className="h-7 rounded bg-slate-50" />
            <span className="h-7 rounded bg-slate-50" />
          </div>
        </div>
        <div className="absolute right-4 top-1/2 w-[82px] -translate-y-1/2 translate-x-[120%] overflow-hidden rounded-[14px] border-4 border-white bg-white shadow-md transition-transform duration-500 group-hover:translate-x-0">
          <div className="h-2 bg-slate-100" />
          <div className="p-1.5">
            <div className="h-10 rounded" style={{ backgroundColor: `${color}20` }} />
            <div className="mt-1.5 h-1 w-3/4 rounded-full bg-slate-800" />
            <div className="mt-1 h-1 w-full rounded-full bg-slate-200" />
            <div className="mt-1 grid grid-cols-2 gap-1">
              <span className="h-5 rounded bg-slate-50" />
              <span className="h-5 rounded bg-slate-50" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 border-t border-slate-200 p-4">
        <div>
          <p className="text-xs text-slate-500">{category}</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{name}</p>
        </div>
        <ArrowRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
      </div>
    </Link>
  );
}

export function TemplateShowcaseLanding() {
  return (
    <div className="bg-white text-slate-950">
      <MarketingHeader />
      <main>
        <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20 lg:px-8">
            <p className="text-sm font-semibold text-blue-600">결과물부터 고르세요</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.12] tracking-normal sm:text-6xl">
              KEYUN 웹사이트 빌더
            </h1>
            <p className="mt-4 text-xl font-semibold text-slate-700 sm:text-2xl">
              마음에 드는 사이트가 시작점이 됩니다.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
              업종에 맞는 완성형 템플릿을 선택하고 텍스트와 이미지만 내 것으로
              바꾸세요.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 bg-blue-600 px-5 text-white hover:bg-blue-700",
                )}
                href="#templates"
              >
                템플릿 둘러보기
                <ArrowRight />
              </Link>
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 px-5",
                )}
                href="/signup?next=/dashboard/sites/new"
              >
                무료로 내 사이트 만들기
              </Link>
            </div>
          </div>

          <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-3 px-3 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
            {templateSet.slice(0, 5).map((template, index) => (
              <div
                className={cn(index % 2 === 1 && "lg:translate-y-10")}
                key={template.name}
              >
                <TemplateMockup {...template} />
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 sm:py-24" id="templates">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">추천 템플릿</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                  내 업종에 맞는 화면을 찾아보세요.
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {["전체", "기업", "전문 서비스", "브랜드", "포트폴리오"].map(
                  (item, index) => (
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        index === 0
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 text-slate-500",
                      )}
                      key={item}
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {templateSet.map((template) => (
                <TemplateMockup key={template.name} {...template} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 px-6",
                )}
                href="/signup?next=/dashboard/sites/new"
              >
                전체 템플릿 보기
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white sm:py-20">
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

        <section className="py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-semibold text-blue-600">템플릿 이후도 간단하게</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                골랐다면,
                <br />
                내용만 바꾸면 됩니다.
              </h2>
              <div className="mt-8 space-y-5">
                {[
                  { icon: LayoutGrid, text: "섹션 레이아웃 선택" },
                  { icon: Paintbrush, text: "브랜드 색상과 폰트 적용" },
                  { icon: MonitorSmartphone, text: "모바일 화면 자동 대응" },
                  { icon: SearchCheck, text: "SEO 확인 후 바로 게시" },
                ].map(({ icon: Icon, text }) => (
                  <div className="flex items-center gap-3 text-sm text-slate-700" key={text}>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="size-4" />
                    </span>
                    {text}
                  </div>
                ))}
              </div>
            </div>
            <ProductPreview />
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
            <Image
              alt="KEYUN으로 웹사이트를 만드는 네 단계"
              className="h-auto w-full rounded-lg border border-slate-200"
              height={960}
              src="/keyun-builder-hero.png"
              width={1694}
            />
            <div>
              <p className="text-sm font-semibold text-blue-600">제작 과정</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal">
                선택에서 게시까지,
                <br />
                네 단계면 충분합니다.
              </h2>
              <ol className="mt-8 border-t border-slate-200">
                {["업종 선택", "템플릿 추천", "콘텐츠 입력", "미리보기·게시"].map(
                  (item, index) => (
                    <li
                      className="flex items-center gap-4 border-b border-slate-200 py-4"
                      key={item}
                    >
                      <span className="font-mono text-xs text-blue-600">0{index + 1}</span>
                      <span className="text-sm font-semibold">{item}</span>
                    </li>
                  ),
                )}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-20 text-center text-white sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-normal sm:text-5xl">
              내가 원하는 웹사이트,
              <br />
              이제 직접 시작해보세요.
            </h2>
            <p className="mt-5 text-sm text-blue-100">
              마음에 드는 템플릿을 고르면 KEYUN이 다음 단계를 준비합니다.
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
