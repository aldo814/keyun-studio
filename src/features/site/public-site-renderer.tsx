import type { CSSProperties, ReactNode } from "react";

import type { DashboardPost } from "@/features/dashboard/content-posts-data";
import type { DashboardPopup } from "@/features/dashboard/queries";
import { submitPublicContact } from "@/features/site/actions";
import { PublicHeroSlider } from "@/features/site/public-hero-slider";
import { PublicSiteAnimations } from "@/features/site/public-site-animations";
import { PublicPopups } from "@/features/site/public-popups";
import type { Json } from "@/types/database";

type PublicSection = Record<string, unknown>;
type SiteLocale = "ko" | "en";
type PublicTranslations = Partial<Record<SiteLocale, PublicSection>>;
type PublicHeroSlide = {
  backgroundType: "color" | "image";
  badge: string;
  bgColor: string;
  buttonLabel: string;
  buttonLink: string;
  description: string;
  id: string;
  imageUrl: string;
  secondaryButtonLabel: string;
  secondaryButtonLink: string;
  title: string;
};
type AlignmentValue = "left" | "center" | "right";
type AnimationElement =
  | "section"
  | "badge"
  | "title"
  | "description"
  | "button"
  | "secondaryButton"
  | "visual";

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
  translations?: PublicTranslations;
};

type PublicNavigationItem = {
  enabled: boolean;
  id: string;
  label: string;
  pageId: string;
  translations?: PublicTranslations;
};

type PublicI18n = {
  footerCopyright: Partial<Record<SiteLocale, string>>;
  locales: SiteLocale[];
  seo: Partial<Record<SiteLocale, { description: string; title: string }>>;
  siteName: Partial<Record<SiteLocale, string>>;
};

type PublicPageJson = {
  design: PublicDesign;
  i18n: PublicI18n;
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
  locale?: SiteLocale;
  pagePath?: string;
  posts?: DashboardPost[];
  siteName: string;
  siteSlug?: string;
};

const defaultDesign: PublicDesign = {
  bodyFontFamily: "pretendard",
  englishFontFamily: "pretendard",
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
  headingFontFamily: "pretendard",
  innerWidth: "1200",
  mainColor: "#2563eb",
  sectionGap: "80",
  subColor: "#eff6ff",
  textColor: "#0f172a",
};

const showcaseHeroLayouts = new Set([
  "product-canvas",
  "centered-showcase",
  "template-showcase",
  "modular-assembly",
  "editorial-contrast",
]);

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

const defaultI18n: PublicI18n = {
  footerCopyright: {
    en: "All rights reserved.",
    ko: "모든 권리 보유.",
  },
  locales: ["ko"],
  seo: {},
  siteName: {},
};

const fontStacks: Record<string, string> = {
  "black-han-sans": "'Black Han Sans', sans-serif",
  "escore-dream": "'Escoredream', sans-serif",
  "gmarket-sans": "'Gmarket Sans', sans-serif",
  genos: "'Genos', sans-serif",
  "google-sans-flex": "'Google Sans Flex', sans-serif",
  "gowun-dodum": "'Gowun Dodum', sans-serif",
  "ibm-plex-sans-kr": "'IBM Plex Sans KR', sans-serif",
  inter: "'Inter', sans-serif",
  jua: "'Jua', sans-serif",
  mona: "'Mona12 Text KR', 'Mona12', sans-serif",
  montserrat: "'Montserrat', sans-serif",
  "nanum-myeongjo": "'Nanum Myeongjo', serif",
  "nanum-square-round": "'NanumSquareRound', sans-serif",
  noto: "'Noto Sans KR', sans-serif",
  "noto-sans-kr": "'Noto Sans KR', sans-serif",
  "noto-serif-kr": "'Noto Serif KR', serif",
  playfair: "'Playfair Display', serif",
  poppins: "'Poppins', sans-serif",
  pretendard:
    "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  roboto: "'Roboto', sans-serif",
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

function stringValue(record: PublicSection, key: string, fallback = "") {
  const value = record[key];
  return typeof value === "string" ? value : fallback;
}

function translationFields(value: unknown): PublicTranslations | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as PublicSection;
  const english =
    record.en && typeof record.en === "object" && !Array.isArray(record.en)
      ? (record.en as PublicSection)
      : undefined;

  return english ? { en: english } : undefined;
}

function localizedRecord(record: PublicSection, locale: SiteLocale) {
  if (locale === "ko") return record;
  const translated = translationFields(record.translations)?.[locale];
  return translated ? { ...record, ...translated } : record;
}

function localizedSectionRecord(record: PublicSection, locale: SiteLocale) {
  const localized = localizedRecord(record, locale);

  if (!Array.isArray(record.slides)) return localized;

  return {
    ...localized,
    slides: record.slides.map((slide) =>
      slide && typeof slide === "object" && !Array.isArray(slide)
        ? localizedRecord(slide as PublicSection, locale)
        : slide,
    ),
  };
}

function normalizeI18n(value: unknown): PublicI18n {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultI18n;
  const record = value as PublicSection;
  const locales = Array.isArray(record.locales)
    ? record.locales.filter(
        (locale): locale is SiteLocale => locale === "ko" || locale === "en",
      )
    : defaultI18n.locales;

  return {
    footerCopyright:
      record.footerCopyright &&
      typeof record.footerCopyright === "object" &&
      !Array.isArray(record.footerCopyright)
        ? (record.footerCopyright as PublicI18n["footerCopyright"])
        : defaultI18n.footerCopyright,
    locales: Array.from(new Set<SiteLocale>(["ko", ...locales])),
    seo:
      record.seo && typeof record.seo === "object" && !Array.isArray(record.seo)
        ? (record.seo as PublicI18n["seo"])
        : {},
    siteName:
      record.siteName && typeof record.siteName === "object" && !Array.isArray(record.siteName)
        ? (record.siteName as PublicI18n["siteName"])
        : {},
  };
}

function publicHeroSlides(section: PublicSection): PublicHeroSlide[] {
  const fallbackSlides = [
    {
      badge: "AI · No Code · Web Solution",
      bgColor: "#172554",
      description: "검증된 디자인을 선택하고 내용만 바꾸면 사이트가 완성됩니다.",
      title: "쉬운데, 결과물은 예쁜 웹사이트",
    },
    {
      badge: "Preset Website Builder",
      bgColor: "#1e3a8a",
      description: "업종에 맞는 템플릿과 섹션을 골라 빠르게 시작하세요.",
      title: "복잡한 디자인은 KEYUN이 정리했습니다",
    },
    {
      badge: "Publish Today",
      bgColor: "#064e3b",
      description: "모바일 대응부터 문의 관리까지 한 번에 운영할 수 있습니다.",
      title: "선택하고, 바꾸고, 오늘 바로 게시하세요",
    },
  ];
  const createFallback = (index: number): PublicHeroSlide => {
    const fallback = fallbackSlides[index % fallbackSlides.length];

    return {
      backgroundType: "color",
      badge: fallback.badge,
      bgColor: fallback.bgColor,
      buttonLabel: "무료로 시작하기",
      buttonLink: "#contact",
      description: fallback.description,
      id: `slide-${index + 1}`,
      imageUrl: "",
      secondaryButtonLabel: "템플릿 둘러보기",
      secondaryButtonLink: "#",
      title: fallback.title,
    };
  };

  if (Array.isArray(section.slides) && section.slides.length) {
    return section.slides
      .map((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return null;

        const record = item as PublicSection;
        const fallback = createFallback(index);

        return {
          backgroundType:
            stringValue(record, "backgroundType", fallback.backgroundType) === "image"
              ? "image"
              : "color",
          badge: stringValue(record, "badge", fallback.badge),
          bgColor: stringValue(record, "bgColor", fallback.bgColor),
          buttonLabel: stringValue(record, "buttonLabel", fallback.buttonLabel),
          buttonLink: stringValue(record, "buttonLink", fallback.buttonLink),
          description: stringValue(record, "description", fallback.description),
          id: stringValue(record, "id", fallback.id),
          imageUrl: stringValue(record, "imageUrl"),
          secondaryButtonLabel: stringValue(
            record,
            "secondaryButtonLabel",
            fallback.secondaryButtonLabel,
          ),
          secondaryButtonLink: stringValue(
            record,
            "secondaryButtonLink",
            fallback.secondaryButtonLink,
          ),
          title: stringValue(record, "title", fallback.title),
        } satisfies PublicHeroSlide;
      })
      .filter((item): item is PublicHeroSlide => Boolean(item));
  }

  return [
    createFallback(0),
    createFallback(1),
    createFallback(2),
  ];
}

