"use client";

import {
  Check,
  ChevronDown,
  GripVertical,
  ImageIcon,
  Laptop,
  LayoutTemplate,
  Monitor,
  Plus,
  Smartphone,
  Type,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const sections = [
  { label: "메인 비주얼", icon: ImageIcon },
  { label: "서비스 소개", icon: LayoutTemplate },
  { label: "브랜드 스토리", icon: Type },
];

const colors = ["#3B6EF0", "#111827", "#10B981"];

export function ProductPreview({ compact = false }: { compact?: boolean }) {
  const [activeSection, setActiveSection] = useState(0);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [brandColor, setBrandColor] = useState(colors[0]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex h-11 items-center justify-between border-b border-slate-200 px-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 hidden text-[11px] font-medium text-slate-500 sm:block">
            KEYUN Editor
          </span>
        </div>
        <div className="flex rounded-md bg-slate-100 p-0.5">
          <button
            aria-label="데스크톱 미리보기"
            aria-pressed={device === "desktop"}
            className={cn(
              "flex size-7 items-center justify-center rounded",
              device === "desktop" ? "bg-white text-blue-600" : "text-slate-400",
            )}
            onClick={() => setDevice("desktop")}
            type="button"
          >
            <Monitor className="size-3.5" />
          </button>
          <button
            aria-label="모바일 미리보기"
            aria-pressed={device === "mobile"}
            className={cn(
              "flex size-7 items-center justify-center rounded",
              device === "mobile" ? "bg-white text-blue-600" : "text-slate-400",
            )}
            onClick={() => setDevice("mobile")}
            type="button"
          >
            <Smartphone className="size-3.5" />
          </button>
        </div>
        <button
          className="rounded-md bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white"
          type="button"
        >
          게시하기
        </button>
      </div>

      <div
        className={cn(
          "grid bg-slate-100",
          compact
            ? "min-h-[360px] grid-cols-[116px_1fr]"
            : "min-h-[420px] grid-cols-[104px_minmax(0,1fr)] sm:min-h-[500px] sm:grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[150px_1fr_170px]",
        )}
      >
        <aside className="border-r border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold text-slate-400">현재 페이지</p>
          <button
            className="mt-2 flex w-full items-center justify-between rounded-md bg-slate-50 px-2 py-2 text-[11px] font-semibold text-slate-700"
            type="button"
          >
            홈
            <ChevronDown className="size-3" />
          </button>
          <p className="mt-5 text-[10px] font-semibold text-slate-400">섹션</p>
          <div className="mt-2 space-y-1">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <button
                  aria-pressed={activeSection === index}
                  className={cn(
                    "flex w-full items-center gap-1.5 rounded-md px-1.5 py-2 text-left text-[10px]",
                    activeSection === index
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                  key={section.label}
                  onClick={() => setActiveSection(index)}
                  type="button"
                >
                  <GripVertical className="size-3 text-slate-300" />
                  <Icon className="size-3" />
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </div>
          <button
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 py-2 text-[10px] font-medium text-slate-500"
            type="button"
          >
            <Plus className="size-3" />
            섹션 추가
          </button>
        </aside>

        <div className="flex items-center justify-center overflow-hidden p-3 sm:p-5">
          <div
            className={cn(
              "overflow-hidden border border-slate-200 bg-white transition-[width] duration-300",
              device === "desktop" ? "w-full max-w-2xl" : "w-[210px]",
            )}
          >
            <div className="flex h-8 items-center justify-between border-b border-slate-100 px-3">
              <span className="h-2 w-12 rounded-full bg-slate-900" />
              <div className="flex gap-2">
                <span className="h-1.5 w-7 rounded-full bg-slate-200" />
                <span className="h-1.5 w-7 rounded-full bg-slate-200" />
                <span
                  className="h-4 w-9 rounded"
                  style={{ backgroundColor: brandColor }}
                />
              </div>
            </div>
            <div
              className={cn(
                "grid min-h-40 items-center gap-4 border-2 border-blue-500 bg-slate-50 p-5",
                device === "desktop" && "grid-cols-[1fr_0.8fr]",
              )}
            >
              <div>
                <span
                  className="inline-block h-2 w-12 rounded-full opacity-30"
                  style={{ backgroundColor: brandColor }}
                />
                <div className="mt-3 h-3 w-4/5 rounded-full bg-slate-900" />
                <div className="mt-2 h-3 w-3/5 rounded-full bg-slate-900" />
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200" />
                <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-slate-200" />
                <div
                  className="mt-4 h-6 w-20 rounded"
                  style={{ backgroundColor: brandColor }}
                />
              </div>
              {device === "desktop" && (
                <div
                  className="aspect-[4/3] rounded bg-[linear-gradient(135deg,#dbeafe,#f8fafc)] p-3"
                  style={{ borderBottom: `12px solid ${brandColor}` }}
                >
                  <div className="h-full rounded border border-white/70 bg-white/60" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 p-3">
              {[0, 1, 2].map((item) => (
                <div className="rounded border border-slate-100 p-2" key={item}>
                  <span className="block size-5 rounded bg-slate-100" />
                  <span className="mt-2 block h-1.5 w-3/4 rounded-full bg-slate-300" />
                  <span className="mt-1.5 block h-1 w-full rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {!compact && (
          <aside className="hidden border-l border-slate-200 bg-white p-3 lg:block">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
              <Laptop className="size-3.5 text-blue-600" />
              섹션 스타일
            </div>
            <p className="mt-4 text-[10px] font-medium text-slate-500">레이아웃</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {[0, 1].map((item) => (
                <button
                  aria-pressed={item === activeSection % 2}
                  className={cn(
                    "relative h-12 rounded border p-1.5",
                    item === activeSection % 2
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200",
                  )}
                  key={item}
                  onClick={() => setActiveSection(item)}
                  type="button"
                >
                  <span className="block h-full rounded bg-white" />
                  {item === activeSection % 2 && (
                    <span className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="size-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[10px] font-medium text-slate-500">브랜드 색상</p>
            <div className="mt-2 flex gap-2">
              {colors.map((color) => (
                <button
                  aria-label={`${color} 색상 선택`}
                  aria-pressed={brandColor === color}
                  className={cn(
                    "size-7 rounded-md border-2 border-white ring-1",
                    brandColor === color ? "ring-slate-900" : "ring-slate-200",
                  )}
                  key={color}
                  onClick={() => setBrandColor(color)}
                  style={{ backgroundColor: color }}
                  type="button"
                />
              ))}
            </div>
            <p className="mt-4 text-[10px] font-medium text-slate-500">섹션 간격</p>
            <div className="mt-2 h-1.5 rounded-full bg-slate-100">
              <div
                className="h-full w-3/5 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
