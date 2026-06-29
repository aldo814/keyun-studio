import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Eye, Gauge, HeartHandshake } from "lucide-react";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "회사 소개",
  description:
    "누구나 좋은 웹사이트를 만들고 오래 운영할 수 있도록, KEYUN은 쉬운 선택과 예쁜 기본값을 설계합니다.",
};

const principles = [
  {
    icon: Eye,
    title: "예쁜 기본값",
    description:
      "사용자가 세부 디자인을 몰라도 첫 선택부터 완성도 높은 결과를 얻도록 설계합니다.",
  },
  {
    icon: Gauge,
    title: "쉬운 선택",
    description:
      "수많은 옵션 대신 지금 필요한 선택지만 보여주어 만드는 속도를 높입니다.",
  },
  {
    icon: HeartHandshake,
    title: "지속 가능한 운영",
    description:
      "제작 이후에도 운영자가 직접 콘텐츠를 바꾸고 사이트를 성장시킬 수 있어야 합니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-slate-950">
      <MarketingHeader />
      <main>
        <section className="border-b border-slate-200 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold text-blue-600">회사 소개</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.18] tracking-normal sm:text-6xl">
              좋은 웹사이트를 만들기 위해
              <br />
              모두가 전문가일 필요는 없습니다.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-slate-600">
              KEYUN은 디자인과 개발의 복잡함을 좋은 프리셋 안에 담습니다.
              사용자는 자신의 브랜드와 콘텐츠에 집중하고, 기술은 그 선택을
              안정적인 웹사이트로 완성합니다.
            </p>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold text-blue-600">우리가 해결하는 문제</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal">
                제작은 끝이 아니라
                <br />
                운영의 시작이니까.
              </h2>
            </div>
            <div className="border-t border-slate-200">
              {[
                "웹사이트 제작은 어렵고 외주 의존도는 높습니다.",
                "자유도가 높은 도구는 결과물의 품질을 보장하기 어렵습니다.",
                "제작이 끝나도 작은 수정마다 전문가의 도움이 필요합니다.",
              ].map((item, index) => (
                <div
                  className="grid grid-cols-[40px_1fr] gap-4 border-b border-slate-200 py-6"
                  key={item}
                >
                  <span className="font-mono text-xs text-slate-400">0{index + 1}</span>
                  <p className="text-lg font-medium leading-7 text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold text-blue-300">제품 원칙</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
              KEYUN이 지키는 세 가지 기준
            </h2>
            <div className="mt-12 grid border-y border-white/15 md:grid-cols-3">
              {principles.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    className={cn(
                      "py-8 md:px-8 md:py-10",
                      index > 0 && "border-t border-white/15 md:border-l md:border-t-0",
                      index === 0 && "md:pl-0",
                    )}
                    key={item.title}
                  >
                    <Icon className="size-5 text-blue-300" />
                    <h3 className="mt-12 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Check className="size-5" />
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-normal sm:text-4xl">
              만들기 쉬운 사이트는 운영도 쉬워야 합니다.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              KEYUN은 처음 만드는 순간부터 게시 이후의 관리까지 하나의 경험으로
              연결합니다.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 bg-blue-600 px-5 text-white hover:bg-blue-700",
                )}
                href="/signup?next=/dashboard/sites/new"
              >
                무료로 시작하기
                <ArrowRight />
              </Link>
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 px-5",
                )}
                href="/contact"
              >
                도입 문의하기
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