function numberValue(record: PublicSection, key: string, fallback: number) {
  const value = Number(stringValue(record, key, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}


function normalizePages(value: unknown, locale: SiteLocale): PublicPageItem[] {
  if (!Array.isArray(value)) return defaultPages;

  const pages = value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const source = item as PublicSection;
      const record = localizedRecord(source, locale);
      const fallback = defaultPages[index] ?? defaultPages[0];
      const id = stringValue(record, "id", fallback.id || `page-${index}`);
      const title = stringValue(record, "title", fallback.title || "페이지");
      const path = stringValue(record, "path", fallback.path || "/");
      const status = stringValue(record, "status", fallback.status) === "private" ? "private" : "public";

      return {
        id,
        path,
        status,
        title,
        translations: translationFields(source.translations),
      } satisfies PublicPageItem;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return pages.length ? pages : defaultPages;
}

function normalizeNavigation(
  value: unknown,
  pages: PublicPageItem[],
  locale: SiteLocale,
): PublicNavigationItem[] {
  const pageIds = new Set(pages.map((page) => page.id));

  if (!Array.isArray(value)) {
    return defaultNavigation.filter((item) => pageIds.has(item.pageId));
  }

  const navigation = value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const source = item as PublicSection;
      const record = localizedRecord(source, locale);
      const fallback = defaultNavigation[index] ?? defaultNavigation[0];
      const pageId = stringValue(record, "pageId", fallback.pageId);

      if (!pageIds.has(pageId)) return null;

      return {
        enabled: record.enabled === false ? false : true,
        id: stringValue(record, "id", `nav-${index}`),
        label: stringValue(record, "label", fallback.label || "메뉴"),
        pageId,
        translations: translationFields(source.translations),
      } satisfies PublicNavigationItem;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

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
      overlayColor: "#000000",
      overlayOpacity: "0.3",
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

function normalizeSection(
  value: unknown,
  index: number,
  locale: SiteLocale,
): PublicSection {
  if (typeof value === "string") {
    return { ...defaultSection(value), builderId: `${value}-${index}` };
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = localizedSectionRecord(value as PublicSection, locale);
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

function normalizePageJson(publishedJson: Json, locale: SiteLocale): PublicPageJson {
  if (publishedJson && typeof publishedJson === "object" && !Array.isArray(publishedJson)) {
    const record = publishedJson as PublicSection;
    const sections = Array.isArray(record.sections)
      ? record.sections.map((section, index) => normalizeSection(section, index, locale))
      : [];

    const pages = normalizePages(record.pages, locale);

    return {
      design: mergeDesign(record.design),
      i18n: normalizeI18n(record.i18n),
      navigation: normalizeNavigation(record.navigation, pages, locale),
      pages,
      sections: sections.length
        ? sections
        : [defaultSection("hero"), defaultSection("features"), defaultSection("cta")],
      version: numberValue(record, "version", 1),
    };
  }

  return {
    design: defaultDesign,
    i18n: defaultI18n,
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
      backgroundImage: `url(${imageUrl})`,
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

function animationName(section: PublicSection, element: AnimationElement) {
  const key =
    element === "section"
      ? "sectionAnimation"
      : element === "secondaryButton"
        ? "secondaryButtonAnimation"
        : `${element}Animation`;
  const value = stringValue(section, key, "none");

  return value === "fade-in" || value === "bounce-in" || value === "zoom-in"
    ? value
    : "none";
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
  locale,
  locales,
  navigation,
  pagePath,
  pages,
  siteName,
  siteSlug,
}: {
  design: PublicDesign;
  locale: SiteLocale;
  locales: SiteLocale[];
  navigation: PublicNavigationItem[];
  pagePath: string;
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
    const localePrefix = locale === "en" ? `/s/${siteSlug}/en` : `/s/${siteSlug}`;
    if (path === "/") return localePrefix;

    return `${localePrefix}${path.startsWith("/") ? path : `/${path}`}`;
  };
  const languageHref = (targetLocale: SiteLocale) => {
    const suffix = pagePath === "/" ? "" : pagePath;
    return targetLocale === "en"
      ? `/s/${siteSlug}/en${suffix}`
      : `/s/${siteSlug}${suffix}`;
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

        <div className="flex shrink-0 items-center gap-2">
          {locales.includes("en") ? (
            <div className="hidden items-center rounded-full border border-current/15 p-1 text-[11px] font-bold sm:flex">
              {(["ko", "en"] as const).map((item) => (
                <a
                  aria-current={locale === item ? "page" : undefined}
                  className={`rounded-full px-2.5 py-1.5 ${
                    locale === item ? "bg-current/10" : "opacity-45"
                  }`}
                  href={languageHref(item)}
                  key={item}
                >
                  {item.toUpperCase()}
                </a>
              ))}
            </div>
          ) : null}
          <a
            className={`inline-flex min-h-11 items-center justify-center px-5 text-sm font-semibold ${headerLayout === "cta" ? "px-7 shadow-lg" : ""}`}
            href="#contact"
            style={{
              backgroundColor: design.headerButtonBgColor,
              borderRadius: 999,
              color: design.headerButtonTextColor,
            }}
          >
            {locale === "en" ? "Get started" : "시작하기"}
          </a>
        </div>
      </div>
    </header>
  );
}

function VisualBlock({ section, siteName }: { section: PublicSection; siteName: string }) {
  const imageUrl = stringValue(section, "imageUrl");
  const radius = `${stringValue(section, "radius", "24")}px`;

  if (imageUrl) {
    return (
      <div
        className="overflow-hidden border border-white/70 bg-white/60"
        data-keyun-animation={animationName(section, "visual")}
        style={{ borderRadius: radius }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="h-full min-h-72 w-full object-cover" src={imageUrl} />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-80 overflow-hidden border border-white/70 bg-white/55 p-8 backdrop-blur"
      data-keyun-animation={animationName(section, "visual")}
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

function ShowcaseVisual({
  layout,
  section,
}: {
  layout: string;
  section: PublicSection;
}) {
  const imageUrl = stringValue(section, "imageUrl");
  const sitePreview = (tone: "blue" | "green" | "warm" = "blue") => (
    <div
      className={`relative overflow-hidden rounded-lg border border-slate-200 bg-white ${
        tone === "green"
          ? "bg-emerald-950 text-white"
          : tone === "warm"
            ? "bg-amber-100"
            : ""
      }`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="absolute inset-0 h-full w-full object-cover" src={imageUrl} />
      ) : null}
      <div className="relative z-10 flex h-8 items-center justify-between border-b border-current/10 px-3">
        <span className="text-[8px] font-black">STUDIO KEYUN</span>
        <span className="h-1 w-12 rounded bg-current/25" />
      </div>
      <div className="relative z-10 p-5">
        <div className="h-1.5 w-16 rounded bg-blue-500/80" />
        <div className="mt-4 h-3 w-32 rounded-sm bg-current/85" />
        <div className="mt-2 h-3 w-24 rounded-sm bg-current/85" />
        <div className="mt-4 h-1.5 w-28 rounded bg-current/20" />
        <div className="mt-5 h-6 w-20 rounded bg-slate-950" />
      </div>
    </div>
  );

  if (layout === "centered-showcase") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="mb-2 flex items-center gap-1 border-b border-slate-100 pb-2">
          <span className="size-1.5 rounded-full bg-red-300" />
          <span className="size-1.5 rounded-full bg-amber-300" />
          <span className="size-1.5 rounded-full bg-emerald-300" />
          <span className="ml-3 h-2 flex-1 rounded bg-slate-100" />
        </div>
        <div className="grid min-h-72 grid-cols-[100px_1fr_110px] gap-2 max-md:grid-cols-[74px_1fr]">
          <div className="space-y-2 bg-slate-50 p-2">
            {["히어로", "서비스", "포트폴리오", "후기"].map((item, index) => (
              <div
                className={`rounded border bg-white px-2 py-2 text-[8px] ${
                  index === 0 ? "border-blue-400 text-blue-600" : ""
                }`}
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
          {sitePreview("warm")}
          <div className="space-y-3 bg-slate-50 p-2 max-md:hidden">
            <div className="h-2 w-10 rounded bg-blue-500" />
            <div className="h-12 rounded border bg-white" />
            <div className="h-8 rounded border bg-white" />
            <div className="h-16 rounded border bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "template-showcase") {
    return (
      <div className="grid min-h-80 grid-cols-[1.15fr_0.55fr] gap-3">
        <div className="translate-y-6">{sitePreview("green")}</div>
        <div className="space-y-3">
          <div className="h-48">{sitePreview("warm")}</div>
          <div className="h-32">{sitePreview("blue")}</div>
        </div>
      </div>
    );
  }

  if (layout === "modular-assembly") {
    return (
      <div className="grid min-h-80 grid-cols-[0.9fr_1.15fr] items-center gap-4">
        <div className="space-y-2">
          {["히어로", "서비스", "가격", "후기", "문의"].map((item, index) => (
            <div
              className="flex h-12 items-center justify-between rounded-md border border-blue-200 bg-white px-3"
              key={item}
              style={{ transform: `translateX(${index * 5}px)` }}
            >
              <span className="text-[10px] font-bold">{item}</span>
              <span className="text-blue-500">→</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="h-28 bg-amber-50 p-4">
            <div className="h-2 w-24 bg-slate-800" />
            <div className="mt-2 h-1.5 w-28 bg-slate-300" />
          </div>
          <div className="mt-1 grid grid-cols-3 gap-1 bg-blue-50 p-3">
            {[0, 1, 2].map((item) => <div className="h-12 bg-white" key={item} />)}
          </div>
          <div className="mt-1 grid grid-cols-3 gap-1 bg-emerald-50 p-3">
            {[0, 1, 2].map((item) => <div className="h-14 bg-white" key={item} />)}
          </div>
        </div>
      </div>
    );
  }

  if (layout === "editorial-contrast") {
    return (
      <div className="grid min-h-80 grid-cols-[46px_1fr] gap-4">
        <div className="flex flex-col items-center justify-around rounded-lg bg-slate-950 py-4 text-[8px] font-bold text-white">
          <span>01</span>
          <span className="-rotate-90 whitespace-nowrap">업종 선택</span>
          <span>02</span>
          <span className="-rotate-90 whitespace-nowrap">바로 게시</span>
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-44">{sitePreview("warm")}</div>
          <div className="absolute bottom-0 left-10 right-4 h-40">{sitePreview("green")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-80 pt-6">
      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="mb-2 flex h-7 items-center justify-between border-b px-2 text-[8px] font-bold">
          <span>KEYUN</span>
          <span className="text-blue-600">게시하기</span>
        </div>
        <div className="grid grid-cols-[90px_1fr_100px] gap-2 max-md:grid-cols-[70px_1fr]">
          <div className="space-y-2 bg-slate-50 p-2">
            {[0, 1, 2, 3].map((item) => <div className="h-9 rounded border bg-white" key={item} />)}
          </div>
          {sitePreview("blue")}
          <div className="space-y-2 bg-slate-50 p-2 max-md:hidden">
            <div className="h-3 w-12 bg-blue-100" />
            <div className="h-10 border bg-white" />
            <div className="h-14 border bg-white" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-2 h-40 w-28 border-4 border-slate-900 bg-white p-1">
        {sitePreview("blue")}
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
      className={`relative overflow-hidden border ${
        ["image", "video"].includes(backgroundType) ? "keyun-bg-overlay" : ""
      }`}
      data-keyun-animation={animationName(section, "section")}
      style={{
        ...sectionBackground(section, design),
        ...sectionEffectStyle(section),
        "--keyun-overlay-color": stringValue(section, "overlayColor", "#000000"),
        "--keyun-overlay-opacity": stringValue(section, "overlayOpacity", "0.3"),
        borderRadius: `${stringValue(section, "radius", "24")}px`,
        color: design.textColor,
        paddingBottom: `${numberValue(section, "paddingBottom", 90)}px`,
        paddingTop: `${numberValue(section, "paddingTop", 90)}px`,
      } as unknown as CSSProperties}
    >
      {backgroundType === "video" && videoUrl ? (
        <video
          aria-hidden
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          src={videoUrl}
        />
      ) : null}
      <div className="relative z-10 mx-auto w-full px-6 md:px-10" style={{ maxWidth: sectionWidth(section, design) }}>
        {children}
      </div>
    </section>
  );
}

function HeroCopy({
  design,
  section,
  siteName,
}: {
  design: PublicDesign;
  section: PublicSection;
  siteName: string;
}) {
  return (
    <div className={`max-w-2xl ${positionClass(section)} ${alignClass(section)}`}>
      {stringValue(section, "badge") ? (
        <p
          className="mb-5 inline-flex rounded-full px-4 py-2 text-xs font-bold"
          data-keyun-animation={animationName(section, "badge")}
          style={{ backgroundColor: `${design.mainColor}12`, color: design.mainColor }}
        >
          {stringValue(section, "badge")}
        </p>
      ) : null}
      <h1
        className="max-w-3xl font-black leading-[1.08] tracking-normal"
        data-keyun-animation={animationName(section, "title")}
        style={titleStyle(section, design)}
      >
        {stringValue(section, "title", siteName)}
      </h1>
      <p
        className="mt-5 max-w-2xl font-medium"
        data-keyun-animation={animationName(section, "description")}
        style={descriptionStyle(section, design)}
      >
        {stringValue(section, "description")}
      </p>
      <div className={`mt-8 flex flex-wrap items-center gap-3 ${justifyClass(section, "buttonAlign")}`}>
        {stringValue(section, "buttonLabel") ? (
          <a
            className="inline-flex min-h-12 items-center justify-center px-6 font-semibold"
            data-keyun-animation={animationName(section, "button")}
            href={stringValue(section, "buttonLink", "#")}
            style={buttonStyle(section, design)}
          >
            {stringValue(section, "buttonLabel")}
          </a>
        ) : null}
        {stringValue(section, "secondaryButtonLabel") ? (
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900"
            data-keyun-animation={animationName(section, "secondaryButton")}
            href="#"
          >
            {stringValue(section, "secondaryButtonLabel")}
          </a>
        ) : null}
      </div>
    </div>
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

  if (layout === "slide") {
    return (
      <section
        className="relative overflow-hidden border"
        data-keyun-animation={animationName(section, "section")}
        style={{
          ...sectionEffectStyle(section),
          borderRadius: `${stringValue(section, "radius", "8")}px`,
        }}
      >
        <PublicHeroSlider
          align={alignmentValue(section, "align")}
          animations={{
            badge: animationName(section, "badge"),
            button: animationName(section, "button"),
            description: animationName(section, "description"),
            secondaryButton: animationName(section, "secondaryButton"),
            title: animationName(section, "title"),
          }}
          arrowBgColor={stringValue(section, "arrowBgColor", "#0f172a")}
          arrowButtonSize={stringValue(section, "arrowButtonSize", "48")}
          arrowColor={stringValue(section, "arrowColor", "#ffffff")}
          arrowImageUrl={stringValue(section, "arrowImageUrl")}
          arrowSize={stringValue(section, "arrowSize", "24")}
          arrowStyle={stringValue(section, "arrowStyle", "simple")}
          autoplayDelay={numberValue(section, "autoplayDelay", 4500)}
          buttonStyle={buttonStyle(section, design)}
          descriptionStyle={{
            ...descriptionStyle(section, design),
            color: stringValue(section, "descriptionColor", "#ffffff"),
          }}
          overlayColor={stringValue(section, "overlayColor", "#000000")}
          overlayOpacity={stringValue(section, "overlayOpacity", "0.3")}
          paginationStyle={stringValue(section, "paginationStyle", "circle")}
          slides={publicHeroSlides(section)}
          titleStyle={{
            ...titleStyle(section, design),
            color: stringValue(section, "titleColor", "#ffffff"),
          }}
        />
      </section>
    );
  }

  if (showcaseHeroLayouts.has(layout)) {
    const centered = layout === "centered-showcase";

    return (
      <SectionShell design={design} section={section}>
        <div
          className={
            centered
              ? "space-y-12"
              : "grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]"
          }
        >
          <div className={centered ? "mx-auto text-center" : ""}>
            <HeroCopy design={design} section={section} siteName={siteName} />
          </div>
          <div
            className={centered ? "mx-auto w-full max-w-5xl" : ""}
            data-keyun-animation={animationName(section, "visual")}
          >
            <ShowcaseVisual layout={layout} section={section} />
          </div>
        </div>
      </SectionShell>
    );
  }

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
              data-keyun-animation={animationName(section, "badge")}
              style={{
                backgroundColor: `${design.mainColor}14`,
                color: design.mainColor,
              }}
            >
              {stringValue(section, "badge")}
            </p>
          ) : null}
          <h1
            className="max-w-3xl font-bold tracking-normal"
            data-keyun-animation={animationName(section, "title")}
            style={titleStyle(section, design)}
          >
            {stringValue(section, "title", siteName)}
          </h1>
          <p
            className="mt-6 max-w-2xl"
            data-keyun-animation={animationName(section, "description")}
            style={descriptionStyle(section, design)}
          >
            {stringValue(section, "description")}
          </p>
          <div className={`mt-9 flex flex-wrap items-center gap-4 ${justifyClass(section, "buttonAlign")}`}>
            {stringValue(section, "buttonLabel") ? (
              <a
                className="inline-flex min-h-12 items-center justify-center px-6 font-semibold"
                data-keyun-animation={animationName(section, "button")}
                href={stringValue(section, "buttonLink", "#")}
                style={buttonStyle(section, design)}
              >
                {stringValue(section, "buttonLabel")}
              </a>
            ) : null}
            {stringValue(section, "secondaryButtonLabel") ? (
              <a
                className="inline-flex min-h-12 items-center justify-center px-3 text-sm font-semibold text-slate-900"
                data-keyun-animation={animationName(section, "secondaryButton")}
                href="#"
              >
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
          <p
            className="mb-4 text-sm font-bold"
            data-keyun-animation={animationName(section, "badge")}
            style={{ color: design.mainColor }}
          >
            {stringValue(section, "badge")}
          </p>
        ) : null}
        <h2
          className="font-bold tracking-normal"
          data-keyun-animation={animationName(section, "title")}
          style={titleStyle(section, design)}
        >
          {stringValue(section, "title")}
        </h2>
        <p
          className={`mt-4 max-w-2xl ${positionClass(section)}`}
          data-keyun-animation={animationName(section, "description")}
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
            <p
              className="mb-4 text-sm font-bold"
              data-keyun-animation={animationName(section, "badge")}
              style={{ color: design.mainColor }}
            >
              {stringValue(section, "badge")}
            </p>
          ) : null}
          <h2
            className="font-bold tracking-normal"
            data-keyun-animation={animationName(section, "title")}
            style={titleStyle(section, design)}
          >
            {stringValue(section, "title")}
          </h2>
          <p
            className="mt-5"
            data-keyun-animation={animationName(section, "description")}
            style={descriptionStyle(section, design)}
          >
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
          data-keyun-animation={animationName(section, "title")}
          style={titleStyle(section, design)}
        >
          {stringValue(section, "title")}
        </h2>
        <p
          className={`mt-5 max-w-2xl ${positionClass(section)}`}
          data-keyun-animation={animationName(section, "description")}
          style={descriptionStyle(section, design)}
        >
          {stringValue(section, "description")}
        </p>
        {stringValue(section, "buttonLabel") ? (
          <div className={`mt-8 flex ${justifyClass(section, "buttonAlign")}`}>
            <a
              className="inline-flex min-h-12 items-center justify-center px-6 font-semibold"
              data-keyun-animation={animationName(section, "button")}
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
  locale,
  posts,
  siteSlug,
}: {
  design: PublicDesign;
  locale: SiteLocale;
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
              {locale === "en" ? "Latest posts" : "최근 게시글"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {locale === "en"
                ? "Published updates appear here automatically."
                : "관리자에서 게시한 글이 사용자 페이지에 자동으로 노출됩니다."}
            </p>
          </div>
          <a
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-bold"
            href={`/s/${siteSlug}/posts`}
          >
            {locale === "en" ? "View all" : "전체 보기"}
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
  locale,
  pagePath,
  siteName,
  siteSlug,
}: {
  contactEnabled: boolean;
  contactResult?: string;
  design: PublicDesign;
  locale: SiteLocale;
  pagePath: string;
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
            {locale === "en" ? "Contact us" : "문의를 남겨주세요"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {locale === "en"
              ? `${siteName} will review your message and get back to you.`
              : `${siteName} 담당자가 문의 내용을 확인한 뒤 연락드립니다.`}
          </p>
          {contactResult === "sent" ? (
            <p className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
              {locale === "en" ? "Your message has been received." : "문의가 접수되었습니다."}
            </p>
          ) : null}
          {contactResult === "failed" ? (
            <p className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100">
              {locale === "en"
                ? "We could not send your message. Please check the required fields."
                : "문의 접수에 실패했습니다. 이름, 연락처, 문의 내용을 확인해 주세요."}
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
          <input
            name="source_path"
            type="hidden"
            value={`${locale === "en" ? `/s/${siteSlug}/en` : `/s/${siteSlug}`}${
              pagePath === "/" ? "" : pagePath
            }`}
          />
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
              {locale === "en" ? "Name" : "이름"}
              <input
                autoComplete="name"
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-slate-950"
                name="name"
                placeholder={locale === "en" ? "Your name" : "홍길동"}
                required
              />
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-slate-500">
              {locale === "en" ? "Phone" : "연락처"}
              <input
                autoComplete="tel"
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-slate-950"
                name="phone"
                placeholder="010-0000-0000"
              />
            </label>
          </div>
          <label className="grid gap-1.5 text-xs font-bold text-slate-500">
            {locale === "en" ? "Email" : "이메일"}
            <input
              autoComplete="email"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-slate-950"
              name="email"
              placeholder="hello@example.com"
              type="email"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-slate-500">
            {locale === "en" ? "Subject" : "제목"}
            <input
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-slate-950"
              name="subject"
              placeholder={locale === "en" ? "How can we help?" : "문의 제목"}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-slate-500">
            {locale === "en" ? "Message" : "문의 내용"}
            <textarea
              className="min-h-32 resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-950 outline-none focus:border-slate-950"
              name="message"
              placeholder={
                locale === "en"
                  ? "Tell us what you would like to know."
                  : "궁금한 내용을 남겨주세요."
              }
              required
            />
          </label>
          <p className="text-xs leading-5 text-slate-500">
            {locale === "en"
              ? "Please enter either a phone number or an email address."
              : "연락처 또는 이메일 중 하나는 꼭 입력해 주세요."}
          </p>
          <button
            className="mt-2 inline-flex h-12 items-center justify-center rounded-xl px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!contactEnabled}
            style={{ backgroundColor: contactEnabled ? design.mainColor : "#94a3b8" }}
            type="submit"
          >
            {contactEnabled
              ? locale === "en"
                ? "Send message"
                : "문의 보내기"
              : locale === "en"
                ? "Unavailable in demo"
                : "데모에서는 저장 불가"}
          </button>
          <p className="text-xs leading-5 text-slate-400">
            {locale === "en"
              ? "Your information is used only to respond to this inquiry."
              : "제출한 정보는 문의 응대 목적으로만 사용됩니다."}
          </p>
        </form>
      </div>
    </section>
  );
}

function PublicFooter({
  copyright,
  design,
  locale,
  siteName,
}: {
  copyright: string;
  design: PublicDesign;
  locale: SiteLocale;
  siteName: string;
}) {
  const links =
    locale === "en"
      ? ["Terms", "Privacy Policy", "Contact"]
      : ["이용약관", "개인정보처리방침", "문의하기"];
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
            <p className="text-sm opacity-70">© {new Date().getFullYear()} {siteName}. {copyright}</p>
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
              <p className="mt-2 text-sm opacity-70">
                {locale === "en"
                  ? "Build your brand's next page with KEYUN."
                  : "브랜드의 다음 페이지를 키운과 함께 만듭니다."}
              </p>
            </div>
            <a className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-bold" href="#" style={{ color: design.footerAccentColor }}>
              {locale === "en" ? "Contact" : "문의하기"}
            </a>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div>
              <p className="text-xl font-bold">{siteName}</p>
              <p className="mt-3 max-w-sm text-sm leading-7 opacity-70">
                {locale === "en"
                  ? "This website was created with KEYUN Studio."
                  : "키운 스튜디오로 제작된 사이트입니다."}
              </p>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: design.footerAccentColor }}>
                {locale === "en" ? "Menu" : "메뉴"}
              </p>
              <div className="mt-4 grid gap-2 text-sm opacity-75">
                {(locale === "en"
                  ? ["Product", "Solutions", "Pricing"]
                  : ["제품", "솔루션", "가격"]
                ).map((item) => <a key={item} href="#">{item}</a>)}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: design.footerAccentColor }}>
                {locale === "en" ? "Information" : "정보"}
              </p>
              <div className="mt-4 grid gap-2 text-sm opacity-75">
                {links.map((item) => <a key={item} href="#">{item}</a>)}
              </div>
            </div>
          </div>
        )}
        {layout !== "minimal" && layout !== "simple" ? (
          <div className="mt-10 border-t pt-5 text-sm opacity-70" style={{ borderColor: `${design.footerAccentColor}55` }}>
            © {new Date().getFullYear()} {siteName}. {copyright}
          </div>
        ) : null}
      </div>
    </footer>
  );
}

// ── content blocks helper (mirrors editor) ──────────────
type ContentBlock = { badge: string; description: string; imageUrl: string; mediaPosition: "left" | "right"; title: string };
function contentBlocks(section: PublicSection): ContentBlock[] {
  const raw = section.blocks;
  if (Array.isArray(raw) && raw.length) {
    return raw.map((b) => {
      const block = b as Record<string, unknown>;
      return {
        badge: String(block.badge ?? ""),
        description: String(block.description ?? ""),
        imageUrl: String(block.imageUrl ?? ""),
        mediaPosition: block.mediaPosition === "right" ? "right" : "left",
        title: String(block.title ?? ""),
      };
    });
  }
  return [{ badge: String(section.badge ?? ""), description: String(section.description ?? ""), imageUrl: String(section.imageUrl ?? ""), mediaPosition: section.mediaPosition === "right" ? "right" : "left", title: String(section.title ?? "") }];
}

// ── ReviewSection ────────────────────────────────────────
function ReviewSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "grid");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      {layout === "featured" && items[0] ? (() => {
        const [name, role, quote] = items[0].split("|");
        return (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl bg-white/80 p-8 shadow-sm" style={childCardStyle(section)}>
            <p className="text-xl font-medium leading-relaxed" style={{ color: design.textColor }}>"{quote || name}"</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="size-10 rounded-full bg-slate-200" />
              <div><p className="font-semibold">{name}</p><p className="text-sm text-slate-500">{role}</p></div>
            </div>
          </div>
        );
      })() : (
        <div className={`mt-10 grid gap-5 ${layout === "rating" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {items.map((item, i) => {
            const [name, role, quote] = item.split("|");
            return (
              <article key={i} className="rounded-2xl bg-white/80 p-6" style={childCardStyle(section)}>
                {layout === "rating" && <div className="mb-3 flex gap-0.5">{[1,2,3,4,5].map((s) => <span key={s} style={{ color: design.mainColor }}>★</span>)}</div>}
                <p className="text-sm leading-7 text-slate-600">"{quote || name}"</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="size-8 rounded-full bg-slate-200" />
                  <div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-slate-400">{role}</p></div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

// ── StatsSection ─────────────────────────────────────────
function StatsSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "counters");
  const isDark = layout === "dark";
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      {layout === "bars" ? (
        <div className="mt-10 space-y-5">
          {items.map((item, i) => {
            const [label, val] = item.split("|");
            const pct = Math.min(100, Number(val) || 80);
            return (
              <div key={i}>
                <div className="mb-1 flex justify-between text-sm font-semibold"><span>{label}</span><span>{val}%</span></div>
                <div className="h-2.5 rounded-full bg-slate-200"><div className="h-full rounded-full" style={{ background: design.mainColor, width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {items.map((item, i) => {
            const [label, val, suffix] = item.split("|");
            return (
              <div key={i} className="rounded-2xl p-6 text-center" style={isDark ? { background: "rgba(0,0,0,0.3)" } : childCardStyle(section)}>
                <p className="text-4xl font-black" style={{ color: design.mainColor }}>{val}{suffix}</p>
                <p className="mt-2 text-sm font-medium opacity-70">{label}</p>
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

// ── PricingSection ───────────────────────────────────────
function PricingSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const [name, price, desc, features] = item.split("|");
          const featureList = (features ?? "").split(",").filter(Boolean);
          const isFeatured = i === 1;
          return (
            <div key={i} className="rounded-2xl border p-7 text-left" style={{ ...(isFeatured ? { background: design.mainColor, borderColor: design.mainColor, color: "#fff" } : childCardStyle(section)) }}>
              <p className="text-sm font-bold opacity-70">{name}</p>
              <p className="mt-2 text-4xl font-black">{price}</p>
              {desc && <p className="mt-2 text-sm opacity-70">{desc}</p>}
              {featureList.length > 0 && (
                <ul className="mt-6 space-y-2">
                  {featureList.map((f, j) => <li key={j} className="flex items-center gap-2 text-sm"><span>✓</span>{f}</li>)}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── FaqSection ───────────────────────────────────────────
function FaqSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "accordion");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      <div className={`mt-10 ${layout === "two-col" ? "grid gap-6 sm:grid-cols-2" : "space-y-3"}`}>
        {items.map((item, i) => {
          const [q, a] = item.split("|");
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white/80 p-5" style={layout === "accordion" ? childCardStyle(section) : {}}>
              <p className="font-semibold" style={{ color: design.textColor }}>{q}</p>
              {a && <p className="mt-2 text-sm leading-6 text-slate-500">{a}</p>}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── TeamSection ──────────────────────────────────────────
function TeamSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "grid");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      <div className={`mt-10 ${layout === "list" ? "space-y-4" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-4"}`}>
        {items.map((item, i) => {
          const [name, role, desc] = item.split("|");
          return layout === "list" ? (
            <div key={i} className="flex items-center gap-5 rounded-xl bg-white/80 p-5" style={childCardStyle(section)}>
              <div className="size-14 shrink-0 rounded-full bg-slate-200" />
              <div><p className="font-semibold">{name}</p><p className="text-sm" style={{ color: design.mainColor }}>{role}</p>{desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}</div>
            </div>
          ) : (
            <div key={i} className="rounded-xl bg-white/80 p-5 text-center" style={childCardStyle(section)}>
              <div className="mx-auto size-16 rounded-full bg-slate-200" />
              <p className="mt-3 font-semibold">{name}</p>
              <p className="text-sm" style={{ color: design.mainColor }}>{role}</p>
              {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── SubheroSection ───────────────────────────────────────
function SubheroSection({ design, section, siteName }: { design: PublicDesign; section: PublicSection; siteName: string }) {
  const layout = stringValue(section, "layout", "banner");
  const title = stringValue(section, "title", siteName);
  const desc = stringValue(section, "description");
  const imgUrl = stringValue(section, "imageUrl");
  const bgStyle: CSSProperties = imgUrl
    ? { backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: stringValue(section, "bgColor", "#f8fafc") };
  return (
    <section className="relative overflow-hidden" style={{ ...bgStyle, paddingBottom: `${numberValue(section, "paddingBottom", 56)}px`, paddingTop: `${numberValue(section, "paddingTop", 56)}px` }}>
      {imgUrl && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10 mx-auto w-full px-6 md:px-10" style={{ maxWidth: sectionWidth(section, design) }}>
        {layout === "split" ? (
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold" style={{ color: imgUrl ? "#fff" : design.textColor }}>{title}</h1>
            {desc && <p className="text-sm text-slate-500">{desc}</p>}
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold" style={{ color: imgUrl ? "#fff" : design.textColor }}>{title}</h1>
            {desc && <p className="mt-2 text-sm" style={{ color: imgUrl ? "rgba(255,255,255,0.8)" : "#64748b" }}>{desc}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

// ── BreadcrumbSection ────────────────────────────────────
function BreadcrumbSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "default");
  return (
    <section style={{ background: stringValue(section, "bgColor", "#ffffff"), paddingBottom: `${numberValue(section, "paddingBottom", 12)}px`, paddingTop: `${numberValue(section, "paddingTop", 12)}px` }}>
      <div className="mx-auto w-full px-6 md:px-10" style={{ maxWidth: sectionWidth(section, design) }}>
        <nav className="flex flex-wrap items-center gap-1.5 text-sm">
          {items.map((item, i) => {
            const [label, href] = item.split("|");
            const isLast = i === items.length - 1;
            return (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-300">›</span>}
                {isLast ? <span className="font-semibold" style={{ color: design.textColor }}>{label}</span> : <a className="text-slate-400 hover:underline" href={href || "#"}>{label}</a>}
              </span>
            );
          })}
        </nav>
        {layout === "with-title" && stringValue(section, "title") && (
          <h1 className="mt-3 text-xl font-bold" style={{ color: design.textColor }}>{stringValue(section, "title")}</h1>
        )}
      </div>
    </section>
  );
}

// ── OrgChartSection ──────────────────────────────────────
function OrgChartSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "tree");
  const levels: Record<string, Array<{ name: string; role: string }>> = {};
  items.forEach((item) => {
    const [name, role, level] = item.split("|");
    const l = level || "1";
    if (!levels[l]) levels[l] = [];
    levels[l].push({ name, role });
  });
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      <div className="mt-10">
        {Object.entries(levels).map(([level, members]) => (
          <div key={level} className="mb-6 flex flex-wrap justify-center gap-4">
            {members.map((m, i) => (
              <div key={i} className={`rounded-xl border p-4 text-center ${level === "0" ? "border-2" : "border"}`} style={{ borderColor: level === "0" ? design.mainColor : undefined, minWidth: 120 }}>
                <div className="mx-auto mb-2 size-10 rounded-full bg-slate-200" />
                <p className="font-semibold text-sm">{m.name}</p>
                <p className="text-xs" style={{ color: design.mainColor }}>{m.role}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── HistorySection ───────────────────────────────────────
function HistorySection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "timeline");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      <div className={`mt-10 ${layout === "zigzag" ? "space-y-8" : "relative pl-8"}`}>
        {layout !== "zigzag" && <div className="absolute left-3 top-0 h-full w-px bg-slate-200" />}
        {items.map((item, i) => {
          const [year, title, desc] = item.split("|");
          return layout === "zigzag" ? (
            <div key={i} className={`flex items-center gap-8 ${i % 2 === 1 ? "flex-row-reverse" : ""}`}>
              <div className="flex-1 rounded-xl border bg-white/80 p-5" style={childCardStyle(section)}>
                <span className="text-sm font-bold" style={{ color: design.mainColor }}>{year}</span>
                <p className="mt-1 font-semibold">{title}</p>
                {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
              </div>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold" style={{ borderColor: design.mainColor, color: design.mainColor }}>{i + 1}</div>
              <div className="flex-1" />
            </div>
          ) : (
            <div key={i} className="relative mb-8">
              <div className="absolute -left-5 top-1.5 size-3 rounded-full border-2" style={{ background: "#fff", borderColor: design.mainColor }} />
              <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-bold" style={{ color: design.mainColor }}>{year}</span>
              <p className="mt-1 font-semibold">{title}</p>
              {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── VisionSection ────────────────────────────────────────
function VisionSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const layout = stringValue(section, "layout", "centered");
  const items = itemList(section);
  return (
    <SectionShell design={design} section={section}>
      {layout === "split" ? (
        <div className="grid gap-8 sm:grid-cols-2">
          {[{ label: "비전", color: design.mainColor }, { label: "미션", color: design.subColor || design.mainColor }].map(({ label, color }) => (
            <div key={label} className="rounded-2xl p-8" style={{ background: `${color}15`, borderLeft: `4px solid ${color}` }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
              <h2 className="text-xl font-bold" style={{ color: design.textColor }}>{stringValue(section, "title")}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">{stringValue(section, "description")}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <SectionHeader design={design} section={section} />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {items.map((item, i) => {
              const [name, desc] = item.split("|");
              return (
                <div key={i} className="rounded-xl border bg-white/80 p-6" style={childCardStyle(section)}>
                  <p className="font-semibold">{name}</p>
                  {desc && <p className="mt-2 text-sm text-slate-500">{desc}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionShell>
  );
}

// ── ValuesSection ────────────────────────────────────────
function ValuesSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "grid");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      <div className={`mt-10 ${layout === "list" ? "space-y-4" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}`}>
        {items.map((item, i) => {
          const [name, , desc] = item.split("|");
          return layout === "list" ? (
            <div key={i} className="flex items-start gap-4 rounded-xl bg-white/80 p-5" style={childCardStyle(section)}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: `${design.mainColor}20`, color: design.mainColor }}>{i + 1}</div>
              <div><p className="font-semibold">{name}</p>{desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}</div>
            </div>
          ) : (
            <div key={i} className="rounded-xl bg-white/80 p-6" style={childCardStyle(section)}>
              <div className="mb-3 flex size-10 items-center justify-center rounded-full text-sm font-bold" style={{ background: `${design.mainColor}20`, color: design.mainColor }}>{i + 1}</div>
              <p className="font-semibold">{name}</p>
              {desc && <p className="mt-2 text-sm text-slate-500">{desc}</p>}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ── LocationSection ──────────────────────────────────────
function LocationSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const layout = stringValue(section, "layout", "map-text");
  const address = stringValue(section, "address");
  const phone = stringValue(section, "phone");
  const email = stringValue(section, "email");
  const transportItems = itemList(section);
  const mapSrc = address ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&hl=ko` : "";
  const info = [
    address && { label: "주소", val: address },
    phone && { label: "전화", val: phone },
    email && { label: "이메일", val: email },
  ].filter(Boolean) as Array<{ label: string; val: string }>;
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      {layout === "text-only" ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div className="space-y-4">{info.map(({ label, val }) => (
            <div key={label}><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-slate-700">{val}</p></div>
          ))}</div>
          <div className="space-y-3">
            {transportItems.map((item, i) => {
              const [mode, desc] = item.split("|");
              return <div key={i}><span className="font-semibold" style={{ color: design.mainColor }}>{mode}</span> <span className="text-sm text-slate-600">{desc}</span></div>;
            })}
          </div>
        </div>
      ) : (
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl" style={{ height: 320 }}>
            {mapSrc ? (
              <iframe allowFullScreen className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapSrc} title="지도" />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-400">주소를 설정하면 지도가 표시됩니다</div>
            )}
          </div>
          <div className="space-y-4 py-2">
            {stringValue(section, "title") && <h2 className="text-xl font-bold">{stringValue(section, "title")}</h2>}
            {info.map(({ label, val }) => (
              <div key={label}><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-0.5 text-sm text-slate-700">{val}</p></div>
            ))}
            {transportItems.filter(i => i.includes("|")).map((item, i) => {
              const [mode, desc] = item.split("|");
              return <div key={i} className="text-sm"><span className="font-semibold" style={{ color: design.mainColor }}>{mode}</span> <span className="text-slate-600">{desc}</span></div>;
            })}
          </div>
        </div>
      )}
    </SectionShell>
  );
}

// ── PartnersSection ──────────────────────────────────────
function PartnersSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "logo-grid");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      <div className={`mt-10 ${layout === "logo-strip" ? "flex flex-wrap items-center justify-center gap-6" : "grid grid-cols-2 gap-5 sm:grid-cols-3"}`}>
        {items.map((name, i) => (
          <div key={i} className="flex h-16 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 font-semibold text-slate-400">{name}</div>
        ))}
      </div>
    </SectionShell>
  );
}

// ── AwardsSection ────────────────────────────────────────
function AwardsSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "grid");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      {layout === "list" ? (
        <div className="mt-10 space-y-4">
          {items.map((item, i) => {
            const [title, org, year] = item.split("|");
            return (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-white/80 p-5" style={childCardStyle(section)}>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full text-xl" style={{ background: "#fef9c3" }}>🏆</div>
                <div className="flex-1"><p className="font-semibold">{title}</p><p className="text-sm text-slate-500">{org}</p></div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{year}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {items.map((item, i) => {
            const [title, org, year] = item.split("|");
            return (
              <div key={i} className="rounded-xl bg-white/80 p-6" style={childCardStyle(section)}>
                <div className="mb-3 flex size-10 items-center justify-center rounded-full text-xl" style={{ background: "#fef9c3" }}>🏆</div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{org}</p>
                <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">{year}</span>
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

// ── PressSection ─────────────────────────────────────────
function PressSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "list");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      {layout === "cards" ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {items.map((item, i) => {
            const [title, media, date] = item.split("|");
            return (
              <div key={i} className="overflow-hidden rounded-xl bg-white/80" style={childCardStyle(section)}>
                <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200" />
                <div className="p-4"><p className="text-xs font-bold" style={{ color: design.mainColor }}>{media}</p><p className="mt-1 font-semibold text-sm">{title}</p><p className="mt-2 text-xs text-slate-400">{date}</p></div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 divide-y rounded-xl border bg-white/80" style={childCardStyle(section)}>
          {items.map((item, i) => {
            const [title, media, date] = item.split("|");
            return (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <span className="rounded px-2 py-0.5 text-xs font-bold" style={{ background: `${design.mainColor}20`, color: design.mainColor }}>{media}</span>
                <p className="flex-1 text-sm font-medium">{title}</p>
                <span className="text-xs text-slate-400">{date}</span>
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

// ── PhotoGallerySection ──────────────────────────────────
function PhotoGallerySection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "masonry");
  const heights = [200, 150, 250, 180, 220, 160];
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      {layout === "masonry" ? (
        <div className="mt-10 columns-2 gap-4 md:columns-3" style={{ columnFill: "balance" }}>
          {items.map((item, i) => (
            <div key={i} className="mb-4 break-inside-avoid overflow-hidden rounded-xl bg-slate-200" style={{ height: heights[i % heights.length] }}>
              {item && item !== "사진1" && <img alt="" className="h-full w-full object-cover" src={item} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-xl bg-slate-200">
              {item && item !== "사진1" && <img alt="" className="h-full w-full object-cover" src={item} />}
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

// ── JobsSection ──────────────────────────────────────────
function JobsSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "list");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      {layout === "cards" ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {items.map((item, i) => {
            const [position, dept, career, deadline] = item.split("|");
            return (
              <div key={i} className="rounded-xl bg-white/80 p-6" style={childCardStyle(section)}>
                <div className="flex items-start justify-between">
                  <div><p className="font-semibold">{position}</p><p className="mt-0.5 text-sm text-slate-500">{dept}</p></div>
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: `${design.mainColor}20`, color: design.mainColor }}>채용중</span>
                </div>
                <div className="mt-4 flex gap-2 text-xs text-slate-400">
                  <span className="rounded bg-slate-100 px-2 py-0.5">{career}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5">마감 {deadline}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 divide-y rounded-xl border bg-white/80" style={childCardStyle(section)}>
          {items.map((item, i) => {
            const [position, dept, career, deadline] = item.split("|");
            return (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1"><p className="font-semibold">{position}</p><p className="text-sm text-slate-400">{dept} · {career}</p></div>
                <span className="text-xs text-slate-400">마감 {deadline}</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: `${design.mainColor}20`, color: design.mainColor }}>채용중</span>
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

// ── DownloadsSection ─────────────────────────────────────
function DownloadsSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const items = itemList(section);
  const layout = stringValue(section, "layout", "list");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      {layout === "cards" ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => {
            const [name, ext, date, href] = item.split("|");
            return (
              <a key={i} className="flex items-center gap-4 rounded-xl bg-white/80 p-4 transition hover:opacity-80" href={href || "#"} rel="noopener noreferrer" style={childCardStyle(section)} target="_blank">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-500">{ext || "PDF"}</div>
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{name}</p><p className="text-xs text-slate-400">{date}</p></div>
                <span className="text-slate-400">↓</span>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 divide-y rounded-xl border bg-white/80" style={childCardStyle(section)}>
          {items.map((item, i) => {
            const [name, ext, date, href] = item.split("|");
            return (
              <a key={i} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50" href={href || "#"} rel="noopener noreferrer" target="_blank">
                <div className="flex size-8 shrink-0 items-center justify-center rounded bg-red-100 text-xs font-bold text-red-500">{ext || "PDF"}</div>
                <div className="min-w-0 flex-1"><p className="truncate font-semibold text-sm">{name}</p><p className="text-xs text-slate-400">{date}</p></div>
                <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">다운로드</span>
              </a>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

// ── BoardSection ─────────────────────────────────────────
function BoardSection({ design, posts, section, siteSlug }: { design: PublicDesign; posts: DashboardPost[]; section: PublicSection; siteSlug: string }) {
  const layout = stringValue(section, "layout", "list");
  const boardName = stringValue(section, "boardName", "");
  const perPage = Math.max(1, Number(stringValue(section, "postsPerPage", "10")) || 10);
  const filtered = (boardName ? posts.filter((p) => p.board === boardName) : posts).slice(0, perPage);

  function postHref(post: DashboardPost) {
    return `/s/${siteSlug}/posts/${post.slug || post.id}`;
  }

  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border bg-white/80 p-8 text-center text-sm text-slate-400" style={childCardStyle(section)}>
          {boardName ? `"${boardName}" 게시판에 게시글이 없습니다.` : "등록된 게시글이 없습니다."}
        </div>
      ) : layout === "gallery" ? (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {filtered.map((post) => (
            <a key={post.id} className="group overflow-hidden rounded-xl bg-white/80 shadow-sm transition hover:shadow-md" href={postHref(post)} style={childCardStyle(section)}>
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200" />
              <div className="p-3">
                <span className="text-xs font-bold" style={{ color: design.mainColor }}>{post.board}</span>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug">{post.title}</p>
                <p className="mt-1.5 text-xs text-slate-400">{post.updatedAt}</p>
              </div>
            </a>
          ))}
        </div>
      ) : layout === "news" ? (
        <div className="mt-10 space-y-4">
          {filtered.map((post) => (
            <a key={post.id} className="flex gap-4 rounded-xl bg-white/80 p-4 transition hover:opacity-80" href={postHref(post)} style={childCardStyle(section)}>
              <div className="size-16 shrink-0 rounded-lg bg-gradient-to-br from-slate-100 to-blue-100" />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold" style={{ color: design.mainColor }}>{post.board}</span>
                <p className="mt-0.5 truncate font-semibold">{post.title}</p>
                {post.summary && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{post.summary}</p>}
                <p className="mt-1.5 text-xs text-slate-400">{post.updatedAt}</p>
              </div>
            </a>
          ))}
        </div>
      ) : layout === "notice" ? (
        <div className="mt-10 overflow-hidden rounded-xl border bg-white/80" style={childCardStyle(section)}>
          {filtered.map((post) => (
            <a key={post.id} className={`flex items-center gap-3 border-b border-slate-100 px-5 py-3.5 last:border-0 transition hover:bg-slate-50 ${post.pinned ? "bg-blue-50/60" : ""}`} href={postHref(post)}>
              {post.pinned && <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-bold" style={{ color: design.mainColor }}>공지</span>}
              <span className="flex-1 truncate text-sm font-medium">{post.title}</span>
              <span className="shrink-0 text-xs text-slate-400">{post.updatedAt}</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-xl border bg-white/80" style={childCardStyle(section)}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-400">
                <th className="py-2.5 pl-5 text-left font-medium">번호</th>
                <th className="py-2.5 text-left font-medium">제목</th>
                <th className="hidden py-2.5 text-left font-medium sm:table-cell">작성자</th>
                <th className="py-2.5 pr-5 text-right font-medium">날짜</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((post, i) => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="py-3 pl-5 text-slate-400">{filtered.length - i}</td>
                  <td className="py-3 pr-3">
                    <a className="hover:underline" href={postHref(post)}>
                      {post.pinned && <span className="mr-1.5 rounded bg-blue-100 px-1 py-0.5 text-[10px] font-bold" style={{ color: design.mainColor }}>공지</span>}
                      {post.title}
                    </a>
                  </td>
                  <td className="hidden py-3 text-slate-500 sm:table-cell">{post.author}</td>
                  <td className="py-3 pr-5 text-right text-slate-400">{post.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionShell>
  );
}

// ── EmbedFormSection ─────────────────────────────────────
function EmbedFormSection({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const layout = stringValue(section, "layout", "contact");
  const buttonLabel = stringValue(section, "buttonLabel", layout === "newsletter" ? "구독하기" : layout === "consult" ? "상담 신청" : "보내기");
  return (
    <SectionShell design={design} section={section}>
      <SectionHeader design={design} section={section} />
      <div className="mx-auto mt-10 max-w-xl rounded-2xl border bg-white/90 p-8" style={childCardStyle(section)}>
        {layout === "newsletter" ? (
          <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
            <input className="h-11 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none" placeholder="이메일 주소를 입력하세요" type="email" />
            <button className="h-11 rounded-lg px-5 text-sm font-semibold text-white" style={{ background: design.mainColor }} type="submit">{buttonLabel}</button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {layout !== "survey" && (
              <div className="grid grid-cols-2 gap-4">
                <input className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none" placeholder="이름" />
                <input className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none" placeholder="이메일" type="email" />
              </div>
            )}
            {layout === "consult" && <input className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none" placeholder="연락처" />}
            <textarea className="h-28 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none" placeholder="내용을 입력하세요" />
            <button className="h-11 w-full rounded-lg text-sm font-semibold text-white" style={{ background: design.mainColor }} type="submit">{buttonLabel}</button>
          </form>
        )}
      </div>
    </SectionShell>
  );
}

// ── SectionHeader helper ─────────────────────────────────
function SectionHeader({ design, section }: { design: PublicDesign; section: PublicSection }) {
  const badge = stringValue(section, "badge");
  const title = stringValue(section, "title");
  const description = stringValue(section, "description");
  if (!badge && !title && !description) return null;
  return (
    <div className={`max-w-2xl ${positionClass(section)} ${alignClass(section)}`}>
      {badge && <p className="mb-3 text-sm font-bold" style={{ color: design.mainColor }}>{badge}</p>}
      {title && <h2 className="font-bold tracking-normal" style={titleStyle(section, design)}>{title}</h2>}
      {description && <p className="mt-4" style={descriptionStyle(section, design)}>{description}</p>}
    </div>
  );
}

function PublicSectionRenderer({
  design,
  posts,
  section,
  siteName,
  siteSlug,
}: {
  design: PublicDesign;
  posts: DashboardPost[];
  section: PublicSection;
  siteName: string;
  siteSlug: string;
}) {
  const type = stringValue(section, "type", "content");

  if (type === "hero") return <HeroSection design={design} section={section} siteName={siteName} />;
  if (type === "features") return <FeaturesSection design={design} section={section} />;
  if (type === "cta") return <CtaSection design={design} section={section} />;
  if (type === "review") return <ReviewSection design={design} section={section} />;
  if (type === "stats") return <StatsSection design={design} section={section} />;
  if (type === "pricing") return <PricingSection design={design} section={section} />;
  if (type === "faq") return <FaqSection design={design} section={section} />;
  if (type === "team") return <TeamSection design={design} section={section} />;
  if (type === "subhero") return <SubheroSection design={design} section={section} siteName={siteName} />;
  if (type === "breadcrumb") return <BreadcrumbSection design={design} section={section} />;
  if (type === "org-chart") return <OrgChartSection design={design} section={section} />;
  if (type === "history") return <HistorySection design={design} section={section} />;
  if (type === "vision") return <VisionSection design={design} section={section} />;
  if (type === "values") return <ValuesSection design={design} section={section} />;
  if (type === "location") return <LocationSection design={design} section={section} />;
  if (type === "partners") return <PartnersSection design={design} section={section} />;
  if (type === "awards") return <AwardsSection design={design} section={section} />;
  if (type === "press") return <PressSection design={design} section={section} />;
  if (type === "photo-gallery") return <PhotoGallerySection design={design} section={section} />;
  if (type === "jobs") return <JobsSection design={design} section={section} />;
  if (type === "downloads") return <DownloadsSection design={design} section={section} />;
  if (type === "board") return <BoardSection design={design} posts={posts} section={section} siteSlug={siteSlug} />;
  if (type === "embed-form") return <EmbedFormSection design={design} section={section} />;

  // content — 멀티블록 지원
  if (type === "content") {
    const blocks = contentBlocks(section);
    return (
      <SectionShell design={design} section={section}>
        <div className="space-y-20">
          {blocks.map((block, i) => {
            const visual = block.imageUrl ? (
              <img alt={block.title} className="w-full rounded-xl object-cover" src={block.imageUrl} />
            ) : null;
            return (
              <div key={i} className="grid items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
                {block.mediaPosition === "left" && visual ? <div className="lg:order-1">{visual}</div> : null}
                <div className={`${alignClass(section)} ${block.mediaPosition === "right" ? "lg:order-1" : "lg:order-2"}`}>
                  {block.badge && <p className="mb-4 text-sm font-bold" style={{ color: design.mainColor }}>{block.badge}</p>}
                  {block.title && <h2 className="font-bold tracking-normal" style={titleStyle(section, design)}>{block.title}</h2>}
                  {block.description && <p className="mt-4 leading-7 text-slate-600" style={descriptionStyle(section, design)}>{block.description}</p>}
                </div>
                {block.mediaPosition !== "left" && visual ? <div className="lg:order-2">{visual}</div> : null}
              </div>
            );
          })}
        </div>
      </SectionShell>
    );
  }

  return <ContentSection design={design} section={section} siteName={siteName} />;
}

export function PublicSiteRenderer({
  contactEnabled = true,
  contactResult,
  description,
  locale = "ko",
  pagePath = "/",
  popups = [],
  publishedJson,
  posts = [],
  siteName,
  siteSlug = "",
}: PublicSiteRendererProps) {
  const page = normalizePageJson(publishedJson, locale);
  const { design, i18n, navigation, pages, sections } = page;
  const localizedSiteName = i18n.siteName[locale] || siteName;
  const localizedCopyright =
    i18n.footerCopyright[locale] ||
    (locale === "en" ? "All rights reserved." : "모든 권리 보유.");

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        color: design.textColor,
        fontFamily: fontStack(design.bodyFontFamily, "system"),
      }}
    >
      <PublicSiteAnimations />
      <PublicHeader
        design={design}
        locale={locale}
        locales={i18n.locales}
        navigation={navigation}
        pagePath={pagePath}
        pages={pages}
        siteName={localizedSiteName}
        siteSlug={siteSlug}
      />
      <main style={{ display: "grid", gap: `${Math.max(0, Number(design.sectionGap) || 0)}px` }}>
        {sections.map((section, index) => (
          <PublicSectionRenderer
            design={design}
            key={stringValue(section, "builderId", `${stringValue(section, "type", "section")}-${index}`)}
            posts={posts}
            section={section}
            siteName={localizedSiteName}
            siteSlug={siteSlug}
          />
        ))}
        {sections.length === 0 ? (
          <section className="px-6 py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold">{localizedSiteName}</h1>
              {description ? <p className="mt-4 text-slate-500">{description}</p> : null}
            </div>
          </section>
        ) : null}
        {siteSlug ? (
          <LatestPostsSection
            design={design}
            locale={locale}
            posts={posts}
            siteSlug={siteSlug}
          />
        ) : null}
        {siteSlug ? (
          <ContactSection
            contactEnabled={contactEnabled}
            contactResult={contactResult}
            design={design}
            locale={locale}
            pagePath={pagePath}
            siteName={localizedSiteName}
            siteSlug={siteSlug}
          />
        ) : null}
      </main>
      <PublicFooter
        copyright={localizedCopyright}
        design={design}
        locale={locale}
        siteName={localizedSiteName}
      />
      {siteSlug ? <PublicPopups popups={popups} siteSlug={siteSlug} /> : null}
    </div>
  );
}
