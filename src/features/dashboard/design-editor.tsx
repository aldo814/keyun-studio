"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Check,
  Copy,
  Eye,
  FileText,
  GripVertical,
  Home,
  ImageIcon,
  Laptop,
  Layers3,
  Monitor,
  MoreHorizontal,
  Palette,
  Plus,
  Settings,
  Smartphone,
  Tablet,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateDraftJson } from "@/features/dashboard/actions";
import { cn } from "@/lib/utils";
import type { Json } from "@/types/database";

type EditorSection = Record<string, unknown>;

type DesignSettings = {
  bodyFontFamily: string;
  englishFontFamily: string;
  footerAccentColor: string;
  footerBgColor: string;
  footerLayout: string;
  footerTextColor: string;
  headerBgColor: string;
  headerButtonBgColor: string;
  headerButtonTextColor: string;
  headerLayout: string;
  headerPosition: string;
  headerTextColor: string;
  headingFontFamily: string;
  mainColor: string;
  subColor: string;
  textColor: string;
  innerWidth: string;
  sectionGap: string;
};

type EditableDraft = Record<string, unknown> & {
  design: DesignSettings;
  sections: EditorSection[];
};

type DesignEditorProps = {
  site: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  page: {
    id: string;
    draftJson: Json;
    updatedAt: string;
  };
};

type ModulePreset = {
  category: string;
  description: string;
  layout: string;
  title: string;
  type: string;
};

type EditorViewport = "desktop" | "tablet" | "mobile";
type RightPanelMode = "library" | "settings";
type SelectedElement =
  | "site"
  | "section"
  | "badge"
  | "title"
  | "description"
  | "button"
  | "secondaryButton"
  | "visual";

const defaultDesign: DesignSettings = {
  bodyFontFamily: "system",
  englishFontFamily: "inter",
  footerAccentColor: "#2563eb",
  footerBgColor: "#0f172a",
  footerLayout: "info",
  footerTextColor: "#ffffff",
  headerBgColor: "#ffffff",
  headerButtonBgColor: "#0f172a",
  headerButtonTextColor: "#ffffff",
  headerLayout: "center",
  headerPosition: "fixed",
  headerTextColor: "#0f172a",
  headingFontFamily: "system",
  mainColor: "#2563eb",
  subColor: "#dbeafe",
  textColor: "#0f172a",
  innerWidth: "1200",
  sectionGap: "80",
};

const sectionTypes = [
  { value: "hero", label: "히어로", icon: Monitor },
  { value: "features", label: "기능", icon: Layers3 },
  { value: "content", label: "서비스", icon: FileText },
  { value: "cta", label: "CTA", icon: ArrowRight },
];

const modulePresets: ModulePreset[] = [
  {
    category: "히어로",
    description: "첫 화면에 가장 적합한 슬라이드형 메인 비주얼",
    layout: "slide",
    title: "슬라이드 히어로",
    type: "hero",
  },
  {
    category: "히어로",
    description: "강한 전환 버튼과 메시지를 함께 보여주는 구성",
    layout: "cta-focus",
    title: "CTA 강조형 히어로",
    type: "hero",
  },
  {
    category: "히어로",
    description: "좌측 텍스트와 우측 비주얼이 균형 잡힌 구성",
    layout: "split-visual",
    title: "비주얼 강조 히어로",
    type: "hero",
  },
  {
    category: "히어로",
    description: "문구 중심으로 빠르게 메시지를 전달하는 구성",
    layout: "text-focus",
    title: "텍스트 중심 히어로",
    type: "hero",
  },
  {
    category: "기능",
    description: "핵심 장점을 카드로 안전하게 정리",
    layout: "cards",
    title: "기능 카드 그리드",
    type: "features",
  },
  {
    category: "기능",
    description: "서비스 흐름을 순서대로 보여주는 단계형 구성",
    layout: "timeline",
    title: "프로세스 타임라인",
    type: "features",
  },
  {
    category: "서비스",
    description: "이미지와 설명을 나란히 배치하는 소개 섹션",
    layout: "media-left",
    title: "이미지 설명 섹션",
    type: "content",
  },
  {
    category: "CTA",
    description: "페이지 하단 전환을 만드는 와이드 배너",
    layout: "banner",
    title: "와이드 CTA",
    type: "cta",
  },
];

const pageItems = ["메인 페이지", "회사 소개", "서비스", "가격", "블로그"];

const pageManagementItems = [
  { label: "메인 페이지", path: "/", status: "공개", menu: "제품" },
  { label: "회사 소개", path: "/about", status: "공개", menu: "회사" },
  { label: "서비스", path: "/service", status: "공개", menu: "솔루션" },
  { label: "가격", path: "/pricing", status: "비공개", menu: "가격" },
];

const widthOptions = [
  { label: "기본 1200", value: "1200" },
  { label: "넓게", value: "1440" },
  { label: "전체", value: "full" },
];

const shadowOptions = [
  { label: "없음", value: "none" },
  { label: "부드럽게", value: "soft" },
  { label: "강하게", value: "strong" },
];

const radiusOptions = [
  { label: "각짐", value: "8" },
  { label: "기본", value: "24" },
  { label: "둥글게", value: "36" },
];

const freeFontOptions = [
  {
    label: "시스템 기본",
    stack: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    value: "system",
  },
  {
    label: "Noto Sans KR",
    stack: "'Noto Sans KR', ui-sans-serif, system-ui, sans-serif",
    value: "noto-sans-kr",
  },
  {
    label: "IBM Plex Sans KR",
    stack: "'IBM Plex Sans KR', ui-sans-serif, system-ui, sans-serif",
    value: "ibm-plex-sans-kr",
  },
  {
    label: "Gowun Dodum",
    stack: "'Gowun Dodum', ui-sans-serif, system-ui, sans-serif",
    value: "gowun-dodum",
  },
  {
    label: "Inter",
    stack: "Inter, ui-sans-serif, system-ui, sans-serif",
    value: "inter",
  },
];

function createSectionId(type: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${type}-${Date.now()}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function defaultSectionStyle(type: string, layout: string) {
  const desktopPadding = type === "hero" ? "120" : "96";
  const tabletPadding = type === "hero" ? "96" : "80";
  const mobilePadding = type === "hero" ? "72" : "56";
  const titleFontSize = type === "hero" ? "48" : "32";

  return {
    align: layout === "text-focus" ? "center" : "left",
    backgroundType: layout === "cta-focus" ? "color" : "gradient",
    bgColor: "#f8fbff",
    gradientFrom: "#f3f7ff",
    gradientTo: "#ffffff",
    glass: "off",
    imageUrl: "",
    mediaPosition: type === "content" ? "left" : type === "hero" ? "right" : "center",
    paddingBottom: desktopPadding,
    paddingBottomDesktop: desktopPadding,
    paddingBottomMobile: mobilePadding,
    paddingBottomTablet: tabletPadding,
    paddingTop: desktopPadding,
    paddingTopDesktop: desktopPadding,
    paddingTopMobile: mobilePadding,
    paddingTopTablet: tabletPadding,
    radius: "24",
    shadow: "soft",
    titleFontSize,
    videoUrl: "",
    width: "1200",
  };
}

function createSection(type: string, layout?: string): EditorSection {
  const nextLayout =
    layout ??
    (type === "hero"
      ? "slide"
      : type === "features"
        ? "cards"
        : type === "cta"
          ? "banner"
          : "media-left");

  const base = {
    builderId: createSectionId(type),
    layout: nextLayout,
    type,
    ...defaultSectionStyle(type, nextLayout),
  };

  if (type === "hero") {
    return {
      ...base,
      badge: "AI · No Code · Web Solution",
      buttonLabel: "무료로 시작하기",
      buttonLink: "#contact",
      description:
        "KEYUN은 AI와 노코드 기술로 비즈니스의 시작부터 성장까지 모든 과정을 지원하는 통합 솔루션 플랫폼입니다.",
      secondaryButtonLabel: "제품 살펴보기",
      title: "아이디어를 실현하는 가장 스마트한 방법, KEYUN",
    };
  }

  if (type === "features") {
    return {
      ...base,
      badge: "Features",
      description: "검증된 섹션을 조합해 디자인 품질을 유지합니다.",
      items: ["프리셋 기반 편집", "섹션 상하 이동", "실시간 미리보기"],
      title: "쉬운데 결과물이 예쁜 빌더",
    };
  }

  if (type === "cta") {
    return {
      ...base,
      buttonLabel: "상담 신청",
      buttonLink: "#contact",
      description: "저장 후 게시하면 공개 URL에 바로 반영됩니다.",
      title: "이제 사이트를 게시할 시간입니다",
    };
  }

  return {
    ...base,
    badge: "Service",
    description: "브랜드 메시지를 안정적인 레이아웃으로 보여주는 섹션입니다.",
    title: "제한된 자유도로 완성도를 지킵니다",
  };
}

function stringValue(record: Record<string, unknown>, key: string, fallback = "") {
  const value = record[key];

  return typeof value === "string" ? value : fallback;
}

function numberValue(record: Record<string, unknown>, key: string, fallback: number) {
  const value = Number(stringValue(record, key, String(fallback)));

  return Number.isFinite(value) ? value : fallback;
}

function normalizeDesign(value: unknown): DesignSettings {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;

    return {
      bodyFontFamily: stringValue(record, "bodyFontFamily", defaultDesign.bodyFontFamily),
      englishFontFamily: stringValue(record, "englishFontFamily", defaultDesign.englishFontFamily),
      footerAccentColor: stringValue(record, "footerAccentColor", defaultDesign.footerAccentColor),
      footerBgColor: stringValue(record, "footerBgColor", defaultDesign.footerBgColor),
      footerLayout: stringValue(record, "footerLayout", defaultDesign.footerLayout),
      footerTextColor: stringValue(record, "footerTextColor", defaultDesign.footerTextColor),
      headerBgColor: stringValue(record, "headerBgColor", defaultDesign.headerBgColor),
      headerButtonBgColor: stringValue(
        record,
        "headerButtonBgColor",
        defaultDesign.headerButtonBgColor,
      ),
      headerButtonTextColor: stringValue(
        record,
        "headerButtonTextColor",
        defaultDesign.headerButtonTextColor,
      ),
      headerLayout: stringValue(record, "headerLayout", defaultDesign.headerLayout),
      headerPosition: stringValue(record, "headerPosition", defaultDesign.headerPosition),
      headerTextColor: stringValue(record, "headerTextColor", defaultDesign.headerTextColor),
      headingFontFamily: stringValue(record, "headingFontFamily", defaultDesign.headingFontFamily),
      mainColor: stringValue(record, "mainColor", defaultDesign.mainColor),
      subColor: stringValue(record, "subColor", defaultDesign.subColor),
      textColor: stringValue(record, "textColor", defaultDesign.textColor),
      innerWidth: stringValue(record, "innerWidth", defaultDesign.innerWidth),
      sectionGap: stringValue(record, "sectionGap", defaultDesign.sectionGap),
    };
  }

  return defaultDesign;
}

function toEditableJson(draftJson: Json): EditableDraft {
  if (draftJson && typeof draftJson === "object" && !Array.isArray(draftJson)) {
    const record = draftJson as Record<string, unknown>;
    const sections = Array.isArray(record.sections)
      ? record.sections.map((section, index) => {
          if (typeof section === "string") {
            return createSection(section);
          }

          if (section && typeof section === "object" && !Array.isArray(section)) {
            const sectionRecord = section as EditorSection;
            const type = stringValue(sectionRecord, "type", "content");
            const fallback = createSection(type);
            const layout = stringValue(sectionRecord, "layout", stringValue(fallback, "layout"));

            return {
              ...fallback,
              ...sectionRecord,
              ...defaultSectionStyle(type, layout),
              ...sectionRecord,
              builderId: stringValue(sectionRecord, "builderId", `${type}-${index}`),
              layout,
            };
          }

          return createSection("content");
        })
      : [];

    return {
      ...record,
      design: normalizeDesign(record.design),
      sections: sections.length
        ? sections
        : [createSection("hero"), createSection("features"), createSection("cta")],
    };
  }

  return {
    design: defaultDesign,
    sections: [createSection("hero"), createSection("features"), createSection("cta")],
    theme: "keyun-default",
    version: 1,
  };
}

function itemList(section: EditorSection) {
  const items = section.items;

  return Array.isArray(items) && items.length
    ? items.map(String)
    : ["프리셋 기반 편집", "섹션 상하 이동", "실시간 미리보기"];
}

function itemsValue(section: EditorSection) {
  const items = section.items;

  return Array.isArray(items) ? items.map(String).join("\n") : "";
}

function sectionLabel(type: string) {
  return sectionTypes.find((item) => item.value === type)?.label ?? "섹션";
}

function layoutLabel(section: EditorSection) {
  const layout = stringValue(section, "layout");
  const preset = modulePresets.find(
    (preset) => preset.type === stringValue(section, "type") && preset.layout === layout,
  );

  return preset?.title ?? layout;
}

function elementPanelTitle(element: SelectedElement) {
  if (element === "site") return "사이트 스타일";
  if (element === "badge") return "배지 텍스트";
  if (element === "title") return "제목 텍스트";
  if (element === "description") return "본문 텍스트";
  if (element === "button") return "기본 버튼";
  if (element === "secondaryButton") return "보조 버튼";
  if (element === "visual") return "이미지";

  return "섹션 설정";
}

function sectionBackground(section: EditorSection, design: DesignSettings): CSSProperties {
  const type = stringValue(section, "backgroundType", "gradient");
  const imageUrl = stringValue(section, "imageUrl");

  if (type === "video") {
    return {
      backgroundColor: stringValue(section, "bgColor", design.subColor),
    };
  }

  if (type === "image" && imageUrl) {
    return {
      backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.92), rgba(255,255,255,0.54)), url(${imageUrl})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
    };
  }

  if (type === "color") {
    return {
      backgroundColor: stringValue(section, "bgColor", design.subColor),
    };
  }

  return {
    backgroundImage: `linear-gradient(135deg, ${stringValue(section, "gradientFrom", "#f3f7ff")}, ${stringValue(section, "gradientTo", "#ffffff")})`,
  };
}

function shadowStyle(value: string) {
  if (value === "strong") {
    return "0 36px 90px rgba(37, 99, 235, 0.22), 0 12px 32px rgba(15, 23, 42, 0.08)";
  }

  if (value === "soft") {
    return "0 20px 60px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.45)";
  }

  return "none";
}

function sectionEffectStyle(section: EditorSection): CSSProperties {
  const glassEnabled = stringValue(section, "glass", "off") === "on";

  return {
    backdropFilter: glassEnabled ? "blur(18px) saturate(1.12)" : undefined,
    borderColor: glassEnabled ? "rgba(255, 255, 255, 0.64)" : undefined,
    boxShadow: shadowStyle(stringValue(section, "shadow", "soft")),
    WebkitBackdropFilter: glassEnabled ? "blur(18px) saturate(1.12)" : undefined,
  };
}

function childCardStyle(section: EditorSection): CSSProperties {
  const radius = Math.max(10, numberValue(section, "radius", 24) - 6);

  return {
    borderRadius: `${radius}px`,
    boxShadow: shadowStyle(stringValue(section, "shadow", "soft")),
  };
}

function widthClass(value: string) {
  if (value === "full") return "max-w-none";
  if (value === "1440") return "max-w-[1440px]";

  return "max-w-[1200px]";
}

function viewportSuffix(viewport: EditorViewport) {
  if (viewport === "mobile") return "Mobile";
  if (viewport === "tablet") return "Tablet";

  return "Desktop";
}

function paddingField(base: "paddingTop" | "paddingBottom", viewport: EditorViewport) {
  return `${base}${viewportSuffix(viewport)}`;
}

function responsivePaddingValue(
  section: EditorSection,
  base: "paddingTop" | "paddingBottom",
  viewport: EditorViewport,
  fallback: string,
) {
  return stringValue(
    section,
    paddingField(base, viewport),
    stringValue(section, base, fallback),
  );
}

function sectionMediaPosition(section: EditorSection) {
  const fallback = stringValue(section, "type", "content") === "content" ? "left" : "right";
  const value = stringValue(section, "mediaPosition", fallback);

  return value === "left" || value === "right" ? value : fallback;
}

function fontLabel(value: string) {
  return freeFontOptions.find((option) => option.value === value)?.label ?? "시스템 기본";
}

