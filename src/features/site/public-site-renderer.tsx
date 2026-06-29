import type { CSSProperties, ReactNode } from "react";

import type { DashboardPost } from "@/features/dashboard/content-posts-data";
import type { DashboardPopup } from "@/features/dashboard/queries";
import { submitPublicContact } from "@/features/site/actions";
import { PublicPopups } from "@/features/site/public-popups";
import type { Json } from "@/types/database";

type PublicSection = Record<string, unknown>;
type AlignmentValue = "left" | "center" | "right";

type PublicDesign = {
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
  innerWidth: string;
  mainColor: string;
  sectionGap: string;
  subColor: string;
  textColor: string;
};

type PublicPageItem = {
  id: string;
  title: string;
  path: string;
  status: "public" | "private";
};

type PublicNavigationItem = {
  enabled: boolean;
  id: string;
  label: string;
  pageId: string;
};

type PublicPageJson = {
  design: PublicDesign;
  navigation: PublicNavigationItem[];
  pages: PublicPageItem[];
  sections: PublicSection[];
  version: number;
};

type PublicSiteRendererProps = {
  contactResult?: string;
  contactEnabled?: boolean;
  description?: string;
  popups?: DashboardPopup[];
  publishedJson: Json;
  posts?: DashboardPost[];
  siteName: string;
  siteSlug?: string;
};

const defaultDesign: PublicDesign = {
  bodyFontFamily: "system",
  englishFontFamily: "inter",
  footerAccentColor: "#2563eb",
  footerBgColor: "#0f172a",
  footerLayout: "simple",
  footerTextColor: "#e2e8f0",
  headerBgColor: "#ffffff",
  headerButtonBgColor: "#0f172a",
  headerButtonTextColor: "#ffffff",
  headerLayout: "center",
  headerPosition: "static",
  headerTextColor: "#0f172a",
  headingFontFamily: "system",
  innerWidth: "1200",
  mainColor: "#2563eb",
  sectionGap: "80",
  subColor: "#eff6ff",
  textColor: "#0f172a",
};

const defaultPages: PublicPageItem[] = [
  { id: "home", title: "메인 페이지", path: "/", status: "public" },
  { id: "about", title: "회사 소개", path: "/about", status: "public" },
  { id: "service", title: "서비스", path: "/service", status: "public" },
  { id: "pricing", title: "가격", path: "/pricing", status: "private" },
  { id: "blog", title: "블로그", path: "/blog", status: "public" },
];

const defaultNavigation: PublicNavigationItem[] = [
  { id: "nav-products", label: "제품", pageId: "home", enabled: true },
  { id: "nav-solutions", label: "솔루션", pageId: "service", enabled: true },
  { id: "nav-pricing", label: "가격", pageId: "pricing", enabled: true },
  { id: "nav-company", label: "회사", pageId: "about", enabled: true },
];

const fontStacks: Record<string, string> = {
  genos: "'Genos', sans-serif",
  inter: "'Inter', sans-serif",
  montserrat: "'Montserrat', sans-serif",
  noto: "'Noto Sans KR', sans-serif",
  playfair: "'Playfair Display', serif",
  pretendard: "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  roboto: "'Roboto', sans-serif",
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

function stringValue(record: PublicSection, key: string, fallback = "") {
  const value = record[key];
  return typeof value === "string" ? value : fallback;
}

function numberValue(record: PublicSection, key: string, fallback: number) {
  const value = Number(stringValue(record, key, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}


function normalizePages(value: unknown): PublicPageItem[] {
  if (!Array.isArray(value)) return defaultPages;

  const pages = value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const record = item as PublicSection;
      const fallback = defaultPages[index] ?? defaultPages[0];
      const id = stringValue(record, "id", fallback.id || `page-${index}`);
      const title = stringValue(record, "title", fallback.title || "페이지");
      const path = stringValue(record, "path", fallback.path || "/");
      const status = stringValue(record, "status", fallback.status) === "private" ? "private" : "public";

      return { id, path, status, title } satisfies PublicPageItem;
    })
    .filter((item): item is PublicPageItem => Boolean(item));

  return pages.length ? pages : defaultPages;
}

function normalizeNavigation(value: unknown, pages: PublicPageItem[]): PublicNavigationItem[] {
  const pageIds = new Set(pages.map((page) => page.id));

  if (!Array.isArray(value)) {
    return defaultNavigation.filter((item) => pageIds.has(item.pageId));
  }

  const navigation = value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const record = item as PublicSection;
      const fallback = defaultNavigation[index] ?? defaultNavigation[0];
      const pageId = stringValue(record, "pageId", fallback.pageId);

      if (!pageIds.has(pageId)) return null;

      return {
        enabled: record.enabled === false ? false : true,
        id: stringValue(record, "id", `nav-${index}`),
        label: stringValue(record, "label", fallback.label || "메뉴"),
        pageId,
      } satisfies PublicNavigationItem;
    })
    .filter((item): item is PublicNavigationItem => Boolean(item));

  return navigation.length ? navigation : defaultNavigation.filter((item) => pageIds.has(item.pageId));
}

