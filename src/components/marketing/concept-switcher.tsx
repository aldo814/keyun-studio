import Link from "next/link";

import { cn } from "@/lib/utils";

const concepts = [
  { id: "product-first", label: "A · Product", href: "/concepts/product-first" },
  { id: "interactive-3d", label: "B · 3D", href: "/concepts/interactive-3d" },
  {
    id: "template-showcase",
    label: "C · Template",
    href: "/concepts/template-showcase",
  },
];

export function ConceptSwitcher({ active }: { active: string }) {
  return (
    <nav
      aria-label="랜딩페이지 시안 비교"
      className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-lg backdrop-blur"
    >
      <span className="hidden px-2 text-[10px] font-semibold text-slate-400 sm:block">
        시안 비교
      </span>
      {concepts.map((concept) => (
        <Link
          aria-current={active === concept.id ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors",
            active === concept.id
              ? "bg-slate-950 text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
          )}
          href={concept.href}
          key={concept.id}
        >
          {concept.label}
        </Link>
      ))}
    </nav>
  );
}