function fontStack(
  value: string,
  design: DesignSettings = defaultDesign,
  fallback: "body" | "english" | "heading" = "body",
) {
  if (value === "site-heading") {
    return fontStack(design.headingFontFamily, design, "heading");
  }

  if (value === "site-body") {
    return fontStack(design.bodyFontFamily, design, "body");
  }

  if (value === "site-english") {
    return fontStack(design.englishFontFamily, design, "english");
  }

  return (
    freeFontOptions.find((option) => option.value === value)?.stack ??
    fontStack(
      fallback === "heading"
        ? design.headingFontFamily
        : fallback === "english"
          ? design.englishFontFamily
          : design.bodyFontFamily,
      defaultDesign,
      "body",
    )
  );
}

function defaultTitleSize(section: EditorSection) {
  return stringValue(section, "type", "content") === "hero" ? "48" : "32";
}

function titleTextStyle(section: EditorSection, design: DesignSettings): CSSProperties {
  return {
    color: stringValue(section, "titleColor", design.textColor),
    fontFamily: fontStack(stringValue(section, "titleFontFamily", "site-heading"), design, "heading"),
    fontSize: `${stringValue(section, "titleFontSize", defaultTitleSize(section))}px`,
    letterSpacing: `${stringValue(section, "titleLetterSpacing", "0")}px`,
    lineHeight: stringValue(section, "titleLineHeight", "1.16"),
  };
}

function descriptionTextStyle(section: EditorSection, design: DesignSettings): CSSProperties {
  return {
    color: stringValue(section, "descriptionColor", "#64748b"),
    fontFamily: fontStack(stringValue(section, "descriptionFontFamily", "site-body"), design, "body"),
    fontSize: `${stringValue(section, "descriptionFontSize", "14")}px`,
    letterSpacing: `${stringValue(section, "descriptionLetterSpacing", "0")}px`,
    lineHeight: stringValue(section, "descriptionLineHeight", "1.72"),
  };
}

function buttonStyle(section: EditorSection, design: DesignSettings): CSSProperties {
  return {
    backgroundColor: stringValue(section, "buttonBgColor", design.mainColor),
    borderRadius: `${stringValue(section, "buttonRadius", "12")}px`,
    color: stringValue(section, "buttonTextColor", "#ffffff"),
    fontFamily: fontStack(stringValue(section, "buttonFontFamily", "site-body"), design, "body"),
    fontSize: `${stringValue(section, "buttonFontSize", "14")}px`,
    letterSpacing: `${stringValue(section, "buttonLetterSpacing", "0")}px`,
    lineHeight: stringValue(section, "buttonLineHeight", "1.1"),
  };
}

function MiniModulePreview({ preset }: { preset: ModulePreset }) {
  return (
    <div className="relative h-20 overflow-hidden rounded-md border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-2">
      <div className="absolute right-2 top-2 size-8 rounded-lg border border-white/70 bg-white/70" />
      <div className="space-y-1.5">
        <div className="h-2 w-14 rounded-full bg-blue-500/70" />
        <div className="h-2.5 w-24 rounded-full bg-slate-800/80" />
        <div className="h-1.5 w-20 rounded-full bg-slate-300" />
      </div>
      {preset.type === "features" ? (
        <div className="mt-4 grid grid-cols-3 gap-1">
          <div className="h-5 rounded bg-white/80" />
          <div className="h-5 rounded bg-white/80" />
          <div className="h-5 rounded bg-white/80" />
        </div>
      ) : (
        <div className="mt-4 h-5 w-16 rounded bg-blue-600" />
      )}
    </div>
  );
}

function EmptyVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-full min-h-72 overflow-hidden rounded-3xl border border-white/80 bg-white/45 shadow-[0_30px_90px_rgba(37,99,235,0.18)] backdrop-blur",
        className,
      )}
    >
      <div className="absolute left-8 top-8 flex gap-1.5">
        <span className="size-2 rounded-full bg-blue-200" />
        <span className="size-2 rounded-full bg-blue-200" />
        <span className="size-2 rounded-full bg-blue-200" />
      </div>
      <div className="absolute left-1/2 top-1/2 flex size-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-blue-100 bg-white/80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="h-8 w-auto" src="/keyun-logo.svg" />
      </div>
      <div className="absolute bottom-8 left-14 h-16 w-36 rounded-2xl border border-blue-100 bg-white/70" />
      <div className="absolute bottom-16 right-14 h-24 w-24 rounded-2xl border border-blue-100 bg-white/70" />
      <div className="absolute inset-x-12 bottom-0 h-24 rounded-t-[50%] bg-blue-500/10" />
    </div>
  );
}

function InlineEditFrame({
  active,
  children,
  className,
  label,
  onContextMenu,
  onSelect,
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
  label: string;
  onContextMenu?: (event: ReactMouseEvent) => void;
  onSelect?: () => void;
}) {
  return (
    <div
      className={cn(
        "group/inline relative rounded-lg outline outline-0 outline-offset-4 outline-blue-500/0 transition hover:outline-2 hover:outline-blue-400/40 focus-within:outline-2 focus-within:outline-blue-500/60",
        active && "outline-2 outline-blue-500/70",
        className,
      )}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
      onContextMenu={(event) => {
        event.stopPropagation();
        onContextMenu?.(event);
      }}
      onFocus={() => onSelect?.()}
    >
      <span
        className={cn(
          "pointer-events-none absolute -top-8 left-0 z-30 inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-blue-600 opacity-0 transition-opacity group-hover/inline:opacity-100 group-focus-within/inline:opacity-100",
          active && "opacity-100",
        )}
      >
        <Settings className="size-3" />
        {label}
      </span>
      {children}
    </div>
  );
}

function VisualEditable({
  active,
  className,
  emptyClassName,
  imageUrl,
  onContextMenu,
  onUpload,
  onSelect,
}: {
  active?: boolean;
  className?: string;
  emptyClassName?: string;
  imageUrl: string;
  onContextMenu?: (event: ReactMouseEvent) => void;
  onUpload: () => void;
  onSelect?: () => void;
}) {
  return (
    <button
      className={cn(
        "group/visual relative block w-full overflow-hidden rounded-3xl text-left outline outline-0 outline-offset-4 outline-blue-500/0 transition hover:outline-2 hover:outline-blue-400/40",
        active && "outline-2 outline-blue-500/70",
        className,
      )}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onUpload();
      }}
      onContextMenu={(event) => {
        event.stopPropagation();
        onContextMenu?.(event);
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="h-full min-h-72 w-full rounded-3xl object-cover"
          src={imageUrl}
        />
      ) : (
        <EmptyVisual className={emptyClassName} />
      )}
      <span className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/0 text-sm font-semibold text-white opacity-0 transition group-hover/visual:bg-slate-950/35 group-hover/visual:opacity-100">
        <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2 text-slate-900">
          <UploadCloud className="size-4 text-blue-600" />
          이미지 설정
        </span>
      </span>
    </button>
  );
}

type CanvasSectionProps = {
  design: DesignSettings;
  index: number;
  isSelected: boolean;
  moveSection: (index: number, direction: -1 | 1) => void;
  openContextMenu: (
    event: ReactMouseEvent,
    index: number,
    element: SelectedElement,
  ) => void;
  requestVisualUpload: (index: number) => void;
  removeSection: (index: number) => void;
  section: EditorSection;
  selectedElement: SelectedElement;
  selectElement: (index: number, element: SelectedElement) => void;
  selectSection: (index: number) => void;
  updateField: (index: number, key: string, value: string) => void;
  updateItems: (index: number, value: string) => void;
  viewport: EditorViewport;
};