function mergeDesign(value: unknown): PublicDesign {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultDesign;
  }

  const record = value as PublicSection;

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
    innerWidth: stringValue(record, "innerWidth", defaultDesign.innerWidth),
    mainColor: stringValue(record, "mainColor", defaultDesign.mainColor),
    sectionGap: stringValue(record, "sectionGap", defaultDesign.sectionGap),
    subColor: stringValue(record, "subColor", defaultDesign.subColor),
    textColor: stringValue(record, "textColor", defaultDesign.textColor),
  };
}

function defaultSection(type: string): PublicSection {
  if (type === "hero") {
    return {
      backgroundType: "gradient",
      badge: "AI · No Code · Web Solution",
      buttonLabel: "무료로 시작하기",
      buttonLink: "#contact",
      description:
        "KEYUN은 AI와 노코드 기술로 비즈니스의 시작부터 성장까지 모든 과정을 지원하는 통합 솔루션 플랫폼입니다.",
      gradientFrom: "#f3f7ff",
      gradientTo: "#ffffff",
      layout: "slide",
      mediaPosition: "right",
      paddingBottom: "110",
      paddingTop: "110",
      secondaryButtonLabel: "제품 살펴보기",
      title: "아이디어를 실현하는 가장 스마트한 방법, KEYUN",
      type,
      width: "1200",
    };
  }

  if (type === "features") {
    return {
      backgroundType: "color",
      badge: "Features",
      bgColor: "#ffffff",
      description: "검증된 섹션을 조합해 디자인 품질을 유지합니다.",
      items: ["프리셋 기반 편집", "섹션 상하 이동", "실시간 미리보기"],
      layout: "cards",
      paddingBottom: "90",
      paddingTop: "90",
      title: "쉬운데 결과물이 예쁜 빌더",
      type,
      width: "1200",
    };
  }

  if (type === "cta") {
    return {
      backgroundType: "gradient",
      buttonLabel: "상담 신청",
      buttonLink: "#contact",
      description: "저장 후 게시하면 공개 URL에 바로 반영됩니다.",
      gradientFrom: "#0f172a",
      gradientTo: "#1d4ed8",
      layout: "banner",
      paddingBottom: "86",
      paddingTop: "86",
      title: "이제 사이트를 게시할 시간입니다",
      type,
      width: "1200",
    };
  }

  return {
    backgroundType: "color",
    badge: "Service",
    bgColor: "#f8fafc",
    description: "브랜드 메시지를 안정적인 레이아웃으로 보여주는 섹션입니다.",
    layout: "media-left",
    mediaPosition: "left",
    paddingBottom: "90",
    paddingTop: "90",
    title: "제한된 자유도로 완성도를 지킵니다",
    type: "content",
    width: "1200",
  };
}

function normalizeSection(value: unknown, index: number): PublicSection {
  if (typeof value === "string") {
    return { ...defaultSection(value), builderId: `${value}-${index}` };
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as PublicSection;
    const type = stringValue(record, "type", "content");
    return {
      ...defaultSection(type),
      ...record,
      builderId: stringValue(record, "builderId", `${type}-${index}`),
      type,
    };
  }

  return { ...defaultSection("content"), builderId: `content-${index}` };
}

function normalizePageJson(publishedJson: Json): PublicPageJson {
  if (publishedJson && typeof publishedJson === "object" && !Array.isArray(publishedJson)) {
    const record = publishedJson as PublicSection;
    const sections = Array.isArray(record.sections)
      ? record.sections.map(normalizeSection)
      : [];

    const pages = normalizePages(record.pages);

    return {
      design: mergeDesign(record.design),
      navigation: normalizeNavigation(record.navigation, pages),
      pages,
      sections: sections.length
        ? sections
        : [defaultSection("hero"), defaultSection("features"), defaultSection("cta")],
      version: numberValue(record, "version", 1),
    };
  }

  return {
    design: defaultDesign,
    navigation: defaultNavigation,
    pages: defaultPages,
    sections: [defaultSection("hero"), defaultSection("features"), defaultSection("cta")],
    version: 1,
  };
}

