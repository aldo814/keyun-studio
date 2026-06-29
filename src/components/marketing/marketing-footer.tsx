import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const footerGroups = [
  {
    title: "제품",
    links: [
      { label: "제품 소개", href: "/product" },
      { label: "템플릿", href: "/#templates" },
      { label: "요금제", href: "/#pricing" },
    ],
  },
  {
    title: "회사",
    links: [
      { label: "회사 소개", href: "/about" },
      { label: "문의하기", href: "/contact" },
    ],
  },
  {
    title: "계정",
    links: [
      { label: "로그인", href: "/login?next=/dashboard" },
      { label: "무료로 시작하기", href: "/signup?next=/dashboard/sites/new" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <Image
            alt="KEYUN"
            className="h-7 w-auto"
            height={30}
            src="/keyun-logo.svg"
            width={126}
          />
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
            디자인을 고민하는 시간은 줄이고, 브랜드를 키우는 일에 집중하세요.
            KEYUN은 결과물이 예쁜 프리셋 기반 웹사이트 빌더입니다.
          </p>
          <a
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-blue-600"
            href="mailto:hello@keyun.io"
          >
            hello@keyun.io
            <ArrowUpRight className="size-4" />
          </a>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-slate-950">{group.title}</p>
              <div className="mt-4 grid gap-3">
                {group.links.map((link) => (
                  <Link
                    className="text-sm text-slate-500 hover:text-slate-950"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© KEYUN. All rights reserved.</p>
          <div className="flex gap-5">
            <span>이용약관</span>
            <span>개인정보처리방침</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
