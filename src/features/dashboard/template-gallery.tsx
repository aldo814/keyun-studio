"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Template = {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  status: string;
  category: string;
  isFeatured: boolean;
};

const CATEGORIES = ["전체", "비즈니스", "포트폴리오", "쇼핑몰", "기타"];

const GRADIENT_MAP: Record<string, string> = {
  비즈니스: "from-blue-50 via-indigo-50 to-blue-100",
  포트폴리오: "from-violet-50 via-purple-50 to-violet-100",
  쇼핑몰: "from-emerald-50 via-teal-50 to-emerald-100",
  기타: "from-slate-50 via-gray-50 to-slate-100",
};

type TemplateGalleryProps = {
  templates: Template[];
};

export function TemplateGallery({ templates }: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [search, setSearch] = useState("");

  const filtered = templates.filter((t) => {
    const matchCategory = activeCategory === "전체" || t.category === activeCategory;
    const matchSearch =
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* 검색 */}
      <input
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        placeholder="템플릿 이름 또는 설명 검색"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
            type="button"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 그리드 */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            아직 등록된 템플릿이 없습니다
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            어드민에서 템플릿을 추가하면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="group overflow-hidden rounded-lg border border-border bg-card"
            >
              <Link
                aria-label={`${template.name} 미리보기`}
                className={cn(
                  "relative block aspect-[16/10] overflow-hidden bg-gradient-to-br",
                  GRADIENT_MAP[template.category] ?? GRADIENT_MAP["기타"],
                )}
                href={`/dashboard/design/templates/${template.id}/preview`}
              >
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
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
                    <div className="h-4 w-32 rounded bg-white/60" />
                    <div className="h-8 w-44 rounded bg-white/80" />
                    <div className="h-2 w-36 rounded bg-white/40" />
                    <div className="mt-2 h-2 w-28 rounded bg-white/40" />
                    <div className="mt-3 h-8 w-24 rounded-lg bg-blue-500/70" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                {template.isFeatured && (
                  <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    추천
                  </span>
                )}
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-white">
                  <span className="text-xs font-semibold">전체 미리보기</span>
                  <Eye className="size-4" />
                </div>
              </Link>

              <div className="p-4">
                <div>
                  <p className="truncate text-sm font-semibold">{template.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{template.category}</p>
                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">
                    {template.description}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    className={buttonVariants({ size: "sm", variant: "outline" })}
                    href={`/dashboard/design/templates/${template.id}/preview`}
                  >
                    <Eye />
                    미리보기
                  </Link>
                  <Link
                    className={buttonVariants({ size: "sm", variant: "default" })}
                    href={`/dashboard/sites/new?templateId=${template.id}`}
                  >
                    사용
                    <ArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