function fontStack(value: string, fallback: string) {
  return fontStacks[value] ?? fontStacks[fallback] ?? fontStacks.system;
}

function siteWidth(value: string) {
  if (value === "full") return "100%";
  if (value === "1440") return "1440px";
  return "1200px";
}

function sectionWidth(section: PublicSection, design: PublicDesign) {
  const value = stringValue(section, "width", design.innerWidth);
  return siteWidth(value);
}

function sectionBackground(section: PublicSection, design: PublicDesign): CSSProperties {
  const type = stringValue(section, "backgroundType", "gradient");
  const imageUrl = stringValue(section, "imageUrl");

  if (type === "image" && imageUrl) {
    return {
      backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.92), rgba(255,255,255,0.58)), url(${imageUrl})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
    };
  }

  if (type === "color" || type === "video") {
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

function sectionEffectStyle(section: PublicSection): CSSProperties {
  const glassEnabled = stringValue(section, "glass", "off") === "on";

  return {
    backdropFilter: glassEnabled ? "blur(18px) saturate(1.12)" : undefined,
    borderColor: glassEnabled ? "rgba(255, 255, 255, 0.64)" : "transparent",
    boxShadow: shadowStyle(stringValue(section, "shadow", "soft")),
    WebkitBackdropFilter: glassEnabled ? "blur(18px) saturate(1.12)" : undefined,
  };
}

function childCardStyle(section: PublicSection): CSSProperties {
  const radius = Math.max(10, numberValue(section, "radius", 24) - 6);

  return {
    borderRadius: `${radius}px`,
    boxShadow: shadowStyle(stringValue(section, "shadow", "soft")),
  };
}

function titleStyle(section: PublicSection, design: PublicDesign): CSSProperties {
  const type = stringValue(section, "type", "content");
  const layoutAlign = alignmentValue(section, "align");

  return {
    color: stringValue(section, "titleColor", design.textColor),
    fontFamily: fontStack(
      stringValue(section, "titleFontFamily", design.headingFontFamily),
      design.headingFontFamily,
    ),
    fontSize: `${stringValue(section, "titleFontSize", type === "hero" ? "52" : "36")}px`,
    letterSpacing: `${stringValue(section, "titleLetterSpacing", "0")}px`,
    lineHeight: stringValue(section, "titleLineHeight", "1.15"),
    textAlign: alignmentValue(section, "titleAlign", layoutAlign),
    whiteSpace: "pre-line",
  };
}

function descriptionStyle(section: PublicSection, design: PublicDesign): CSSProperties {
  const layoutAlign = alignmentValue(section, "align");

  return {
    color: stringValue(section, "descriptionColor", "#64748b"),
    fontFamily: fontStack(
      stringValue(section, "descriptionFontFamily", design.bodyFontFamily),
      design.bodyFontFamily,
    ),
    fontSize: `${stringValue(section, "descriptionFontSize", "16")}px`,
    letterSpacing: `${stringValue(section, "descriptionLetterSpacing", "0")}px`,
    lineHeight: stringValue(section, "descriptionLineHeight", "1.72"),
    textAlign: alignmentValue(section, "descriptionAlign", layoutAlign),
    whiteSpace: "pre-line",
  };
}

function buttonStyle(section: PublicSection, design: PublicDesign): CSSProperties {
  return {
    backgroundColor: stringValue(section, "buttonBgColor", design.mainColor),
    borderRadius: `${stringValue(section, "buttonRadius", "12")}px`,
    color: stringValue(section, "buttonTextColor", "#ffffff"),
    fontFamily: fontStack(
      stringValue(section, "buttonFontFamily", design.bodyFontFamily),
      design.bodyFontFamily,
    ),
    fontSize: `${stringValue(section, "buttonFontSize", "15")}px`,
    letterSpacing: `${stringValue(section, "buttonLetterSpacing", "0")}px`,
    lineHeight: stringValue(section, "buttonLineHeight", "1.1"),
  };
}

function itemList(section: PublicSection) {
  const items = section.items;
  return Array.isArray(items) && items.length
    ? items.map(String)
    : ["프리셋 기반 편집", "섹션 상하 이동", "실시간 미리보기"];
}

function alignmentValue(
  section: PublicSection,
  key: string,
  fallback: AlignmentValue = "left",
) {
  const value = stringValue(section, key, fallback);

  return value === "center" || value === "right" ? value : "left";
}

function alignClass(section: PublicSection) {
  const align = alignmentValue(section, "align");

  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

function justifyClass(section: PublicSection, key = "align") {
  const align = alignmentValue(
    section,
    key,
    alignmentValue(section, "align"),
  );

  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}

function positionClass(section: PublicSection) {
  const align = alignmentValue(section, "align");

  if (align === "center") return "mx-auto";
  if (align === "right") return "ml-auto";
  return "mr-auto";
}

function sectionMediaPosition(section: PublicSection) {
  const fallback = stringValue(section, "type", "content") === "content" ? "left" : "right";
  const value = stringValue(section, "mediaPosition", fallback);

  return value === "left" || value === "right" ? value : fallback;
}

function headerPositionClass(position: string) {
  if (position === "fixed") return "sticky top-0 z-40 shadow-sm";
  return "relative";
}

function PublicHeader({
  design,
  navigation,
  pages,
  siteName,
  siteSlug,
}: {
  design: PublicDesign;
  navigation: PublicNavigationItem[];
  pages: PublicPageItem[];
  siteName: string;
  siteSlug: string;
}) {
  const pageById = new Map(pages.map((page) => [page.id, page]));
  const navItems = navigation
    .filter((item) => item.enabled)
    .map((item) => ({ ...item, page: pageById.get(item.pageId) }))
    .filter((item) => item.page?.status === "public");
  const headerLayout = design.headerLayout;
  const publicHref = (path?: string) => {
    if (!siteSlug) return path || "#";
    if (!path || path === "#") return "#";
    if (path.startsWith("http") || path.startsWith("tel:") || path.startsWith("mailto:")) {
      return path;
    }
    if (path.startsWith("#")) return path;
    if (path === "/") return `/s/${siteSlug}`;

    return `/s/${siteSlug}${path.startsWith("/") ? path : `/${path}`}`;
  };

  return (
    <header
      className={headerPositionClass(design.headerPosition)}
      style={{
        backgroundColor: design.headerBgColor,
        color: design.headerTextColor,
        fontFamily: fontStack(design.bodyFontFamily, "system"),
      }}
    >
      <div
        className="mx-auto flex min-h-20 w-full items-center justify-between gap-8 px-6"
        style={{ maxWidth: siteWidth(design.innerWidth) }}
      >
        <div className={`flex min-w-0 items-center ${headerLayout === "left" ? "flex-1 gap-10" : "gap-4"}`}>
          <a className="flex shrink-0 items-center gap-2 text-xl font-bold" href={publicHref("/")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={siteName} className="h-8 w-auto" src="/keyun-logo.svg" />
            <span className="sr-only">{siteName}</span>
          </a>
          {headerLayout === "left" ? (
            <nav className="hidden min-w-0 items-center gap-8 text-sm font-semibold md:flex">
              {navItems.map((item) => (
                <a key={item.id} href={publicHref(item.page?.path)}>
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        {headerLayout !== "left" ? (
          <nav className={`hidden items-center text-sm font-semibold md:flex ${headerLayout === "cta" ? "gap-7" : "gap-10"}`}>
            {navItems.slice(0, 4).map((item) => (
              <a key={item.id} href={publicHref(item.page?.path)}>
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}

        <a
          className={`inline-flex min-h-11 shrink-0 items-center justify-center px-5 text-sm font-semibold ${headerLayout === "cta" ? "px-7 shadow-lg" : ""}`}
          href="#contact"
          style={{
            backgroundColor: design.headerButtonBgColor,
            borderRadius: 999,
            color: design.headerButtonTextColor,
          }}
        >
          시작하기
        </a>
      </div>
    </header>
  );
}

function VisualBlock({ section, siteName }: { section: PublicSection; siteName: string }) {
  const imageUrl = stringValue(section, "imageUrl");
  const radius = `${stringValue(section, "radius", "24")}px`;

  if (imageUrl) {
    return (
      <div className="overflow-hidden border border-white/70 bg-white/60" style={{ borderRadius: radius }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="h-full min-h-72 w-full object-cover" src={imageUrl} />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-80 overflow-hidden border border-white/70 bg-white/55 p-8 backdrop-blur"
      style={{ borderRadius: radius }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.16),transparent_26%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.2),transparent_30%)]" />
      <div className="relative mx-auto mt-8 flex size-32 items-center justify-center rounded-3xl border border-blue-100 bg-white/80 text-4xl font-bold text-blue-600">
        K
      </div>
      <div className="relative mx-auto mt-8 max-w-xs rounded-2xl border border-white/80 bg-white/70 p-5 text-center text-sm text-slate-500">
        <strong className="block text-lg text-slate-900">{siteName}</strong>
        Published with KEYUN
      </div>
    </div>
  );
}

function SectionShell({
  children,
  design,
  section,
}: {
  children: ReactNode;
  design: PublicDesign;
  section: PublicSection;
}) {
  const backgroundType = stringValue(section, "backgroundType", "gradient");
  const videoUrl = stringValue(section, "videoUrl");

  return (
    <section
      className="relative overflow-hidden border"
      style={{
        ...sectionBackground(section, design),
        ...sectionEffectStyle(section),
        borderRadius: `${stringValue(section, "radius", "24")}px`,
        color: design.textColor,
        paddingBottom: `${numberValue(section, "paddingBottom", 90)}px`,
        paddingTop: `${numberValue(section, "paddingTop", 90)}px`,
      }}
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
      <div className="relative z-10 mx-auto w-full px-6 md:px-10" style={{ maxWidth: sectionWidth(section, design) }}>
        {children}
      </div>
    </section>
  );
}

function HeroSection({
  design,
  section,
  siteName,
}: {
  design: PublicDesign;
  section: PublicSection;
  siteName: string;
}) {
  const layout = stringValue(section, "layout");
  const mediaPosition = sectionMediaPosition(section);
  const visual = <VisualBlock section={section} siteName={siteName} />;
  const isTextOnly = layout === "text-focus" || layout === "cta-focus";

  return (
    <SectionShell design={design} section={section}>
      <div
        className={`grid items-center gap-10 ${
          isTextOnly
            ? `max-w-3xl grid-cols-1 ${positionClass(section)}`
            : "lg:grid-cols-[0.95fr_1.05fr]"
        } ${alignClass(section)}`}
      >
        {mediaPosition === "left" && !isTextOnly ? <div className="lg:order-1">{visual}</div> : null}
        <div className={`max-w-2xl ${positionClass(section)} ${mediaPosition === "left" && !isTextOnly ? "lg:order-2" : "lg:order-1"}`}>
          {stringValue(section, "badge") ? (
            <p
              className="mb-5 inline-flex rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                backgroundColor: `${design.mainColor}14`,
                color: design.mainColor,
              }}
            >
              {stringValue(section, "badge")}
            </p>
          ) : null}
          <h1 className="max-w-3xl font-bold tracking-normal" style={titleStyle(section, design)}>
            {stringValue(section, "title", siteName)}
          </h1>
          <p className="mt-6 max-w-2xl" style={descriptionStyle(section, design)}>
            {stringValue(section, "description")}
          </p>
          <div className={`mt-9 flex flex-wrap items-center gap-4 ${justifyClass(section, "buttonAlign")}`}>
            {stringValue(section, "buttonLabel") ? (
              <a
                className="inline-flex min-h-12 items-center justify-center px-6 font-semibold"
                href={stringValue(section, "buttonLink", "#")}
                style={buttonStyle(section, design)}
              >
                {stringValue(section, "buttonLabel")}
              </a>
            ) : null}
            {stringValue(section, "secondaryButtonLabel") ? (
              <a className="inline-flex min-h-12 items-center justify-center px-3 text-sm font-semibold text-slate-900" href="#">
                {stringValue(section, "secondaryButtonLabel")}
              </a>
            ) : null}
          </div>
        </div>
        {mediaPosition !== "left" && !isTextOnly ? <div className="lg:order-2">{visual}</div> : null}
      </div>
    </SectionShell>
  );
}

function FeaturesSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout");

  return (
    <SectionShell design={design} section={section}>
      <div className={`max-w-4xl ${positionClass(section)} ${alignClass(section)}`}>
        {stringValue(section, "badge") ? (
          <p className="mb-4 text-sm font-bold" style={{ color: design.mainColor }}>
            {stringValue(section, "badge")}
          </p>
        ) : null}
        <h2 className="font-bold tracking-normal" style={titleStyle(section, design)}>
          {stringValue(section, "title")}
        </h2>
        <p
          className={`mt-4 max-w-2xl ${positionClass(section)}`}
          style={descriptionStyle(section, design)}
        >
          {stringValue(section, "description")}
        </p>
      </div>
      <div className={`mt-10 grid gap-5 ${layout === "timeline" ? "grid-cols-1" : "md:grid-cols-3"}`}>
        {items.map((item, index) => (
          <article
            key={`${item}-${index}`}
            className="rounded-2xl border border-blue-100 bg-white/70 p-6 text-left"
            style={childCardStyle(section)}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3
              className="mt-5 text-base font-bold"
              style={{
                color: stringValue(section, "titleColor", design.textColor),
                fontFamily: fontStack(stringValue(section, "descriptionFontFamily", design.bodyFontFamily), design.bodyFontFamily),
              }}
            >
              {item}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              운영자가 선택한 레이아웃 안에서 안정적으로 노출됩니다.
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function ContentSection({
  design,
  section,
  siteName,
}: {
  design: PublicDesign;
  section: PublicSection;
  siteName: string;
}) {
  const mediaPosition = sectionMediaPosition(section);
  const visual = <VisualBlock section={section} siteName={siteName} />;

  return (
    <SectionShell design={design} section={section}>
      <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
        {mediaPosition === "left" ? <div className="lg:order-1">{visual}</div> : null}
        <div className={`${alignClass(section)} ${mediaPosition === "right" ? "lg:order-1" : "lg:order-2"}`}>
          {stringValue(section, "badge") ? (
            <p className="mb-4 text-sm font-bold" style={{ color: design.mainColor }}>
              {stringValue(section, "badge")}
            </p>
          ) : null}
          <h2 className="font-bold tracking-normal" style={titleStyle(section, design)}>
            {stringValue(section, "title")}
          </h2>
          <p className="mt-5" style={descriptionStyle(section, design)}>
            {stringValue(section, "description")}
          </p>
          {stringValue(section, "bodyText") ? (
            <div
              className="mt-8 max-w-3xl whitespace-pre-line text-base leading-8"
              style={{
                color: stringValue(section, "descriptionColor", design.textColor),
                fontFamily: fontStack(
                  stringValue(section, "descriptionFontFamily", design.bodyFontFamily),
                  design.bodyFontFamily,
                ),
              }}
            >
              {stringValue(section, "bodyText")}
            </div>
          ) : null}
        </div>
        {mediaPosition !== "left" ? <div className="lg:order-2">{visual}</div> : null}
      </div>
    </SectionShell>
  );
}

function CtaSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  return (
    <SectionShell design={design} section={section}>
      <div className={`max-w-4xl ${positionClass(section)} ${alignClass(section)}`}>
        <h2
          className="font-bold tracking-normal"
          style={titleStyle(section, design)}
        >
          {stringValue(section, "title")}
        </h2>
        <p
          className={`mt-5 max-w-2xl ${positionClass(section)}`}
          style={descriptionStyle(section, design)}
        >
          {stringValue(section, "description")}
        </p>
        {stringValue(section, "buttonLabel") ? (
          <div className={`mt-8 flex ${justifyClass(section, "buttonAlign")}`}>
            <a
              className="inline-flex min-h-12 items-center justify-center px-6 font-semibold"
              href={stringValue(section, "buttonLink", "#")}
              style={buttonStyle(section, design)}
            >
              {stringValue(section, "buttonLabel")}
            </a>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

function LatestPostsSection({
  design,
  posts,
  siteSlug,
}: {
  design: PublicDesign;
  posts: DashboardPost[];
  siteSlug: string;
}) {
  if (!posts.length) {
    return null;
  }

  const visiblePosts = posts.slice(0, 3);

  return (
    <section className="px-6 py-4">
      <div
        className="mx-auto rounded-[24px] border border-slate-200 bg-white px-6 py-12 md:px-10"
        style={{ maxWidth: siteWidth(design.innerWidth) }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold" style={{ color: design.mainColor }}>
              News
            </p>
            <h2
              className="mt-3 text-3xl font-bold tracking-normal"
              style={{
                color: design.textColor,
                fontFamily: fontStack(design.headingFontFamily, "system"),
              }}
            >
              최근 게시글
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              관리자에서 게시한 글이 사용자 페이지에 자동으로 노출됩니다.
            </p>
          </div>
          <a
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-bold"
            href={`/s/${siteSlug}/posts`}
          >
            전체 보기
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {visiblePosts.map((post) => (
            <a
              className="group flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white"
              href={`/s/${siteSlug}/posts/${post.slug || post.id}`}
              key={post.id}
            >
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span
                  className="rounded-full px-2.5 py-1"
                  style={{
                    backgroundColor: `${design.mainColor}12`,
                    color: design.mainColor,
                  }}
                >
                  {post.board}
                </span>
                {post.category ? (
                  <span className="rounded-full bg-white px-2.5 py-1 text-slate-500">
                    {post.category}
                  </span>
                ) : null}
              </div>
              <h3
                className="mt-5 text-xl font-bold leading-snug tracking-normal transition group-hover:text-blue-600"
                style={{ fontFamily: fontStack(design.headingFontFamily, "system") }}
              >
                {post.title}
              </h3>
              <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">
                {post.summary || post.content}
              </p>
              <div className="mt-auto pt-6 text-sm font-semibold text-slate-400">
                {post.updatedAt}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({
  contactEnabled,
  contactResult,
  design,
  siteName,
  siteSlug,
}: {
  contactEnabled: boolean;
  contactResult?: string;
  design: PublicDesign;
  siteName: string;
  siteSlug: string;
}) {
  return (
    <section className="px-6 py-4" id="contact">
      <div
        className="mx-auto grid gap-8 rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white md:grid-cols-[0.9fr_1.1fr] md:p-10"
        style={{ maxWidth: siteWidth(design.innerWidth) }}
      >
        <div>
          <p className="text-sm font-bold" style={{ color: design.footerAccentColor }}>
            Contact
          </p>
          <h2
            className="mt-3 text-3xl font-bold tracking-normal"
            style={{ fontFamily: fontStack(design.headingFontFamily, "system") }}
          >
            문의를 남겨주세요
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {siteName} 담당자가 문의 내용을 확인한 뒤 연락드립니다.
          </p>
          {contactResult === "sent" ? (
            <p className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
              문의가 접수되었습니다.
            </p>
          ) : null}
          {contactResult === "failed" ? (
            <p className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100">
              문의 접수에 실패했습니다. 이름, 연락처, 문의 내용을 확인해 주세요.
            </p>
          ) : null}
          {!contactEnabled ? (
            <p className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
              이 화면은 DB에 연결되지 않은 데모 미리보기입니다. 실제 문의 저장은 게시된 사이트에서 동작합니다.
            </p>
          ) : null}
        </div>

        <form action={submitPublicContact} className="grid gap-3 rounded-2xl bg-white p-4 text-slate-950 md:p-5">
          <input name="site_slug" type="hidden" value={siteSlug} />
          <input name="source_path" type="hidden" value={`/s/${siteSlug}`} />
          <input
            aria-hidden="true"
            autoComplete="off"
            className="hidden"
            name="company"
            tabIndex={-1}
            type="text"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-bold text-slate-500">
              이름
              <input
                autoComplete="name"
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-slate-950"
                name="name"
                placeholder="홍길동"
                required
              />
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-slate-500">
              연락처
              <input
                autoComplete="tel"
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-slate-950"
                name="phone"
                placeholder="010-0000-0000"
              />
            </label>
          </div>
          <label className="grid gap-1.5 text-xs font-bold text-slate-500">
            이메일
            <input
              autoComplete="email"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-slate-950"
              name="email"
              placeholder="hello@example.com"
              type="email"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-slate-500">
            제목
            <input
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-slate-950"
              name="subject"
              placeholder="문의 제목"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-slate-500">
            문의 내용
            <textarea
              className="min-h-32 resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-950 outline-none focus:border-slate-950"
              name="message"
              placeholder="궁금한 내용을 남겨주세요."
              required
            />
          </label>
          <p className="text-xs leading-5 text-slate-500">
            연락처 또는 이메일 중 하나는 꼭 입력해 주세요.
          </p>
          <button
            className="mt-2 inline-flex h-12 items-center justify-center rounded-xl px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!contactEnabled}
            style={{ backgroundColor: contactEnabled ? design.mainColor : "#94a3b8" }}
            type="submit"
          >
            {contactEnabled ? "문의 보내기" : "데모에서는 저장 불가"}
          </button>
          <p className="text-xs leading-5 text-slate-400">
            제출한 정보는 문의 응대 목적으로만 사용됩니다.
          </p>
        </form>
      </div>
    </section>
  );
}

function PublicFooter({ design, siteName }: { design: PublicDesign; siteName: string }) {
  const links = ["이용약관", "개인정보처리방침", "문의하기"];
  const layout = design.footerLayout;

  return (
    <footer
      className="px-6 py-12"
      style={{
        backgroundColor: design.footerBgColor,
        color: design.footerTextColor,
        fontFamily: fontStack(design.bodyFontFamily, "system"),
      }}
    >
      <div className="mx-auto" style={{ maxWidth: siteWidth(design.innerWidth) }}>
        {layout === "minimal" || layout === "simple" ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xl font-bold">{siteName}</p>
            <p className="text-sm opacity-70">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          </div>
        ) : layout === "social" ? (
          <div className="text-center">
            <p className="text-xl font-bold">{siteName}</p>
            <div className="mt-6 flex justify-center gap-3">
              {["B", "K", "I", "Y"].map((item) => (
                <a
                  key={item}
                  className="flex size-10 items-center justify-center rounded-lg bg-white/10 text-sm font-bold"
                  href="#"
                >
                  {item}
                </a>
              ))}
            </div>
            <p className="mt-6 text-sm opacity-70">© {new Date().getFullYear()} {siteName}</p>
          </div>
        ) : layout === "cta" ? (
          <div className="flex flex-col gap-8 rounded-3xl bg-white/10 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-2xl font-bold">{siteName}</p>
              <p className="mt-2 text-sm opacity-70">브랜드의 다음 페이지를 키운과 함께 만듭니다.</p>
            </div>
            <a className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-bold" href="#" style={{ color: design.footerAccentColor }}>
              문의하기
            </a>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div>
              <p className="text-xl font-bold">{siteName}</p>
              <p className="mt-3 max-w-sm text-sm leading-7 opacity-70">키운 스튜디오로 제작된 사이트입니다.</p>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: design.footerAccentColor }}>메뉴</p>
              <div className="mt-4 grid gap-2 text-sm opacity-75">
                {["제품", "솔루션", "가격"].map((item) => <a key={item} href="#">{item}</a>)}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: design.footerAccentColor }}>정보</p>
              <div className="mt-4 grid gap-2 text-sm opacity-75">
                {links.map((item) => <a key={item} href="#">{item}</a>)}
              </div>
            </div>
          </div>
        )}
        {layout !== "minimal" && layout !== "simple" ? (
          <div className="mt-10 border-t pt-5 text-sm opacity-70" style={{ borderColor: `${design.footerAccentColor}55` }}>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </div>
        ) : null}
      </div>
    </footer>
  );
}

function PublicSectionRenderer({
  design,
  section,
  siteName,
}: {
  design: PublicDesign;
  section: PublicSection;
  siteName: string;
}) {
  const type = stringValue(section, "type", "content");

  if (type === "hero") {
    return <HeroSection design={design} section={section} siteName={siteName} />;
  }

  if (type === "features") {
    return <FeaturesSection design={design} section={section} />;
  }

  if (type === "cta") {
    return <CtaSection design={design} section={section} />;
  }

  return <ContentSection design={design} section={section} siteName={siteName} />;
}

export function PublicSiteRenderer({
  contactEnabled = true,
  contactResult,
  description,
  popups = [],
  publishedJson,
  posts = [],
  siteName,
  siteSlug = "",
}: PublicSiteRendererProps) {
  const page = normalizePageJson(publishedJson);
  const { design, navigation, pages, sections } = page;

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        color: design.textColor,
        fontFamily: fontStack(design.bodyFontFamily, "system"),
      }}
    >
      <PublicHeader
        design={design}
        navigation={navigation}
        pages={pages}
        siteName={siteName}
        siteSlug={siteSlug}
      />
      <main style={{ display: "grid", gap: `${Math.max(0, Number(design.sectionGap) || 0)}px` }}>
        {sections.map((section, index) => (
          <PublicSectionRenderer
            design={design}
            key={stringValue(section, "builderId", `${stringValue(section, "type", "section")}-${index}`)}
            section={section}
            siteName={siteName}
          />
        ))}
        {sections.length === 0 ? (
          <section className="px-6 py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold">{siteName}</h1>
              {description ? <p className="mt-4 text-slate-500">{description}</p> : null}
            </div>
          </section>
        ) : null}
        {siteSlug ? <LatestPostsSection design={design} posts={posts} siteSlug={siteSlug} /> : null}
        {siteSlug ? (
          <ContactSection
            contactEnabled={contactEnabled}
            contactResult={contactResult}
            design={design}
            siteName={siteName}
            siteSlug={siteSlug}
          />
        ) : null}
      </main>
      <PublicFooter design={design} siteName={siteName} />
      {siteSlug ? <PublicPopups popups={popups} siteSlug={siteSlug} /> : null}
    </div>
  );
}
