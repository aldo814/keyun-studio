import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, Layers3, SearchCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type LucideIcon = ComponentType<{ className?: string }>;

const featureCards: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  { title: "템플릿", description: "빠른 사이트 시작", icon: Layers3 },
  { title: "SEO", description: "검색 노출 준비", icon: SearchCheck },
  { title: "게시", description: "초안에서 공개까지", icon: ArrowRight },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 px-4 py-6 text-white sm:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-300">
            <Sparkles className="size-4 text-blue-300" />
            Keyun Studio
          </div>
          <h1 className="text-4xl font-semibold tracking-normal text-balance sm:text-6xl lg:text-7xl">
            홈페이지 제작을 더 빠르고 정확하게.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            템플릿 선택부터 SEO 설정, 게시까지 한 흐름으로 관리하는 키운
            스튜디오 웹빌더입니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              render={<Link href="/login?next=/dashboard" />}
            >
              시작하기
              <ArrowRight />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/15 bg-white/[0.04] text-white hover:bg-white/10"
              render={<Link href="/signup?next=/dashboard" />}
            >
              계정 만들기
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {featureCards.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
              >
                <Icon className="size-5 text-blue-300" />
                <p className="mt-4 text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs text-zinc-400">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[420px] lg:min-h-[620px]">
          <div className="absolute inset-0 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_35%_20%,rgba(37,99,235,0.85),transparent_28%),radial-gradient(circle_at_80%_65%,rgba(124,58,237,0.55),transparent_30%),linear-gradient(145deg,#020617,#050505)] shadow-2xl" />
          <div className="absolute left-[12%] top-[14%] h-36 w-64 rotate-[-10deg] rounded-lg border border-blue-300/25 bg-blue-500/15" />
          <div className="absolute right-[10%] top-[32%] h-48 w-72 rotate-6 rounded-lg border border-violet-300/20 bg-white/[0.06]" />
          <div className="absolute bottom-[14%] left-[18%] h-44 w-80 rotate-[-4deg] rounded-lg border border-white/10 bg-zinc-950/70 p-5">
            <p className="text-xs text-blue-300">Builder Flow</p>
            <p className="mt-4 text-2xl font-semibold">Create. Edit. Publish.</p>
            <div className="mt-6 space-y-2">
              <div className="h-2 w-2/3 rounded-full bg-white/20" />
              <div className="h-2 w-1/2 rounded-full bg-white/10" />
              <div className="h-2 w-3/4 rounded-full bg-blue-300/40" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
