import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "제품 소개", href: "/product" },
  { label: "템플릿", href: "/#templates" },
  { label: "요금제", href: "/#pricing" },
  { label: "회사 소개", href: "/about" },
  { label: "문의하기", href: "/contact" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link aria-label="KEYUN 홈" href="/">
          <Image
            alt="KEYUN"
            className="h-7 w-auto"
            height={30}
            priority
            src="/keyun-logo.svg"
            width={126}
          />
        </Link>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <Link
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            className={buttonVariants({ variant: "ghost" })}
            href="/login?next=/dashboard"
          >
            로그인
          </Link>
          <Link
            className={cn(
              buttonVariants(),
              "bg-blue-600 text-white hover:bg-blue-700",
            )}
            href="/signup?next=/dashboard/sites/new"
          >
            무료로 시작하기
            <ArrowRight />
          </Link>
        </div>

        <details className="group relative lg:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 text-slate-700 marker:content-none">
            <Menu className="size-5" />
            <span className="sr-only">메뉴 열기</span>
          </summary>
          <div className="absolute right-0 top-12 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            <nav aria-label="모바일 메뉴" className="grid">
              {navigation.map((item) => (
                <Link
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
              <Link
                className={buttonVariants({ variant: "outline" })}
                href="/login?next=/dashboard"
              >
                로그인
              </Link>
              <Link
                className={cn(buttonVariants(), "bg-blue-600 text-white")}
                href="/signup?next=/dashboard/sites/new"
              >
                시작하기
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