function CanvasSection({
  design,
  index,
  isSelected,
  moveSection,
  openContextMenu,
  requestVisualUpload,
  removeSection,
  section,
  selectedElement,
  selectElement,
  selectSection,
  updateField,
  updateItems,
  viewport,
}: CanvasSectionProps) {
  const type = stringValue(section, "type", "content");
  const layout = stringValue(section, "layout");
  const align = stringValue(section, "align", "left");
  const backgroundType = stringValue(section, "backgroundType", "gradient");
  const imageUrl = stringValue(section, "imageUrl");
  const items = itemList(section);
  const mediaPosition = sectionMediaPosition(section);
  const videoUrl = stringValue(section, "videoUrl");
  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const sectionStyle = {
    ...sectionBackground(section, design),
    ...sectionEffectStyle(section),
    borderRadius: `${stringValue(section, "radius", "24")}px`,
    color: design.textColor,
    paddingBottom: `${responsivePaddingValue(section, "paddingBottom", viewport, "96")}px`,
    paddingTop: `${responsivePaddingValue(section, "paddingTop", viewport, "96")}px`,
  };
  const cardStyle = childCardStyle(section);
  const activeElement = (element: SelectedElement) => isSelected && selectedElement === element;
  const selectElementForSection = (element: SelectedElement) => {
    selectElement(index, element);
  };

  return (
    <section
      className={cn(
        "group relative overflow-hidden border transition-all",
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-transparent hover:border-blue-300",
      )}
      style={sectionStyle}
      onClick={() => selectSection(index)}
      onContextMenu={(event) => openContextMenu(event, index, "section")}
    >
      {backgroundType === "video" && videoUrl ? (
        <>
          <video
            aria-hidden
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            loop
            muted
            playsInline
            src={videoUrl}
          />
          <div className="absolute inset-0 bg-white/72" />
        </>
      ) : null}

      {isSelected ? (
        <>
          <span className="absolute left-0 top-0 z-20 rounded-br-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
            {sectionLabel(type)} 섹션
          </span>
          <div className="absolute right-5 top-5 z-20 flex items-center rounded-lg border border-slate-200 bg-white/95 p-1 backdrop-blur">
            <Button
              size="icon"
              title="위로 이동"
              type="button"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                moveSection(index, -1);
              }}
            >
              <ArrowUp />
            </Button>
            <Button
              size="icon"
              title="아래로 이동"
              type="button"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                moveSection(index, 1);
              }}
            >
              <ArrowDown />
            </Button>
            <Button size="icon" title="복제" type="button" variant="ghost">
              <Copy />
            </Button>
            <Button
              size="icon"
              title="삭제"
              type="button"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                removeSection(index);
              }}
            >
              <Trash2 />
            </Button>
            <Button size="icon" title="더보기" type="button" variant="ghost">
              <MoreHorizontal />
            </Button>
          </div>
        </>
      ) : null}

      <div
        className={cn(
          "relative z-10 mx-auto w-full px-10",
          widthClass(stringValue(section, "width", design.innerWidth)),
        )}
      >
        {type === "hero" ? (
          <div
            className={cn(
              "grid items-center gap-10",
              layout === "text-focus" || layout === "cta-focus"
                ? "mx-auto max-w-3xl grid-cols-1"
                : "lg:grid-cols-[0.95fr_1.05fr]",
              alignClass,
            )}
          >
            <div
              className={cn(
                align === "center" ? "mx-auto" : "",
                "max-w-2xl",
                mediaPosition === "left" && layout !== "text-focus" && layout !== "cta-focus"
                  ? "lg:order-2"
                  : "lg:order-1",
              )}
            >
              <InlineEditFrame
                active={activeElement("badge")}
                className="inline-block"
                label="배지 바로 수정"
                onContextMenu={(event) => openContextMenu(event, index, "badge")}
                onSelect={() => selectElementForSection("badge")}
              >
                <Input
                  className="inline-flex h-8 w-auto rounded-full border-blue-100 bg-white/70 px-4 text-xs font-semibold text-blue-600"
                  placeholder="배지"
                  value={stringValue(section, "badge")}
                  onChange={(event) => updateField(index, "badge", event.target.value)}
                />
              </InlineEditFrame>
              <InlineEditFrame
                active={activeElement("title")}
                className="mt-8"
                label="제목 바로 수정"
                onContextMenu={(event) => openContextMenu(event, index, "title")}
                onSelect={() => selectElementForSection("title")}
              >
                <Textarea
                  className="min-h-28 resize-none border-0 bg-transparent p-0 text-4xl font-bold leading-tight tracking-normal shadow-none focus-visible:ring-0 lg:text-5xl"
                  placeholder="제목을 입력하세요"
                  style={titleTextStyle(section, design)}
                  value={stringValue(section, "title")}
                  onChange={(event) => updateField(index, "title", event.target.value)}
                />
              </InlineEditFrame>
              <InlineEditFrame
                active={activeElement("description")}
                className="mt-4"
                label="설명 바로 수정"
                onContextMenu={(event) => openContextMenu(event, index, "description")}
                onSelect={() => selectElementForSection("description")}
              >
                <Textarea
                  className="min-h-20 resize-none border-0 bg-transparent p-0 text-sm leading-7 text-slate-600 shadow-none focus-visible:ring-0"
                  placeholder="설명을 입력하세요"
                  style={descriptionTextStyle(section, design)}
                  value={stringValue(section, "description")}
                  onChange={(event) =>
                    updateField(index, "description", event.target.value)
                  }
                />
              </InlineEditFrame>
              <div
                className={cn(
                  "mt-8 flex flex-wrap items-center gap-3",
                  align === "center" ? "justify-center" : align === "right" ? "justify-end" : "",
                )}
              >
                <InlineEditFrame
                  active={activeElement("button")}
                  label="버튼 문구 수정"
                  onContextMenu={(event) => openContextMenu(event, index, "button")}
                  onSelect={() => selectElementForSection("button")}
                >
                  <Input
                    className="h-12 w-40 rounded-lg border-0 px-5 text-center text-sm font-semibold text-white focus-visible:ring-2"
                    placeholder="버튼"
                    style={buttonStyle(section, design)}
                    value={stringValue(section, "buttonLabel")}
                    onChange={(event) =>
                      updateField(index, "buttonLabel", event.target.value)
                    }
                  />
                </InlineEditFrame>
                {stringValue(section, "secondaryButtonLabel") ? (
                  <InlineEditFrame
                    active={activeElement("secondaryButton")}
                    label="보조 버튼 수정"
                    onContextMenu={(event) =>
                      openContextMenu(event, index, "secondaryButton")
                    }
                    onSelect={() => selectElementForSection("secondaryButton")}
                  >
                    <Input
                      className="h-12 w-40 border-0 bg-transparent text-center text-sm font-semibold focus-visible:ring-0"
                      placeholder="보조 버튼"
                      value={stringValue(section, "secondaryButtonLabel")}
                      onChange={(event) =>
                        updateField(
                          index,
                          "secondaryButtonLabel",
                          event.target.value,
                        )
                      }
                    />
                  </InlineEditFrame>
                ) : (
                  <Button
                    className="h-12 border-dashed text-blue-600 opacity-0 transition-opacity group-hover:opacity-100"
                    type="button"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation();
                      updateField(index, "secondaryButtonLabel", "보조 버튼");
                    }}
                  >
                    <Plus />
                    버튼 추가
                  </Button>
                )}
              </div>
            </div>
            {layout !== "text-focus" ? (
              <div
                className={cn(
                  layout === "cta-focus" ? "hidden" : "block",
                  mediaPosition === "left" ? "lg:order-1" : "lg:order-2",
                )}
              >
                <VisualEditable
                  active={activeElement("visual")}
                  imageUrl={imageUrl}
                  onContextMenu={(event) => openContextMenu(event, index, "visual")}
                  onUpload={() => requestVisualUpload(index)}
                  onSelect={() => selectElementForSection("visual")}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {type === "features" ? (
          <div className={cn("mx-auto max-w-4xl", alignClass)}>
            <InlineEditFrame
              active={activeElement("badge")}
              className="mx-auto w-fit"
              label="배지 바로 수정"
              onContextMenu={(event) => openContextMenu(event, index, "badge")}
              onSelect={() => selectElementForSection("badge")}
            >
              <Input
                className="mx-auto h-8 w-32 rounded-full border-blue-100 bg-white/70 text-center text-xs font-semibold text-blue-600"
                placeholder="배지"
                value={stringValue(section, "badge")}
                onChange={(event) => updateField(index, "badge", event.target.value)}
              />
            </InlineEditFrame>
            <InlineEditFrame
              active={activeElement("title")}
              className="mt-5"
              label="제목 바로 수정"
              onContextMenu={(event) => openContextMenu(event, index, "title")}
              onSelect={() => selectElementForSection("title")}
            >
              <Input
                className="h-auto border-0 bg-transparent p-0 text-3xl font-bold shadow-none focus-visible:ring-0"
                placeholder="제목을 입력하세요"
                style={titleTextStyle(section, design)}
                value={stringValue(section, "title")}
                onChange={(event) => updateField(index, "title", event.target.value)}
              />
            </InlineEditFrame>
            <InlineEditFrame
              active={activeElement("description")}
              className="mx-auto mt-3 max-w-2xl"
              label="설명 바로 수정"
              onContextMenu={(event) => openContextMenu(event, index, "description")}
              onSelect={() => selectElementForSection("description")}
            >
              <Textarea
                className="min-h-16 resize-none border-0 bg-transparent p-0 text-sm leading-7 text-slate-600 shadow-none focus-visible:ring-0"
                placeholder="설명을 입력하세요"
                style={descriptionTextStyle(section, design)}
                value={stringValue(section, "description")}
                onChange={(event) =>
                  updateField(index, "description", event.target.value)
                }
              />
            </InlineEditFrame>
            <div
              className={cn(
                "mt-8 grid gap-4",
                layout === "timeline" ? "grid-cols-1" : "md:grid-cols-3",
              )}
            >
              {items.map((item, itemIndex) => (
                <div
                  key={`${item}-${itemIndex}`}
                  className="rounded-2xl border border-blue-100 bg-white/70 p-5 text-left"
                  style={cardStyle}
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                    {String(itemIndex + 1).padStart(2, "0")}
                  </span>
                  <InlineEditFrame className="mt-5" label="카드 문구 수정">
                    <Input
                      className="h-auto border-0 bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0"
                      style={{
                        color: stringValue(section, "titleColor", design.textColor),
                        fontFamily: fontStack(
                          stringValue(section, "descriptionFontFamily", "site-body"),
                          design,
                          "body",
                        ),
                      }}
                      value={item}
                      onChange={(event) => {
                        const nextItems = [...items];

                        nextItems[itemIndex] = event.target.value;
                        updateItems(index, nextItems.join("\n"));
                      }}
                    />
                  </InlineEditFrame>
                </div>
              ))}
            </div>
            <Textarea
              className="sr-only"
              value={itemsValue(section)}
              onChange={(event) => updateItems(index, event.target.value)}
            />
          </div>
        ) : null}

        {type === "content" ? (
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
            <VisualEditable
              active={activeElement("visual")}
              className={cn(
                "aspect-video border border-blue-100 bg-white/60",
                mediaPosition === "right" ? "lg:order-2" : "lg:order-1",
              )}
              emptyClassName="min-h-full rounded-none border-0 shadow-none"
              imageUrl={imageUrl}
              onContextMenu={(event) => openContextMenu(event, index, "visual")}
              onUpload={() => requestVisualUpload(index)}
              onSelect={() => selectElementForSection("visual")}
            />
            <div className={cn(alignClass, mediaPosition === "right" ? "lg:order-1" : "lg:order-2")}>
              <InlineEditFrame
                active={activeElement("badge")}
                className="inline-block"
                label="배지 바로 수정"
                onContextMenu={(event) => openContextMenu(event, index, "badge")}
                onSelect={() => selectElementForSection("badge")}
              >
                <Input
                  className="h-8 w-32 rounded-full border-blue-100 bg-white/70 text-xs font-semibold text-blue-600"
                  placeholder="배지"
                  value={stringValue(section, "badge")}
                  onChange={(event) => updateField(index, "badge", event.target.value)}
                />
              </InlineEditFrame>
              <InlineEditFrame
                active={activeElement("title")}
                className="mt-5"
                label="제목 바로 수정"
                onContextMenu={(event) => openContextMenu(event, index, "title")}
                onSelect={() => selectElementForSection("title")}
              >
                <Input
                  className="h-auto border-0 bg-transparent p-0 text-3xl font-bold shadow-none focus-visible:ring-0"
                  placeholder="제목을 입력하세요"
                  style={titleTextStyle(section, design)}
                  value={stringValue(section, "title")}
                  onChange={(event) => updateField(index, "title", event.target.value)}
                />
              </InlineEditFrame>
              <InlineEditFrame
                active={activeElement("description")}
                className="mt-4"
                label="설명 바로 수정"
                onContextMenu={(event) => openContextMenu(event, index, "description")}
                onSelect={() => selectElementForSection("description")}
              >
                <Textarea
                  className="min-h-24 resize-none border-0 bg-transparent p-0 text-sm leading-7 text-slate-600 shadow-none focus-visible:ring-0"
                  placeholder="설명을 입력하세요"
                  style={descriptionTextStyle(section, design)}
                  value={stringValue(section, "description")}
                  onChange={(event) =>
                    updateField(index, "description", event.target.value)
                  }
                />
              </InlineEditFrame>
            </div>
          </div>
        ) : null}

        {type === "cta" ? (
          <div className={cn("mx-auto max-w-4xl", alignClass)}>
            <InlineEditFrame
              active={activeElement("title")}
              label="제목 바로 수정"
              onContextMenu={(event) => openContextMenu(event, index, "title")}
              onSelect={() => selectElementForSection("title")}
            >
              <Input
                className="h-auto border-0 bg-transparent p-0 text-3xl font-bold shadow-none focus-visible:ring-0"
                placeholder="제목을 입력하세요"
                style={titleTextStyle(section, design)}
                value={stringValue(section, "title")}
                onChange={(event) => updateField(index, "title", event.target.value)}
              />
            </InlineEditFrame>
            <InlineEditFrame
              active={activeElement("description")}
              className="mx-auto mt-4 max-w-2xl"
              label="설명 바로 수정"
              onContextMenu={(event) => openContextMenu(event, index, "description")}
              onSelect={() => selectElementForSection("description")}
            >
              <Textarea
                className="min-h-16 resize-none border-0 bg-transparent p-0 text-sm leading-7 text-slate-600 shadow-none focus-visible:ring-0"
                placeholder="설명을 입력하세요"
                style={descriptionTextStyle(section, design)}
                value={stringValue(section, "description")}
                onChange={(event) =>
                  updateField(index, "description", event.target.value)
                }
              />
            </InlineEditFrame>
            <InlineEditFrame
              active={activeElement("button")}
              className="mt-7 inline-block"
              label="버튼 문구 수정"
              onContextMenu={(event) => openContextMenu(event, index, "button")}
              onSelect={() => selectElementForSection("button")}
            >
              <Input
                className="h-12 w-40 rounded-lg border-0 px-5 text-center text-sm font-semibold text-white focus-visible:ring-2"
                placeholder="버튼"
                style={buttonStyle(section, design)}
                value={stringValue(section, "buttonLabel")}
                onChange={(event) =>
                  updateField(index, "buttonLabel", event.target.value)
                }
              />
            </InlineEditFrame>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function DesignEditor({ site, page }: DesignEditorProps) {
  const [draft, setDraft] = useState<EditableDraft>(() => toEditableJson(page.draftJson));
  const [savedDraft, setSavedDraft] = useState<EditableDraft>(() =>
    toEditableJson(page.draftJson),
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<SelectedElement>("site");
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("settings");
  const [activeRightTab, setActiveRightTab] = useState<"content" | "style">("style");
  const [activeLibraryCategory, setActiveLibraryCategory] = useState("히어로");
  const [viewport, setViewport] = useState<EditorViewport>("desktop");
  const [activeStyleViewport, setActiveStyleViewport] =
    useState<EditorViewport>("desktop");
  const [previewPreset, setPreviewPreset] = useState<ModulePreset | null>(null);
  const [previewViewport, setPreviewViewport] = useState<EditorViewport>("desktop");
  const [previewInsertAfterIndex, setPreviewInsertAfterIndex] = useState(0);
  const [isSectionLibraryOpen, setIsSectionLibraryOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [leftPanel, setLeftPanel] = useState<"pages" | "sections" | "settings">("settings");
  const [settingsSubPanel, setSettingsSubPanel] = useState<null | "menu" | "footer">(null);
  const [saveMessage, setSaveMessage] = useState("저장 전 상태");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [visualUploadIndex, setVisualUploadIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    element: SelectedElement;
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const gradientFromInputRef = useRef<HTMLInputElement>(null);
  const gradientToInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const visualMediaInputRef = useRef<HTMLInputElement>(null);
  const serializedDraft = useMemo(() => JSON.stringify(draft, null, 2), [draft]);
  const serializedSavedDraft = useMemo(
    () => JSON.stringify(savedDraft, null, 2),
    [savedDraft],
  );
  const hasUnsavedChanges = serializedDraft !== serializedSavedDraft;
  const storageKey = `keyun-editor-draft:${site.id}:${page.id}`;
  const isDemoSite = site.id.startsWith("demo_");
  const selectedSection = draft.sections[selectedIndex] ?? draft.sections[0] ?? null;
  const selectedBackgroundType = selectedSection
    ? stringValue(selectedSection, "backgroundType", "gradient")
    : "gradient";
  const activePaddingBottomField = paddingField("paddingBottom", activeStyleViewport);
  const activePaddingTopField = paddingField("paddingTop", activeStyleViewport);
  const activePaddingBottomValue = selectedSection
    ? responsivePaddingValue(selectedSection, "paddingBottom", activeStyleViewport, "96")
    : "96";
  const activePaddingTopValue = selectedSection
    ? responsivePaddingValue(selectedSection, "paddingTop", activeStyleViewport, "96")
    : "96";
  const visibleModules = modulePresets.filter(
    (preset) => preset.category === activeLibraryCategory,
  );
  const availableLibraryCategories = Array.from(
    new Set(modulePresets.map((preset) => preset.category)),
  );
  const previewSection = useMemo(
    () => (previewPreset ? createSection(previewPreset.type, previewPreset.layout) : null),
    [previewPreset],
  );
  const normalizedPreviewInsertAfterIndex = Math.max(
    0,
    Math.min(previewInsertAfterIndex, Math.max(draft.sections.length - 1, 0)),
  );

  useEffect(() => {
    if (!isDemoSite || typeof window === "undefined") {
      return;
    }

    const storedDraft = window.localStorage.getItem(storageKey);

    if (!storedDraft) {
      return;
    }

    try {
      const parsedDraft = toEditableJson(JSON.parse(storedDraft) as Json);
      setDraft(parsedDraft);
      setSavedDraft(parsedDraft);
      setSaveMessage("저장된 데모 상태를 불러왔습니다.");
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [isDemoSite, storageKey]);

  useEffect(() => {
    if (settingsSubPanel) {
      setIsSectionLibraryOpen(false);
    }
  }, [settingsSubPanel]);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    function closeMenu() {
      setContextMenu(null);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setContextMenu(null);
      }
    }

    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [contextMenu]);

  function updateDraft(next: Partial<EditableDraft>) {
    setDraft((current) => ({
      ...current,
      ...next,
    }));
  }

  function updateDesign(key: keyof DesignSettings, value: string) {
    updateDraft({
      design: {
        ...draft.design,
        [key]: value,
      },
    });
  }

  function updateSections(nextSections: EditorSection[], nextSelectedIndex = selectedIndex) {
    updateDraft({ sections: nextSections });
    setSelectedIndex(
      nextSections.length ? Math.max(0, Math.min(nextSelectedIndex, nextSections.length - 1)) : 0,
    );
  }

  function selectSiteStyle() {
    setSelectedElement("site");
    setRightPanelMode("settings");
    setContextMenu(null);
  }

  function selectSectionForEdit(index: number) {
    setSelectedIndex(index);
    setSelectedElement("section");
    setRightPanelMode("settings");
    setContextMenu(null);
  }

  function selectElementForEdit(index: number, element: SelectedElement) {
    setSelectedIndex(index);
    setSelectedElement(element);
    setRightPanelMode("settings");
    setActiveRightTab(element === "section" ? "style" : "content");
    setContextMenu(null);
  }

  function openContextMenu(
    event: ReactMouseEvent,
    index: number,
    element: SelectedElement,
  ) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedIndex(index);
    setSelectedElement(element);
    setRightPanelMode("settings");
    setActiveRightTab(element === "section" ? "style" : "content");
    setContextMenu({
      element,
      index,
      x: Math.min(event.clientX, window.innerWidth - 240),
      y: Math.min(event.clientY, window.innerHeight - 320),
    });
  }

  function openSiteContextMenu(event: ReactMouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedElement("site");
    setRightPanelMode("settings");
    setContextMenu({
      element: "site",
      index: selectedIndex,
      x: Math.min(event.clientX, window.innerWidth - 240),
      y: Math.min(event.clientY, window.innerHeight - 240),
    });
  }

  function updateSection(index: number, nextSection: EditorSection) {
    updateSections(
      draft.sections.map((section, itemIndex) =>
        itemIndex === index ? nextSection : section,
      ),
      index,
    );
  }

  function updateSectionField(index: number, key: string, value: string) {
    updateSection(index, {
      ...draft.sections[index],
      [key]: value,
    });
  }

  function updateSectionItems(index: number, value: string) {
    updateSection(index, {
      ...draft.sections[index],
      items: value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  }

  function openModulePreview(preset: ModulePreset) {
    setPreviewPreset(preset);
    setPreviewViewport(viewport);
    setPreviewInsertAfterIndex(Math.max(0, selectedIndex));
  }

  function openAddSectionFromContext(index: number) {
    setSelectedIndex(index);
    setPreviewPreset(visibleModules[0] ?? modulePresets[0]);
    setPreviewViewport(viewport);
    setPreviewInsertAfterIndex(Math.max(0, index));
    setContextMenu(null);
  }

  function closeModulePreview() {
    setPreviewPreset(null);
  }

  function applyModule(preset: ModulePreset) {
    const current = selectedSection;
    const nextSection = {
      ...createSection(preset.type, preset.layout),
      builderId: current ? stringValue(current, "builderId") : createSectionId(preset.type),
    };

    if (!current) {
      updateSections([nextSection], 0);
      return;
    }

    updateSection(selectedIndex, nextSection);
  }

  function replaceSelectedSection(preset: ModulePreset) {
    applyModule(preset);
    setSelectedElement("section");
    setRightPanelMode("settings");
    closeModulePreview();
  }

  function insertSectionAfter(preset: ModulePreset, afterIndex: number) {
    const nextSection = createSection(preset.type, preset.layout);
    const insertIndex = draft.sections.length
      ? Math.max(0, Math.min(afterIndex + 1, draft.sections.length))
      : 0;
    const nextSections = [...draft.sections];

    nextSections.splice(insertIndex, 0, nextSection);
    updateSections(nextSections, insertIndex);
    setSelectedElement("section");
    setRightPanelMode("settings");
    closeModulePreview();
  }

  function movePreviewInsertTarget(direction: -1 | 1) {
    setPreviewInsertAfterIndex((current) =>
      Math.max(0, Math.min(current + direction, Math.max(draft.sections.length - 1, 0))),
    );
  }

  function removeSection(index: number) {
    setSelectedElement("section");
    setContextMenu(null);
    updateSections(
      draft.sections.filter((_, itemIndex) => itemIndex !== index),
      Math.max(0, index - 1),
    );
  }

  function moveSection(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= draft.sections.length) {
      return;
    }

    const nextSections = [...draft.sections];
    const current = nextSections[index];
    nextSections[index] = nextSections[targetIndex];
    nextSections[targetIndex] = current;
    setSelectedElement("section");
    setContextMenu(null);
    updateSections(nextSections, targetIndex);
  }

  function duplicateSection(index: number) {
    const section = draft.sections[index];

    if (!section) {
      return;
    }

    const nextSection = {
      ...section,
      builderId: `${stringValue(section, "type", "section")}-${Date.now()}`,
    };
    const nextSections = [...draft.sections];

    nextSections.splice(index + 1, 0, nextSection);
    setSelectedElement("section");
    setContextMenu(null);
    updateSections(nextSections, index + 1);
  }

  function dropSection(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    const nextSections = [...draft.sections];
    const [dragged] = nextSections.splice(dragIndex, 1);
    nextSections.splice(targetIndex, 0, dragged);
    setSelectedElement("section");
    updateSections(nextSections, targetIndex);
    setDragIndex(null);
  }

  async function saveDraft() {
    setIsSaving(true);
    setSaveMessage("저장 중...");

    try {
      if (isDemoSite) {
        window.localStorage.setItem(storageKey, serializedDraft);
      } else {
        const formData = new FormData();

        formData.set("site_id", site.id);
        formData.set("page_id", page.id);
        formData.set("draft_json", serializedDraft);
        await updateDraftJson(formData);
      }

      setSavedDraft(draft);
      setSaveMessage("저장되었습니다.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "저장 중 문제가 생겼습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function restoreSavedDraft() {
    setDraft(savedDraft);
    setSelectedElement("section");
    setSelectedIndex((current) =>
      savedDraft.sections.length
        ? Math.max(0, Math.min(current, savedDraft.sections.length - 1))
        : 0,
    );
    setSaveMessage("이전 저장 상태로 되돌렸습니다.");
  }

  function openBackgroundControl() {
    if (selectedBackgroundType === "color") {
      bgColorInputRef.current?.click();
      return;
    }

    if (selectedBackgroundType === "gradient") {
      gradientFromInputRef.current?.click();
      return;
    }

    mediaInputRef.current?.click();
  }

  function requestVisualUpload(index: number) {
    setSelectedIndex(index);
    setSelectedElement("visual");
    setRightPanelMode("settings");
    setVisualUploadIndex(index);
    visualMediaInputRef.current?.click();
  }

  function renderSiteSettings() {
    return (
      <>
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">브랜드 색상</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              사이트 전체에 먼저 적용되는 기본 색상입니다. 섹션이나 요소에서 따로 지정하면 그 값이 우선 적용됩니다.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Primary", "mainColor"],
              ["보조", "subColor"],
              ["기본 텍스트", "textColor"],
            ].map(([label, key]) => (
              <label key={key} className="space-y-2">
                <span className="text-xs text-slate-500">{label}</span>
                <Input
                  className="h-11 p-1"
                  type="color"
                  value={draft.design[key as keyof DesignSettings]}
                  onChange={(event) =>
                    updateDesign(key as keyof DesignSettings, event.target.value)
                  }
                />
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">기본 폰트</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              무료 사용 가능한 폰트만 제공합니다. 섹션과 요소에서는 이 기본 폰트를 그대로 따르거나 개별 변경할 수 있습니다.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              ["본문 기본 폰트", "bodyFontFamily"],
              ["제목 기본 폰트", "headingFontFamily"],
              ["영문 기본 폰트", "englishFontFamily"],
            ].map(([label, key]) => (
              <label key={key} className="space-y-2">
                <span className="text-xs text-slate-500">{label}</span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={draft.design[key as keyof DesignSettings]}
                  onChange={(event) =>
                    updateDesign(key as keyof DesignSettings, event.target.value)
                  }
                >
                  {freeFontOptions.map((option) => (
                    <option key={`${key}-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold">페이지 레이아웃</h3>
          <label className="space-y-2">
            <span className="text-xs text-slate-500">기본 inner 최대 너비</span>
            <div className="grid grid-cols-3 gap-2">
              {widthOptions.map((option) => (
                <button
                  key={`site-${option.value}`}
                  className={cn(
                    "h-9 rounded-lg border text-xs font-semibold",
                    draft.design.innerWidth === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200",
                  )}
                  type="button"
                  onClick={() => updateDesign("innerWidth", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>기본 섹션 간격</span>
              <span>{draft.design.sectionGap}px</span>
            </div>
            <input
              className="w-full accent-blue-600"
              max="140"
              min="24"
              type="range"
              value={draft.design.sectionGap}
              onChange={(event) => updateDesign("sectionGap", event.target.value)}
            />
          </div>
        </section>

        <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">섹션 추가</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                검증된 모듈을 골라 현재 페이지에 추가합니다.
              </p>
            </div>
            <Button type="button" onClick={() => setRightPanelMode("library")}>
              <Plus />
              라이브러리
            </Button>
          </div>
        </section>
      </>
    );
  }

  function renderTextElementSettings(element: "badge" | "title" | "description") {
    if (!selectedSection) return null;

    const isBadge = element === "badge";
    const isTitle = element === "title";
    const contentKey = isBadge ? "badge" : isTitle ? "title" : "description";
    const colorKey = isTitle ? "titleColor" : "descriptionColor";
    const fontKey = isTitle ? "titleFontFamily" : "descriptionFontFamily";
    const sizeKey = isTitle ? "titleFontSize" : "descriptionFontSize";
    const lineHeightKey = isTitle ? "titleLineHeight" : "descriptionLineHeight";
    const letterSpacingKey = isTitle ? "titleLetterSpacing" : "descriptionLetterSpacing";
    const defaultColor = isTitle ? draft.design.textColor : "#64748b";
    const defaultFont = isTitle ? "site-heading" : "site-body";
    const defaultSize = isTitle ? defaultTitleSize(selectedSection) : "14";
    const defaultLineHeight = isTitle ? "1.16" : "1.72";
    const fontValue = stringValue(selectedSection, fontKey, defaultFont);

    return (
      <>
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">내용</h3>
            <p className="mt-1 text-xs text-slate-500">
              캔버스에서도 바로 입력할 수 있습니다.
            </p>
          </div>
          {isBadge ? (
            <Input
              value={stringValue(selectedSection, contentKey)}
              onChange={(event) =>
                updateSectionField(selectedIndex, contentKey, event.target.value)
              }
            />
          ) : (
            <Textarea
              className="min-h-28"
              value={stringValue(selectedSection, contentKey)}
              onChange={(event) =>
                updateSectionField(selectedIndex, contentKey, event.target.value)
              }
            />
          )}
        </section>

        {isBadge ? (
          <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="text-sm font-semibold">배지 스타일</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              배지는 섹션 톤에 맞춰 자동 스타일이 적용됩니다. 색상 세부 조정은 제목/본문/버튼에서 다룰 수 있습니다.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">텍스트 스타일</h3>
              <span
                className="rounded-md px-2 py-1 text-xs font-bold"
                style={isTitle ? titleTextStyle(selectedSection, draft.design) : descriptionTextStyle(selectedSection, draft.design)}
              >
                Aa
              </span>
            </div>
            <div className="grid grid-cols-[88px_1fr] gap-3">
              <label className="space-y-2">
                <span className="text-xs text-slate-500">색상</span>
                <Input
                  className="h-10 p-1"
                  type="color"
                  value={stringValue(selectedSection, colorKey, defaultColor)}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, colorKey, event.target.value)
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs text-slate-500">무료 폰트</span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={fontValue}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, fontKey, event.target.value)
                  }
                >
                  {isTitle ? (
                    <option value="site-heading">
                      사이트 제목 폰트 ({fontLabel(draft.design.headingFontFamily)})
                    </option>
                  ) : (
                    <option value="site-body">
                      사이트 본문 폰트 ({fontLabel(draft.design.bodyFontFamily)})
                    </option>
                  )}
                  <option value="site-english">
                    사이트 영문 폰트 ({fontLabel(draft.design.englishFontFamily)})
                  </option>
                  {freeFontOptions.map((option) => (
                    <option key={`${element}-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>폰트 크기</span>
                <span>{stringValue(selectedSection, sizeKey, defaultSize)}px</span>
              </div>
              <input
                className="w-full accent-blue-600"
                max={isTitle ? "72" : "28"}
                min={isTitle ? "20" : "12"}
                type="range"
                value={stringValue(selectedSection, sizeKey, defaultSize)}
                onChange={(event) =>
                  updateSectionField(selectedIndex, sizeKey, event.target.value)
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>줄간격</span>
                  <span>{stringValue(selectedSection, lineHeightKey, defaultLineHeight)}</span>
                </div>
                <input
                  className="w-full accent-blue-600"
                  max={isTitle ? "1.6" : "2.2"}
                  min={isTitle ? "0.9" : "1.2"}
                  step="0.02"
                  type="range"
                  value={stringValue(selectedSection, lineHeightKey, defaultLineHeight)}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, lineHeightKey, event.target.value)
                  }
                />
              </label>
              <label className="block space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>자간</span>
                  <span>{stringValue(selectedSection, letterSpacingKey, "0")}px</span>
                </div>
                <input
                  className="w-full accent-blue-600"
                  max={isTitle ? "4" : "3"}
                  min={isTitle ? "-2" : "-1"}
                  step="0.1"
                  type="range"
                  value={stringValue(selectedSection, letterSpacingKey, "0")}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, letterSpacingKey, event.target.value)
                  }
                />
              </label>
            </div>
          </section>
        )}
      </>
    );
  }

  function renderButtonElementSettings(element: "button" | "secondaryButton") {
    if (!selectedSection) return null;

    const isSecondary = element === "secondaryButton";
    const labelKey = isSecondary ? "secondaryButtonLabel" : "buttonLabel";
    const linkKey = isSecondary ? "secondaryButtonLink" : "buttonLink";

    return (
      <>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">버튼 내용</h3>
          <div className="grid gap-3">
            <label className="space-y-2">
              <span className="text-xs text-slate-500">버튼 문구</span>
              <Input
                value={stringValue(selectedSection, labelKey)}
                onChange={(event) =>
                  updateSectionField(selectedIndex, labelKey, event.target.value)
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs text-slate-500">버튼 링크</span>
              <Input
                value={stringValue(selectedSection, linkKey)}
                onChange={(event) =>
                  updateSectionField(selectedIndex, linkKey, event.target.value)
                }
              />
            </label>
          </div>
        </section>

        {isSecondary ? (
          <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="text-sm font-semibold">보조 버튼 스타일</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              보조 버튼은 기본 버튼보다 가볍게 보이도록 자동 스타일이 적용됩니다.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">버튼 스타일</h3>
              <span
                className="rounded-md px-3 py-1.5 text-xs font-bold"
                style={buttonStyle(selectedSection, draft.design)}
              >
                Button
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-xs text-slate-500">배경</span>
                <Input
                  className="h-10 p-1"
                  type="color"
                  value={stringValue(selectedSection, "buttonBgColor", draft.design.mainColor)}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, "buttonBgColor", event.target.value)
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs text-slate-500">텍스트</span>
                <Input
                  className="h-10 p-1"
                  type="color"
                  value={stringValue(selectedSection, "buttonTextColor", "#ffffff")}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, "buttonTextColor", event.target.value)
                  }
                />
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-xs text-slate-500">무료 폰트</span>
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={stringValue(selectedSection, "buttonFontFamily", "site-body")}
                onChange={(event) =>
                  updateSectionField(selectedIndex, "buttonFontFamily", event.target.value)
                }
              >
                <option value="site-body">
                  사이트 본문 폰트 ({fontLabel(draft.design.bodyFontFamily)})
                </option>
                <option value="site-english">
                  사이트 영문 폰트 ({fontLabel(draft.design.englishFontFamily)})
                </option>
                {freeFontOptions.map((option) => (
                  <option key={`button-panel-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>크기</span>
                  <span>{stringValue(selectedSection, "buttonFontSize", "14")}px</span>
                </div>
                <input
                  className="w-full accent-blue-600"
                  max="24"
                  min="12"
                  type="range"
                  value={stringValue(selectedSection, "buttonFontSize", "14")}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, "buttonFontSize", event.target.value)
                  }
                />
              </label>
              <label className="block space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>둥글기</span>
                  <span>{stringValue(selectedSection, "buttonRadius", "12")}px</span>
                </div>
                <input
                  className="w-full accent-blue-600"
                  max="32"
                  min="0"
                  type="range"
                  value={stringValue(selectedSection, "buttonRadius", "12")}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, "buttonRadius", event.target.value)
                  }
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>줄간격</span>
                  <span>{stringValue(selectedSection, "buttonLineHeight", "1.1")}</span>
                </div>
                <input
                  className="w-full accent-blue-600"
                  max="1.6"
                  min="0.9"
                  step="0.02"
                  type="range"
                  value={stringValue(selectedSection, "buttonLineHeight", "1.1")}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, "buttonLineHeight", event.target.value)
                  }
                />
              </label>
              <label className="block space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>자간</span>
                  <span>{stringValue(selectedSection, "buttonLetterSpacing", "0")}px</span>
                </div>
                <input
                  className="w-full accent-blue-600"
                  max="3"
                  min="-1"
                  step="0.1"
                  type="range"
                  value={stringValue(selectedSection, "buttonLetterSpacing", "0")}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, "buttonLetterSpacing", event.target.value)
                  }
                />
              </label>
            </div>
          </section>
        )}
      </>
    );
  }

  function renderVisualElementSettings() {
    if (!selectedSection) return null;

    return (
      <>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">이미지</h3>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Input
              placeholder="이미지 URL"
              value={stringValue(selectedSection, "imageUrl")}
              onChange={(event) =>
                updateSectionField(selectedIndex, "imageUrl", event.target.value)
              }
            />
            <Button
              className="h-11"
              disabled={isUploading}
              type="button"
              variant="outline"
              onClick={() => {
                setVisualUploadIndex(selectedIndex);
                visualMediaInputRef.current?.click();
              }}
            >
              <ImageIcon />
            </Button>
          </div>
          <Button
            disabled={isUploading}
            type="button"
            variant="outline"
            onClick={() => {
              setVisualUploadIndex(selectedIndex);
              visualMediaInputRef.current?.click();
            }}
          >
            <UploadCloud />
            {isUploading ? "업로드 중..." : "이미지 업로드"}
          </Button>
          {stringValue(selectedSection, "imageUrl") ? (
            <Button
              className="w-full justify-start text-slate-500"
              type="button"
              variant="ghost"
              onClick={() => updateSectionField(selectedIndex, "imageUrl", "")}
            >
              <Trash2 />
              이미지 제거
            </Button>
          ) : null}
          {uploadMessage ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {uploadMessage}
            </p>
          ) : null}
        </section>

        {["hero", "content"].includes(stringValue(selectedSection, "type", "content")) ? (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">이미지 위치</h3>
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200">
              {[
                ["왼쪽", "left"],
                ["오른쪽", "right"],
              ].map(([label, value]) => (
                <button
                  key={`${value}-visual-panel`}
                  className={cn(
                    "h-10 text-xs font-semibold",
                    sectionMediaPosition(selectedSection) === value
                      ? "bg-blue-50 text-blue-600"
                      : "bg-white text-slate-500",
                  )}
                  type="button"
                  onClick={() => updateSectionField(selectedIndex, "mediaPosition", value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs leading-5 text-slate-500">
              이미지를 더블클릭해도 업로드 창이 열립니다.
            </p>
          </section>
        ) : null}
      </>
    );
  }

  function renderElementSettings() {
    if (selectedElement === "site") return renderSiteSettings();
    if (selectedElement === "badge") return renderTextElementSettings("badge");
    if (selectedElement === "title") return renderTextElementSettings("title");
    if (selectedElement === "description") return renderTextElementSettings("description");
    if (selectedElement === "button") return renderButtonElementSettings("button");
    if (selectedElement === "secondaryButton") {
      return renderButtonElementSettings("secondaryButton");
    }
    if (selectedElement === "visual") return renderVisualElementSettings();

    return null;
  }

  async function uploadSectionMedia(
    file: File,
    mediaType: "image" | "video",
    options?: {
      applyAsBackground?: boolean;
      sectionIndex?: number;
    },
  ) {
    const targetIndex = options?.sectionIndex ?? selectedIndex;
    const applyAsBackground = options?.applyAsBackground ?? true;
    const section = draft.sections[targetIndex];

    if (!section) {
      return;
    }

    setIsUploading(true);
    setUploadMessage("");

    try {
      const urlKey = mediaType === "video" ? "videoUrl" : "imageUrl";

      if (isDemoSite) {
        const dataUrl = await readFileAsDataUrl(file);

        updateSection(targetIndex, {
          ...section,
          ...(applyAsBackground ? { backgroundType: mediaType } : {}),
          [urlKey]: dataUrl,
        });
        setUploadMessage(
          mediaType === "video"
            ? "동영상이 적용되었습니다. 저장하면 데모에 유지됩니다."
            : "이미지가 적용되었습니다. 저장하면 데모에 유지됩니다.",
        );
        return;
      }

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUploadMessage("미디어 업로드는 로그인 후 사용할 수 있습니다.");
        return;
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() ?? (mediaType === "video" ? "mp4" : "png");
      const sectionId = stringValue(section, "builderId") || `section-${targetIndex}`;
      const path = `users/${user.id}/sites/${site.id}/sections/${sectionId}-${Date.now()}.${extension}`;
      const { error } = await supabase.storage
        .from("site-assets")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        setUploadMessage(error.message);
        return;
      }

      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      updateSection(targetIndex, {
        ...section,
        ...(applyAsBackground ? { backgroundType: mediaType } : {}),
        [urlKey]: data.publicUrl,
      });
      setUploadMessage("업로드 완료. 저장하면 섹션에 반영됩니다.");
    } catch (error) {
      setUploadMessage(
        error instanceof Error ? error.message : "미디어 업로드 중 문제가 생겼습니다.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  const canvasWidthClass =
    viewport === "desktop"
      ? "max-w-[1120px]"
      : viewport === "tablet"
        ? "max-w-[768px]"
        : "max-w-[390px]";

  const canvasStyle = {
    "--brand": draft.design.mainColor,
    "--brand-soft": draft.design.subColor,
    "--canvas-text": draft.design.textColor,
  } as CSSProperties;
  const isHeaderSettingsMode = leftPanel === "settings" && settingsSubPanel === "menu";
  const isFooterSettingsMode = leftPanel === "settings" && settingsSubPanel === "footer";
  const headerLayout = draft.design.headerLayout;
  const footerLayout = draft.design.footerLayout;
  const headerMenuItems = ["제품", "솔루션", "가격", "리소스", "회사"];
  const headerStyle = {
    backgroundColor: draft.design.headerBgColor,
    color: draft.design.headerTextColor,
  } as CSSProperties;
  const headerButtonStyle = {
    backgroundColor: draft.design.headerButtonBgColor,
    color: draft.design.headerButtonTextColor,
  } as CSSProperties;
  const footerStyle = {
    backgroundColor: draft.design.footerBgColor,
    color: draft.design.footerTextColor,
  } as CSSProperties;
  const footerAccentStyle = {
    color: draft.design.footerAccentColor,
  } as CSSProperties;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <input name="site_id" type="hidden" value={site.id} />
      <input name="page_id" type="hidden" value={page.id} />
      <input name="draft_json" type="hidden" value={serializedDraft} />
      <input
        ref={visualMediaInputRef}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        disabled={isUploading}
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            void uploadSectionMedia(file, "image", {
              applyAsBackground: false,
              sectionIndex: visualUploadIndex,
            });
          }

          event.currentTarget.value = "";
        }}
      />

      <main className="min-h-screen bg-[#f5f8ff] text-slate-950">
        <div className="grid min-h-screen grid-cols-[320px_minmax(660px,1fr)_360px]">
          <aside className="overflow-auto border-r border-blue-200 bg-[#f3f7ff] px-5 py-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="keyun" className="h-8 w-auto" src="/keyun-logo.svg" />
                </Link>
                <Button
                  render={<Link href="/dashboard/design" />}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  나가기
                </Button>
              </div>

              <div className="rounded-xl border border-blue-200 bg-white/80 p-4">
                <Link
                  href="/dashboard/design"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600"
                >
                  <ArrowLeft className="size-3.5" />
                  디자인 목록
                </Link>
                <p className="mt-4 text-lg font-bold text-slate-950">
                  디자인 편집
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  섹션을 선택하고 텍스트, 이미지, 스타일을 조정합니다.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-blue-100 bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50">
                  <Home className="size-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">KEYUN Official</p>
                  <p className="truncate text-xs text-slate-500">https://keyun.io</p>
                </div>
                <ChevronDown className="ml-auto size-4 text-slate-400" />
              </div>
            </div>

            <nav className="mt-8 space-y-1">
              {[
                { label: "기본 설정", icon: Settings, panel: "settings" as const },
                { label: "디자인", icon: Palette, panel: "sections" as const },
                { label: "페이지", icon: FileText, panel: "pages" as const },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = leftPanel === item.panel;

                return (
                  <button
                    key={item.label}
                    className={cn(
                      "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-white hover:text-slate-950",
                    )}
                    type="button"
                    onClick={() => {
                      setLeftPanel(item.panel);
                      if (item.panel === "sections") selectSiteStyle();
                    }}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* 페이지 탭 */}
            {leftPanel === "pages" && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">페이지 관리</p>
                  <Button size="icon" type="button" variant="ghost">
                    <Plus />
                  </Button>
                </div>
                <div className="space-y-2">
                  {pageManagementItems.map((item, index) => (
                    <div
                      key={item.path}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="mt-0.5 size-4 shrink-0 text-slate-300" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-xs font-semibold">{item.label}</p>
                            <span className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                              item.status === "공개" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500",
                            )}>
                              {item.status}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.path}</p>
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          <Button disabled={index === 0} size="icon" title="위로" type="button" variant="ghost">
                            <ArrowUp />
                          </Button>
                          <Button disabled={index === pageManagementItems.length - 1} size="icon" title="아래로" type="button" variant="ghost">
                            <ArrowDown />
                          </Button>
                          <Button size="icon" title="삭제" type="button" variant="ghost">
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full justify-start" type="button" variant="outline">
                  <Plus />
                  페이지 추가
                </Button>
              </div>
            )}

            {/* 디자인 탭 — 페이지 목록 + 섹션 순서 */}
            {leftPanel === "sections" && (
              <>
                <div className="mt-8 rounded-lg bg-blue-50/60 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">페이지</p>
                    <Button size="icon" type="button" variant="ghost">
                      <Plus />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {pageItems.map((item, index) => (
                      <button
                        key={item}
                        className={cn(
                          "flex h-9 w-full items-center justify-between rounded-md px-3 text-left text-sm",
                          index === 0 ? "bg-white text-blue-600" : "text-slate-600",
                        )}
                        type="button"
                      >
                        {item}
                        {index === 0 ? <Home className="size-3.5" /> : null}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-blue-100 pt-3">
                    {[
                      { icon: Plus, label: "추가" },
                      { icon: Copy, label: "복제" },
                      { icon: ArrowUp, label: "순서" },
                      { icon: Eye, label: "공개" },
                    ].map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-blue-100 bg-white text-xs font-semibold text-slate-600 hover:text-blue-600"
                          type="button"
                          onClick={selectSiteStyle}
                        >
                          <Icon className="size-3.5" />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">섹션 위치</p>
                    <span className="text-xs text-slate-400">Drag</span>
                  </div>
                  <div className="space-y-2">
                    {draft.sections.map((section, index) => {
                      const type = stringValue(section, "type", "content");
                      const isSelected = selectedIndex === index;
                      return (
                        <button
                          key={stringValue(section, "builderId") || `${type}-${index}`}
                          draggable
                          className={cn(
                            "w-full cursor-grab rounded-lg border p-3 text-left transition-colors active:cursor-grabbing",
                            isSelected
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white hover:border-blue-200",
                          )}
                          type="button"
                          onClick={() => selectSectionForEdit(index)}
                          onDragStart={() => setDragIndex(index)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => dropSection(index)}
                        >
                          <p className="text-xs font-medium opacity-70">
                            {String(index + 1).padStart(2, "0")} / {sectionLabel(type)}
                          </p>
                          <p className="mt-1 truncate text-sm font-semibold">
                            {stringValue(section, "title", "Untitled")}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 기본 설정 탭 */}
            {leftPanel === "settings" && (
              <div className="mt-4">
                {/* ── 상위 메뉴 카드 ── */}
                {settingsSubPanel === null && (
                  <div className="space-y-2">
                    {/* 메뉴 설정 카드 */}
                    <button
                      className="group w-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-300 hover:bg-blue-50/40"
                      type="button"
                      onClick={() => setSettingsSubPanel("menu")}
                    >
                      {/* 미니 헤더 프리뷰 */}
                      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex h-7 items-center justify-between rounded-lg bg-white px-3 border border-slate-200">
                          <div className="h-2 w-10 rounded-full bg-blue-500" />
                          <div className="flex gap-1.5">
                            {["제품","솔루션","가격","회사"].map((m) => (
                              <span key={m} className="text-[9px] font-semibold text-slate-400">{m}</span>
                            ))}
                          </div>
                          <div className="h-4 w-9 rounded-full bg-slate-800" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-800">메뉴 설정</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">GNB 연결 · 헤더 레이아웃</p>
                        </div>
                        <ArrowRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-400" />
                      </div>
                    </button>

                    {/* 하단 정보 설정 카드 */}
                    <button
                      className="group w-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-300 hover:bg-blue-50/40"
                      type="button"
                      onClick={() => setSettingsSubPanel("footer")}
                    >
                      {/* 미니 푸터 프리뷰 */}
                      <div className="border-b border-slate-100 bg-slate-900 px-4 py-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <div className="h-1.5 w-10 rounded-full bg-white/40" />
                            {[1,2].map(i => <div key={i} className="h-1 w-8 rounded-full bg-white/20" />)}
                          </div>
                          <div className="space-y-1">
                            <div className="h-1.5 w-10 rounded-full bg-white/40" />
                            {[1,2].map(i => <div key={i} className="h-1 w-7 rounded-full bg-white/20" />)}
                          </div>
                          <div className="flex gap-1 pt-0.5">
                            {[1,2,3].map(i => <div key={i} className="size-3 rounded bg-white/20" />)}
                          </div>
                        </div>
                        <div className="mt-2 h-px bg-white/10" />
                        <div className="mt-1.5 h-1 w-24 rounded-full bg-white/15" />
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-800">하단 정보 설정</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">레이아웃 · 카피라이트 · 색상</p>
                        </div>
                        <ArrowRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-400" />
                      </div>
                    </button>
                  </div>
                )}

                {/* ── 메뉴 설정 드릴다운 ── */}
                {settingsSubPanel === "menu" && (
                  <div className="space-y-5">
                    {/* 뒤로가기 헤더 */}
                    <div className="flex items-center gap-2">
                      <button
                        className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                        type="button"
                        onClick={() => setSettingsSubPanel(null)}
                      >
                        <ArrowLeft className="size-4" />
                      </button>
                      <div>
                        <p className="text-sm font-semibold">메뉴 설정</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Header 레이아웃과 GNB 연결만 설정합니다.
                        </p>
                      </div>
                    </div>

                    {/* Header 레이아웃 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">헤더 레이아웃</p>
                        <button
                          className={cn(
                            "flex h-6 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-colors",
                            draft.design.headerPosition === "fixed" ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-500",
                          )}
                          type="button"
                          onClick={() =>
                            updateDesign(
                              "headerPosition",
                              draft.design.headerPosition === "fixed" ? "scroll" : "fixed",
                            )
                          }
                        >
                          {draft.design.headerPosition === "fixed" ? "고정" : "스크롤"}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: "기본형", value: "center", desc: "로고 / 중앙 GNB / 우측 버튼", preview: (
                            <div className="flex h-7 items-center justify-between rounded-lg bg-slate-50 px-2">
                              <div className="h-2 w-8 rounded-full bg-blue-500" />
                              <div className="flex gap-1.5">{[1,2,3].map(i=><div key={i} className="h-1.5 w-5 rounded-full bg-slate-300"/>)}</div>
                              <div className="h-5 w-10 rounded-full bg-slate-900" />
                            </div>
                          )},
                          { label: "좌측 메뉴형", value: "left", desc: "로고 옆에 GNB", preview: (
                            <div className="flex h-7 items-center justify-between rounded-lg bg-slate-50 px-2">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-8 rounded-full bg-blue-500" />
                                <div className="flex gap-1.5">{[1,2,3].map(i=><div key={i} className="h-1.5 w-4 rounded-full bg-slate-300"/>)}</div>
                              </div>
                              <div className="h-5 w-10 rounded-full bg-slate-900" />
                            </div>
                          )},
                          { label: "CTA 강조형", value: "cta", desc: "우측 버튼 강조", preview: (
                            <div className="flex h-7 items-center justify-between rounded-lg bg-slate-50 px-2">
                              <div className="h-2 w-8 rounded-full bg-blue-500" />
                              <div className="flex gap-1.5">{[1,2,3].map(i=><div key={i} className="h-1.5 w-5 rounded-full bg-slate-300"/>)}</div>
                              <div className="h-5 w-14 rounded-full bg-blue-600" />
                            </div>
                          )},
                        ].map((opt, idx) => (
                          <button
                            key={opt.label}
                            className={cn(
                              "w-full overflow-hidden rounded-xl border-2 transition-all",
                              draft.design.headerLayout === opt.value ? "border-blue-500" : "border-slate-200 hover:border-blue-200",
                            )}
                            type="button"
                            onClick={() => updateDesign("headerLayout", opt.value)}
                          >
                            <div className="bg-white px-3 py-2.5">{opt.preview}</div>
                            <div className={cn("border-t px-3 py-1.5 text-left", draft.design.headerLayout === opt.value ? "border-blue-100 bg-blue-50" : "border-slate-100 bg-slate-50")}>
                              <div className="flex items-center justify-between">
                                <p className={cn("text-[11px] font-semibold", draft.design.headerLayout === opt.value ? "text-blue-600" : "text-slate-600")}>{opt.label}</p>
                                {draft.design.headerLayout === opt.value && <Check className="size-3 text-blue-500" />}
                              </div>
                              <p className="text-[10px] text-slate-400">{opt.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* GNB 메뉴 연결 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GNB 메뉴 연결</p>
                        <Button className="h-6 px-2 text-[11px]" size="sm" type="button" variant="outline">
                          <Plus className="size-3" />
                          추가
                        </Button>
                      </div>
                      {/* 현재 헤더 미리보기 */}
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <div className="flex h-9 items-center justify-between border-b border-slate-100 bg-white px-3">
                          <div className="h-2.5 w-12 rounded-full bg-blue-500" />
                          <div className="flex gap-2.5 text-[10px] font-semibold text-slate-500">
                            {["제품","솔루션","가격","회사"].map(m => <span key={m}>{m}</span>)}
                          </div>
                          <div className="h-5 w-10 rounded-full bg-slate-900" />
                        </div>
                        <p className="px-3 py-1.5 text-[10px] text-slate-400">현재 적용된 GNB 구조</p>
                      </div>
                      {/* 메뉴 항목 */}
                      <div className="space-y-1.5">
                        {[
                          { menu: "제품", page: "메인 페이지", color: "bg-blue-100 text-blue-700" },
                          { menu: "솔루션", page: "서비스", color: "bg-violet-100 text-violet-700" },
                          { menu: "가격", page: "가격", color: "bg-emerald-100 text-emerald-700" },
                          { menu: "회사", page: "회사 소개", color: "bg-amber-100 text-amber-700" },
                        ].map(({ menu, page, color }) => (
                          <div key={menu} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                            <GripVertical className="size-3.5 shrink-0 text-slate-300" />
                            <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold", color)}>{menu}</span>
                            <ArrowRight className="size-3 shrink-0 text-slate-300" />
                            <span className="min-w-0 flex-1 truncate text-[11px] text-slate-500">{page}</span>
                            <Button className="h-5 shrink-0 px-1.5 text-[10px]" size="sm" type="button" variant="outline">변경</Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Header 색상</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: "headerBgColor", label: "배경", value: draft.design.headerBgColor },
                          { key: "headerTextColor", label: "메뉴 텍스트", value: draft.design.headerTextColor },
                          { key: "headerButtonBgColor", label: "버튼 배경", value: draft.design.headerButtonBgColor },
                          { key: "headerButtonTextColor", label: "버튼 텍스트", value: draft.design.headerButtonTextColor },
                        ].map((item) => (
                          <label key={item.key} className="space-y-1.5">
                            <span className="text-[11px] text-slate-500">{item.label}</span>
                            <div className="relative h-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
                              <input
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                type="color"
                                value={item.value}
                                onChange={(event) =>
                                  updateDesign(item.key as keyof DesignSettings, event.target.value)
                                }
                                onInput={(event) =>
                                  updateDesign(
                                    item.key as keyof DesignSettings,
                                    event.currentTarget.value,
                                  )
                                }
                              />
                              <div className="pointer-events-none flex h-full items-center gap-2 px-2">
                                <span
                                  className="inline-block size-4 rounded border border-slate-200"
                                  style={{ backgroundColor: item.value }}
                                />
                                <span className="font-mono text-[11px] uppercase text-slate-500">
                                  {item.value}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 하단 정보 설정 드릴다운 ── */}
                {settingsSubPanel === "footer" && (
                  <div className="space-y-5">
                    {/* 뒤로가기 헤더 */}
                    <div className="flex items-center gap-2">
                      <button
                        className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                        type="button"
                        onClick={() => setSettingsSubPanel(null)}
                      >
                        <ArrowLeft className="size-4" />
                      </button>
                      <div>
                        <p className="text-sm font-semibold">하단 정보 설정</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Footer 레이아웃, 카피라이트, 색상만 설정합니다.
                        </p>
                      </div>
                    </div>

                    {/* Footer 레이아웃 */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">레이아웃</p>
                      <div className="space-y-2">
                        {[
                          { label: "심플형", value: "simple", desc: "카피라이트 · 링크 중심", preview: (
                            <div className="bg-slate-900 px-3 py-3 rounded-t-xl">
                              <div className="flex items-center justify-between">
                                <div className="h-1.5 w-16 rounded-full bg-white/30" />
                                <div className="flex gap-1.5">{[1,2,3].map(i=><div key={i} className="h-1.5 w-6 rounded-full bg-white/20"/>)}</div>
                              </div>
                              <div className="mt-2 h-px bg-white/10" />
                              <div className="mt-2 mx-auto h-1.5 w-24 rounded-full bg-white/20" />
                            </div>
                          )},
                          { label: "정보형", value: "info", desc: "회사정보 · SNS · 약관", preview: (
                            <div className="bg-slate-900 px-3 py-3 rounded-t-xl">
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1"><div className="h-2 w-10 rounded-full bg-white/50"/>{[1,2].map(i=><div key={i} className="h-1 w-8 rounded-full bg-white/20"/>)}</div>
                                <div className="space-y-1"><div className="h-2 w-10 rounded-full bg-white/50"/>{[1,2].map(i=><div key={i} className="h-1 w-7 rounded-full bg-white/20"/>)}</div>
                                <div className="flex gap-1 pt-1">{[1,2,3].map(i=><div key={i} className="size-3 rounded bg-white/20"/>)}</div>
                              </div>
                              <div className="mt-2 h-px bg-white/10" />
                              <div className="mt-1.5 h-1 w-20 rounded-full bg-white/15" />
                            </div>
                          )},
                          { label: "CTA형", value: "cta", desc: "상담 유도 영역 포함", preview: (
                            <div className="bg-slate-900 px-3 py-3 rounded-t-xl">
                              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center">
                                <div className="mx-auto h-2 w-20 rounded-full bg-white/40"/>
                                <div className="mx-auto mt-1 h-1.5 w-14 rounded-full bg-white/20"/>
                                <div className="mx-auto mt-2 h-5 w-14 rounded-full bg-blue-500/70"/>
                              </div>
                              <div className="mt-2 h-1 w-20 rounded-full bg-white/15"/>
                            </div>
                          )},
                        ].map((opt, idx) => (
                          <button
                            key={opt.label}
                            className={cn(
                              "w-full overflow-hidden rounded-xl border-2 transition-all",
                              draft.design.footerLayout === opt.value ? "border-blue-500" : "border-slate-200 hover:border-blue-200",
                            )}
                            type="button"
                            onClick={() => updateDesign("footerLayout", opt.value)}
                          >
                            {opt.preview}
                            <div className={cn("border-t px-3 py-1.5 text-left", draft.design.footerLayout === opt.value ? "border-blue-100 bg-blue-50" : "border-slate-100 bg-slate-50")}>
                              <div className="flex items-center justify-between">
                                <p className={cn("text-[11px] font-semibold", draft.design.footerLayout === opt.value ? "text-blue-600" : "text-slate-600")}>{opt.label}</p>
                                {draft.design.footerLayout === opt.value && <Check className="size-3 text-blue-500" />}
                              </div>
                              <p className="text-[10px] text-slate-400">{opt.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Copyright */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">카피라이트</p>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue="© KEYUN. All rights reserved."
                      />
                    </div>

                    {/* 색상 */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">색상</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: "footerBgColor", label: "배경", value: draft.design.footerBgColor },
                          { key: "footerTextColor", label: "텍스트", value: draft.design.footerTextColor },
                          { key: "footerAccentColor", label: "강조", value: draft.design.footerAccentColor },
                        ].map((item) => (
                          <label key={item.key} className="space-y-1.5">
                            <span className="text-[11px] text-slate-500">{item.label}</span>
                            <div className="relative h-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
                              <input
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                type="color"
                                value={item.value}
                                onChange={(event) =>
                                  updateDesign(item.key as keyof DesignSettings, event.target.value)
                                }
                                onInput={(event) =>
                                  updateDesign(
                                    item.key as keyof DesignSettings,
                                    event.currentTarget.value,
                                  )
                                }
                              />
                              <div className="pointer-events-none flex h-full items-center gap-2 px-2">
                                <span className="inline-block size-4 rounded border border-slate-200" style={{ backgroundColor: item.value }} />
                                <span className="font-mono text-[11px] text-slate-500 uppercase">{item.value}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>

          <section className="min-w-0">
            <header className="flex h-[74px] items-center justify-between border-b border-blue-100 bg-white px-8">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">디자인</span>
                <span className="text-slate-300">&gt;</span>
                <span className="font-semibold">메인 페이지</span>
              </div>
              <div className="flex items-center gap-3">
                <Button size="icon" type="button" variant="ghost">
                  <ArrowLeft />
                </Button>
                <Button size="icon" type="button" variant="ghost">
                  <ArrowRight className="opacity-40" />
                </Button>
                <div className="mx-3 flex rounded-lg bg-blue-50 p-1">
                  {[
                    { value: "desktop", icon: Laptop },
                    { value: "tablet", icon: Tablet },
                    { value: "mobile", icon: Smartphone },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = viewport === item.value;

                    return (
                      <button
                        key={item.value}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-md",
                          isActive ? "bg-white text-blue-600" : "text-slate-500",
                        )}
                        type="button"
                        onClick={() => {
                          const nextViewport = item.value as EditorViewport;

                          setViewport(nextViewport);
                          setActiveStyleViewport(nextViewport);
                        }}
                      >
                        <Icon className="size-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden max-w-40 truncate text-right text-xs text-slate-500 xl:block">
                  {hasUnsavedChanges ? "수정사항 있음" : saveMessage}
                </div>
                <Button
                  disabled={!hasUnsavedChanges}
                  type="button"
                  variant="outline"
                  onClick={restoreSavedDraft}
                >
                  이전
                </Button>
                <Button
                  disabled={isSaving}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void saveDraft();
                  }}
                >
                  {isSaving ? "저장 중..." : "저장"}
                </Button>
                <Button type="button" variant="outline">
                  미리보기
                </Button>
                <Button type="button">
                  저장 및 게시
                  <ChevronDown />
                </Button>
              </div>
            </header>

            <div className="h-[calc(100vh-74px)] overflow-auto px-8 py-5">
              <div
                className={cn(
                  "mx-auto overflow-hidden rounded-lg border border-blue-100 bg-white transition-all",
                  canvasWidthClass,
                )}
                style={canvasStyle}
                onContextMenu={openSiteContextMenu}
              >
                {!isFooterSettingsMode ? (
                  <div
                    className={cn(
                      "flex min-h-20 items-center gap-8 px-10 transition-all",
                      draft.design.headerPosition === "fixed" && "sticky top-0 z-20 shadow-sm",
                      headerLayout === "left" ? "justify-between" : "justify-between",
                    )}
                    style={headerStyle}
                  >
                    <div
                      className={cn(
                        "flex min-w-0 items-center",
                        headerLayout === "left" ? "flex-1 gap-10" : "gap-4",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="keyun" className="h-8 w-auto shrink-0" src="/keyun-logo.svg" />
                      {headerLayout === "left" ? (
                        <nav className="hidden min-w-0 items-center gap-8 text-sm font-semibold md:flex">
                          {headerMenuItems.map((item) => (
                            <span key={item}>{item}</span>
                          ))}
                        </nav>
                      ) : null}
                    </div>

                    {headerLayout !== "left" ? (
                      <nav
                        className={cn(
                          "hidden items-center text-sm font-semibold md:flex",
                          headerLayout === "cta" ? "gap-7" : "gap-10",
                        )}
                      >
                        {headerMenuItems.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </nav>
                    ) : null}

                    <button
                      className={cn(
                        "shrink-0 rounded-full px-5 py-3 text-sm font-semibold transition-all",
                        headerLayout === "cta" && "px-7 shadow-lg",
                      )}
                      style={headerButtonStyle}
                      type="button"
                    >
                      시작하기
                    </button>
                  </div>
                ) : null}

                {!isHeaderSettingsMode && !isFooterSettingsMode ? (
                  <div className="space-y-[var(--section-gap)]" style={{ "--section-gap": `${draft.design.sectionGap}px` } as CSSProperties}>
                    {draft.sections.map((section, index) => (
                      <CanvasSection
                        key={stringValue(section, "builderId") || `${stringValue(section, "type")}-${index}`}
                        design={draft.design}
                        index={index}
                        isSelected={index === selectedIndex}
                        moveSection={moveSection}
                        openContextMenu={openContextMenu}
                        requestVisualUpload={requestVisualUpload}
                        removeSection={removeSection}
                        section={section}
                        selectedElement={selectedElement}
                        selectElement={selectElementForEdit}
                        selectSection={selectSectionForEdit}
                        updateField={updateSectionField}
                        updateItems={updateSectionItems}
                        viewport={viewport}
                      />
                    ))}
                  </div>
                ) : null}

                {!isHeaderSettingsMode ? (
                  <footer className="px-10 py-10 transition-all" style={footerStyle}>
                    {footerLayout === "simple" ? (
                      <div className="flex flex-wrap items-center justify-between gap-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="keyun" className="h-7 w-auto brightness-0 invert" src="/keyun-logo.svg" />
                        <div className="flex flex-wrap items-center gap-6 text-sm font-medium opacity-80">
                          <span>이용약관</span>
                          <span>개인정보처리방침</span>
                          <span>문의하기</span>
                        </div>
                        <p className="text-sm opacity-60">© KEYUN. All rights reserved.</p>
                      </div>
                    ) : footerLayout === "cta" ? (
                      <div className="space-y-8">
                        <div className="rounded-2xl border border-white/10 bg-white/10 px-8 py-7 text-center">
                          <p className="text-2xl font-bold">지금 KEYUN으로 사이트를 시작하세요</p>
                          <p className="mt-2 text-sm opacity-70">
                            템플릿 선택부터 게시까지 한 번에 이어집니다.
                          </p>
                          <button
                            className="mt-5 rounded-full px-6 py-3 text-sm font-semibold"
                            style={{
                              backgroundColor: draft.design.footerAccentColor,
                              color: draft.design.footerTextColor,
                            }}
                            type="button"
                          >
                            상담 신청
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm opacity-70">
                          <span>© KEYUN. All rights reserved.</span>
                          <span>Instagram · Blog · Kakao</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
                        <div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="keyun" className="h-8 w-auto brightness-0 invert" src="/keyun-logo.svg" />
                          <p className="mt-4 text-sm leading-6 opacity-70">
                            쉬운데 결과물이 예쁜 웹사이트 빌더, KEYUN.
                          </p>
                          <p className="mt-5 text-xs opacity-50">© KEYUN. All rights reserved.</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={footerAccentStyle}>메뉴</p>
                          <div className="mt-3 space-y-2 text-sm opacity-70">
                            <p>제품</p>
                            <p>솔루션</p>
                            <p>가격</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={footerAccentStyle}>회사</p>
                          <div className="mt-3 space-y-2 text-sm opacity-70">
                            <p>회사 소개</p>
                            <p>블로그</p>
                            <p>문의하기</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={footerAccentStyle}>채널</p>
                          <div className="mt-3 flex gap-2">
                            {["B", "K", "I"].map((item) => (
                              <span
                                key={item}
                                className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </footer>
                ) : null}
              </div>

            </div>

            {!settingsSubPanel ? (
              <div className="fixed bottom-5 left-[340px] right-[380px] z-40">
                <div className="rounded-2xl border border-blue-100 bg-white/95 shadow-2xl shadow-blue-950/10 backdrop-blur">
                  {isSectionLibraryOpen ? (
                    <div className="max-h-[360px] overflow-hidden p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">섹션 라이브러리</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            검증된 레이아웃을 골라 현재 페이지에 추가합니다.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            className="h-8 px-3 text-xs"
                            type="button"
                            variant="outline"
                            onClick={() => setRightPanelMode("library")}
                          >
                            모두 보기
                          </Button>
                          <Button
                            size="icon"
                            type="button"
                            variant="ghost"
                            onClick={() => setIsSectionLibraryOpen(false)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[118px_1fr]">
                        <div className="space-y-1">
                          {availableLibraryCategories.map((category) => (
                            <button
                              key={category}
                              className={cn(
                                "block h-8 w-full rounded-md px-3 text-left text-sm",
                                activeLibraryCategory === category
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-slate-600 hover:bg-slate-50",
                              )}
                              type="button"
                              onClick={() => setActiveLibraryCategory(category)}
                            >
                              {category}
                            </button>
                          ))}
                        </div>

                        <div className="max-h-[260px] overflow-auto pr-1">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              {activeLibraryCategory} 섹션
                            </p>
                            <span className="text-xs text-slate-400">
                              {visibleModules.length}개 레이아웃
                            </span>
                          </div>
                          <div className="grid gap-3 md:grid-cols-4">
                            {visibleModules.map((preset) => (
                              <div
                                key={`${preset.type}-${preset.layout}`}
                                role="button"
                                tabIndex={0}
                                className={cn(
                                  "rounded-lg border p-2 text-left transition hover:border-blue-300 hover:bg-blue-50/40",
                                  selectedSection &&
                                    stringValue(selectedSection, "type") === preset.type &&
                                    stringValue(selectedSection, "layout") === preset.layout
                                    ? "border-blue-500"
                                    : "border-slate-100",
                                )}
                                onClick={() => openModulePreview(preset)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    openModulePreview(preset);
                                  }
                                }}
                              >
                                <MiniModulePreview preset={preset} />
                                <p className="mt-3 truncate text-xs font-semibold">
                                  {preset.title}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {preset.description}
                                </p>
                                <Button
                                  className="mt-3 h-8 w-full text-xs"
                                  type="button"
                                  variant="outline"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openModulePreview(preset);
                                  }}
                                >
                                  <Eye className="size-3.5" />
                                  미리보기
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Button
                        className="shrink-0 shadow-sm"
                        type="button"
                        onClick={() => setIsSectionLibraryOpen(true)}
                      >
                        <Plus />
                        섹션 추가
                      </Button>
                      <div className="h-6 w-px bg-slate-200" />
                      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                        {availableLibraryCategories.slice(0, 7).map((category) => (
                          <button
                            key={category}
                            className={cn(
                              "h-8 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors",
                              activeLibraryCategory === category
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                            )}
                            type="button"
                            onClick={() => {
                              setActiveLibraryCategory(category);
                              setIsSectionLibraryOpen(true);
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      <Button
                        className="h-8 shrink-0 px-3 text-xs"
                        type="button"
                        variant="outline"
                        onClick={() => setRightPanelMode("library")}
                      >
                        전체 보기
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </section>

          <aside className="border-l border-blue-100 bg-white">
            {rightPanelMode === "settings" && selectedSection ? (
              <div className="flex h-screen flex-col">
                <div className="border-b border-blue-100 px-6 py-6">
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        if (selectedElement === "site") {
                          setRightPanelMode("library");
                          return;
                        }

                        if (selectedElement !== "section") {
                          setSelectedElement("section");
                          setActiveRightTab("style");
                          return;
                        }

                        setSelectedElement("site");
                      }}
                    >
                      <ArrowLeft />
                    </Button>
                    <div>
                      <p className="text-lg font-semibold">
                        {selectedElement === "site"
                          ? "사이트 스타일"
                          : selectedElement === "section"
                          ? `${sectionLabel(stringValue(selectedSection, "type"))} 섹션`
                          : elementPanelTitle(selectedElement)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedElement === "site"
                          ? "전체 페이지의 기본 색상, 폰트, 너비를 관리합니다"
                          : selectedElement === "section"
                          ? layoutLabel(selectedSection)
                          : `${sectionLabel(stringValue(selectedSection, "type"))} 섹션 안의 선택 요소`}
                      </p>
                    </div>
                  </div>
                  {selectedElement === "section" ? (
                    <div className="mt-6 grid grid-cols-2 border-b border-blue-100 text-sm">
                      {[
                        { value: "content", label: "콘텐츠" },
                        { value: "style", label: "스타일" },
                      ].map((tab) => (
                        <button
                          key={tab.value}
                          className={cn(
                            "border-b-2 px-4 py-3 font-semibold",
                            activeRightTab === tab.value
                              ? "border-blue-600 text-blue-600"
                              : "border-transparent text-slate-500",
                          )}
                          type="button"
                          onClick={() =>
                            setActiveRightTab(tab.value as "content" | "style")
                          }
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  ) : selectedElement === "site" ? (
                    <Button
                      className="mt-5 w-full justify-start"
                      type="button"
                      variant="outline"
                      onClick={() => setRightPanelMode("library")}
                    >
                      <Plus />
                      섹션 라이브러리 열기
                    </Button>
                  ) : (
                    <Button
                      className="mt-5 w-full justify-start"
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedElement("section");
                        setActiveRightTab("style");
                      }}
                    >
                      <ArrowLeft />
                      섹션 전체 설정으로
                    </Button>
                  )}
                </div>

                <div className="flex-1 space-y-7 overflow-auto px-6 py-6">
                  {selectedElement !== "section" ? (
                    renderElementSettings()
                  ) : activeRightTab === "content" ? (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold">제목</span>
                        <Input
                          value={stringValue(selectedSection, "title")}
                          onChange={(event) =>
                            updateSectionField(selectedIndex, "title", event.target.value)
                          }
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold">설명</span>
                        <Textarea
                          className="min-h-28"
                          value={stringValue(selectedSection, "description")}
                          onChange={(event) =>
                            updateSectionField(
                              selectedIndex,
                              "description",
                              event.target.value,
                            )
                          }
                        />
                      </label>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-semibold">버튼 문구</span>
                          <Input
                            value={stringValue(selectedSection, "buttonLabel")}
                            onChange={(event) =>
                              updateSectionField(
                                selectedIndex,
                                "buttonLabel",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold">버튼 링크</span>
                          <Input
                            value={stringValue(selectedSection, "buttonLink")}
                            onChange={(event) =>
                              updateSectionField(
                                selectedIndex,
                                "buttonLink",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      </div>
                      {stringValue(selectedSection, "type") === "features" ? (
                        <label className="space-y-2">
                          <span className="text-sm font-semibold">
                            항목 리스트, 한 줄에 하나
                          </span>
                          <Textarea
                            className="min-h-36"
                            value={itemsValue(selectedSection)}
                            onChange={(event) =>
                              updateSectionItems(selectedIndex, event.target.value)
                            }
                          />
                        </label>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <section className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">레이아웃</h3>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const currentPreset =
                                modulePresets.find(
                                  (preset) =>
                                    preset.type === stringValue(selectedSection, "type") &&
                                    preset.layout === stringValue(selectedSection, "layout"),
                                ) ?? modulePresets[0];

                              openModulePreview(currentPreset);
                            }}
                          >
                            변경
                          </Button>
                        </div>
                        <p className="text-sm text-slate-500">{layoutLabel(selectedSection)}</p>
                        <div className="space-y-2">
                          <span className="text-xs text-slate-500">섹션 너비</span>
                          <div className="grid grid-cols-3 gap-2">
                            {widthOptions.map((option) => (
                              <button
                                key={`${option.value}-section`}
                                className={cn(
                                  "h-9 rounded-lg border text-xs font-semibold",
                                  stringValue(selectedSection, "width", draft.design.innerWidth) ===
                                    option.value
                                    ? "border-blue-500 bg-blue-50 text-blue-600"
                                    : "border-slate-200",
                                )}
                                type="button"
                                onClick={() =>
                                  updateSectionField(selectedIndex, "width", option.value)
                                }
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold">콘텐츠 스타일</h3>
                          <p className="mt-1 text-xs text-slate-500">
                            폰트는 무료 사용 가능한 옵션만 제공합니다.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-600">제목</span>
                              <span
                                className="rounded-md px-2 py-1 text-xs font-bold"
                                style={titleTextStyle(selectedSection, draft.design)}
                              >
                                Aa
                              </span>
                            </div>
                            <div className="grid grid-cols-[88px_1fr] gap-3">
                              <label className="space-y-2">
                                <span className="text-xs text-slate-500">색상</span>
                                <Input
                                  className="h-10 p-1"
                                  type="color"
                                  value={stringValue(
                                    selectedSection,
                                    "titleColor",
                                    draft.design.textColor,
                                  )}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "titleColor",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label className="space-y-2">
                                <span className="text-xs text-slate-500">무료 폰트</span>
                                <select
                                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                  value={stringValue(
                                    selectedSection,
                                    "titleFontFamily",
                                    "site-heading",
                                  )}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "titleFontFamily",
                                      event.target.value,
                                    )
                                  }
                                >
                                  <option value="site-heading">
                                    사이트 제목 폰트 ({fontLabel(draft.design.headingFontFamily)})
                                  </option>
                                  <option value="site-english">
                                    사이트 영문 폰트 ({fontLabel(draft.design.englishFontFamily)})
                                  </option>
                                  {freeFontOptions.map((option) => (
                                    <option key={`title-${option.value}`} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                            <label className="mt-3 block space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>폰트 크기</span>
                                <span>
                                  {stringValue(
                                    selectedSection,
                                    "titleFontSize",
                                    defaultTitleSize(selectedSection),
                                  )}
                                  px
                                </span>
                              </div>
                              <input
                                className="w-full accent-blue-600"
                                max="72"
                                min="20"
                                type="range"
                                value={stringValue(
                                  selectedSection,
                                  "titleFontSize",
                                  defaultTitleSize(selectedSection),
                                )}
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    "titleFontSize",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <label className="block space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>줄간격</span>
                                  <span>{stringValue(selectedSection, "titleLineHeight", "1.16")}</span>
                                </div>
                                <input
                                  className="w-full accent-blue-600"
                                  max="1.6"
                                  min="0.9"
                                  step="0.02"
                                  type="range"
                                  value={stringValue(selectedSection, "titleLineHeight", "1.16")}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "titleLineHeight",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label className="block space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>자간</span>
                                  <span>{stringValue(selectedSection, "titleLetterSpacing", "0")}px</span>
                                </div>
                                <input
                                  className="w-full accent-blue-600"
                                  max="4"
                                  min="-2"
                                  step="0.1"
                                  type="range"
                                  value={stringValue(selectedSection, "titleLetterSpacing", "0")}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "titleLetterSpacing",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-600">본문</span>
                              <span
                                className="rounded-md px-2 py-1 text-xs font-bold"
                                style={descriptionTextStyle(selectedSection, draft.design)}
                              >
                                Aa
                              </span>
                            </div>
                            <div className="grid grid-cols-[88px_1fr] gap-3">
                              <label className="space-y-2">
                                <span className="text-xs text-slate-500">색상</span>
                                <Input
                                  className="h-10 p-1"
                                  type="color"
                                  value={stringValue(
                                    selectedSection,
                                    "descriptionColor",
                                    "#64748b",
                                  )}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "descriptionColor",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label className="space-y-2">
                                <span className="text-xs text-slate-500">무료 폰트</span>
                                <select
                                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                  value={stringValue(
                                    selectedSection,
                                    "descriptionFontFamily",
                                    "site-body",
                                  )}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "descriptionFontFamily",
                                      event.target.value,
                                    )
                                  }
                                >
                                  <option value="site-body">
                                    사이트 본문 폰트 ({fontLabel(draft.design.bodyFontFamily)})
                                  </option>
                                  <option value="site-english">
                                    사이트 영문 폰트 ({fontLabel(draft.design.englishFontFamily)})
                                  </option>
                                  {freeFontOptions.map((option) => (
                                    <option key={`description-${option.value}`} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                            <label className="mt-3 block space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>폰트 크기</span>
                                <span>
                                  {stringValue(selectedSection, "descriptionFontSize", "14")}
                                  px
                                </span>
                              </div>
                              <input
                                className="w-full accent-blue-600"
                                max="28"
                                min="12"
                                type="range"
                                value={stringValue(selectedSection, "descriptionFontSize", "14")}
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    "descriptionFontSize",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <label className="block space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>줄간격</span>
                                  <span>{stringValue(selectedSection, "descriptionLineHeight", "1.72")}</span>
                                </div>
                                <input
                                  className="w-full accent-blue-600"
                                  max="2.2"
                                  min="1.2"
                                  step="0.02"
                                  type="range"
                                  value={stringValue(selectedSection, "descriptionLineHeight", "1.72")}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "descriptionLineHeight",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label className="block space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>자간</span>
                                  <span>{stringValue(selectedSection, "descriptionLetterSpacing", "0")}px</span>
                                </div>
                                <input
                                  className="w-full accent-blue-600"
                                  max="3"
                                  min="-1"
                                  step="0.1"
                                  type="range"
                                  value={stringValue(selectedSection, "descriptionLetterSpacing", "0")}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "descriptionLetterSpacing",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-600">버튼</span>
                              <span
                                className="rounded-md px-3 py-1.5 text-xs font-bold"
                                style={buttonStyle(selectedSection, draft.design)}
                              >
                                Button
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <label className="space-y-2">
                                <span className="text-xs text-slate-500">배경</span>
                                <Input
                                  className="h-10 p-1"
                                  type="color"
                                  value={stringValue(
                                    selectedSection,
                                    "buttonBgColor",
                                    draft.design.mainColor,
                                  )}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "buttonBgColor",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label className="space-y-2">
                                <span className="text-xs text-slate-500">텍스트</span>
                                <Input
                                  className="h-10 p-1"
                                  type="color"
                                  value={stringValue(selectedSection, "buttonTextColor", "#ffffff")}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "buttonTextColor",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                            </div>
                            <label className="mt-3 block space-y-2">
                              <span className="text-xs text-slate-500">무료 폰트</span>
                              <select
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={stringValue(selectedSection, "buttonFontFamily", "site-body")}
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    "buttonFontFamily",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="site-body">
                                  사이트 본문 폰트 ({fontLabel(draft.design.bodyFontFamily)})
                                </option>
                                <option value="site-english">
                                  사이트 영문 폰트 ({fontLabel(draft.design.englishFontFamily)})
                                </option>
                                {freeFontOptions.map((option) => (
                                  <option key={`button-${option.value}`} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <label className="block space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>크기</span>
                                  <span>{stringValue(selectedSection, "buttonFontSize", "14")}px</span>
                                </div>
                                <input
                                  className="w-full accent-blue-600"
                                  max="24"
                                  min="12"
                                  type="range"
                                  value={stringValue(selectedSection, "buttonFontSize", "14")}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "buttonFontSize",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label className="block space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>둥글기</span>
                                  <span>{stringValue(selectedSection, "buttonRadius", "12")}px</span>
                                </div>
                                <input
                                  className="w-full accent-blue-600"
                                  max="32"
                                  min="0"
                                  type="range"
                                  value={stringValue(selectedSection, "buttonRadius", "12")}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "buttonRadius",
                                      event.target.value,
                                  )
                                }
                              />
                            </label>
                          </div>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <label className="block space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>줄간격</span>
                                  <span>{stringValue(selectedSection, "buttonLineHeight", "1.1")}</span>
                                </div>
                                <input
                                  className="w-full accent-blue-600"
                                  max="1.6"
                                  min="0.9"
                                  step="0.02"
                                  type="range"
                                  value={stringValue(selectedSection, "buttonLineHeight", "1.1")}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "buttonLineHeight",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label className="block space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>자간</span>
                                  <span>{stringValue(selectedSection, "buttonLetterSpacing", "0")}px</span>
                                </div>
                                <input
                                  className="w-full accent-blue-600"
                                  max="3"
                                  min="-1"
                                  step="0.1"
                                  type="range"
                                  value={stringValue(selectedSection, "buttonLetterSpacing", "0")}
                                  onChange={(event) =>
                                    updateSectionField(
                                      selectedIndex,
                                      "buttonLetterSpacing",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h3 className="text-sm font-semibold">배경</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            ["색상", "color"],
                            ["그라데이션", "gradient"],
                            ["이미지", "image"],
                            ["동영상", "video"],
                          ].map(([label, value]) => (
                            <button
                              key={value}
                              className={cn(
                                "h-9 rounded-lg text-xs font-semibold",
                                stringValue(selectedSection, "backgroundType") === value
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-slate-50 text-slate-500",
                              )}
                              type="button"
                              onClick={() =>
                                updateSectionField(
                                  selectedIndex,
                                  "backgroundType",
                                  value,
                                )
                              }
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <button
                          aria-label="배경 조정"
                          className="relative h-20 w-full overflow-hidden rounded-lg border border-blue-100 text-left"
                          style={sectionBackground(selectedSection, draft.design)}
                          type="button"
                          onClick={openBackgroundControl}
                        >
                          {selectedBackgroundType === "video" &&
                          stringValue(selectedSection, "videoUrl") ? (
                            <video
                              aria-hidden
                              autoPlay
                              className="absolute inset-0 h-full w-full object-cover"
                              loop
                              muted
                              playsInline
                              src={stringValue(selectedSection, "videoUrl")}
                            />
                          ) : null}
                          {["image", "video"].includes(selectedBackgroundType) &&
                          !stringValue(
                            selectedSection,
                            selectedBackgroundType === "video" ? "videoUrl" : "imageUrl",
                          ) ? (
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-500">
                              {selectedBackgroundType === "video"
                                ? "동영상 업로드"
                                : "이미지 업로드"}
                            </span>
                          ) : null}
                        </button>

                        {selectedBackgroundType === "color" ? (
                          <label className="space-y-2">
                            <span className="text-xs text-slate-500">배경 색상</span>
                            <input
                              ref={bgColorInputRef}
                              className="h-11 w-full rounded-lg border border-slate-200 bg-white p-1"
                              type="color"
                              value={stringValue(selectedSection, "bgColor", "#f8fbff")}
                              onChange={(event) =>
                                updateSectionField(
                                  selectedIndex,
                                  "bgColor",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        ) : null}

                        {selectedBackgroundType === "gradient" ? (
                          <div className="grid grid-cols-2 gap-3">
                            <label className="space-y-2">
                              <span className="text-xs text-slate-500">시작 색상</span>
                              <input
                                ref={gradientFromInputRef}
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white p-1"
                                type="color"
                                value={stringValue(selectedSection, "gradientFrom", "#f3f7ff")}
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    "gradientFrom",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-xs text-slate-500">끝 색상</span>
                              <input
                                ref={gradientToInputRef}
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white p-1"
                                type="color"
                                value={stringValue(selectedSection, "gradientTo", "#ffffff")}
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    "gradientTo",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                          </div>
                        ) : null}

                        {["image", "video"].includes(selectedBackgroundType) ? (
                          <>
                            <div className="grid grid-cols-[1fr_auto] gap-3">
                              <Input
                                value={
                                  selectedBackgroundType === "video"
                                    ? stringValue(selectedSection, "videoUrl")
                                    : stringValue(selectedSection, "imageUrl")
                                }
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    selectedBackgroundType === "video"
                                      ? "videoUrl"
                                      : "imageUrl",
                                    event.target.value,
                                  )
                                }
                                placeholder={
                                  selectedBackgroundType === "video"
                                    ? "동영상 URL"
                                    : "이미지 URL"
                                }
                              />
                              <Button
                                className="h-11"
                                disabled={isUploading}
                                type="button"
                                variant="outline"
                                onClick={() => mediaInputRef.current?.click()}
                              >
                                <ImageIcon />
                              </Button>
                            </div>
                            <input
                              ref={mediaInputRef}
                              accept={
                                selectedBackgroundType === "video"
                                  ? "video/mp4,video/webm,video/quicktime"
                                  : "image/png,image/jpeg,image/webp"
                              }
                              className="hidden"
                              disabled={isUploading}
                              type="file"
                              onChange={(event) => {
                                const file = event.target.files?.[0];

                                if (file) {
                                  void uploadSectionMedia(
                                    file,
                                    selectedBackgroundType === "video" ? "video" : "image",
                                  );
                                }

                                event.currentTarget.value = "";
                              }}
                            />
                            <Button
                              disabled={isUploading}
                              type="button"
                              variant="outline"
                              onClick={() => mediaInputRef.current?.click()}
                            >
                              <UploadCloud />
                              {isUploading
                                ? "업로드 중..."
                                : selectedBackgroundType === "video"
                                  ? "동영상 업로드"
                                  : "이미지 업로드"}
                            </Button>
                            {stringValue(
                              selectedSection,
                              selectedBackgroundType === "video" ? "videoUrl" : "imageUrl",
                            ) ? (
                              <Button
                                className="w-full justify-start text-slate-500"
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                  updateSection(selectedIndex, {
                                    ...selectedSection,
                                    backgroundType: "gradient",
                                    [selectedBackgroundType === "video"
                                      ? "videoUrl"
                                      : "imageUrl"]: "",
                                  })
                                }
                              >
                                <Trash2 />
                                미디어 제거
                              </Button>
                            ) : null}
                          </>
                        ) : null}
                        {uploadMessage ? (
                          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                            {uploadMessage}
                          </p>
                        ) : null}
                      </section>

                      <section className="space-y-4">
                        <h3 className="text-sm font-semibold">패딩 / 여백</h3>
                        <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200">
                          {[
                            { value: "desktop", label: "PC", icon: Laptop },
                            { value: "tablet", label: "태블릿", icon: Tablet },
                            { value: "mobile", label: "모바일", icon: Smartphone },
                          ].map((item) => {
                            const Icon = item.icon;
                            const isActive = activeStyleViewport === item.value;

                            return (
                              <button
                                key={`${item.value}-padding`}
                                className={cn(
                                  "flex h-10 items-center justify-center gap-1.5 text-xs font-semibold",
                                  isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-white text-slate-500",
                                )}
                                type="button"
                                onClick={() => {
                                  const nextViewport = item.value as EditorViewport;

                                  setActiveStyleViewport(nextViewport);
                                  setViewport(nextViewport);
                                }}
                              >
                                <Icon className="size-3.5" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="grid grid-cols-2 gap-3">
                            <label className="space-y-2">
                              <span className="text-xs text-slate-500">상단</span>
                              <Input
                                inputMode="numeric"
                                value={activePaddingTopValue}
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    activePaddingTopField,
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-xs text-slate-500">하단</span>
                              <Input
                                inputMode="numeric"
                                value={activePaddingBottomValue}
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    activePaddingBottomField,
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                          </div>

                          <div className="mt-4 space-y-3">
                            <label className="block space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>상단 패딩</span>
                                <span>{activePaddingTopValue}px</span>
                              </div>
                              <input
                                className="w-full accent-blue-600"
                                max="180"
                                min="24"
                                type="range"
                                value={activePaddingTopValue}
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    activePaddingTopField,
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label className="block space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>하단 패딩</span>
                                <span>{activePaddingBottomValue}px</span>
                              </div>
                              <input
                                className="w-full accent-blue-600"
                                max="180"
                                min="24"
                                type="range"
                                value={activePaddingBottomValue}
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    activePaddingBottomField,
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>

                      </section>

                      <section className="space-y-4">
                        <h3 className="text-sm font-semibold">정렬</h3>
                        <div className="space-y-2">
                          <span className="text-xs text-slate-500">텍스트 정렬</span>
                          <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200">
                            {[
                              ["좌측", "left"],
                              ["중앙", "center"],
                              ["우측", "right"],
                            ].map(([label, value]) => (
                              <button
                                key={value}
                                className={cn(
                                  "h-10 text-xs font-semibold",
                                  stringValue(selectedSection, "align", "left") === value
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-white text-slate-500",
                                )}
                                type="button"
                                onClick={() =>
                                  updateSectionField(selectedIndex, "align", value)
                                }
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {["hero", "content"].includes(
                          stringValue(selectedSection, "type", "content"),
                        ) ? (
                          <div className="space-y-2">
                            <span className="text-xs text-slate-500">비주얼 위치</span>
                            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200">
                              {[
                                ["왼쪽", "left"],
                                ["오른쪽", "right"],
                              ].map(([label, value]) => (
                                <button
                                  key={`${value}-media-position`}
                                  className={cn(
                                    "h-10 text-xs font-semibold",
                                    sectionMediaPosition(selectedSection) === value
                                      ? "bg-blue-50 text-blue-600"
                                      : "bg-white text-slate-500",
                                  )}
                                  type="button"
                                  onClick={() =>
                                    updateSectionField(
                                      selectedIndex,
                                      "mediaPosition",
                                      value,
                                    )
                                  }
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </section>

                      <section className="space-y-4">
                        <h3 className="text-sm font-semibold">효과</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>라운드</span>
                            <span>{stringValue(selectedSection, "radius", "24")}px</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {radiusOptions.map((option) => (
                              <button
                                key={option.value}
                                className={cn(
                                  "h-10 rounded-lg border text-xs font-semibold",
                                  stringValue(selectedSection, "radius", "24") === option.value
                                    ? "border-blue-500 bg-blue-50 text-blue-600"
                                    : "border-slate-200 bg-white text-slate-600",
                                )}
                                type="button"
                                onClick={() =>
                                  updateSectionField(selectedIndex, "radius", option.value)
                                }
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                          <input
                            className="w-full accent-blue-600"
                            max="48"
                            min="0"
                            type="range"
                            value={stringValue(selectedSection, "radius", "24")}
                            onChange={(event) =>
                              updateSectionField(selectedIndex, "radius", event.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs text-slate-500">그림자</span>
                          <div className="grid grid-cols-3 gap-2">
                            {shadowOptions.map((option) => (
                              <button
                                key={option.value}
                                className={cn(
                                  "h-10 rounded-lg border text-xs font-semibold",
                                  stringValue(selectedSection, "shadow", "soft") === option.value
                                    ? "border-blue-500 bg-blue-50 text-blue-600"
                                    : "border-slate-200 bg-white text-slate-600",
                                )}
                                type="button"
                                onClick={() =>
                                  updateSectionField(selectedIndex, "shadow", option.value)
                                }
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          className={cn(
                            "flex h-11 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold",
                            stringValue(selectedSection, "glass", "off") === "on"
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-slate-200 bg-white text-slate-600",
                          )}
                          type="button"
                          onClick={() =>
                            updateSectionField(
                              selectedIndex,
                              "glass",
                              stringValue(selectedSection, "glass", "off") === "on"
                                ? "off"
                                : "on",
                            )
                          }
                        >
                          <span>글래스 효과</span>
                          <span className="text-xs">
                            {stringValue(selectedSection, "glass", "off") === "on"
                              ? "ON"
                              : "OFF"}
                          </span>
                        </button>
                      </section>
                    </>
                  )}
                </div>

                <div className="border-t border-blue-100 bg-white px-6 py-4">
                  <p className="mb-3 truncate text-xs text-slate-500">
                    {hasUnsavedChanges ? "저장하지 않은 변경사항이 있습니다." : saveMessage}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      disabled={!hasUnsavedChanges}
                      type="button"
                      variant="outline"
                      onClick={restoreSavedDraft}
                    >
                      이전
                    </Button>
                    <Button
                      disabled={isSaving}
                      type="button"
                      onClick={() => {
                        void saveDraft();
                      }}
                    >
                      {isSaving ? "저장 중..." : "저장"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-screen flex-col">
                <div className="border-b border-blue-100 px-6 py-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">섹션 라이브러리</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        검증된 모듈만 선택해서 페이지 품질을 유지합니다.
                      </p>
                    </div>
                    <Button
                      className="shrink-0"
                      type="button"
                      variant="outline"
                      onClick={selectSiteStyle}
                    >
                      사이트 스타일
                    </Button>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {availableLibraryCategories.map((category) => (
                      <button
                        key={category}
                        className={cn(
                          "h-9 rounded-lg border text-xs font-semibold transition-colors",
                          activeLibraryCategory === category
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-slate-200 bg-white text-slate-500 hover:border-blue-200",
                        )}
                        type="button"
                        onClick={() => setActiveLibraryCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-auto px-6 py-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">
                        {activeLibraryCategory} 모듈
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        클릭하면 큰 미리보기에서 적용 방식을 선택합니다.
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                      {visibleModules.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {visibleModules.map((preset) => (
                      <div
                        key={`${preset.type}-${preset.layout}-right`}
                        role="button"
                        tabIndex={0}
                        className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
                        onClick={() => openModulePreview(preset)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openModulePreview(preset);
                          }
                        }}
                      >
                        <MiniModulePreview preset={preset} />
                        <div className="mt-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{preset.title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {preset.description}
                            </p>
                          </div>
                          <Button
                            className="h-8 shrink-0 px-3 text-xs"
                            type="button"
                            variant="outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              openModulePreview(preset);
                            }}
                          >
                            <Eye className="size-3.5" />
                            보기
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <section className="mt-7 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">현재 페이지 섹션</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          섹션을 선택하면 세부 설정이 열립니다.
                        </p>
                      </div>
                      <Button
                        className="h-8 px-3 text-xs"
                        type="button"
                        onClick={() => openModulePreview(visibleModules[0] ?? modulePresets[0])}
                      >
                        <Plus className="size-3.5" />
                        추가
                      </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {draft.sections.map((section, index) => {
                        const type = stringValue(section, "type", "content");
                        const isSelected = selectedIndex === index;

                        return (
                          <button
                            key={stringValue(section, "builderId") || `${type}-${index}-right`}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                              isSelected
                                ? "border-blue-500 bg-white text-blue-700"
                                : "border-transparent bg-white/70 text-slate-600 hover:border-blue-200",
                            )}
                            type="button"
                            onClick={() => selectSectionForEdit(index)}
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-600">
                              {index + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs opacity-70">
                                {sectionLabel(type)}
                              </span>
                              <span className="block truncate text-sm font-semibold">
                                {stringValue(section, "title", "Untitled")}
                              </span>
                            </span>
                            <ArrowRight className="size-4 shrink-0 text-slate-400" />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {contextMenu ? (
        <div
          className="fixed z-[60] w-60 overflow-hidden rounded-xl border border-blue-100 bg-white/95 p-1.5 text-sm backdrop-blur"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-xs font-semibold text-blue-600">
              {elementPanelTitle(contextMenu.element)}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {contextMenu.element === "site"
                ? "전체 페이지"
                : `${sectionLabel(stringValue(draft.sections[contextMenu.index] ?? {}, "type", "content"))} 섹션`}
            </p>
          </div>

          <button
            className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left font-medium hover:bg-blue-50 hover:text-blue-600"
            type="button"
            onClick={() => {
              if (contextMenu.element === "site") {
                selectSiteStyle();
              } else if (contextMenu.element === "section") {
                selectSectionForEdit(contextMenu.index);
              } else {
                selectElementForEdit(contextMenu.index, contextMenu.element);
              }
            }}
          >
            <Settings className="size-4" />
            설정 열기
          </button>

          {contextMenu.element !== "site" && contextMenu.element !== "section" ? (
            <button
              className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left font-medium hover:bg-blue-50 hover:text-blue-600"
              type="button"
              onClick={() => selectSectionForEdit(contextMenu.index)}
            >
              <Layers3 className="size-4" />
              섹션 전체 설정
            </button>
          ) : null}

          {contextMenu.element === "visual" ? (
            <button
              className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left font-medium hover:bg-blue-50 hover:text-blue-600"
              type="button"
              onClick={() => {
                setContextMenu(null);
                requestVisualUpload(contextMenu.index);
              }}
            >
              <UploadCloud className="size-4" />
              이미지 업로드
            </button>
          ) : null}

          {contextMenu.element === "site" ? (
            <button
              className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left font-medium hover:bg-blue-50 hover:text-blue-600"
              type="button"
              onClick={() => {
                setContextMenu(null);
                setRightPanelMode("library");
              }}
            >
              <Plus className="size-4" />
              섹션 라이브러리
            </button>
          ) : (
            <>
              <button
                className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left font-medium hover:bg-blue-50 hover:text-blue-600"
                type="button"
                onClick={() => duplicateSection(contextMenu.index)}
              >
                <Copy className="size-4" />
                섹션 복제
              </button>
              <button
                className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left font-medium hover:bg-blue-50 hover:text-blue-600"
                type="button"
                onClick={() => openAddSectionFromContext(contextMenu.index)}
              >
                <Plus className="size-4" />
                아래에 섹션 추가
              </button>
            </>
          )}

          {contextMenu.element === "section" ? (
            <>
              <div className="my-1 border-t border-slate-100" />
              <button
                className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left font-medium hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={contextMenu.index <= 0}
                type="button"
                onClick={() => moveSection(contextMenu.index, -1)}
              >
                <ArrowUp className="size-4" />
                위로 이동
              </button>
              <button
                className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left font-medium hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={contextMenu.index >= draft.sections.length - 1}
                type="button"
                onClick={() => moveSection(contextMenu.index, 1)}
              >
                <ArrowDown className="size-4" />
                아래로 이동
              </button>
              {draft.sections.length > 1 ? (
                <button
                  className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left font-medium text-red-600 hover:bg-red-50"
                  type="button"
                  onClick={() => removeSection(contextMenu.index)}
                >
                  <Trash2 className="size-4" />
                  섹션 삭제
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {previewPreset && previewSection ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-6 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white">
            <header className="flex items-center justify-between border-b border-blue-100 px-6 py-4">
              <div>
                <p className="text-xs font-semibold text-blue-600">
                  {previewPreset.category} 섹션 미리보기
                </p>
                <h2 className="mt-1 text-xl font-bold">{previewPreset.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{previewPreset.description}</p>
              </div>
              <Button size="icon" type="button" variant="ghost" onClick={closeModulePreview}>
                <X />
              </Button>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-h-0 overflow-auto bg-[#f5f8ff] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex rounded-lg bg-white p-1">
                    {[
                      { value: "desktop", label: "데스크톱", icon: Laptop },
                      { value: "tablet", label: "태블릿", icon: Tablet },
                      { value: "mobile", label: "모바일", icon: Smartphone },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = previewViewport === item.value;

                      return (
                        <button
                          key={item.value}
                          className={cn(
                            "flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold",
                            isActive ? "bg-blue-50 text-blue-600" : "text-slate-500",
                          )}
                          type="button"
                          onClick={() => setPreviewViewport(item.value as EditorViewport)}
                        >
                          <Icon className="size-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    프리셋 기반이라 큰 디자인 깨짐 없이 적용됩니다.
                  </span>
                </div>

                <div
                  className={cn(
                    "mx-auto overflow-hidden rounded-xl border border-blue-100 bg-white transition-all",
                    previewViewport === "desktop"
                      ? "max-w-[920px]"
                      : previewViewport === "tablet"
                        ? "max-w-[720px]"
                        : "max-w-[390px]",
                  )}
                  style={canvasStyle}
                >
                  <div className="pointer-events-none">
                    <CanvasSection
                      design={draft.design}
                      index={0}
                      isSelected={false}
                      moveSection={() => undefined}
                      openContextMenu={() => undefined}
                      requestVisualUpload={() => undefined}
                      removeSection={() => undefined}
                      section={previewSection}
                      selectedElement="section"
                      selectElement={() => undefined}
                      selectSection={() => undefined}
                      updateField={() => undefined}
                      updateItems={() => undefined}
                      viewport={previewViewport}
                    />
                  </div>
                </div>
              </div>

              <aside className="min-h-0 overflow-auto border-l border-blue-100 p-5">
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
                  <MiniModulePreview preset={previewPreset} />
                  <p className="mt-3 text-sm font-semibold">{previewPreset.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {previewPreset.description}
                  </p>
                </div>

                <section className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">아래에 추가 위치</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        선택한 섹션 바로 아래에 새 섹션이 들어갑니다.
                      </p>
                    </div>
                    <div className="flex rounded-lg border border-slate-200 bg-white">
                      <Button
                        size="icon"
                        title="위 위치 선택"
                        type="button"
                        variant="ghost"
                        onClick={() => movePreviewInsertTarget(-1)}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        size="icon"
                        title="아래 위치 선택"
                        type="button"
                        variant="ghost"
                        onClick={() => movePreviewInsertTarget(1)}
                      >
                        <ArrowDown />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {draft.sections.map((section, index) => {
                      const isTarget = normalizedPreviewInsertAfterIndex === index;
                      const type = stringValue(section, "type", "content");

                      return (
                        <button
                          key={stringValue(section, "builderId") || `${type}-${index}`}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                            isTarget
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200",
                          )}
                          type="button"
                          onClick={() => setPreviewInsertAfterIndex(index)}
                        >
                          <GripVertical className="size-4 shrink-0 text-slate-400" />
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs opacity-70">
                              {sectionLabel(type)}
                            </span>
                            <span className="block truncate text-sm font-semibold">
                              {stringValue(section, "title", "Untitled")}
                            </span>
                          </span>
                          {isTarget ? <Check className="size-4 shrink-0" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </aside>
            </div>

            <footer className="flex items-center justify-end gap-3 border-t border-blue-100 px-6 py-4">
              <Button type="button" variant="outline" onClick={closeModulePreview}>
                취소
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => replaceSelectedSection(previewPreset)}
              >
                현재 섹션 교체
              </Button>
              <Button
                type="button"
                onClick={() =>
                  insertSectionAfter(previewPreset, normalizedPreviewInsertAfterIndex)
                }
              >
                아래에 추가
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </form>
  );
}
