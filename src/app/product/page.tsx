import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  LayoutTemplate,
  Menu,
  MonitorSmartphone,
  Palette,
  SearchCheck,
} from "lucide-react";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ProductPreview } from "@/components/marketing/product-preview";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "제품 소개",
  description:
    "섹션 기반 편집, 브랜드 테마, 반응형 미리보기, 콘텐츠 운영을 하나의 흐름으로 경험하세요.",
};

const capabilities = [
  {
    icon: LayoutTemplate,
    title: "섹션 기반 디자인",
    description: "검증된 레이아웃 안에서 배경, 여백, 정렬을 선택합니다.",
  },
  {
    icon: Menu,
    title: "페이지와 메뉴 관리",
    description: "페이지를 만들면 Header GNB와 자연스럽게 연결됩니다.",
  },
  {
    icon: Palette,
    title: "브랜드 테마",
    description: "색상과 폰트를 한 번 설정해 모든 페이지에 일관되게 적용합니다.",
  },
  {
    icon: MonitorSmartphone,
    title: "반응형 미리보기",
    description: "데스크톱, 태블릿, 모바일 결과를 편집 중 바로 확인합니다.",
  },
  {
    icon: FileText,
    title: "콘텐츠 운영",
    description: "게시글, 문의, 미디어, 팝업을 디자인과 분리해 관리합니다.",
  },
  {
    icon: SearchCheck,
    title: "SEO와 게시",
    description: "검색 정보와 공개 상태를 확인하고 사이트를 게시합니다.",
  },
];

export default function ProductPage() {
  return (
    <div className="bg-white text-slate-950">
      <MarketingHeader />
      <main>
        <section className="border-b border-slate-200 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-blue-600">제품 소개</p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.15] tracking-normal sm:text-6xl">
                좋은 디자인을 위한
                <br />
                더 쉬운 편집 방식.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
                KEYUN은 빈 캔버스 대신 좋은 선택지를 제공합니다. 사용자는
                콘텐츠에 집중하고, 레이아웃은 안정적인 규칙 안에서 완성됩니다.
              </p>
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-8 h-12 bg-blue-600 px-5 text-white hover:bg-blue-700",
                )}
                href="/signup?next=/dashboard/sites/new"
              >
                무료로 시작하기
                <ArrowRight />
              </Link>
            </div>
            <div className="mt-12">
              <ProductPreview />
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-600">하나의 작업 흐름</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                디자인부터 운영까지 이어집니다.
              </h2>
            </div>
            <div className="mt-10 grid border-y border-slate-200 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    className={cn(
                      "border-slate-200 py-8 md:p-8",
                      index % 2 === 1 && "md:border-l",
                      index > 1 && "border-t",
                      index > 0 && index < 2 && "border-t md:border-t-0",
                      index % 3 !== 0 && "lg:border-l",
                      index > 2 && "lg:border-t",
                    )}
                    key={item.title}
                  >
                    <Icon className="size-5 text-blue-600" />
                    <h3 className="mt-8 text-lg font-semibold">{item.title}</h3>
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
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <Image
                alt="모듈형 웹사이트를 구성하는 KEYUN"
                className="h-auto w-full"
                height={960}
                src="/keyun-builder-hero.png"
                width={1694}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-600">프리셋의 장점</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                제한이 아니라,
                <br />
                좋은 결과를 위한 기준입니다.
              </h2>
              <div className="mt-8 space-y-5">
                {[
                  "콘텐츠가 바뀌어도 레이아웃이 무너지지 않습니다.",
                  "브랜드 스타일이 모든 페이지에서 일관됩니다.",
                  "모바일 화면을 따로 다시 만들 필요가 없습니다.",
                  "운영자가 실수하기 어려운 편집 환경을 제공합니다.",
                ].map((item) => (
                  <p className="flex items-start gap-3 text-sm leading-6 text-slate-600" key={item}>
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check className="size-3" />
                    </span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <h2 className="text-3xl font-semibold tracking-normal">
                설명보다 직접 만드는 편이 빠릅니다.
              </h2>
              <p className="mt-3 text-sm text-blue-100">
                업종을 선택하고 KEYUN의 추천 구성으로 시작하세요.
              </p>
            </div>
            <Link
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 bg-white px-5 text-blue-700 hover:bg-blue-50",
              )}
              href="/signup?next=/dashboard/sites/new"
            >
              내 사이트 만들기
              <ArrowRight />
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
