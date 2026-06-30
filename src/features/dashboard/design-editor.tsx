"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowLeft, ArrowRight, ArrowUp,
  Award, BarChart3, Briefcase, Camera, Check, ChevronDown, ClipboardList, Clock,
  Copy, CreditCard, Download, Eye, FileText, GitBranch, GripVertical, HelpCircle,
  Home, Image as ImageIcon, Inbox, Languages, Laptop, Layers3, LayoutGrid, MapPin,
  Monitor, MoreHorizontal, Newspaper, Palette, Plus, Settings, Smartphone, Sparkles,
  Star, Tablet, Trash2, UploadCloud, Users, WandSparkles, X, ZoomIn,
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
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createEditorPage,
  publishSite,
  updateDraftJson,
} from "@/features/dashboard/actions";
import { initialBoards } from "@/features/dashboard/content-posts-data";
import { cn } from "@/lib/utils";
import type { Json } from "@/types/database";

type EditorSection = Record<string, unknown>;
type SupportedLocale = "ko" | "en";
type TranslationFields = Partial<Record<SupportedLocale, Record<string, unknown>>>;

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

type EditorPageItem = {
  id: string;
  title: string;
  path: string;
  status: "public" | "private";
  translations?: TranslationFields;
};

type EditorNavigationItem = {
  id: string;
  label: string;
  pageId: string;
  enabled: boolean;
  translations?: TranslationFields;
};

type EditorI18nSettings = {
  defaultLocale: "ko";
  footerCopyright: Partial<Record<SupportedLocale, string>>;
  locales: SupportedLocale[];
  seo: Partial<
    Record<SupportedLocale, { description: string; title: string }>
  >;
  siteName: Partial<Record<SupportedLocale, string>>;
};

type EditableDraft = Record<string, unknown> & {
  design: DesignSettings;
  i18n: EditorI18nSettings;
  navigation: EditorNavigationItem[];
  pages: EditorPageItem[];
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
    path: string;
    title: string;
    updatedAt: string;
  };
  sitePages: EditorPageItem[];
};

type ModulePreset = {
  category: string;
  description: string;
  layout: string;
  pageType?: "main" | "sub" | "all";
  title: string;
  type: string;
};

type HeroSlide = {
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
  translations?: TranslationFields;
};

type EditorViewport = "desktop" | "tablet" | "mobile";
type RightPanelMode = "library" | "settings";
type AlignmentValue = "left" | "center" | "right";
type AnimationValue = "none" | "fade-in" | "bounce-in" | "zoom-in";
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
  bodyFontFamily: "pretendard",
  englishFontFamily: "pretendard",
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
  headingFontFamily: "pretendard",
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
  { value: "review", label: "후기", icon: Star },
  { value: "stats", label: "데이터", icon: BarChart3 },
  { value: "pricing", label: "가격", icon: CreditCard },
  { value: "faq", label: "FAQ", icon: HelpCircle },
  { value: "team", label: "팀", icon: Users },
  { value: "subhero", label: "서브 비주얼", icon: ImageIcon },
  { value: "breadcrumb", label: "브레드크럼", icon: ChevronDown },
  { value: "board", label: "게시판", icon: Newspaper },
  { value: "embed-form", label: "폼", icon: ClipboardList },
  { value: "org-chart", label: "조직도", icon: GitBranch },
  { value: "history", label: "연혁", icon: Clock },
  { value: "vision", label: "비전·미션", icon: Sparkles },
  { value: "values", label: "핵심가치", icon: Award },
  { value: "location", label: "오시는길", icon: MapPin },
  { value: "partners", label: "파트너", icon: Users },
  { value: "awards", label: "수상·인증", icon: Award },
  { value: "press", label: "보도자료", icon: Newspaper },
  { value: "photo-gallery", label: "포토갤러리", icon: Camera },
  { value: "jobs", label: "채용", icon: Briefcase },
  { value: "downloads", label: "자료실", icon: Download },
];

const modulePresets: ModulePreset[] = [
  {
    category: "히어로",
    description: "메시지와 실제 에디터 화면을 한눈에 보여주는 제품 중심 구성",
    layout: "product-canvas",
    pageType: "main",
    title: "제품 캔버스",
    type: "hero",
  },
  {
    category: "히어로",
    description: "중앙 메시지 아래 대형 제품 화면으로 신뢰를 만드는 구성",
    layout: "centered-showcase",
    pageType: "main",
    title: "중앙 쇼케이스",
    type: "hero",
  },
  {
    category: "히어로",
    description: "완성된 사이트 결과물을 갤러리처럼 먼저 보여주는 구성",
    layout: "template-showcase",
    pageType: "main",
    title: "템플릿 쇼케이스",
    type: "hero",
  },
  {
    category: "히어로",
    description: "섹션이 하나의 페이지로 조립되는 과정을 표현한 구성",
    layout: "modular-assembly",
    pageType: "main",
    title: "모듈 조립형",
    type: "hero",
  },
  {
    category: "히어로",
    description: "강한 타이포와 결과물 화면을 비대칭으로 배치한 구성",
    layout: "editorial-contrast",
    pageType: "main",
    title: "에디토리얼",
    type: "hero",
  },
  {
    category: "히어로",
    description: "첫 화면에 가장 적합한 슬라이드형 메인 비주얼",
    layout: "slide",
    pageType: "main",
    title: "슬라이드 히어로",
    type: "hero",
  },
  {
    category: "히어로",
    description: "강한 전환 버튼과 메시지를 함께 보여주는 구성",
    layout: "cta-focus",
    pageType: "main",
    title: "CTA 강조형 히어로",
    type: "hero",
  },
  {
    category: "히어로",
    description: "좌측 텍스트와 우측 비주얼이 균형 잡힌 구성",
    layout: "split-visual",
    pageType: "main",
    title: "비주얼 강조 히어로",
    type: "hero",
  },
  {
    category: "히어로",
    description: "문구 중심으로 빠르게 메시지를 전달하는 구성",
    layout: "text-focus",
    pageType: "main",
    title: "텍스트 중심 히어로",
    type: "hero",
  },
  // ── 소개 (기능 + 서비스) ────────────────────────
  {
    category: "소개",
    description: "핵심 장점을 카드로 안전하게 정리",
    layout: "cards",
    title: "특징 카드 그리드",
    type: "features",
  },
  {
    category: "소개",
    description: "서비스 흐름을 순서대로 보여주는 단계형 구성",
    layout: "timeline",
    title: "프로세스 타임라인",
    type: "features",
  },
  {
    category: "소개",
    description: "이미지와 설명을 나란히 배치하는 소개 섹션",
    layout: "media-left",
    title: "이미지 설명 섹션",
    type: "content",
  },
  // ── 신뢰 (후기 + 데이터) ────────────────────────
  {
    category: "신뢰",
    description: "여러 고객 후기를 카드 그리드로 나열하는 구성",
    layout: "grid",
    title: "후기 카드 그리드",
    type: "review",
  },
  {
    category: "신뢰",
    description: "대표 고객 후기를 크게 부각하는 구성",
    layout: "featured",
    title: "추천 후기 강조",
    type: "review",
  },
  {
    category: "신뢰",
    description: "별점과 함께 후기를 나열하는 구성",
    layout: "rating",
    title: "별점 후기",
    type: "review",
  },
  {
    category: "신뢰",
    description: "핵심 수치를 크게 강조하는 카운터 구성",
    layout: "counters",
    title: "핵심 수치 강조",
    type: "stats",
  },
  {
    category: "신뢰",
    description: "진행 바로 달성도를 시각화하는 구성",
    layout: "bars",
    title: "진행 바 통계",
    type: "stats",
  },
  {
    category: "신뢰",
    description: "어두운 배경으로 임팩트 있게 수치를 보여주는 구성",
    layout: "dark",
    title: "다크 데이터",
    type: "stats",
  },
  // ── 전환 (CTA + 가격) ────────────────────────────
  {
    category: "전환",
    description: "페이지 하단 전환을 만드는 와이드 배너",
    layout: "banner",
    title: "와이드 CTA",
    type: "cta",
  },
  {
    category: "전환",
    description: "어두운 배경으로 강한 전환을 유도하는 구성",
    layout: "dark",
    title: "다크 CTA",
    type: "cta",
  },
  {
    category: "전환",
    description: "이메일 입력 + 구독 버튼으로 리드를 수집하는 구성",
    layout: "newsletter",
    title: "뉴스레터 구독",
    type: "cta",
  },
  {
    category: "전환",
    description: "플랜별 카드로 가격을 비교하는 구성",
    layout: "cards",
    title: "가격 카드",
    type: "pricing",
  },
  {
    category: "전환",
    description: "두 개의 플랜을 나란히 비교하는 구성",
    layout: "two-col",
    title: "2열 가격 비교",
    type: "pricing",
  },
  // ── 정보 (FAQ + 팀) ──────────────────────────────
  {
    category: "정보",
    description: "질문을 클릭해 답변을 여는 아코디언 구성",
    layout: "accordion",
    title: "FAQ 아코디언",
    type: "faq",
  },
  {
    category: "정보",
    description: "질문과 답변을 두 열로 나란히 배치하는 구성",
    layout: "two-col",
    title: "2열 FAQ",
    type: "faq",
  },
  {
    category: "정보",
    description: "팀원 프로필을 카드 그리드로 보여주는 구성",
    layout: "grid",
    title: "팀 그리드",
    type: "team",
  },
  {
    category: "정보",
    description: "팀원을 리스트로 나열하는 구성",
    layout: "list",
    title: "팀 리스트",
    type: "team",
  },
  // ── 콘텐츠 (게시판 + 폼) ────────────────────────
  {
    category: "콘텐츠",
    description: "제목·날짜·작성자를 테이블로 나열하는 기본형 목록",
    layout: "list",
    title: "목록형 게시판",
    type: "board",
  },
  {
    category: "콘텐츠",
    description: "썸네일 이미지를 카드 그리드로 보여주는 갤러리형",
    layout: "gallery",
    title: "갤러리형 게시판",
    type: "board",
  },
  {
    category: "콘텐츠",
    description: "최신 글을 뉴스레터처럼 카드로 나열하는 구성",
    layout: "news",
    title: "뉴스형 게시판",
    type: "board",
  },
  {
    category: "콘텐츠",
    description: "주요 공지사항을 강조해서 보여주는 구성",
    layout: "notice",
    title: "공지사항형",
    type: "board",
  },
  {
    category: "콘텐츠",
    description: "이름·이메일·내용을 입력받는 기본 문의 폼",
    layout: "contact",
    title: "문의 폼",
    type: "embed-form",
  },
  {
    category: "콘텐츠",
    description: "이메일 주소만 받아 뉴스레터를 구독하는 폼",
    layout: "newsletter",
    title: "뉴스레터 구독 폼",
    type: "embed-form",
  },
  {
    category: "콘텐츠",
    description: "상담 일정·내용을 받는 상담 신청 폼",
    layout: "consult",
    title: "상담 신청 폼",
    type: "embed-form",
  },
  {
    category: "콘텐츠",
    description: "여러 항목을 체크하는 설문 폼",
    layout: "survey",
    title: "설문 폼",
    type: "embed-form",
  },
  // ── 서브페이지 전용 ─────────────────────────────
  // 페이지 헤더 (상단 고정)
  {
    category: "페이지 헤더",
    description: "페이지 제목과 배경을 보여주는 컴팩트 배너",
    layout: "banner",
    pageType: "sub",
    title: "페이지 배너",
    type: "subhero",
  },
  {
    category: "페이지 헤더",
    description: "배경 이미지 위에 제목을 얹는 구성",
    layout: "image-bg",
    pageType: "sub",
    title: "이미지 배경 배너",
    type: "subhero",
  },
  {
    category: "페이지 헤더",
    description: "좌측 제목 + 우측 부가정보를 나란히 배치",
    layout: "split",
    pageType: "sub",
    title: "좌우 분리형 배너",
    type: "subhero",
  },
  {
    category: "페이지 헤더",
    description: "현재 위치를 경로로 표시하는 네비게이션 바",
    layout: "default",
    pageType: "sub",
    title: "브레드크럼",
    type: "breadcrumb",
  },
  {
    category: "페이지 헤더",
    description: "브레드크럼과 페이지 제목을 함께 보여주는 구성",
    layout: "with-title",
    pageType: "sub",
    title: "제목 포함 브레드크럼",
    type: "breadcrumb",
  },
  // 서브 전용 정보형
  {
    category: "정보",
    description: "수직 트리 구조로 조직 계층을 보여주는 구성",
    layout: "tree",
    pageType: "sub",
    title: "조직도 트리",
    type: "org-chart",
  },
  {
    category: "정보",
    description: "부서·직책을 카드 그리드로 나열하는 조직도",
    layout: "grid",
    pageType: "sub",
    title: "조직도 카드형",
    type: "org-chart",
  },
  {
    category: "정보",
    description: "연도별 이정표를 세로 타임라인으로 표현하는 구성",
    layout: "timeline",
    pageType: "sub",
    title: "연혁 타임라인",
    type: "history",
  },
  {
    category: "정보",
    description: "좌우 교차 배치로 연도·사건을 보여주는 구성",
    layout: "zigzag",
    pageType: "sub",
    title: "연혁 지그재그",
    type: "history",
  },
  // ── 소개형 (서브) ────────────────────────────────
  {
    category: "소개",
    description: "회사의 비전과 미션을 중앙 정렬로 강조하는 구성",
    layout: "centered",
    pageType: "sub",
    title: "비전·미션 중앙형",
    type: "vision",
  },
  {
    category: "소개",
    description: "비전과 미션을 좌우로 나란히 배치하는 구성",
    layout: "split",
    pageType: "sub",
    title: "비전·미션 분리형",
    type: "vision",
  },
  {
    category: "소개",
    description: "핵심 가치를 아이콘 카드 그리드로 나열하는 구성",
    layout: "grid",
    pageType: "sub",
    title: "핵심가치 카드",
    type: "values",
  },
  {
    category: "소개",
    description: "아이콘과 설명을 세로 목록으로 나열하는 구성",
    layout: "list",
    pageType: "sub",
    title: "핵심가치 목록",
    type: "values",
  },
  // ── 정보형 추가 (서브) ───────────────────────────
  {
    category: "정보",
    description: "지도 이미지와 주소·교통 정보를 나란히 배치",
    layout: "map-text",
    pageType: "sub",
    title: "오시는길 지도+텍스트",
    type: "location",
  },
  {
    category: "정보",
    description: "주소·전화·이메일 등 연락처 정보만 보여주는 구성",
    layout: "text-only",
    pageType: "sub",
    title: "오시는길 텍스트형",
    type: "location",
  },
  {
    category: "정보",
    description: "최신 보도자료를 목록으로 나열하는 구성",
    layout: "list",
    pageType: "sub",
    title: "보도자료 목록",
    type: "press",
  },
  {
    category: "정보",
    description: "언론 보도를 카드 그리드로 보여주는 구성",
    layout: "cards",
    pageType: "sub",
    title: "보도자료 카드",
    type: "press",
  },
  // ── 신뢰형 (서브) ────────────────────────────────
  {
    category: "신뢰",
    description: "파트너·고객사 로고를 그리드로 나열하는 구성",
    layout: "logo-grid",
    pageType: "sub",
    title: "파트너 로고 그리드",
    type: "partners",
  },
  {
    category: "신뢰",
    description: "파트너 로고를 가로 스트립으로 보여주는 구성",
    layout: "logo-strip",
    pageType: "sub",
    title: "파트너 로고 스트립",
    type: "partners",
  },
  {
    category: "신뢰",
    description: "수상·인증 배지를 카드 그리드로 나열하는 구성",
    layout: "grid",
    pageType: "sub",
    title: "수상·인증 그리드",
    type: "awards",
  },
  {
    category: "신뢰",
    description: "인증 항목을 로고+설명 목록으로 보여주는 구성",
    layout: "list",
    pageType: "sub",
    title: "수상·인증 목록",
    type: "awards",
  },
  // ── 콘텐츠형 추가 (서브) ────────────────────────
  {
    category: "콘텐츠",
    description: "사진을 마소너리 그리드로 보여주는 갤러리",
    layout: "masonry",
    pageType: "sub",
    title: "포토갤러리 마소너리",
    type: "photo-gallery",
  },
  {
    category: "콘텐츠",
    description: "사진을 균일한 그리드로 나열하는 갤러리",
    layout: "grid",
    pageType: "sub",
    title: "포토갤러리 그리드",
    type: "photo-gallery",
  },
  {
    category: "콘텐츠",
    description: "채용 포지션을 카드 목록으로 나열하는 구성",
    layout: "list",
    pageType: "sub",
    title: "채용 목록",
    type: "jobs",
  },
  {
    category: "콘텐츠",
    description: "부서별 채용 포지션을 카드로 보여주는 구성",
    layout: "cards",
    pageType: "sub",
    title: "채용 카드",
    type: "jobs",
  },
  {
    category: "콘텐츠",
    description: "파일·문서를 다운로드 목록으로 나열하는 구성",
    layout: "list",
    pageType: "sub",
    title: "자료실 목록",
    type: "downloads",
  },
  {
    category: "콘텐츠",
    description: "카테고리별 자료를 카드로 보여주는 구성",
    layout: "cards",
    pageType: "sub",
    title: "자료실 카드",
    type: "downloads",
  },
];

const defaultPages: EditorPageItem[] = [
  { id: "home", title: "메인 페이지", path: "/", status: "public" },
  { id: "about", title: "회사 소개", path: "/about", status: "public" },
  { id: "service", title: "서비스", path: "/service", status: "public" },
  { id: "pricing", title: "가격", path: "/pricing", status: "private" },
  { id: "blog", title: "블로그", path: "/blog", status: "public" },
];

const defaultNavigation: EditorNavigationItem[] = [
  { id: "nav-products", label: "제품", pageId: "home", enabled: true },
  { id: "nav-solutions", label: "솔루션", pageId: "service", enabled: true },
  { id: "nav-pricing", label: "가격", pageId: "pricing", enabled: true },
  { id: "nav-company", label: "회사", pageId: "about", enabled: true },
];

const defaultI18n: EditorI18nSettings = {
  defaultLocale: "ko",
  footerCopyright: {
    en: "All rights reserved.",
    ko: "모든 권리 보유.",
  },
  locales: ["ko"],
  seo: {
    en: { description: "", title: "" },
  },
  siteName: {},
};

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

const alignmentOptions = [
  { icon: AlignLeft, label: "왼쪽", value: "left" },
  { icon: AlignCenter, label: "가운데", value: "center" },
  { icon: AlignRight, label: "오른쪽", value: "right" },
] satisfies Array<{
  icon: typeof AlignLeft;
  label: string;
  value: AlignmentValue;
}>;

const animationOptions = [
  { description: "아래에서 부드럽게 등장", icon: Sparkles, label: "페이드 인", value: "fade-in" },
  { description: "가볍게 통통 튀며 등장", icon: WandSparkles, label: "통통 튀기", value: "bounce-in" },
  { description: "작은 크기에서 확대", icon: ZoomIn, label: "줌 인", value: "zoom-in" },
] satisfies Array<{
  description: string;
  icon: typeof Sparkles;
  label: string;
  value: Exclude<AnimationValue, "none">;
}>;

const showcaseHeroLayouts = new Set([
  "product-canvas",
  "centered-showcase",
  "template-showcase",
  "modular-assembly",
  "editorial-contrast",
]);

const freeFontOptions = [
  {
    label: "Pretendard",
    stack: "'Pretendard Variable', Pretendard, ui-sans-serif, system-ui, sans-serif",
    value: "pretendard",
  },
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
    label: "Noto Serif KR",
    stack: "'Noto Serif KR', serif",
    value: "noto-serif-kr",
  },
  {
    label: "나눔명조",
    stack: "'Nanum Myeongjo', serif",
    value: "nanum-myeongjo",
  },
  {
    label: "나눔스퀘어라운드",
    stack: "'NanumSquareRound', ui-sans-serif, system-ui, sans-serif",
    value: "nanum-square-round",
  },
  {
    label: "G마켓 산스",
    stack: "'Gmarket Sans', ui-sans-serif, system-ui, sans-serif",
    value: "gmarket-sans",
  },
  {
    label: "S-Core Dream",
    stack: "'Escoredream', ui-sans-serif, system-ui, sans-serif",
    value: "escore-dream",
  },
  {
    label: "Mona",
    stack: "'Mona12 Text KR', 'Mona12', ui-sans-serif, system-ui, sans-serif",
    value: "mona",
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
    label: "Black Han Sans",
    stack: "'Black Han Sans', ui-sans-serif, system-ui, sans-serif",
    value: "black-han-sans",
  },
  {
    label: "Jua",
    stack: "'Jua', ui-sans-serif, system-ui, sans-serif",
    value: "jua",
  },
  {
    label: "Inter",
    stack: "Inter, ui-sans-serif, system-ui, sans-serif",
    value: "inter",
  },
  {
    label: "Google Sans Flex",
    stack: "'Google Sans Flex', ui-sans-serif, system-ui, sans-serif",
    value: "google-sans-flex",
  },
  {
    label: "Montserrat",
    stack: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
    value: "montserrat",
  },
  {
    label: "Poppins",
    stack: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    value: "poppins",
  },
  {
    label: "Roboto",
    stack: "'Roboto', ui-sans-serif, system-ui, sans-serif",
    value: "roboto",
  },
];

function createHeroSlide(index: number, overrides: Partial<HeroSlide> = {}): HeroSlide {
  const defaults = [
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
  ][index % 3];

  return {
    backgroundType: "color",
    badge: defaults.badge,
    bgColor: defaults.bgColor,
    buttonLabel: "무료로 시작하기",
    buttonLink: "#contact",
    description: defaults.description,
    id: createSectionId(`slide-${index + 1}`),
    imageUrl: "",
    secondaryButtonLabel: "템플릿 둘러보기",
    secondaryButtonLink: "#",
    title: defaults.title,
    ...overrides,
  };
}

function heroSlides(section: EditorSection): HeroSlide[] {
  const sectionId = stringValue(section, "builderId", "hero");

  if (Array.isArray(section.slides) && section.slides.length) {
    return section.slides
      .map((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return null;

        const record = item as Record<string, unknown>;
        const fallback = createHeroSlide(index, {
          id: `${sectionId}-slide-${index + 1}`,
        });
        const backgroundType =
          stringValue(record, "backgroundType", fallback.backgroundType) === "image"
            ? "image"
            : "color";

        return {
          backgroundType,
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
          translations: normalizeTranslations(record.translations),
        } satisfies HeroSlide;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  return [
    createHeroSlide(0, {
      badge: stringValue(section, "badge", "AI · No Code · Web Solution"),
      buttonLabel: stringValue(section, "buttonLabel", "무료로 시작하기"),
      buttonLink: stringValue(section, "buttonLink", "#contact"),
      description: stringValue(
        section,
        "description",
        "검증된 디자인을 선택하고 내용만 바꾸면 사이트가 완성됩니다.",
      ),
      imageUrl: stringValue(section, "imageUrl"),
      secondaryButtonLabel: stringValue(
        section,
        "secondaryButtonLabel",
        "템플릿 둘러보기",
      ),
      title: stringValue(section, "title", "쉬운데, 결과물은 예쁜 웹사이트"),
      id: `${sectionId}-slide-1`,
    }),
    createHeroSlide(1, { id: `${sectionId}-slide-2` }),
    createHeroSlide(2, { id: `${sectionId}-slide-3` }),
  ];
}

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
    align:
      layout === "text-focus" ||
      layout === "centered-showcase" ||
      type === "review" ||
      type === "stats" ||
      type === "pricing" ||
      type === "faq" ||
      type === "team"
        ? "center"
        : "left",
    arrowBgColor: "#0f172a",
    arrowButtonSize: "48",
    arrowColor: "#ffffff",
    arrowImageUrl: "",
    arrowSize: "24",
    arrowStyle: "simple",
    autoplayDelay: "4500",
    backgroundType:
      layout === "cta-focus" || (type === "hero" && showcaseHeroLayouts.has(layout))
        ? "color"
        : "gradient",
    bgColor: type === "hero" && showcaseHeroLayouts.has(layout) ? "#ffffff" : "#f8fbff",
    gradientFrom: "#f3f7ff",
    gradientTo: "#ffffff",
    glass: "off",
    imageUrl: "",
    mediaPosition: type === "content" ? "left" : type === "hero" ? "right" : "center",
    overlayColor: "#000000",
    overlayOpacity: "0.3",
    paddingBottom: desktopPadding,
    paddingBottomDesktop: desktopPadding,
    paddingBottomMobile: mobilePadding,
    paddingBottomTablet: tabletPadding,
    paddingTop: desktopPadding,
    paddingTopDesktop: desktopPadding,
    paddingTopMobile: mobilePadding,
    paddingTopTablet: tabletPadding,
    paginationStyle: "circle",
    radius: type === "hero" && showcaseHeroLayouts.has(layout) ? "8" : "24",
    shadow: type === "hero" && showcaseHeroLayouts.has(layout) ? "none" : "soft",
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
          : type === "review"
            ? "grid"
            : type === "stats"
              ? "counters"
              : type === "pricing"
                ? "cards"
                : type === "faq"
                  ? "accordion"
                  : type === "team"
                    ? "grid"
                    : type === "subhero"
                      ? "banner"
                      : type === "breadcrumb"
                        ? "default"
                        : type === "board"
                          ? "list"
                          : type === "embed-form"
                            ? "contact"
                            : type === "org-chart"
                              ? "tree"
                              : type === "history"
                                ? "timeline"
                                : type === "vision"
                                  ? "centered"
                                  : type === "values"
                                    ? "grid"
                                    : type === "location"
                                      ? "map-text"
                                      : type === "partners"
                                        ? "logo-grid"
                                        : type === "awards"
                                          ? "grid"
                                          : type === "press"
                                            ? "list"
                                            : type === "photo-gallery"
                                              ? "masonry"
                                              : type === "jobs"
                                                ? "list"
                                                : type === "downloads"
                                                  ? "list"
                                                  : "media-left");

  const base = {
    builderId: createSectionId(type),
    layout: nextLayout,
    type,
    ...defaultSectionStyle(type, nextLayout),
  };

  if (type === "hero") {
    const showcaseCopy = {
      badge: "PRESET-BASED NO-CODE BUILDER",
      buttonLabel: "무료로 내 사이트 만들기",
      buttonLink: "#contact",
      description: "쉬운데, 결과물은 예쁜 웹사이트",
      secondaryButtonLabel: "템플릿 둘러보기",
      title: "KEYUN 웹사이트 빌더",
    };

    const heroSection = {
      ...base,
      ...(nextLayout === "product-canvas" ||
      nextLayout === "centered-showcase" ||
      nextLayout === "template-showcase" ||
      nextLayout === "modular-assembly" ||
      nextLayout === "editorial-contrast"
        ? showcaseCopy
        : {
            badge: "AI · No Code · Web Solution",
            buttonLabel: "무료로 시작하기",
            buttonLink: "#contact",
            description:
              "KEYUN은 AI와 노코드 기술로 비즈니스의 시작부터 성장까지 모든 과정을 지원하는 통합 솔루션 플랫폼입니다.",
            secondaryButtonLabel: "제품 살펴보기",
            title: "아이디어를 실현하는 가장 스마트한 방법, KEYUN",
          }),
    };

    return nextLayout === "slide"
      ? {
          ...heroSection,
          align: "left",
          backgroundType: "color",
          bgColor: "#172554",
          slides: [createHeroSlide(0), createHeroSlide(1), createHeroSlide(2)],
          descriptionColor: "#ffffff",
          titleColor: "#ffffff",
          width: "full",
        }
      : heroSection;
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

  if (type === "review") {
    return {
      ...base,
      align: "center",
      badge: "고객 후기",
      description: "실제 고객들이 경험한 이야기를 들어보세요.",
      items: [
        "김민준|마케팅 팀장|덕분에 사이트 운영이 훨씬 쉬워졌어요. 비개발자도 쉽게 쓸 수 있습니다.",
        "이서연|스타트업 대표|런칭까지 일주일도 안 걸렸어요. 결과물이 기대 이상이었습니다.",
        "박지훈|프리랜서 디자이너|디자인 퀄리티가 높고 커스터마이징이 자유로워서 만족합니다.",
      ],
      title: "고객들이 직접 경험한 변화",
    };
  }

  if (type === "stats") {
    return {
      ...base,
      align: "center",
      badge: "주요 지표",
      description: "숫자로 증명하는 키운의 성과입니다.",
      items: ["500+|누적 사이트 수", "98%|고객 만족도", "3일|평균 런칭 기간", "24/7|운영 지원"],
      title: "신뢰할 수 있는 플랫폼",
    };
  }

  if (type === "pricing") {
    return {
      ...base,
      align: "center",
      badge: "요금제",
      description: "필요에 맞는 플랜을 선택하세요.",
      items: [
        "스타터|무료|기본 템플릿 5개\n페이지 3개\n서브도메인 제공|무제한",
        "프로|월 29,000원|모든 템플릿\n페이지 무제한\n커스텀 도메인|우선 지원",
        "비즈니스|월 79,000원|화이트라벨\n팀 협업\n전담 매니저|엔터프라이즈",
      ],
      title: "합리적인 가격으로 시작하세요",
    };
  }

  if (type === "faq") {
    return {
      ...base,
      align: "center",
      badge: "자주 묻는 질문",
      description: "궁금한 점이 있으시면 언제든 문의해주세요.",
      items: [
        "코딩 없이도 사용할 수 있나요?|네, 키운은 완전한 노코드 빌더입니다. 드래그 앤 드롭과 텍스트 입력만으로 사이트를 만들 수 있습니다.",
        "무료 체험이 가능한가요?|스타터 플랜은 영구 무료입니다. 신용카드 없이 바로 시작하실 수 있습니다.",
        "커스텀 도메인을 연결할 수 있나요?|프로 이상 플랜에서 커스텀 도메인을 연결하실 수 있습니다.",
        "데이터는 안전하게 보관되나요?|AWS 클라우드에 저장되며 정기적으로 백업됩니다.",
      ],
      title: "자주 묻는 질문",
    };
  }

  if (type === "team") {
    return {
      ...base,
      align: "center",
      badge: "우리 팀",
      description: "키운을 만들어가는 사람들을 소개합니다.",
      items: [
        "김대표|CEO · 공동창업자|제품 전략 및 비전",
        "이기획|CPO · 공동창업자|프로덕트 디자인",
        "박개발|CTO|풀스택 개발",
        "최마케|CMO|브랜드 & 그로스",
      ],
      title: "팀을 소개합니다",
    };
  }

  if (type === "vision") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#f8fafc",
      description: "우리는 모든 사람이 쉽게 웹사이트를 만들 수 있는 세상을 꿈꿉니다.",
      items: ["혁신|끊임없이 새로운 방법을 탐구합니다", "신뢰|고객과의 약속을 지킵니다", "성장|함께 성장하는 가치를 추구합니다"],
      title: "우리의 비전",
    };
  }

  if (type === "values") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#ffffff",
      items: [
        "혁신|Sparkles|새로운 방법으로 문제를 해결합니다",
        "신뢰|Shield|고객과의 약속을 최우선으로 합니다",
        "협력|Users|함께 성장하는 문화를 만들어갑니다",
        "도전|Zap|두려움 없이 새로운 것에 도전합니다",
        "책임|Check|맡은 일에 끝까지 책임을 집니다",
        "성장|TrendingUp|끊임없이 배우고 발전합니다",
      ],
      title: "핵심 가치",
    };
  }

  if (type === "location") {
    return {
      ...base,
      address: "서울특별시 강남구 테헤란로 123, 키운빌딩 5층",
      backgroundType: "color",
      bgColor: "#ffffff",
      email: "hello@keyun.io",
      items: ["지하철|2호선 강남역 3번 출구 도보 5분", "버스|강남역 정류장 하차"],
      phone: "02-1234-5678",
      title: "오시는 길",
    };
  }

  if (type === "partners") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#f8fafc",
      description: "신뢰할 수 있는 파트너사와 함께합니다.",
      items: ["파트너A", "파트너B", "파트너C", "파트너D", "파트너E", "파트너F"],
      title: "파트너 & 고객사",
    };
  }

  if (type === "awards") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#ffffff",
      items: [
        "2026 대한민국 IT 대상|중소벤처기업부장관상|2026",
        "2025 스타트업 어워드|최우수 서비스상|2025",
        "ISO 27001|정보보안경영시스템 인증|2024",
        "벤처기업 인증|중소벤처기업부|2024",
      ],
      title: "수상 및 인증",
    };
  }

  if (type === "press") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#ffffff",
      items: [
        "키운스튜디오, 누적 투자금 50억 돌파|조선일보|2026-06-01",
        "노코드 시대를 여는 키운스튜디오|한국경제|2026-05-15",
        "스타트업 키운, 글로벌 진출 선언|매일경제|2026-04-20",
      ],
      title: "언론 보도",
    };
  }

  if (type === "photo-gallery") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#ffffff",
      description: "",
      items: ["사진1", "사진2", "사진3", "사진4", "사진5", "사진6"],
      title: "",
    };
  }

  if (type === "jobs") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#f8fafc",
      description: "함께 성장할 인재를 찾습니다.",
      items: [
        "프론트엔드 개발자|개발팀|경력 3년 이상|상시채용",
        "백엔드 개발자|개발팀|경력 3년 이상|상시채용",
        "UX 디자이너|디자인팀|경력 2년 이상|상시채용",
        "마케팅 매니저|마케팅팀|경력 2년 이상|2026-07-31",
      ],
      title: "채용 공고",
    };
  }

  if (type === "downloads") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#ffffff",
      items: [
        "회사 소개서|PDF|2026-06|/files/company-profile.pdf",
        "서비스 이용 가이드|PDF|2026-05|/files/guide.pdf",
        "개인정보처리방침|PDF|2026-01|/files/privacy.pdf",
        "이용약관|PDF|2026-01|/files/terms.pdf",
      ],
      title: "자료실",
    };
  }

  if (type === "org-chart") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#ffffff",
      description: "",
      items: [
        "대표이사|CEO|0|",
        "개발본부장|CTO|1|",
        "마케팅본부장|CMO|1|",
        "개발팀장|Team Lead|2|",
        "디자인팀장|Team Lead|2|",
      ],
      title: "",
    };
  }

  if (type === "history") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#ffffff",
      description: "",
      items: [
        "2024|회사 설립|서울시 강남구에 법인 설립",
        "2024|첫 서비스 출시|베타 서비스 오픈 및 초기 사용자 1000명 달성",
        "2025|Series A 투자유치|누적 투자금 50억 원 확보",
        "2026|글로벌 진출|일본·동남아 시장 서비스 오픈",
      ],
      title: "",
    };
  }

  if (type === "board") {
    return {
      ...base,
      align: "left",
      badge: "",
      boardName: "",
      description: "",
      postsPerPage: "10",
      title: "",
    };
  }

  if (type === "embed-form") {
    return {
      ...base,
      align: "center",
      badge: "",
      buttonLabel: layout === "newsletter" ? "구독하기" : layout === "consult" ? "상담 신청" : "보내기",
      description: "",
      title: "",
    };
  }

  if (type === "subhero") {
    return {
      ...base,
      align: "left",
      backgroundType: "color",
      bgColor: "#f8fafc",
      description: "페이지에 대한 간단한 설명을 입력하세요.",
      paddingBottom: "56",
      paddingBottomDesktop: "56",
      paddingBottomMobile: "40",
      paddingBottomTablet: "48",
      paddingTop: "56",
      paddingTopDesktop: "56",
      paddingTopMobile: "40",
      paddingTopTablet: "48",
      title: "페이지 제목",
    };
  }

  if (type === "breadcrumb") {
    return {
      ...base,
      backgroundType: "color",
      bgColor: "#ffffff",
      items: ["홈|/", "서비스|/service"],
      paddingBottom: "12",
      paddingBottomDesktop: "12",
      paddingBottomMobile: "10",
      paddingBottomTablet: "10",
      paddingTop: "12",
      paddingTopDesktop: "12",
      paddingTopMobile: "10",
      paddingTopTablet: "10",
      title: "",
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

function localizedRecord<T extends Record<string, unknown>>(
  record: T,
  locale: SupportedLocale,
): T {
  if (locale === "ko") return record;

  const translations = normalizeTranslations(record.translations);
  const translated = translations?.[locale];

  return translated ? ({ ...record, ...translated } as T) : record;
}

function localizedSection(section: EditorSection, locale: SupportedLocale): EditorSection {
  const localized = localizedRecord(section, locale);

  if (!Array.isArray(section.slides)) return localized;

  return {
    ...localized,
    slides: section.slides.map((slide) =>
      slide && typeof slide === "object" && !Array.isArray(slide)
        ? localizedRecord(slide as Record<string, unknown>, locale)
        : slide,
    ),
  };
}

function localizedPageTitle(page: EditorPageItem, locale: SupportedLocale) {
  return locale === "ko"
    ? page.title
    : stringValue(page.translations?.[locale] ?? {}, "title", page.title);
}

function localizedNavigationLabel(
  item: EditorNavigationItem,
  locale: SupportedLocale,
) {
  return locale === "ko"
    ? item.label
    : stringValue(item.translations?.[locale] ?? {}, "label", item.label);
}

function alignmentValue(
  section: EditorSection,
  key: string,
  fallback: AlignmentValue = "left",
) {
  const value = stringValue(section, key, fallback);

  return value === "center" || value === "right" ? value : "left";
}

function alignmentTextClass(value: AlignmentValue) {
  if (value === "center") return "text-center";
  if (value === "right") return "text-right";
  return "text-left";
}

function alignmentJustifyClass(value: AlignmentValue) {
  if (value === "center") return "justify-center";
  if (value === "right") return "justify-end";
  return "justify-start";
}

function alignmentPositionClass(value: AlignmentValue) {
  if (value === "center") return "mx-auto";
  if (value === "right") return "ml-auto";
  return "mr-auto";
}

function animationField(element: Exclude<SelectedElement, "site">) {
  if (element === "section") return "sectionAnimation";
  if (element === "secondaryButton") return "secondaryButtonAnimation";

  return `${element}Animation`;
}

function animationValue(
  section: EditorSection,
  element: Exclude<SelectedElement, "site">,
): AnimationValue {
  const value = stringValue(section, animationField(element), "none");

  return value === "fade-in" || value === "bounce-in" || value === "zoom-in"
    ? value
    : "none";
}

function AlignmentControl({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: AlignmentValue) => void;
  value: AlignmentValue;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200">
        {alignmentOptions.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === value;

          return (
            <button
              aria-label={`${label} ${option.label}`}
              aria-pressed={isActive}
              className={cn(
                "flex h-10 items-center justify-center gap-1.5 border-r border-slate-200 text-xs font-semibold transition-colors last:border-r-0",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              )}
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
            >
              <Icon className="size-4" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AnimationControl({
  onChange,
  value,
}: {
  onChange: (value: AnimationValue) => void;
  value: AnimationValue;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">등장 애니메이션</h3>
          <p className="mt-1 text-xs text-slate-500">선택하면 캔버스에서 한 번 재생됩니다.</p>
        </div>
        <button
          className={cn(
            "h-8 rounded-md border px-3 text-xs font-semibold",
            value === "none"
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-slate-200 text-slate-500",
          )}
          type="button"
          onClick={() => onChange("none")}
        >
          없음
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {animationOptions.map((option) => {
          const Icon = option.icon;
          const isActive = value === option.value;

          return (
            <button
              aria-pressed={isActive}
              className={cn(
                "group flex min-h-24 flex-col items-center justify-center rounded-lg border px-2 py-3 text-center transition-colors",
                isActive
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-slate-800",
              )}
              key={option.value}
              title={option.description}
              type="button"
              onClick={() => onChange(option.value)}
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-slate-50 transition-colors group-hover:bg-blue-100">
                <Icon className="size-4" />
              </span>
              <span className="mt-2 text-[11px] font-semibold">{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function numberValue(record: Record<string, unknown>, key: string, fallback: number) {
  const value = Number(stringValue(record, key, String(fallback)));

  return Number.isFinite(value) ? value : fallback;
}

function normalizeTranslations(value: unknown): TranslationFields | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

  const record = value as Record<string, unknown>;
  const english =
    record.en && typeof record.en === "object" && !Array.isArray(record.en)
      ? (record.en as Record<string, unknown>)
      : undefined;

  return english ? { en: english } : undefined;
}

function normalizeI18n(value: unknown): EditorI18nSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultI18n;
  }

  const record = value as Record<string, unknown>;
  const locales = Array.isArray(record.locales)
    ? record.locales.filter(
        (locale): locale is SupportedLocale => locale === "ko" || locale === "en",
      )
    : defaultI18n.locales;
  const siteName =
    record.siteName && typeof record.siteName === "object" && !Array.isArray(record.siteName)
      ? (record.siteName as Partial<Record<SupportedLocale, string>>)
      : {};
  const footerCopyright =
    record.footerCopyright &&
    typeof record.footerCopyright === "object" &&
    !Array.isArray(record.footerCopyright)
      ? (record.footerCopyright as Partial<Record<SupportedLocale, string>>)
      : defaultI18n.footerCopyright;
  const seo =
    record.seo && typeof record.seo === "object" && !Array.isArray(record.seo)
      ? (record.seo as EditorI18nSettings["seo"])
      : defaultI18n.seo;

  return {
    defaultLocale: "ko",
    footerCopyright,
    locales: Array.from(new Set<SupportedLocale>(["ko", ...locales])),
    seo,
    siteName,
  };
}


function normalizePages(value: unknown): EditorPageItem[] {
  if (!Array.isArray(value)) {
    return defaultPages;
  }

  const pages = value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const fallback = defaultPages[index] ?? defaultPages[0];
      const id = stringValue(record, "id", fallback.id || `page-${index}`);
      const title = stringValue(record, "title", fallback.title || "새 페이지");
      const path = stringValue(record, "path", fallback.path || `/page-${index + 1}`);
      const status = stringValue(record, "status", fallback.status) === "private" ? "private" : "public";

      return {
        id,
        path,
        status,
        title,
        translations: normalizeTranslations(record.translations),
      } satisfies EditorPageItem;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return pages.length ? pages : defaultPages;
}

function normalizeNavigation(value: unknown, pages: EditorPageItem[]): EditorNavigationItem[] {
  const pageIds = new Set(pages.map((page) => page.id));

  if (!Array.isArray(value)) {
    return defaultNavigation.filter((item) => pageIds.has(item.pageId));
  }

  const navigation = value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const fallback = defaultNavigation[index] ?? defaultNavigation[0];
      const pageId = stringValue(record, "pageId", fallback.pageId);

      if (!pageIds.has(pageId)) {
        return null;
      }

      return {
        enabled: record.enabled === false ? false : true,
        id: stringValue(record, "id", `nav-${index}`),
        label: stringValue(record, "label", fallback.label || "메뉴"),
        pageId,
        translations: normalizeTranslations(record.translations),
      } satisfies EditorNavigationItem;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return navigation.length ? navigation : defaultNavigation.filter((item) => pageIds.has(item.pageId));
}

function slugifyPath(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? `/${slug}` : `/page-${Date.now()}`;
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

    const pages = normalizePages(record.pages);

    return {
      ...record,
      design: normalizeDesign(record.design),
      i18n: normalizeI18n(record.i18n),
      navigation: normalizeNavigation(record.navigation, pages),
      pages,
      sections: sections.length
        ? sections
        : [createSection("hero"), createSection("features"), createSection("cta")],
    };
  }

  return {
    design: defaultDesign,
    i18n: defaultI18n,
    navigation: defaultNavigation,
    pages: defaultPages,
    sections: [createSection("hero"), createSection("features"), createSection("cta")],
    theme: "keyun-default",
    version: 1,
  };
}

// ── content 섹션 멀티블록 헬퍼 ──────────────────────
type ContentBlock = {
  badge: string;
  description: string;
  imageUrl: string;
  mediaPosition: "left" | "right";
  title: string;
};

function contentBlocks(section: EditorSection): ContentBlock[] {
  const raw = section.blocks;
  if (Array.isArray(raw) && raw.length) {
    return raw.map((b) => {
      const block = b as Record<string, unknown>;
      return {
        badge: String(block.badge ?? ""),
        description: String(block.description ?? ""),
        imageUrl: String(block.imageUrl ?? ""),
        mediaPosition: (block.mediaPosition === "right" ? "right" : "left") as "left" | "right",
        title: String(block.title ?? ""),
      };
    });
  }
  // 기존 단일 필드를 블록 1개로 변환 (하위 호환)
  return [{
    badge: String(section.badge ?? ""),
    description: String(section.description ?? ""),
    imageUrl: String(section.imageUrl ?? ""),
    mediaPosition: (section.mediaPosition === "right" ? "right" : "left") as "left" | "right",
    title: String(section.title ?? ""),
  }];
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
      backgroundImage: `url(${imageUrl})`,
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
): string {
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
  const layoutAlign = alignmentValue(section, "align");

  return {
    color: stringValue(section, "titleColor", design.textColor),
    fontFamily: fontStack(stringValue(section, "titleFontFamily", "site-heading"), design, "heading"),
    fontSize: `${stringValue(section, "titleFontSize", defaultTitleSize(section))}px`,
    letterSpacing: `${stringValue(section, "titleLetterSpacing", "0")}px`,
    lineHeight: stringValue(section, "titleLineHeight", "1.16"),
    textAlign: alignmentValue(section, "titleAlign", layoutAlign),
  };
}

function descriptionTextStyle(section: EditorSection, design: DesignSettings): CSSProperties {
  const layoutAlign = alignmentValue(section, "align");

  return {
    color: stringValue(section, "descriptionColor", "#64748b"),
    fontFamily: fontStack(stringValue(section, "descriptionFontFamily", "site-body"), design, "body"),
    fontSize: `${stringValue(section, "descriptionFontSize", "14")}px`,
    letterSpacing: `${stringValue(section, "descriptionLetterSpacing", "0")}px`,
    lineHeight: stringValue(section, "descriptionLineHeight", "1.72"),
    textAlign: alignmentValue(section, "descriptionAlign", layoutAlign),
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
  if (preset.type === "hero" && showcaseHeroLayouts.has(preset.layout)) {
    return (
      <div className="relative h-24 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "centered-showcase" ? (
          <>
            <div className="mx-auto h-1.5 w-12 rounded bg-slate-900" />
            <div className="mx-auto mt-1 h-1 w-20 rounded bg-slate-300" />
            <div className="mx-auto mt-2 h-2.5 w-10 rounded bg-blue-600" />
            <div className="mt-2 h-10 rounded border border-slate-200 bg-slate-50 p-1">
              <div className="h-1 w-full bg-slate-200" />
              <div className="mt-1 grid grid-cols-[20px_1fr_22px] gap-1">
                <div className="h-6 bg-blue-50" />
                <div className="h-6 bg-white" />
                <div className="h-6 bg-slate-100" />
              </div>
            </div>
          </>
        ) : preset.layout === "template-showcase" ? (
          <div className="grid h-full grid-cols-[0.7fr_1.3fr_0.55fr] gap-1.5">
            <div className="flex flex-col justify-center gap-1">
              <div className="h-1.5 w-10 bg-slate-900" />
              <div className="h-1 w-12 bg-slate-300" />
              <div className="mt-1 h-2.5 w-9 rounded-sm bg-blue-600" />
            </div>
            <div className="rounded-sm border border-emerald-200 bg-emerald-900 p-1.5">
              <div className="h-1 w-8 bg-white/80" />
              <div className="mt-3 h-1.5 w-12 bg-white" />
            </div>
            <div className="rounded-sm bg-rose-800 p-1.5">
              <div className="h-1 w-5 bg-white/80" />
            </div>
          </div>
        ) : preset.layout === "modular-assembly" ? (
          <div className="grid h-full grid-cols-[0.7fr_0.7fr_1fr] items-center gap-1.5">
            <div className="space-y-1">
              <div className="h-1.5 w-10 bg-slate-900" />
              <div className="h-1 w-12 bg-slate-300" />
              <div className="h-2.5 w-9 rounded-sm bg-blue-600" />
            </div>
            <div className="space-y-1">
              {[0, 1, 2].map((item) => (
                <div className="h-4 border border-blue-200 bg-blue-50" key={item} />
              ))}
            </div>
            <div className="h-16 border border-slate-200 bg-white p-1">
              <div className="h-5 bg-orange-50" />
              <div className="mt-1 h-3 bg-blue-50" />
              <div className="mt-1 h-3 bg-emerald-50" />
            </div>
          </div>
        ) : preset.layout === "editorial-contrast" ? (
          <div className="grid h-full grid-cols-[12px_0.8fr_1.2fr] gap-2">
            <div className="rounded-sm bg-slate-950" />
            <div className="flex flex-col justify-center gap-1">
              <div className="h-3 w-14 bg-slate-950" />
              <div className="h-3 w-12 bg-slate-950" />
              <div className="h-1 w-14 bg-slate-300" />
              <div className="mt-1 h-2.5 w-9 rounded-sm bg-blue-600" />
            </div>
            <div className="space-y-1.5 py-1">
              <div className="h-8 bg-amber-200" />
              <div className="ml-3 h-8 bg-emerald-100" />
            </div>
          </div>
        ) : (
          <div className="grid h-full grid-cols-[0.8fr_1.2fr] items-center gap-2">
            <div className="space-y-1">
              <div className="h-1.5 w-10 bg-slate-900" />
              <div className="h-1 w-12 bg-slate-300" />
              <div className="mt-2 h-2.5 w-9 rounded-sm bg-blue-600" />
            </div>
            <div className="h-16 rounded-sm border border-slate-200 bg-slate-50 p-1">
              <div className="h-1.5 bg-white" />
              <div className="mt-1 grid grid-cols-[18px_1fr_18px] gap-1">
                <div className="h-11 bg-blue-50" />
                <div className="h-11 bg-white" />
                <div className="h-11 bg-slate-100" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "hero") {
    if (preset.layout === "slide") {
      return (
        <div className="relative h-24 overflow-hidden rounded-md border border-slate-700 bg-blue-950 p-2">
          <div className="h-1.5 w-12 rounded bg-white/30" />
          <div className="mt-1 h-3 w-20 rounded bg-white/80" />
          <div className="mt-1 h-2.5 w-16 rounded bg-white/60" />
          <div className="mt-2 h-5 w-14 rounded bg-blue-500" />
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            <div className="size-1.5 rounded-full bg-white" />
            <div className="size-1.5 rounded-full bg-white/40" />
            <div className="size-1.5 rounded-full bg-white/40" />
          </div>
        </div>
      );
    }
    if (preset.layout === "cta-focus") {
      return (
        <div className="relative h-24 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
          <div className="h-1 w-10 rounded bg-blue-400" />
          <div className="mt-1 h-3 w-24 rounded bg-slate-900" />
          <div className="mt-1 h-2 w-20 rounded bg-slate-300" />
          <div className="mt-3 flex gap-1.5">
            <div className="h-6 w-16 rounded-md bg-blue-600" />
            <div className="h-6 w-14 rounded-md border border-slate-200 bg-white" />
          </div>
        </div>
      );
    }
    if (preset.layout === "split-visual") {
      return (
        <div className="relative h-24 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
          <div className="grid h-full grid-cols-[1fr_1fr] items-center gap-2">
            <div className="space-y-1">
              <div className="h-1 w-10 rounded bg-blue-400" />
              <div className="h-2.5 w-16 rounded bg-slate-900" />
              <div className="h-1 w-12 rounded bg-slate-300" />
              <div className="mt-1 h-4 w-10 rounded bg-blue-600" />
            </div>
            <div className="h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200" />
          </div>
        </div>
      );
    }
    if (preset.layout === "text-focus") {
      return (
        <div className="relative h-24 overflow-hidden rounded-md border border-slate-200 bg-gradient-to-b from-blue-50 to-white p-2">
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <div className="h-1 w-12 rounded bg-blue-400" />
            <div className="h-3 w-28 rounded bg-slate-900" />
            <div className="h-1.5 w-20 rounded bg-slate-300" />
            <div className="mt-2 h-5 w-14 rounded bg-blue-600" />
          </div>
        </div>
      );
    }
  }

  if (preset.type === "review") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        <div className="mx-auto mb-2 flex justify-center gap-1">
          <div className="h-1.5 w-12 rounded bg-slate-800" />
        </div>
        {preset.layout === "featured" ? (
          <div className="mx-auto w-4/5 rounded border border-slate-200 bg-slate-50 p-1.5">
            <div className="h-1 w-full rounded bg-slate-300" />
            <div className="mt-1 h-1 w-3/4 rounded bg-slate-200" />
            <div className="mt-2 flex items-center gap-1">
              <div className="size-3 rounded-full bg-blue-200" />
              <div className="h-1 w-8 rounded bg-slate-300" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded border border-slate-100 bg-slate-50 p-1">
                {preset.layout === "rating" && (
                  <div className="mb-0.5 flex gap-0.5">
                    {[0,1,2].map((s) => <div key={s} className="size-1 rounded-sm bg-amber-400" />)}
                  </div>
                )}
                <div className="h-1 w-full rounded bg-slate-300" />
                <div className="mt-1 h-1 w-3/4 rounded bg-slate-200" />
                <div className="mt-1.5 flex items-center gap-0.5">
                  <div className="size-2 rounded-full bg-blue-200" />
                  <div className="h-1 w-4 rounded bg-slate-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "stats") {
    return (
      <div className={cn("relative h-20 overflow-hidden rounded-md border p-2", preset.layout === "dark" ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white")}>
        <div className={cn("mx-auto mb-2 h-1.5 w-16 rounded", preset.layout === "dark" ? "bg-slate-400" : "bg-slate-800")} />
        {preset.layout === "bars" ? (
          <div className="space-y-1.5 px-1">
            {[70, 85, 55].map((w, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="h-1 w-6 rounded bg-slate-300" />
                <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {["98%", "500+", "3일", "24h"].map((v, i) => (
              <div key={i} className={cn("rounded p-1 text-center", preset.layout === "dark" ? "bg-slate-800" : "border border-slate-100 bg-slate-50")}>
                <div className={cn("text-[8px] font-bold leading-none", preset.layout === "dark" ? "text-blue-400" : "text-blue-600")}>{v}</div>
                <div className={cn("mt-0.5 h-0.5 rounded", preset.layout === "dark" ? "bg-slate-600" : "bg-slate-200")} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "pricing") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        <div className="mx-auto mb-1.5 h-1.5 w-16 rounded bg-slate-800" />
        <div className={cn("grid gap-1", preset.layout === "two-col" ? "grid-cols-2" : "grid-cols-3")}>
          {(preset.layout === "two-col" ? [0, 1] : [0, 1, 2]).map((i) => (
            <div key={i} className={cn("rounded p-1", i === 1 ? "bg-blue-600" : "border border-slate-100 bg-slate-50")}>
              <div className={cn("h-1 w-5 rounded", i === 1 ? "bg-blue-200" : "bg-slate-300")} />
              <div className={cn("mt-0.5 h-2 w-7 rounded text-[7px] font-bold leading-none", i === 1 ? "bg-blue-400" : "bg-slate-200")} />
              <div className={cn("mt-1 space-y-0.5")}>
                {[0, 1].map((j) => <div key={j} className={cn("h-0.5 w-full rounded", i === 1 ? "bg-blue-400" : "bg-slate-200")} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (preset.type === "faq") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        <div className="mx-auto mb-2 h-1.5 w-16 rounded bg-slate-800" />
        {preset.layout === "two-col" ? (
          <div className="grid grid-cols-2 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded border border-slate-100 bg-slate-50 p-1">
                <div className="h-1 w-full rounded bg-slate-700" />
                <div className="mt-0.5 h-1 w-3/4 rounded bg-slate-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="h-1 w-20 rounded bg-slate-700" />
                <div className="size-2 rounded-full border border-slate-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "team") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        <div className="mx-auto mb-2 h-1.5 w-16 rounded bg-slate-800" />
        {preset.layout === "list" ? (
          <div className="divide-y divide-slate-100">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1 py-1">
                <div className="size-4 shrink-0 rounded-full bg-blue-100" />
                <div className="space-y-0.5">
                  <div className="h-1 w-10 rounded bg-slate-700" />
                  <div className="h-0.5 w-7 rounded bg-slate-300" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded border border-slate-100 bg-slate-50 p-1 text-center">
                <div className="mx-auto size-4 rounded-full bg-blue-100" />
                <div className="mt-0.5 h-0.5 w-full rounded bg-slate-300" />
                <div className="mt-0.5 h-0.5 w-3/4 mx-auto rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "subhero") {
    return (
      <div className={cn(
        "relative h-20 overflow-hidden rounded-md border p-2",
        preset.layout === "image-bg"
          ? "border-slate-600 bg-slate-700"
          : "border-slate-200 bg-slate-50",
      )}>
        {preset.layout === "split" ? (
          <div className="flex h-full items-center justify-between gap-2">
            <div className="space-y-1">
              <div className={cn("h-2.5 w-20 rounded", preset.layout === "split" ? "bg-slate-800" : "bg-white/80")} />
              <div className="h-1 w-16 rounded bg-slate-300" />
            </div>
            <div className="space-y-1 text-right">
              <div className="h-1 w-10 rounded bg-slate-200" />
              <div className="h-1 w-8 rounded bg-slate-200" />
            </div>
          </div>
        ) : (
          <>
            {preset.layout === "image-bg" && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 opacity-60" />
            )}
            <div className="relative space-y-1.5">
              <div className="flex items-center gap-1">
                <div className="h-0.5 w-4 rounded bg-slate-400" />
                <div className="h-0.5 w-6 rounded bg-slate-400" />
                <div className="h-0.5 w-3 rounded bg-blue-400" />
              </div>
              <div className={cn("h-3 w-24 rounded", preset.layout === "image-bg" ? "bg-white/90" : "bg-slate-800")} />
              <div className={cn("h-1 w-20 rounded", preset.layout === "image-bg" ? "bg-white/50" : "bg-slate-300")} />
            </div>
          </>
        )}
      </div>
    );
  }

  if (preset.type === "breadcrumb") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        <div className="flex items-center gap-1">
          <div className="h-1 w-5 rounded bg-slate-400" />
          <div className="size-1.5 rotate-45 border-r border-t border-slate-300" />
          <div className="h-1 w-8 rounded bg-slate-400" />
          <div className="size-1.5 rotate-45 border-r border-t border-slate-300" />
          <div className="h-1 w-10 rounded bg-slate-700" />
        </div>
        {preset.layout === "with-title" && (
          <div className="mt-3 border-t border-slate-100 pt-2">
            <div className="h-3 w-28 rounded bg-slate-800" />
            <div className="mt-1 h-1.5 w-20 rounded bg-slate-200" />
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "vision") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
        {preset.layout === "split" ? (
          <div className="grid h-full grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-blue-50 p-1.5">
              <div className="mb-1 h-1.5 w-8 rounded bg-blue-400" />
              <div className="h-1 w-full rounded bg-blue-200" />
              <div className="mt-0.5 h-1 w-3/4 rounded bg-blue-200" />
            </div>
            <div className="rounded-lg bg-purple-50 p-1.5">
              <div className="mb-1 h-1.5 w-8 rounded bg-purple-400" />
              <div className="h-1 w-full rounded bg-purple-200" />
              <div className="mt-0.5 h-1 w-3/4 rounded bg-purple-200" />
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5">
            <div className="h-2 w-20 rounded bg-slate-700" />
            <div className="h-1 w-28 rounded bg-slate-300" />
            <div className="mt-1 flex gap-1.5">
              {[0,1,2].map((i) => <div key={i} className="h-6 w-12 rounded-lg border border-blue-100 bg-blue-50" />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "values") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "list" ? (
          <div className="space-y-1.5">
            {[0,1,2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="size-4 rounded-full bg-blue-100" />
                <div className="flex-1 space-y-0.5">
                  <div className="h-1.5 w-10 rounded bg-slate-600" />
                  <div className="h-1 w-16 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 rounded border border-slate-100 p-1">
                <div className="size-3 rounded-full bg-blue-100" />
                <div className="h-1 w-6 rounded bg-slate-600" />
                <div className="h-0.5 w-8 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "location") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "text-only" ? (
          <div className="grid grid-cols-2 gap-2">
            {[["주소", 14], ["교통", 10], ["전화", 10], ["이메일", 12]].map(([label, w], i) => (
              <div key={i} className="flex gap-1">
                <div className="mt-0.5 size-2 rounded-sm bg-blue-300" />
                <div>
                  <div className="h-1 w-4 rounded bg-slate-300" />
                  <div className={`mt-0.5 h-1 rounded bg-slate-600`} style={{ width: w }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <MapPin className="size-4 text-slate-400" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-12 rounded bg-slate-700" />
              {[0,1,2].map((i) => (
                <div key={i} className="flex gap-1 items-center">
                  <div className="size-1.5 rounded-sm bg-blue-300" />
                  <div className="h-1 flex-1 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "partners") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
        {preset.layout === "logo-strip" ? (
          <div className="flex h-full items-center justify-center gap-1.5">
            {[0,1,2,3,4].map((i) => (
              <div key={i} className="flex h-7 w-10 items-center justify-center rounded border border-slate-200 bg-white">
                <div className="h-1.5 w-6 rounded bg-slate-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="flex h-7 items-center justify-center rounded border border-slate-200 bg-white">
                <div className="h-1.5 w-8 rounded bg-slate-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "awards") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "list" ? (
          <div className="space-y-1.5">
            {[0,1,2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="size-5 rounded-full bg-yellow-100 flex items-center justify-center">
                  <div className="size-2.5 rounded-sm bg-yellow-400" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="h-1.5 w-16 rounded bg-slate-600" />
                  <div className="h-1 w-10 rounded bg-slate-200" />
                </div>
                <div className="h-2 w-6 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {[0,1,2,3].map((i) => (
              <div key={i} className="rounded border border-slate-100 p-1.5">
                <div className="mb-1 size-4 rounded-full bg-yellow-100" />
                <div className="h-1.5 w-10 rounded bg-slate-600" />
                <div className="mt-0.5 h-1 w-8 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "press") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "cards" ? (
          <div className="grid grid-cols-3 gap-1">
            {[0,1,2].map((i) => (
              <div key={i} className="overflow-hidden rounded border border-slate-100">
                <div className="h-6 bg-slate-100" />
                <div className="p-1">
                  <div className="h-1 w-5 rounded bg-blue-300" />
                  <div className="mt-0.5 h-1.5 w-full rounded bg-slate-600" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {[0,1,2].map((i) => (
              <div key={i} className="flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
                <div className="h-2 w-8 rounded bg-blue-200" />
                <div className="h-1.5 flex-1 rounded bg-slate-600" />
                <div className="h-1 w-8 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "photo-gallery") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-1.5">
        {preset.layout === "masonry" ? (
          <div className="flex gap-1 h-full">
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex-[2] rounded bg-slate-200" />
              <div className="flex-[1] rounded bg-slate-100" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex-[1] rounded bg-slate-100" />
              <div className="flex-[2] rounded bg-slate-200" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex-[1.5] rounded bg-slate-200" />
              <div className="flex-[1.5] rounded bg-slate-100" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 h-full">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="rounded bg-gradient-to-br from-slate-100 to-slate-200" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "jobs") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "cards" ? (
          <div className="grid grid-cols-2 gap-1.5">
            {[0,1,2,3].map((i) => (
              <div key={i} className="rounded border border-slate-100 p-1.5">
                <div className="flex justify-between">
                  <div className="h-1.5 w-10 rounded bg-slate-700" />
                  <div className="h-1.5 w-6 rounded bg-blue-200" />
                </div>
                <div className="mt-0.5 h-1 w-8 rounded bg-slate-300" />
                <div className="mt-1 flex gap-1">
                  <div className="h-1.5 w-8 rounded bg-slate-100" />
                  <div className="h-1.5 w-8 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {[0,1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-1.5 border-b border-slate-50 pb-1">
                <div className="size-3 rounded bg-slate-100" />
                <div className="flex-1">
                  <div className="h-1.5 w-14 rounded bg-slate-700" />
                  <div className="mt-0.5 h-1 w-10 rounded bg-slate-300" />
                </div>
                <div className="h-2 w-8 rounded bg-blue-100" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "downloads") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "cards" ? (
          <div className="grid grid-cols-2 gap-1.5">
            {[0,1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-1 rounded border border-slate-100 p-1.5">
                <div className="size-4 rounded bg-red-100 flex items-center justify-center shrink-0">
                  <div className="size-2 rounded-sm bg-red-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-1.5 w-full rounded bg-slate-600" />
                  <div className="mt-0.5 h-1 w-8 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {[0,1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-1.5 border-b border-slate-50 pb-1">
                <div className="size-4 rounded bg-red-100 shrink-0" />
                <div className="flex-1">
                  <div className="h-1.5 w-16 rounded bg-slate-600" />
                  <div className="mt-0.5 h-1 w-10 rounded bg-slate-200" />
                </div>
                <div className="h-3 w-10 rounded border border-slate-200" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "org-chart") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "grid" ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-5 w-14 rounded-lg border-2 border-blue-400 bg-white" />
            <div className="flex gap-2">
              {[0,1,2].map((i) => <div key={i} className="h-4 w-10 rounded border border-slate-300 bg-white" />)}
            </div>
            <div className="flex gap-1.5">
              {[0,1,2,3].map((i) => <div key={i} className="h-3 w-7 rounded bg-slate-100" />)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="h-5 w-14 rounded-lg border-2 border-blue-400 bg-white" />
            <div className="h-3 w-px bg-slate-300" />
            <div className="flex gap-3">
              {[0,1].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="h-4 w-12 rounded border border-slate-300 bg-white" />
                  <div className="h-2 w-px bg-slate-300" />
                  <div className="flex gap-1">
                    <div className="h-2.5 w-8 rounded bg-slate-100" />
                    <div className="h-2.5 w-8 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "history") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "zigzag" ? (
          <div className="space-y-1.5">
            {[0,1,2].map((i) => (
              <div key={i} className={cn("flex items-center gap-2", i % 2 === 1 && "flex-row-reverse")}>
                <div className="h-5 flex-1 rounded border border-slate-200 bg-white px-1.5">
                  <div className="mt-1 h-1 w-6 rounded bg-blue-400" />
                  <div className="mt-0.5 h-1 w-10 rounded bg-slate-300" />
                </div>
                <div className="size-3 shrink-0 rounded-full border-2 border-blue-500 bg-white" />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative pl-4">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-blue-200" />
            {[0,1,2,3].map((i) => (
              <div key={i} className="relative mb-1.5 last:mb-0">
                <div className="absolute -left-2.5 top-1 size-2 rounded-full border border-blue-500 bg-white" />
                <div className="rounded border border-slate-100 bg-white px-1.5 py-0.5">
                  <div className="h-1 w-4 rounded bg-blue-300" />
                  <div className="mt-0.5 h-1 w-10 rounded bg-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "board") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "gallery" ? (
          <div className="grid grid-cols-3 gap-1">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="h-7 rounded bg-gradient-to-br from-slate-100 to-slate-200" />
            ))}
          </div>
        ) : preset.layout === "news" ? (
          <div className="space-y-1.5">
            {[0,1,2].map((i) => (
              <div key={i} className="flex gap-1.5">
                <div className="size-7 shrink-0 rounded bg-slate-100" />
                <div className="flex-1 space-y-0.5">
                  <div className="h-1.5 w-full rounded bg-slate-700" />
                  <div className="h-1 w-3/4 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : preset.layout === "notice" ? (
          <div className="divide-y divide-slate-100">
            {[{ pin: true, title: "공지" }, { pin: true, title: "안내" }, { pin: false, title: "업데이트" }].map((item, i) => (
              <div key={i} className={cn("flex items-center gap-1 py-1", item.pin && "bg-blue-50/50")}>
                {item.pin && <div className="h-2 w-4 rounded bg-blue-200" />}
                <div className="h-1 flex-1 rounded bg-slate-600" />
                <div className="h-1 w-5 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          /* list */
          <div>
            <div className="mb-1 flex gap-2 border-b border-slate-100 pb-1">
              <div className="h-1 w-4 rounded bg-slate-300" />
              <div className="h-1 flex-1 rounded bg-slate-300" />
              <div className="h-1 w-6 rounded bg-slate-300" />
            </div>
            {[0,1,2].map((i) => (
              <div key={i} className="flex gap-2 py-1">
                <div className="h-1 w-4 rounded bg-slate-200" />
                <div className="h-1 flex-1 rounded bg-slate-600" />
                <div className="h-1 w-6 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "embed-form") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-white p-2">
        {preset.layout === "newsletter" ? (
          <div className="flex h-full flex-col justify-center gap-1.5">
            <div className="h-1.5 w-20 rounded bg-slate-700" />
            <div className="flex gap-1">
              <div className="h-5 flex-1 rounded border border-slate-200 bg-slate-50" />
              <div className="h-5 w-10 rounded bg-blue-600" />
            </div>
          </div>
        ) : preset.layout === "survey" ? (
          <div className="space-y-1.5">
            {[0,1,2].map((i) => (
              <div key={i}>
                <div className="mb-0.5 h-1 w-16 rounded bg-slate-600" />
                {i === 1 ? (
                  <div className="flex gap-1.5">
                    {[0,1,2,3].map((j) => (
                      <div key={j} className="flex items-center gap-0.5">
                        <div className="size-2 rounded-full border border-slate-300" />
                        <div className="h-0.5 w-4 rounded bg-slate-200" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-3 w-full rounded border border-slate-100 bg-slate-50" />
                )}
              </div>
            ))}
          </div>
        ) : (
          /* contact / consult */
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1">
              <div className="h-4 rounded border border-slate-100 bg-slate-50" />
              <div className="h-4 rounded border border-slate-100 bg-slate-50" />
            </div>
            <div className="h-6 w-full rounded border border-slate-100 bg-slate-50" />
            <div className="h-4 w-full rounded bg-blue-600" />
          </div>
        )}
      </div>
    );
  }

  if (preset.type === "cta" && preset.layout === "newsletter") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-2">
        <div className="mb-1.5 h-2 w-20 rounded bg-slate-800" />
        <div className="h-1 w-16 rounded bg-slate-300" />
        <div className="mt-3 flex gap-1">
          <div className="h-4 flex-1 rounded border border-slate-200 bg-white" />
          <div className="h-4 w-12 rounded bg-blue-600" />
        </div>
      </div>
    );
  }

  if (preset.type === "cta" && preset.layout === "dark") {
    return (
      <div className="relative h-20 overflow-hidden rounded-md border border-slate-700 bg-slate-900 p-2">
        <div className="mb-1.5 h-2 w-20 rounded bg-white/80" />
        <div className="h-1 w-16 rounded bg-slate-500" />
        <div className="mt-3 h-5 w-16 rounded bg-blue-500" />
      </div>
    );
  }

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

function ShowcaseHeroVisual({
  imageUrl,
  layout,
}: {
  imageUrl: string;
  layout: string;
}) {
  const sitePreview = (tone: "blue" | "green" | "warm" = "blue") => (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-200 bg-white",
        tone === "green" && "bg-emerald-950 text-white",
        tone === "warm" && "bg-amber-100",
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="absolute inset-0 h-full w-full object-cover" src={imageUrl} />
      ) : null}
      <div className="relative z-10 flex h-7 items-center justify-between border-b border-current/10 px-3">
        <span className="text-[7px] font-black">STUDIO KEYUN</span>
        <span className="h-1 w-12 rounded bg-current/25" />
      </div>
      <div className="relative z-10 p-4">
        <div className="h-1.5 w-14 rounded bg-blue-500/80" />
        <div className="mt-3 h-3 w-28 rounded-sm bg-current/85" />
        <div className="mt-1.5 h-3 w-20 rounded-sm bg-current/85" />
        <div className="mt-3 h-1.5 w-24 rounded bg-current/20" />
        <div className="mt-4 h-5 w-16 rounded bg-slate-950" />
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
        <div className="grid min-h-64 grid-cols-[90px_1fr_100px] gap-2">
          <div className="space-y-2 bg-slate-50 p-2">
            {["히어로", "서비스", "포트폴리오", "후기"].map((item, index) => (
              <div
                className={cn(
                  "rounded border bg-white px-2 py-2 text-[8px]",
                  index === 0 && "border-blue-400 text-blue-600",
                )}
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
          {sitePreview("warm")}
          <div className="space-y-3 bg-slate-50 p-2">
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
      <div className="grid min-h-72 grid-cols-[1.15fr_0.55fr] gap-3">
        <div className="translate-y-6">{sitePreview("green")}</div>
        <div className="space-y-3">
          <div className="h-44">{sitePreview("warm")}</div>
          <div className="h-28">{sitePreview("blue")}</div>
        </div>
      </div>
    );
  }

  if (layout === "modular-assembly") {
    return (
      <div className="grid min-h-72 grid-cols-[0.9fr_1.15fr] items-center gap-4">
        <div className="space-y-2">
          {["히어로", "서비스", "가격", "후기", "문의"].map((item, index) => (
            <div
              className="flex h-11 items-center justify-between rounded-md border border-blue-200 bg-white px-3"
              key={item}
              style={{ transform: `translateX(${index * 5}px)` }}
            >
              <span className="text-[9px] font-bold">{item}</span>
              <ArrowRight className="size-3 text-blue-500" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="h-24 bg-amber-50 p-3">
            <div className="h-2 w-20 bg-slate-800" />
            <div className="mt-2 h-1.5 w-24 bg-slate-300" />
          </div>
          <div className="mt-1 grid grid-cols-3 gap-1 bg-blue-50 p-3">
            <div className="h-10 bg-white" />
            <div className="h-10 bg-white" />
            <div className="h-10 bg-white" />
          </div>
          <div className="mt-1 grid grid-cols-3 gap-1 bg-emerald-50 p-3">
            <div className="h-12 bg-white" />
            <div className="h-12 bg-white" />
            <div className="h-12 bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "editorial-contrast") {
    return (
      <div className="grid min-h-72 grid-cols-[42px_1fr] gap-4">
        <div className="flex flex-col items-center justify-around rounded-lg bg-slate-950 py-4 text-[8px] font-bold text-white">
          <span>01</span>
          <span className="-rotate-90 whitespace-nowrap">업종 선택</span>
          <span>02</span>
          <span className="-rotate-90 whitespace-nowrap">바로 게시</span>
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-40">{sitePreview("warm")}</div>
          <div className="absolute bottom-0 left-10 right-4 h-36">{sitePreview("green")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-72 pt-6">
      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="mb-2 flex h-6 items-center justify-between border-b px-2 text-[8px] font-bold">
          <span>KEYUN</span>
          <span className="text-blue-600">게시하기</span>
        </div>
        <div className="grid grid-cols-[80px_1fr_90px] gap-2">
          <div className="space-y-2 bg-slate-50 p-2">
            {[0, 1, 2, 3].map((item) => (
              <div className="h-8 rounded border bg-white" key={item} />
            ))}
          </div>
          {sitePreview("blue")}
          <div className="space-y-2 bg-slate-50 p-2">
            <div className="h-3 w-12 bg-blue-100" />
            <div className="h-10 border bg-white" />
            <div className="h-14 border bg-white" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-2 h-36 w-24 border-4 border-slate-900 bg-white p-1">
        {sitePreview("blue")}
      </div>
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
  animationClass,
  children,
  className,
  label,
  onContextMenu,
  onSelect,
}: {
  active?: boolean;
  animationClass?: string;
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
        animationClass,
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
  animationClass,
  className,
  emptyClassName,
  imageUrl,
  onContextMenu,
  onUpload,
  onSelect,
}: {
  active?: boolean;
  animationClass?: string;
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
        animationClass,
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
  animationPreview: {
    element: Exclude<SelectedElement, "site">;
    token: number;
  } | null;
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
  requestContentBlockUpload: (sectionIndex: number, blockIndex: number) => void;
  addContentBlock: (sectionIndex: number) => void;
  updateContentBlock: (sectionIndex: number, blockIndex: number, key: keyof ContentBlock, value: string) => void;
  removeContentBlock: (sectionIndex: number, blockIndex: number) => void;
  toggleContentBlockLayout: (sectionIndex: number, blockIndex: number) => void;
  removeSection: (index: number) => void;
  selectedSlideIndex: number;
  section: EditorSection;
  selectedElement: SelectedElement;
  selectElement: (index: number, element: SelectedElement) => void;
  selectSection: (index: number) => void;
  selectSlide: (index: number) => void;
  updateField: (index: number, key: string, value: string) => void;
  updateItems: (index: number, value: string) => void;
  updateSlideField: (
    sectionIndex: number,
    slideIndex: number,
    key: keyof HeroSlide,
    value: string,
  ) => void;
  viewport: EditorViewport;
};

function ShowcaseHeroCopy({
  activeElement,
  align,
  buttonAlign,
  design,
  index,
  onContextMenu,
  onSelect,
  previewAnimationClass,
  section,
  updateField,
}: {
  activeElement: (element: SelectedElement) => boolean;
  align: AlignmentValue;
  buttonAlign: AlignmentValue;
  design: DesignSettings;
  index: number;
  onContextMenu: (
    event: ReactMouseEvent,
    index: number,
    element: SelectedElement,
  ) => void;
  onSelect: (element: SelectedElement) => void;
  previewAnimationClass: (element: Exclude<SelectedElement, "site">) => string;
  section: EditorSection;
  updateField: (index: number, key: string, value: string) => void;
}) {
  return (
    <div className={cn("max-w-2xl", alignmentPositionClass(align), alignmentTextClass(align))}>
      <InlineEditFrame
        active={activeElement("badge")}
        animationClass={previewAnimationClass("badge")}
        className="inline-block"
        label="배지 바로 수정"
        onContextMenu={(event) => onContextMenu(event, index, "badge")}
        onSelect={() => onSelect("badge")}
      >
        <Input
          className="h-7 w-auto rounded-full border-blue-100 bg-blue-50 px-3 text-[10px] font-bold text-blue-600"
          value={stringValue(section, "badge")}
          onChange={(event) => updateField(index, "badge", event.target.value)}
        />
      </InlineEditFrame>
      <InlineEditFrame
        active={activeElement("title")}
        animationClass={previewAnimationClass("title")}
        className="mt-5"
        label="제목 바로 수정"
        onContextMenu={(event) => onContextMenu(event, index, "title")}
        onSelect={() => onSelect("title")}
      >
        <Textarea
          className="min-h-24 resize-none border-0 bg-transparent p-0 text-4xl font-black leading-[1.08] tracking-normal shadow-none focus-visible:ring-0 lg:text-5xl"
          style={titleTextStyle(section, design)}
          value={stringValue(section, "title")}
          onChange={(event) => updateField(index, "title", event.target.value)}
        />
      </InlineEditFrame>
      <InlineEditFrame
        active={activeElement("description")}
        animationClass={previewAnimationClass("description")}
        className="mt-4"
        label="설명 바로 수정"
        onContextMenu={(event) => onContextMenu(event, index, "description")}
        onSelect={() => onSelect("description")}
      >
        <Textarea
          className="min-h-12 resize-none border-0 bg-transparent p-0 text-base font-medium text-slate-500 shadow-none focus-visible:ring-0"
          style={descriptionTextStyle(section, design)}
          value={stringValue(section, "description")}
          onChange={(event) => updateField(index, "description", event.target.value)}
        />
      </InlineEditFrame>
      <div className={cn("mt-7 flex flex-wrap gap-3", alignmentJustifyClass(buttonAlign))}>
        <InlineEditFrame
          active={activeElement("button")}
          animationClass={previewAnimationClass("button")}
          label="버튼 문구 수정"
          onContextMenu={(event) => onContextMenu(event, index, "button")}
          onSelect={() => onSelect("button")}
        >
          <Input
            className="h-11 w-44 rounded-lg border-0 px-4 text-center text-sm font-semibold text-white"
            style={buttonStyle(section, design)}
            value={stringValue(section, "buttonLabel")}
            onChange={(event) => updateField(index, "buttonLabel", event.target.value)}
          />
        </InlineEditFrame>
        <InlineEditFrame
          active={activeElement("secondaryButton")}
          animationClass={previewAnimationClass("secondaryButton")}
          label="보조 버튼 수정"
          onContextMenu={(event) => onContextMenu(event, index, "secondaryButton")}
          onSelect={() => onSelect("secondaryButton")}
        >
          <Input
            className="h-11 w-40 rounded-lg border border-slate-200 bg-white px-4 text-center text-sm font-semibold"
            value={stringValue(section, "secondaryButtonLabel")}
            onChange={(event) =>
              updateField(index, "secondaryButtonLabel", event.target.value)
            }
          />
        </InlineEditFrame>
      </div>
    </div>
  );
}

function CanvasSection({
  animationPreview,
  design,
  index,
  isSelected,
  moveSection,
  openContextMenu,
  requestVisualUpload,
  requestContentBlockUpload,
  addContentBlock,
  updateContentBlock,
  removeContentBlock,
  toggleContentBlockLayout,
  removeSection,
  selectedSlideIndex,
  section,
  selectedElement,
  selectElement,
  selectSection,
  selectSlide,
  updateField,
  updateItems,
  updateSlideField,
  viewport,
}: CanvasSectionProps) {
  const heroSwiperRef = useRef<SwiperInstance | null>(null);
  const type = stringValue(section, "type", "content");
  const layout = stringValue(section, "layout");
  const align = alignmentValue(section, "align");
  const buttonAlign = alignmentValue(section, "buttonAlign", align);
  const backgroundType = stringValue(section, "backgroundType", "gradient");
  const imageUrl = stringValue(section, "imageUrl");
  const items = itemList(section);
  const slides = layout === "slide" ? heroSlides(section) : [];
  const mediaPosition = sectionMediaPosition(section);
  const videoUrl = stringValue(section, "videoUrl");
  const isShowcaseHero = type === "hero" && showcaseHeroLayouts.has(layout);
  useEffect(() => {
    if (layout !== "slide" || !heroSwiperRef.current) return;
    if (heroSwiperRef.current.realIndex === selectedSlideIndex) return;

    heroSwiperRef.current.slideToLoop(selectedSlideIndex);
  }, [layout, selectedSlideIndex]);
  const previewAnimationClass = (element: Exclude<SelectedElement, "site">) => {
    if (!animationPreview || animationPreview.element !== element) return "";

    const effect = animationValue(section, element);
    if (effect === "none") return "";

    return `keyun-animation-preview-${effect}-${animationPreview.token % 2 ? "a" : "b"}`;
  };
  const alignClass = alignmentTextClass(align);
  const sectionStyle = {
    ...sectionBackground(section, design),
    ...sectionEffectStyle(section),
    "--keyun-overlay-color": stringValue(section, "overlayColor", "#000000"),
    "--keyun-overlay-opacity": stringValue(section, "overlayOpacity", "0.3"),
    borderRadius: `${stringValue(section, "radius", "24")}px`,
    color: design.textColor,
    paddingBottom:
      layout === "slide"
        ? "0px"
        : `${responsivePaddingValue(section, "paddingBottom", viewport, "96")}px`,
    paddingTop:
      layout === "slide"
        ? "0px"
        : `${responsivePaddingValue(section, "paddingTop", viewport, "96")}px`,
  } as CSSProperties;
  const cardStyle = childCardStyle(section);
  const activeElement = (element: SelectedElement) => isSelected && selectedElement === element;
  const selectElementForSection = (element: SelectedElement) => {
    selectElement(index, element);
  };

  return (
    <section
      className={cn(
        "group relative overflow-hidden border transition-all",
        (layout === "slide" || ["image", "video"].includes(backgroundType)) &&
          "keyun-bg-overlay",
        previewAnimationClass("section"),
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
          "relative z-10 mx-auto w-full",
          layout === "slide" ? "max-w-none px-0" : "px-10",
          layout !== "slide" &&
            widthClass(stringValue(section, "width", design.innerWidth)),
        )}
      >
        {type === "hero" && layout === "slide" ? (
          <Swiper
            key={`editor-slider-${stringValue(section, "builderId")}`}
            a11y={{ enabled: true }}
            autoplay={{
              delay: numberValue(section, "autoplayDelay", 4500),
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            className={cn(
              "keyun-hero-swiper",
              `keyun-pagination-${stringValue(section, "paginationStyle", "circle")}`,
            )}
            initialSlide={Math.min(selectedSlideIndex, Math.max(slides.length - 1, 0))}
            loop={slides.length > 1}
            modules={[A11y, Autoplay, Pagination]}
            pagination={{
              clickable: true,
              renderBullet: (bulletIndex, className) =>
                `<span class="${className}">${
                  stringValue(section, "paginationStyle", "circle") === "numeric"
                    ? bulletIndex + 1
                    : ""
                }</span>`,
            }}
            onAutoplayTimeLeft={(swiper, _time, progress) => {
              swiper.el.style.setProperty(
                "--keyun-progress",
                `${Math.max(0, Math.min(100, (1 - progress) * 100))}%`,
              );
            }}
            onRealIndexChange={(swiper) => selectSlide(swiper.realIndex)}
            onSwiper={(swiper) => {
              heroSwiperRef.current = swiper;
            }}
          >
            {slides.map((slide, slideIndex) => {
              const slideAlign = align;
              const slideBackground =
                slide.backgroundType === "image" && slide.imageUrl
                  ? {
                      backgroundImage: `url(${slide.imageUrl})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }
                  : { backgroundColor: slide.bgColor };

              return (
                <SwiperSlide key={slide.id}>
                  <div className="keyun-slide-overlay min-h-[620px]" style={slideBackground}>
                    <div className="relative z-[2] mx-auto flex min-h-[620px] w-full max-w-[1440px] items-center px-10 py-24">
                      <div
                        className={cn(
                          "w-full",
                          alignmentTextClass(slideAlign),
                        )}
                      >
                        <InlineEditFrame
                          active={activeElement("badge")}
                          animationClass={previewAnimationClass("badge")}
                          className={cn(
                            "inline-block",
                            alignmentPositionClass(slideAlign),
                          )}
                          label="배지 바로 수정"
                          onContextMenu={(event) => openContextMenu(event, index, "badge")}
                          onSelect={() => selectElementForSection("badge")}
                        >
                          <Input
                            className="h-8 w-auto rounded-full border-white/20 bg-white/10 px-4 text-xs font-semibold text-white"
                            value={slide.badge}
                            onChange={(event) =>
                              updateSlideField(index, slideIndex, "badge", event.target.value)
                            }
                          />
                        </InlineEditFrame>
                        <InlineEditFrame
                          active={activeElement("title")}
                          animationClass={previewAnimationClass("title")}
                          className={cn(
                            "mt-7 max-w-4xl",
                            alignmentPositionClass(slideAlign),
                          )}
                          label="제목 바로 수정"
                          onContextMenu={(event) => openContextMenu(event, index, "title")}
                          onSelect={() => selectElementForSection("title")}
                        >
                          <Textarea
                            className="min-h-32 resize-none border-0 bg-transparent p-0 text-5xl font-black leading-[1.08] text-white shadow-none focus-visible:ring-0"
                            style={{
                              ...titleTextStyle(section, design),
                              color: stringValue(section, "titleColor", "#ffffff"),
                            }}
                            value={slide.title}
                            onChange={(event) =>
                              updateSlideField(index, slideIndex, "title", event.target.value)
                            }
                          />
                        </InlineEditFrame>
                        <InlineEditFrame
                          active={activeElement("description")}
                          animationClass={previewAnimationClass("description")}
                          className={cn(
                            "mt-5 max-w-2xl",
                            alignmentPositionClass(slideAlign),
                          )}
                          label="설명 바로 수정"
                          onContextMenu={(event) =>
                            openContextMenu(event, index, "description")
                          }
                          onSelect={() => selectElementForSection("description")}
                        >
                          <Textarea
                            className="min-h-16 resize-none border-0 bg-transparent p-0 text-base leading-7 text-white/80 shadow-none focus-visible:ring-0"
                            style={{
                              ...descriptionTextStyle(section, design),
                              color: stringValue(
                                section,
                                "descriptionColor",
                                "#ffffff",
                              ),
                            }}
                            value={slide.description}
                            onChange={(event) =>
                              updateSlideField(
                                index,
                                slideIndex,
                                "description",
                                event.target.value,
                              )
                            }
                          />
                        </InlineEditFrame>
                        <div
                          className={cn(
                            "mt-8 flex flex-wrap items-center gap-3",
                            alignmentJustifyClass(slideAlign),
                          )}
                        >
                          <InlineEditFrame
                            active={activeElement("button")}
                            animationClass={previewAnimationClass("button")}
                            label="버튼 문구 수정"
                            onContextMenu={(event) =>
                              openContextMenu(event, index, "button")
                            }
                            onSelect={() => selectElementForSection("button")}
                          >
                            <Input
                              className="h-12 w-44 border-0 px-5 text-center text-sm font-semibold text-white"
                              style={buttonStyle(section, design)}
                              value={slide.buttonLabel}
                              onChange={(event) =>
                                updateSlideField(
                                  index,
                                  slideIndex,
                                  "buttonLabel",
                                  event.target.value,
                                )
                              }
                            />
                          </InlineEditFrame>
                          <InlineEditFrame
                            active={activeElement("secondaryButton")}
                            animationClass={previewAnimationClass("secondaryButton")}
                            label="보조 버튼 수정"
                            onContextMenu={(event) =>
                              openContextMenu(event, index, "secondaryButton")
                            }
                            onSelect={() => selectElementForSection("secondaryButton")}
                          >
                            <Input
                              className="h-12 w-40 border border-white/30 bg-white/10 text-center text-sm font-semibold text-white"
                              value={slide.secondaryButtonLabel}
                              onChange={(event) =>
                                updateSlideField(
                                  index,
                                  slideIndex,
                                  "secondaryButtonLabel",
                                  event.target.value,
                                )
                              }
                            />
                          </InlineEditFrame>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
            <button
              aria-label="이전 슬라이드"
              className={cn(
                "keyun-slider-arrow keyun-slider-arrow-prev",
                stringValue(section, "arrowStyle", "simple") === "circle" &&
                  "keyun-slider-arrow-circle",
              )}
              style={{
                "--keyun-arrow-bg": stringValue(section, "arrowBgColor", "#0f172a"),
                "--keyun-arrow-color": stringValue(section, "arrowColor", "#ffffff"),
                "--keyun-arrow-icon-size": `${stringValue(section, "arrowSize", "24")}px`,
                "--keyun-arrow-size": `${stringValue(section, "arrowButtonSize", "48")}px`,
              } as CSSProperties}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                heroSwiperRef.current?.slidePrev();
              }}
            >
              {stringValue(section, "arrowStyle", "simple") === "image" &&
              stringValue(section, "arrowImageUrl") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" src={stringValue(section, "arrowImageUrl")} />
              ) : (
                <ArrowLeft />
              )}
            </button>
            <button
              aria-label="다음 슬라이드"
              className={cn(
                "keyun-slider-arrow keyun-slider-arrow-next",
                stringValue(section, "arrowStyle", "simple") === "circle" &&
                  "keyun-slider-arrow-circle",
              )}
              style={{
                "--keyun-arrow-bg": stringValue(section, "arrowBgColor", "#0f172a"),
                "--keyun-arrow-color": stringValue(section, "arrowColor", "#ffffff"),
                "--keyun-arrow-icon-size": `${stringValue(section, "arrowSize", "24")}px`,
                "--keyun-arrow-size": `${stringValue(section, "arrowButtonSize", "48")}px`,
              } as CSSProperties}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                heroSwiperRef.current?.slideNext();
              }}
            >
              {stringValue(section, "arrowStyle", "simple") === "image" &&
              stringValue(section, "arrowImageUrl") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" src={stringValue(section, "arrowImageUrl")} />
              ) : (
                <ArrowRight />
              )}
            </button>
          </Swiper>
        ) : null}

        {isShowcaseHero ? (
          <div
            className={cn(
              layout === "centered-showcase"
                ? "space-y-10"
                : layout === "editorial-contrast"
                  ? "grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]"
                  : "grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]",
            )}
          >
            <div className={cn(layout === "centered-showcase" && "mx-auto text-center")}>
              <ShowcaseHeroCopy
                activeElement={activeElement}
                align={layout === "centered-showcase" ? "center" : align}
                buttonAlign={layout === "centered-showcase" ? "center" : buttonAlign}
                design={design}
                index={index}
                onContextMenu={openContextMenu}
                onSelect={selectElementForSection}
                previewAnimationClass={previewAnimationClass}
                section={section}
                updateField={updateField}
              />
            </div>
            <button
              className={cn(
                "group/visual relative block w-full text-left outline outline-0 outline-offset-4 outline-blue-500/0 transition hover:outline-2 hover:outline-blue-400/40",
                activeElement("visual") && "outline-2 outline-blue-500/70",
                previewAnimationClass("visual"),
                layout === "centered-showcase" && "mx-auto max-w-5xl",
              )}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                selectElementForSection("visual");
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                requestVisualUpload(index);
              }}
              onContextMenu={(event) => openContextMenu(event, index, "visual")}
            >
              <ShowcaseHeroVisual imageUrl={imageUrl} layout={layout} />
              <span className="absolute right-3 top-3 rounded-md bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 transition group-hover/visual:opacity-100">
                이미지 설정
              </span>
            </button>
          </div>
        ) : null}

        {type === "hero" && !isShowcaseHero && layout !== "slide" ? (
          <div
            className={cn(
              "grid items-center gap-10",
              layout === "text-focus" || layout === "cta-focus"
                ? cn("max-w-3xl grid-cols-1", alignmentPositionClass(align))
                : "lg:grid-cols-[0.95fr_1.05fr]",
              alignClass,
            )}
          >
            <div
              className={cn(
                alignmentPositionClass(align),
                "max-w-2xl",
                mediaPosition === "left" && layout !== "text-focus" && layout !== "cta-focus"
                  ? "lg:order-2"
                  : "lg:order-1",
              )}
            >
              <InlineEditFrame
                active={activeElement("badge")}
                animationClass={previewAnimationClass("badge")}
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
                animationClass={previewAnimationClass("title")}
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
                animationClass={previewAnimationClass("description")}
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
                  alignmentJustifyClass(buttonAlign),
                )}
              >
                <InlineEditFrame
                  active={activeElement("button")}
                  animationClass={previewAnimationClass("button")}
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
                    animationClass={previewAnimationClass("secondaryButton")}
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
                  animationClass={previewAnimationClass("visual")}
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
          <div
            className={cn(
              "max-w-4xl",
              alignmentPositionClass(align),
              alignClass,
            )}
          >
            <InlineEditFrame
              active={activeElement("badge")}
              animationClass={previewAnimationClass("badge")}
              className={cn("w-fit", alignmentPositionClass(align))}
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
              animationClass={previewAnimationClass("title")}
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
              animationClass={previewAnimationClass("description")}
              className={cn(
                "mt-3 max-w-2xl",
                alignmentPositionClass(align),
              )}
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
          <div className="space-y-16">
            {contentBlocks(section).map((block, blockIndex) => (
              <div key={blockIndex} className="group/block relative">
                {/* 블록 툴바 */}
                <div className="absolute -top-8 right-0 flex items-center gap-1 opacity-0 transition-opacity group-hover/block:opacity-100">
                  <button
                    className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                    title="이미지 좌/우 전환"
                    type="button"
                    onClick={() => toggleContentBlockLayout(index, blockIndex)}
                  >
                    <ArrowLeft className="size-3" />
                    <ArrowRight className="size-3" />
                    {block.mediaPosition === "left" ? "이미지 왼쪽" : "이미지 오른쪽"}
                  </button>
                  {contentBlocks(section).length > 1 && (
                    <button
                      className="rounded border border-red-100 bg-white p-1 text-red-400 shadow-sm hover:bg-red-50"
                      title="블록 삭제"
                      type="button"
                      onClick={() => removeContentBlock(index, blockIndex)}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>

                <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
                  {/* 이미지 */}
                  <VisualEditable
                    active={false}
                    animationClass=""
                    className={cn(
                      "aspect-video border border-blue-100 bg-white/60",
                      block.mediaPosition === "right" ? "lg:order-2" : "lg:order-1",
                    )}
                    emptyClassName="min-h-full rounded-none border-0 shadow-none"
                    imageUrl={block.imageUrl}
                    onContextMenu={(event) => openContextMenu(event, index, "visual")}
                    onUpload={() => requestContentBlockUpload(index, blockIndex)}
                    onSelect={() => selectElementForSection("visual")}
                  />
                  {/* 텍스트 */}
                  <div className={cn(alignClass, block.mediaPosition === "right" ? "lg:order-1" : "lg:order-2")}>
                    <Input
                      className="h-8 w-32 rounded-full border-blue-100 bg-white/70 text-xs font-semibold text-blue-600"
                      placeholder="배지"
                      value={block.badge}
                      onChange={(e) => updateContentBlock(index, blockIndex, "badge", e.target.value)}
                    />
                    <Input
                      className="mt-5 h-auto border-0 bg-transparent p-0 text-3xl font-bold shadow-none focus-visible:ring-0"
                      placeholder="제목을 입력하세요"
                      style={titleTextStyle(section, design)}
                      value={block.title}
                      onChange={(e) => updateContentBlock(index, blockIndex, "title", e.target.value)}
                    />
                    <Textarea
                      className="mt-4 min-h-24 resize-none border-0 bg-transparent p-0 text-sm leading-7 text-slate-600 shadow-none focus-visible:ring-0"
                      placeholder="설명을 입력하세요"
                      style={descriptionTextStyle(section, design)}
                      value={block.description}
                      onChange={(e) => updateContentBlock(index, blockIndex, "description", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* 영역 추가 버튼 */}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ borderColor: design.textColor, color: design.textColor, opacity: 0.35 }}
              type="button"
              onClick={() => addContentBlock(index)}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.35")}
            >
              <Plus className="size-4" />
              영역 추가
            </button>
          </div>
        ) : null}

        {type === "cta" ? (
          <div
            className={cn(
              "max-w-4xl",
              alignmentPositionClass(align),
              alignClass,
            )}
          >
            <InlineEditFrame
              active={activeElement("title")}
              animationClass={previewAnimationClass("title")}
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
              animationClass={previewAnimationClass("description")}
              className={cn(
                "mt-4 max-w-2xl",
                alignmentPositionClass(align),
              )}
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
            {layout === "newsletter" ? (
              <div className={cn("mt-7 flex gap-3", alignmentJustifyClass(align))}>
                <input
                  className="h-12 w-64 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none"
                  placeholder="이메일 주소를 입력하세요"
                  type="email"
                />
                <div
                  className="flex h-12 cursor-pointer items-center rounded-lg px-6 text-sm font-semibold text-white"
                  style={buttonStyle(section, design)}
                >
                  {stringValue(section, "buttonLabel", "구독하기")}
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "mt-7 flex",
                  alignmentJustifyClass(buttonAlign),
                )}
              >
                <InlineEditFrame
                  active={activeElement("button")}
                  animationClass={previewAnimationClass("button")}
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
            )}
          </div>
        ) : null}

        {type === "review" ? (
          <div className="w-full">
            <div className={cn("mb-10", alignClass, alignmentPositionClass(align))}>
              <span className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {stringValue(section, "badge", "고객 후기")}
              </span>
              <InlineEditFrame
                active={activeElement("title")}
                animationClass={previewAnimationClass("title")}
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
              <Textarea
                className="mt-3 min-h-0 resize-none border-0 bg-transparent p-0 text-sm leading-7 text-slate-500 shadow-none focus-visible:ring-0"
                style={descriptionTextStyle(section, design)}
                value={stringValue(section, "description")}
                onChange={(event) => updateField(index, "description", event.target.value)}
              />
            </div>
            {layout === "featured" ? (
              <div className="mx-auto max-w-2xl rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
                {items[0] ? (() => {
                  const [name, role, quote] = items[0].split("|");
                  return (
                    <>
                      <p className="text-lg leading-8 text-slate-700">&ldquo;{quote}&rdquo;</p>
                      <div className="mt-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          {name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{name}</p>
                          <p className="text-xs text-slate-500">{role}</p>
                        </div>
                      </div>
                    </>
                  );
                })() : null}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, i) => {
                  const [name, role, quote] = item.split("|");
                  return (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6">
                      {layout === "rating" && (
                        <div className="mb-3 flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      )}
                      <p className="text-sm leading-7 text-slate-600">&ldquo;{quote}&rdquo;</p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                          {name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{name}</p>
                          <p className="text-xs text-slate-400">{role}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {type === "stats" ? (
          <div className="w-full">
            <div className={cn("mb-10", alignClass, alignmentPositionClass(align))}>
              <span className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {stringValue(section, "badge", "주요 지표")}
              </span>
              <InlineEditFrame
                active={activeElement("title")}
                animationClass={previewAnimationClass("title")}
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
            </div>
            {layout === "bars" ? (
              <div className="mx-auto max-w-2xl space-y-6">
                {items.map((item, i) => {
                  const [value, label] = item.split("|");
                  const pct = parseInt(value) || 80;
                  return (
                    <div key={i}>
                      <div className="mb-2 flex justify-between text-sm font-medium">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item, i) => {
                  const [value, label] = item.split("|");
                  return (
                    <div key={i} className={cn("rounded-2xl p-6 text-center", layout === "dark" ? "bg-slate-800 text-white" : "border border-slate-100 bg-white")}>
                      <p className={cn("text-4xl font-bold", layout === "dark" ? "text-white" : "text-blue-600")}>{value}</p>
                      <p className={cn("mt-2 text-sm", layout === "dark" ? "text-slate-300" : "text-slate-500")}>{label}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {type === "pricing" ? (
          <div className="w-full">
            <div className={cn("mb-10", alignClass, alignmentPositionClass(align))}>
              <span className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {stringValue(section, "badge", "요금제")}
              </span>
              <InlineEditFrame
                active={activeElement("title")}
                animationClass={previewAnimationClass("title")}
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
              <Textarea
                className="mt-3 min-h-0 resize-none border-0 bg-transparent p-0 text-sm leading-7 text-slate-500 shadow-none focus-visible:ring-0"
                style={descriptionTextStyle(section, design)}
                value={stringValue(section, "description")}
                onChange={(event) => updateField(index, "description", event.target.value)}
              />
            </div>
            <div className={cn("grid gap-6", layout === "two-col" ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
              {items.map((item, i) => {
                const [name, price, features, support] = item.split("|");
                const featureList = (features ?? "").split("\n").filter(Boolean);
                const isHighlighted = i === 1;
                return (
                  <div
                    key={i}
                    className={cn(
                      "rounded-2xl p-6",
                      isHighlighted
                        ? "bg-blue-600 text-white"
                        : "border border-slate-100 bg-white",
                    )}
                  >
                    <p className={cn("text-sm font-semibold", isHighlighted ? "text-blue-100" : "text-slate-500")}>{name}</p>
                    <p className={cn("mt-2 text-3xl font-bold", isHighlighted ? "text-white" : "text-slate-900")}>{price}</p>
                    <ul className="mt-6 space-y-3">
                      {featureList.map((f, j) => (
                        <li key={j} className={cn("flex items-center gap-2 text-sm", isHighlighted ? "text-blue-100" : "text-slate-600")}>
                          <Check className="size-4 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {support && (
                      <p className={cn("mt-4 text-xs", isHighlighted ? "text-blue-200" : "text-slate-400")}>{support}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {type === "faq" ? (
          <div className="w-full">
            <div className={cn("mb-10", alignClass, alignmentPositionClass(align))}>
              <span className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {stringValue(section, "badge", "자주 묻는 질문")}
              </span>
              <InlineEditFrame
                active={activeElement("title")}
                animationClass={previewAnimationClass("title")}
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
            </div>
            {layout === "two-col" ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {items.map((item, i) => {
                  const [q, a] = item.split("|");
                  return (
                    <div key={i} className="rounded-xl border border-slate-100 bg-white p-5">
                      <p className="text-sm font-semibold text-slate-800">{q}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{a}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mx-auto max-w-2xl divide-y divide-slate-100">
                {items.map((item, i) => {
                  const [q, a] = item.split("|");
                  return (
                    <div key={i} className="py-4">
                      <p className="flex items-center justify-between text-sm font-semibold text-slate-800">
                        {q}
                        <ChevronDown className="size-4 shrink-0 text-slate-400" />
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{a}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {type === "team" ? (
          <div className="w-full">
            <div className={cn("mb-10", alignClass, alignmentPositionClass(align))}>
              <span className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {stringValue(section, "badge", "우리 팀")}
              </span>
              <InlineEditFrame
                active={activeElement("title")}
                animationClass={previewAnimationClass("title")}
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
              <Textarea
                className="mt-3 min-h-0 resize-none border-0 bg-transparent p-0 text-sm leading-7 text-slate-500 shadow-none focus-visible:ring-0"
                style={descriptionTextStyle(section, design)}
                value={stringValue(section, "description")}
                onChange={(event) => updateField(index, "description", event.target.value)}
              />
            </div>
            {layout === "list" ? (
              <div className="mx-auto max-w-2xl divide-y divide-slate-100">
                {items.map((item, i) => {
                  const [name, role, specialty] = item.split("|");
                  return (
                    <div key={i} className="flex items-center gap-4 py-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                        {name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{name}</p>
                        <p className="text-xs text-slate-500">{role}</p>
                        {specialty && <p className="mt-0.5 text-xs text-blue-500">{specialty}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item, i) => {
                  const [name, role, specialty] = item.split("|");
                  return (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 text-center">
                      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                        {name?.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold">{name}</p>
                      <p className="mt-1 text-xs text-slate-500">{role}</p>
                      {specialty && <p className="mt-1 text-xs text-blue-500">{specialty}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {type === "subhero" ? (
          <div className="w-full">
            {layout === "image-bg" && imageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${imageUrl})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
              </div>
            )}
            <div className={cn("relative", layout === "image-bg" ? "text-white" : "")}>
              <InlineEditFrame
                active={activeElement("title")}
                animationClass={previewAnimationClass("title")}
                label="페이지 제목 수정"
                onContextMenu={(event) => openContextMenu(event, index, "title")}
                onSelect={() => selectElementForSection("title")}
              >
                <Input
                  className={cn(
                    "h-auto border-0 bg-transparent p-0 font-bold shadow-none focus-visible:ring-0",
                    layout === "split" ? "text-2xl" : "text-4xl",
                  )}
                  placeholder="페이지 제목"
                  style={titleTextStyle(section, design)}
                  value={stringValue(section, "title")}
                  onChange={(event) => updateField(index, "title", event.target.value)}
                />
              </InlineEditFrame>
              {layout !== "split" && (
                <InlineEditFrame
                  active={activeElement("description")}
                  animationClass={previewAnimationClass("description")}
                  className="mt-3"
                  label="설명 수정"
                  onContextMenu={(event) => openContextMenu(event, index, "description")}
                  onSelect={() => selectElementForSection("description")}
                >
                  <Textarea
                    className="min-h-0 resize-none border-0 bg-transparent p-0 text-sm leading-6 text-slate-500 shadow-none focus-visible:ring-0"
                    placeholder="페이지 설명을 입력하세요"
                    style={descriptionTextStyle(section, design)}
                    value={stringValue(section, "description")}
                    onChange={(event) => updateField(index, "description", event.target.value)}
                  />
                </InlineEditFrame>
              )}
              {layout === "split" && (
                <div className="mt-2 text-sm text-slate-400">
                  {stringValue(section, "description", "페이지에 대한 간단한 설명")}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {type === "breadcrumb" ? (
          <div className="w-full">
            <nav className="flex items-center gap-1.5 text-sm">
              {itemList(section).map((item, i) => {
                const [label] = item.split("|");
                const isLast = i === itemList(section).length - 1;
                return (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronDown className="size-3 -rotate-90 text-slate-300" />}
                    <span className={cn(isLast ? "font-semibold text-slate-800" : "text-slate-400 hover:text-blue-500")}>
                      {label}
                    </span>
                  </span>
                );
              })}
              {layout === "with-title" && (
                <div className="mt-3 w-full border-t border-slate-100 pt-3">
                  <Input
                    className="h-auto border-0 bg-transparent p-0 text-xl font-bold shadow-none focus-visible:ring-0"
                    placeholder="페이지 제목"
                    style={titleTextStyle(section, design)}
                    value={stringValue(section, "title")}
                    onChange={(event) => updateField(index, "title", event.target.value)}
                  />
                </div>
              )}
            </nav>
          </div>
        ) : null}

        {type === "vision" ? (
          <div className="w-full">
            {layout === "split" ? (
              <div className="grid grid-cols-2 gap-8">
                {[{ label: "비전", color: "blue" }, { label: "미션", color: "purple" }].map(({ label, color }) => (
                  <div key={label} className={cn("rounded-2xl p-6", color === "blue" ? "bg-blue-50" : "bg-purple-50")}>
                    <span className={cn("mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold", color === "blue" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700")}>{label}</span>
                    <p className={cn("text-lg font-bold", color === "blue" ? "text-blue-900" : "text-purple-900")}>
                      {label === "비전" ? stringValue(section, "title", "우리의 비전") : "우리의 미션"}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{stringValue(section, "description", "")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{stringValue(section, "title", "우리의 비전")}</p>
                <p className="mt-4 text-base leading-relaxed text-slate-500">{stringValue(section, "description", "")}</p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {itemList(section).map((item, i) => {
                    const [name, desc] = item.split("|");
                    return (
                      <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-blue-100">
                          <Sparkles className="size-5 text-blue-600" />
                        </div>
                        <p className="font-semibold text-slate-800">{name}</p>
                        <p className="mt-1 text-sm text-slate-400">{desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {type === "values" ? (
          <div className="w-full">
            {layout === "list" ? (
              <div className="space-y-3">
                {itemList(section).map((item, i) => {
                  const [name, , desc] = item.split("|");
                  return (
                    <div key={i} className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Award className="size-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{name}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {itemList(section).map((item, i) => {
                  const [name, , desc] = item.split("|");
                  return (
                    <div key={i} className="rounded-xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                      <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-blue-100">
                        <Award className="size-5 text-blue-600" />
                      </div>
                      <p className="font-semibold text-slate-800">{name}</p>
                      <p className="mt-1 text-sm text-slate-400">{desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {type === "location" ? (() => {
          const address = stringValue(section, "address", "");
          const mapSrc = address
            ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&hl=ko`
            : "";
          const contactRows = [
            { icon: MapPin, label: "주소", field: "address", placeholder: "서울특별시 강남구 테헤란로 123" },
            { icon: FileText, label: "전화", field: "phone", placeholder: "02-1234-5678" },
            { icon: FileText, label: "이메일", field: "email", placeholder: "hello@example.com" },
          ] as const;
          return (
            <div className="w-full">
              {layout === "text-only" ? (
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {contactRows.map(({ icon: Icon, label, field, placeholder }) => (
                      <div key={field} className="flex gap-3">
                        <Icon className="mt-1 size-5 shrink-0 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                          <Input
                            className="mt-1 h-auto border-0 bg-transparent p-0 text-sm text-slate-700 shadow-none focus-visible:ring-0"
                            placeholder={placeholder}
                            value={stringValue(section, field, "")}
                            onChange={(e) => updateField(index, field, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <FileText className="mt-1 size-5 shrink-0 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">교통편</p>
                        <div className="mt-1 space-y-1">
                          {itemList(section).map((item, i) => {
                            const [label, desc] = item.split("|");
                            return <p key={i} className="text-sm text-slate-600"><span className="font-semibold">{label}</span> {desc}</p>;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {/* 지도 */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100" style={{ height: 320 }}>
                    {mapSrc ? (
                      <iframe
                        allowFullScreen
                        className="h-full w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={mapSrc}
                        title="지도"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                        <MapPin className="size-10" />
                        <p className="text-sm">주소를 입력하면 지도가 표시됩니다</p>
                      </div>
                    )}
                  </div>
                  {/* 정보 */}
                  <div className="space-y-4 py-2">
                    <Input
                      className="h-auto border-0 bg-transparent p-0 text-lg font-bold text-slate-800 shadow-none focus-visible:ring-0"
                      placeholder="오시는 길"
                      value={stringValue(section, "title", "")}
                      onChange={(e) => updateField(index, "title", e.target.value)}
                    />
                    <div className="space-y-3">
                      {contactRows.map(({ icon: Icon, label, field, placeholder }) => (
                        <div key={field} className="flex gap-3">
                          <Icon className="mt-0.5 size-4 shrink-0 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-400">{label}</p>
                            <Input
                              className="h-auto border-0 bg-transparent p-0 text-sm text-slate-700 shadow-none focus-visible:ring-0"
                              placeholder={placeholder}
                              value={stringValue(section, field, "")}
                              onChange={(e) => updateField(index, field, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="pt-1">
                        <p className="text-xs font-bold text-slate-400">교통편</p>
                        {itemList(section).map((item, i) => {
                          const [label, desc] = item.split("|");
                          return <p key={i} className="mt-1 text-sm text-slate-600"><span className="font-semibold text-blue-600">{label}</span> {desc}</p>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })() : null}

        {type === "partners" ? (
          <div className="w-full">
            {layout === "logo-strip" ? (
              <div>
                {stringValue(section, "title") && <p className="mb-6 text-center text-lg font-bold text-slate-700">{stringValue(section, "title")}</p>}
                <div className="flex items-center justify-center gap-8 rounded-2xl border border-slate-100 bg-slate-50 py-6">
                  {itemList(section).slice(0, 5).map((name, i) => (
                    <div key={i} className="flex h-10 w-20 items-center justify-center rounded-lg bg-white shadow-sm">
                      <span className="text-xs font-bold text-slate-400">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {stringValue(section, "title") && <p className="mb-6 text-center text-lg font-bold text-slate-700">{stringValue(section, "title")}</p>}
                {stringValue(section, "description") && <p className="mb-6 text-center text-sm text-slate-400">{stringValue(section, "description")}</p>}
                <div className="grid grid-cols-3 gap-4">
                  {itemList(section).map((name, i) => (
                    <div key={i} className="flex h-16 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
                      <span className="text-sm font-bold text-slate-400">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {type === "awards" ? (
          <div className="w-full">
            {layout === "list" ? (
              <div className="space-y-3">
                {itemList(section).map((item, i) => {
                  const [title, org, year] = item.split("|");
                  return (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                        <Award className="size-6 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{title}</p>
                        <p className="text-sm text-slate-500">{org}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{year}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {itemList(section).map((item, i) => {
                  const [title, org, year] = item.split("|");
                  return (
                    <div key={i} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-yellow-100">
                        <Award className="size-5 text-yellow-500" />
                      </div>
                      <p className="font-semibold text-slate-800">{title}</p>
                      <p className="mt-1 text-sm text-slate-500">{org}</p>
                      <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">{year}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {type === "press" ? (
          <div className="w-full">
            {layout === "cards" ? (
              <div className="grid grid-cols-3 gap-4">
                {itemList(section).map((item, i) => {
                  const [title, media, date] = item.split("|");
                  return (
                    <div key={i} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                      <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-200" />
                      <div className="p-4">
                        <p className="text-xs font-bold text-blue-600">{media}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 line-clamp-2">{title}</p>
                        <p className="mt-2 text-xs text-slate-400">{date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {itemList(section).map((item, i) => {
                  const [title, media, date] = item.split("|");
                  return (
                    <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                      <span className="shrink-0 rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">{media}</span>
                      <p className="flex-1 text-sm font-medium text-slate-700">{title}</p>
                      <span className="shrink-0 text-xs text-slate-400">{date}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {type === "photo-gallery" ? (
          <div className="w-full">
            {layout === "masonry" ? (
              <div className="columns-3 gap-3 space-y-3">
                {[140, 100, 160, 120, 150, 90].map((h, i) => (
                  <div
                    key={i}
                    className="break-inside-avoid overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200"
                    style={{ height: h }}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200" />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {type === "jobs" ? (
          <div className="w-full">
            {stringValue(section, "title") && <p className="mb-6 text-2xl font-bold text-slate-800">{stringValue(section, "title")}</p>}
            {stringValue(section, "description") && <p className="mb-6 text-slate-500">{stringValue(section, "description")}</p>}
            {layout === "cards" ? (
              <div className="grid grid-cols-2 gap-4">
                {itemList(section).map((item, i) => {
                  const [position, dept, career, deadline] = item.split("|");
                  return (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{position}</p>
                          <p className="mt-1 text-sm text-slate-500">{dept}</p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">채용중</span>
                      </div>
                      <div className="mt-3 flex gap-2 text-xs text-slate-400">
                        <span className="rounded bg-slate-100 px-2 py-0.5">{career}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5">마감 {deadline}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {itemList(section).map((item, i) => {
                  const [position, dept, career, deadline] = item.split("|");
                  return (
                    <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                      <Briefcase className="size-5 shrink-0 text-slate-300" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{position}</p>
                        <p className="text-sm text-slate-400">{dept} · {career}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">마감 {deadline}</span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">채용중</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {type === "downloads" ? (
          <div className="w-full">
            {stringValue(section, "title") && <p className="mb-6 text-2xl font-bold text-slate-800">{stringValue(section, "title")}</p>}
            {layout === "cards" ? (
              <div className="grid grid-cols-2 gap-4">
                {itemList(section).map((item, i) => {
                  const [name, ext, date] = item.split("|");
                  return (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                        <FileText className="size-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold text-slate-800">{name}</p>
                        <p className="text-xs text-slate-400">{ext} · {date}</p>
                      </div>
                      <Download className="size-4 shrink-0 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {itemList(section).map((item, i) => {
                  const [name, ext, date] = item.split("|");
                  return (
                    <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded bg-red-100">
                        <FileText className="size-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                        <p className="text-xs text-slate-400">{ext} · {date}</p>
                      </div>
                      <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50" type="button">
                        <Download className="size-3" /> 다운로드
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {type === "board" ? (
          <div className="w-full">
            {/* 게시판 프리뷰 — 실제 데이터는 공개 렌더링 시 주입 */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {/* 상단 툴바 */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  {layout === "gallery" ? (
                    <LayoutGrid className="size-4 text-slate-400" />
                  ) : (
                    <Newspaper className="size-4 text-slate-400" />
                  )}
                  <span className="text-sm font-semibold text-slate-600">
                    {layout === "gallery" ? "갤러리" : layout === "news" ? "뉴스" : layout === "notice" ? "공지사항" : "게시판"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-7 w-24 rounded border border-slate-200 bg-slate-50 px-2 text-xs flex items-center text-slate-400">검색</div>
                </div>
              </div>

              {layout === "gallery" ? (
                <div className="grid grid-cols-3 gap-3 p-4">
                  {[
                    { w: "w-full", h: "h-24", tag: "디자인" },
                    { w: "w-full", h: "h-24", tag: "개발" },
                    { w: "w-full", h: "h-24", tag: "마케팅" },
                    { w: "w-full", h: "h-24", tag: "공지" },
                    { w: "w-full", h: "h-24", tag: "이벤트" },
                    { w: "w-full", h: "h-24", tag: "소식" },
                  ].map((item, i) => (
                    <div key={i} className="overflow-hidden rounded-lg border border-slate-100">
                      <div className={cn(item.h, "bg-gradient-to-br from-slate-100 to-slate-200 flex items-end p-2")}>
                        <span className="rounded bg-blue-600/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">{item.tag}</span>
                      </div>
                      <div className="p-2">
                        <div className="h-1.5 w-full rounded bg-slate-200" />
                        <div className="mt-1 h-1 w-3/4 rounded bg-slate-100" />
                        <div className="mt-2 text-[10px] text-slate-400">2026.06.30</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : layout === "news" ? (
                <div className="divide-y divide-slate-50 p-2">
                  {["새로운 기능이 출시되었습니다", "서비스 업데이트 안내", "6월 이벤트 공지"].map((title, i) => (
                    <div key={i} className="flex gap-3 px-2 py-3">
                      <div className="size-14 shrink-0 rounded-lg bg-gradient-to-br from-slate-100 to-blue-100" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-400">내용 미리보기가 여기에 표시됩니다.</p>
                        <p className="mt-1.5 text-[10px] text-slate-300">2026.06.{30 - i}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : layout === "notice" ? (
                <div className="divide-y divide-slate-100">
                  {[
                    { title: "서비스 점검 안내", pin: true },
                    { title: "개인정보처리방침 개정", pin: true },
                    { title: "6월 이벤트 당첨자 발표", pin: false },
                    { title: "업데이트 노트 v2.4", pin: false },
                  ].map((item, i) => (
                    <div key={i} className={cn("flex items-center gap-3 px-4 py-3", item.pin && "bg-blue-50/50")}>
                      {item.pin && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">공지</span>
                      )}
                      <span className="flex-1 truncate text-sm font-medium text-slate-700">{item.title}</span>
                      <span className="shrink-0 text-[11px] text-slate-400">2026.06.{30 - i}</span>
                    </div>
                  ))}
                </div>
              ) : (
                /* list */
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-400">
                      <th className="py-2.5 pl-4 text-left font-medium">번호</th>
                      <th className="py-2.5 text-left font-medium">제목</th>
                      <th className="py-2.5 pr-4 text-right font-medium">날짜</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {["새로운 기능 업데이트 안내", "서비스 이용 방법 안내", "자주 묻는 질문 정리"].map((title, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 pl-4 text-slate-400">{3 - i}</td>
                        <td className="py-3 text-slate-700">{title}</td>
                        <td className="py-3 pr-4 text-right text-slate-400">2026.06.{30 - i}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="flex items-center justify-center gap-1 border-t border-slate-100 py-3">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    className={cn("flex size-7 items-center justify-center rounded text-xs", n === 1 ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-100")}
                    type="button"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">게시판 데이터는 공개 페이지에서 실시간으로 표시됩니다.</p>
          </div>
        ) : null}

        {type === "embed-form" ? (
          <div className="w-full">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6">
              {/* 폼 헤더 */}
              {stringValue(section, "title") && (
                <InlineEditFrame
                  active={activeElement("title")}
                  animationClass={previewAnimationClass("title")}
                  className="mb-4"
                  label="폼 제목 수정"
                  onContextMenu={(event) => openContextMenu(event, index, "title")}
                  onSelect={() => selectElementForSection("title")}
                >
                  <Input
                    className="h-auto border-0 bg-transparent p-0 text-xl font-bold shadow-none focus-visible:ring-0"
                    placeholder="폼 제목 (선택)"
                    style={titleTextStyle(section, design)}
                    value={stringValue(section, "title")}
                    onChange={(event) => updateField(index, "title", event.target.value)}
                  />
                </InlineEditFrame>
              )}

              {layout === "newsletter" ? (
                <div className="flex gap-3">
                  <input className="h-11 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-400 outline-none" placeholder="이메일 주소를 입력하세요" readOnly />
                  <button className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white" type="button">
                    {stringValue(section, "buttonLabel", "구독하기")}
                  </button>
                </div>
              ) : layout === "survey" ? (
                <div className="space-y-4">
                  {["이 서비스를 어떻게 알게 되셨나요?", "만족도를 선택해주세요", "개선을 원하는 기능이 있나요?"].map((q, i) => (
                    <div key={i}>
                      <p className="mb-2 text-sm font-semibold text-slate-700">{i + 1}. {q}</p>
                      {i === 1 ? (
                        <div className="flex gap-2">
                          {["매우 만족", "만족", "보통", "불만족"].map((opt) => (
                            <label key={opt} className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                              <div className="size-3.5 rounded-full border border-slate-300 bg-white" />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 outline-none" placeholder="입력" readOnly />
                      )}
                    </div>
                  ))}
                  <button className="h-10 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white" type="button">
                    {stringValue(section, "buttonLabel", "보내기")}
                  </button>
                </div>
              ) : (
                /* contact / consult */
                <div className="space-y-3">
                  <div className={cn("grid gap-3", layout === "consult" ? "grid-cols-2" : "grid-cols-2")}>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-500">이름</label>
                      <input className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 outline-none" placeholder="홍길동" readOnly />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-500">이메일</label>
                      <input className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 outline-none" placeholder="hello@example.com" readOnly />
                    </div>
                  </div>
                  {layout === "consult" && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-500">연락처</label>
                      <input className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 outline-none" placeholder="010-0000-0000" readOnly />
                    </div>
                  )}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">
                      {layout === "consult" ? "상담 내용" : "문의 내용"}
                    </label>
                    <div className="h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                      내용을 입력하세요
                    </div>
                  </div>
                  <button
                    className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white"
                    type="button"
                  >
                    {stringValue(section, "buttonLabel", layout === "consult" ? "상담 신청" : "보내기")}
                  </button>
                </div>
              )}
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">폼 제출 데이터는 콘텐츠 &gt; 문의폼에서 확인할 수 있습니다.</p>
          </div>
        ) : null}

        {type === "org-chart" ? (
          <div className="w-full">
            {layout === "grid" ? (
              /* 카드 그리드형 */
              <div className="space-y-6">
                {/* CEO row */}
                <div className="flex justify-center">
                  <div className="w-44 rounded-xl border-2 border-blue-500 bg-white p-4 text-center shadow-sm">
                    <div className="mx-auto mb-2 size-12 rounded-full bg-blue-100" />
                    <p className="font-bold text-slate-800">대표이사</p>
                    <p className="text-sm text-blue-600">CEO</p>
                  </div>
                </div>
                {/* Level 2 */}
                <div className="flex justify-center gap-4">
                  {["개발본부장·CTO", "마케팅본부장·CMO", "운영본부장·COO"].map((label) => {
                    const [name, role] = label.split("·");
                    return (
                      <div key={label} className="w-36 rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                        <div className="mx-auto mb-2 size-9 rounded-full bg-slate-100" />
                        <p className="text-sm font-semibold text-slate-700">{name}</p>
                        <p className="text-xs text-slate-400">{role}</p>
                      </div>
                    );
                  })}
                </div>
                {/* Level 3 */}
                <div className="flex justify-center gap-3">
                  {["개발팀", "디자인팀", "마케팅팀", "운영팀"].map((label) => (
                    <div key={label} className="w-24 rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
                      <p className="text-xs font-medium text-slate-600">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 트리형 */
              <div className="flex flex-col items-center gap-0">
                {/* CEO */}
                <div className="w-40 rounded-xl border-2 border-blue-500 bg-white p-3 text-center shadow-sm">
                  <p className="font-bold text-slate-800">대표이사</p>
                  <p className="text-xs text-blue-600">CEO</p>
                </div>
                <div className="h-6 w-px bg-slate-300" />
                {/* Level-2 row with connectors */}
                <div className="relative flex gap-6">
                  <div className="absolute -top-0 left-1/2 h-px -translate-x-1/2" />
                  {[{ name: "개발본부장", role: "CTO" }, { name: "마케팅본부장", role: "CMO" }].map((item) => (
                    <div key={item.role} className="flex flex-col items-center">
                      <div className="h-0 w-px" />
                      <div className="w-32 rounded-lg border border-slate-300 bg-white p-3 text-center shadow-sm">
                        <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.role}</p>
                      </div>
                      <div className="h-5 w-px bg-slate-300" />
                      <div className="flex gap-3">
                        {["팀A", "팀B"].map((t) => (
                          <div key={t} className="w-16 rounded-md border border-slate-100 bg-slate-50 py-1.5 text-center text-xs text-slate-500">{t}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {type === "history" ? (
          <div className="w-full">
            {layout === "zigzag" ? (
              <div className="space-y-6">
                {[
                  { year: "2024", title: "회사 설립", desc: "서울시 강남구에 법인 설립" },
                  { year: "2025", title: "Series A", desc: "누적 투자금 50억 원 확보" },
                  { year: "2026", title: "글로벌 진출", desc: "일본·동남아 시장 진출" },
                ].map((item, i) => (
                  <div key={i} className={cn("flex items-center gap-8", i % 2 === 1 && "flex-row-reverse")}>
                    <div className="flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-bold text-blue-600">{item.year}</p>
                      <p className="mt-1 font-semibold text-slate-800">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-white font-bold text-blue-600 text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              /* 세로 타임라인 */
              <div className="relative pl-10">
                <div className="absolute left-4 top-2 bottom-2 w-px bg-blue-200" />
                {[
                  { year: "2024", title: "회사 설립", desc: "서울시 강남구에 법인 설립" },
                  { year: "2024", title: "첫 서비스 출시", desc: "베타 서비스 오픈, 초기 사용자 1000명" },
                  { year: "2025", title: "Series A 투자유치", desc: "누적 투자금 50억 원 확보" },
                  { year: "2026", title: "글로벌 진출", desc: "일본·동남아 시장 서비스 오픈" },
                ].map((item, i) => (
                  <div key={i} className="relative mb-8 last:mb-0">
                    <div className="absolute -left-6 flex size-5 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
                      <div className="size-2 rounded-full bg-blue-500" />
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">{item.year}</span>
                      <p className="mt-2 font-semibold text-slate-800">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function DesignEditor({ site, page, sitePages }: DesignEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<EditableDraft>(() => toEditableJson(page.draftJson));
  const [savedDraft, setSavedDraft] = useState<EditableDraft>(() =>
    toEditableJson(page.draftJson),
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>("ko");
  const [selectedElement, setSelectedElement] = useState<SelectedElement>("site");
  const [animationPreview, setAnimationPreview] = useState<{
    element: Exclude<SelectedElement, "site">;
    token: number;
  } | null>(null);
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
  const [isLibraryFullOpen, setIsLibraryFullOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [leftPanel, setLeftPanel] =
    useState<"pages" | "sections" | "settings">("settings");
  const [settingsSubPanel, setSettingsSubPanel] =
    useState<null | "language" | "pages" | "menu" | "footer">(null);
  const [headerSettingsTab, setHeaderSettingsTab] = useState<"layout" | "color" | "menu">("layout");
  const [footerSettingsTab, setFooterSettingsTab] = useState<"layout" | "color">("layout");
  const [saveMessage, setSaveMessage] = useState("저장 전 상태");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isPageComposerOpen, setIsPageComposerOpen] = useState(false);
  const [isPagePathTouched, setIsPagePathTouched] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPagePath, setNewPagePath] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [visualUploadIndex, setVisualUploadIndex] = useState(0);
  const [visualUploadBlockIndex, setVisualUploadBlockIndex] = useState<number | null>(null);
  const [slideUploadTarget, setSlideUploadTarget] = useState<{
    sectionIndex: number;
    slideIndex: number;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    element: SelectedElement;
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const arrowMediaInputRef = useRef<HTMLInputElement>(null);
  const gradientFromInputRef = useRef<HTMLInputElement>(null);
  const gradientToInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const slideMediaInputRef = useRef<HTMLInputElement>(null);
  const visualMediaInputRef = useRef<HTMLInputElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const headerPreviewRef = useRef<HTMLDivElement>(null);
  const footerPreviewRef = useRef<HTMLElement>(null);
  const serializedDraft = useMemo(() => JSON.stringify(draft, null, 2), [draft]);
  const serializedSavedDraft = useMemo(
    () => JSON.stringify(savedDraft, null, 2),
    [savedDraft],
  );
  const hasUnsavedChanges = serializedDraft !== serializedSavedDraft;
  const storageKey = `keyun-editor-draft:${site.id}:${page.id}`;
  const isDemoSite = site.id.startsWith("demo_");
  const selectedSection = draft.sections[selectedIndex] ?? draft.sections[0] ?? null;
  const localizedSelectedSection = selectedSection
    ? localizedSection(selectedSection, activeLocale)
    : null;
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
  const isMainPage = page.path === "/";
  const pageFilteredPresets = modulePresets.filter((preset) => {
    const pt = preset.pageType ?? "all";
    if (isMainPage) return pt === "main" || pt === "all";
    return pt === "sub" || pt === "all";
  });
  const availableLibraryCategories = Array.from(
    new Set(pageFilteredPresets.map((preset) => preset.category)),
  ).sort((a, b) => {
    if (a === "페이지 헤더") return -1;
    if (b === "페이지 헤더") return 1;
    if (a === "히어로") return -1;
    if (b === "히어로") return 1;
    return 0;
  });
  // 페이지 전환 시 현재 카테고리가 없으면 첫 번째로 리셋
  useEffect(() => {
    if (!availableLibraryCategories.includes(activeLibraryCategory)) {
      setActiveLibraryCategory(availableLibraryCategories[0] ?? "");
    }
  }, [page.id]);
  const visibleModules = pageFilteredPresets.filter(
    (preset) => preset.category === activeLibraryCategory,
  );
  const previewSection = useMemo(
    () => (previewPreset ? createSection(previewPreset.type, previewPreset.layout) : null),
    [previewPreset],
  );

  useEffect(() => {
    if (leftPanel !== "settings" || !settingsSubPanel) return;

    const scrollRoot = canvasScrollRef.current;
    const target =
      settingsSubPanel === "menu"
        ? headerPreviewRef.current
        : settingsSubPanel === "footer"
          ? footerPreviewRef.current
          : null;

    if (!scrollRoot) return;

    window.requestAnimationFrame(() => {
      target?.scrollIntoView({
        behavior: "smooth",
        block: settingsSubPanel === "menu" ? "start" : "center",
      });
    });
  }, [leftPanel, settingsSubPanel, viewport]);
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

      window.queueMicrotask(() => {
        setDraft(parsedDraft);
        setSavedDraft(parsedDraft);
        setSaveMessage("저장된 데모 상태를 불러왔습니다.");
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [isDemoSite, storageKey]);

  useEffect(() => {
    if (!settingsSubPanel) {
      return;
    }

    window.queueMicrotask(() => {
      setIsSectionLibraryOpen(false);
      setIsLibraryFullOpen(false);
    });
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

  function setEnglishEnabled(enabled: boolean) {
    const locales: SupportedLocale[] = enabled ? ["ko", "en"] : ["ko"];

    updateDraft({
      i18n: {
        ...draft.i18n,
        locales,
      },
    });

    if (!enabled && activeLocale === "en") {
      setActiveLocale("ko");
    }
  }

  function updateI18nSiteField(
    key: "footerCopyright" | "siteName",
    locale: SupportedLocale,
    value: string,
  ) {
    updateDraft({
      i18n: {
        ...draft.i18n,
        [key]: {
          ...draft.i18n[key],
          [locale]: value,
        },
      },
    });
  }

  function updateI18nSeo(locale: SupportedLocale, key: "description" | "title", value: string) {
    updateDraft({
      i18n: {
        ...draft.i18n,
        seo: {
          ...draft.i18n.seo,
          [locale]: {
            description: draft.i18n.seo[locale]?.description ?? "",
            title: draft.i18n.seo[locale]?.title ?? "",
            [key]: value,
          },
        },
      },
    });
  }


  function updatePages(nextPages: EditorPageItem[]) {
    const pageIds = new Set(nextPages.map((page) => page.id));
    const nextNavigation = draft.navigation.filter((item) => pageIds.has(item.pageId));

    updateDraft({
      navigation: nextNavigation.length ? nextNavigation : normalizeNavigation([], nextPages),
      pages: nextPages,
    });
  }

  function updatePage(pageId: string, nextPage: Partial<EditorPageItem>) {
    updatePages(
      draft.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              ...nextPage,
              path: nextPage.path ? (nextPage.path.startsWith("/") ? nextPage.path : `/${nextPage.path}`) : page.path,
            }
          : page,
      ),
    );
  }

  function updateLocalizedPageTitle(pageId: string, title: string) {
    if (activeLocale === "ko") {
      updatePage(pageId, { title });
      return;
    }

    updatePages(
      draft.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              translations: {
                ...(page.translations ?? {}),
                [activeLocale]: {
                  ...(page.translations?.[activeLocale] ?? {}),
                  title,
                },
              },
            }
          : page,
      ),
    );
  }

  async function addPage() {
    const title = newPageTitle.trim();

    if (!title) {
      setSaveMessage("페이지명을 입력해 주세요.");
      return;
    }

    if (isDemoSite) {
      setSaveMessage("데모에서는 실제 페이지를 추가할 수 없습니다.");
      return;
    }

    setIsCreatingPage(true);
    setSaveMessage("새 페이지를 만드는 중...");

    try {
      const formData = new FormData();
      formData.set("site_id", site.id);
      formData.set("title", title);
      formData.set("path", newPagePath);
      const createdPage = await createEditorPage(formData);

      setNewPageTitle("");
      setNewPagePath("");
      setIsPagePathTouched(false);
      setIsPageComposerOpen(false);
      setSaveMessage("새 페이지를 만들었습니다.");
      router.push(`/dashboard/editor/${site.id}?pageId=${createdPage.id}`);
      router.refresh();
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "페이지 생성 중 문제가 생겼습니다.",
      );
    } finally {
      setIsCreatingPage(false);
    }
  }

  function openEditorPage(pageId: string) {
    if (pageId === page.id) return;
    if (
      hasUnsavedChanges &&
      !window.confirm("저장하지 않은 변경사항이 있습니다. 다른 페이지로 이동할까요?")
    ) {
      return;
    }

    router.push(`/dashboard/editor/${site.id}?pageId=${pageId}`);
  }

  function duplicatePage(pageId: string) {
    const source = draft.pages.find((page) => page.id === pageId);

    if (!source) return;

    const page: EditorPageItem = {
      ...source,
      id: `page-${Date.now()}`,
      path: `${source.path === "/" ? "/home" : source.path}-copy`,
      status: "private",
      title: `${source.title} 복사본`,
    };

    updateDraft({
      navigation: [
        ...draft.navigation,
        { enabled: false, id: `nav-${Date.now()}`, label: page.title, pageId: page.id },
      ],
      pages: [...draft.pages, page],
    });
  }

  function removePage(pageId: string) {
    if (pageId === "home" || draft.pages.length <= 1) {
      return;
    }

    updatePages(draft.pages.filter((page) => page.id !== pageId));
  }

  function movePage(pageId: string, direction: -1 | 1) {
    const index = draft.pages.findIndex((page) => page.id === pageId);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= draft.pages.length) {
      return;
    }

    const nextPages = [...draft.pages];
    const current = nextPages[index];
    nextPages[index] = nextPages[targetIndex];
    nextPages[targetIndex] = current;
    updatePages(nextPages);
  }

  function updateNavigationItem(itemId: string, nextItem: Partial<EditorNavigationItem>) {
    updateDraft({
      navigation: draft.navigation.map((item) =>
        item.id === itemId ? { ...item, ...nextItem } : item,
      ),
    });
  }

  function updateLocalizedNavigationLabel(itemId: string, label: string) {
    if (activeLocale === "ko") {
      updateNavigationItem(itemId, { label });
      return;
    }

    updateDraft({
      navigation: draft.navigation.map((item) =>
        item.id === itemId
          ? {
              ...item,
              translations: {
                ...(item.translations ?? {}),
                [activeLocale]: {
                  ...(item.translations?.[activeLocale] ?? {}),
                  label,
                },
              },
            }
          : item,
      ),
    });
  }

  function addNavigationItem() {
    const firstPublicPage = draft.pages.find((page) => page.status === "public") ?? draft.pages[0];

    if (!firstPublicPage) return;

    updateDraft({
      navigation: [
        ...draft.navigation,
        {
          enabled: true,
          id: `nav-${Date.now()}`,
          label: firstPublicPage.title,
          pageId: firstPublicPage.id,
        },
      ],
    });
  }

  function removeNavigationItem(itemId: string) {
    updateDraft({
      navigation: draft.navigation.filter((item) => item.id !== itemId),
    });
  }

  function moveNavigationItem(itemId: string, direction: -1 | 1) {
    const index = draft.navigation.findIndex((item) => item.id === itemId);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= draft.navigation.length) {
      return;
    }

    const nextNavigation = [...draft.navigation];
    const current = nextNavigation[index];
    nextNavigation[index] = nextNavigation[targetIndex];
    nextNavigation[targetIndex] = current;
    updateDraft({ navigation: nextNavigation });
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
    setSelectedSlideIndex(0);
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

  // ── content 섹션 멀티블록 함수 ───────────────────
  function addContentBlock(sectionIndex: number) {
    const section = draft.sections[sectionIndex];
    if (!section) return;
    const blocks = contentBlocks(section);
    const lastPos = blocks[blocks.length - 1]?.mediaPosition ?? "left";
    const nextPos: "left" | "right" = lastPos === "left" ? "right" : "left";
    updateSection(sectionIndex, {
      ...section,
      blocks: [...blocks, { badge: "", description: "", imageUrl: "", mediaPosition: nextPos, title: "" }],
    });
  }

  function updateContentBlock(sectionIndex: number, blockIndex: number, key: keyof ContentBlock, value: string) {
    const section = draft.sections[sectionIndex];
    if (!section) return;
    const blocks = contentBlocks(section).map((b, i) =>
      i === blockIndex ? { ...b, [key]: value } : b,
    );
    updateSection(sectionIndex, { ...section, blocks });
  }

  function removeContentBlock(sectionIndex: number, blockIndex: number) {
    const section = draft.sections[sectionIndex];
    if (!section) return;
    const blocks = contentBlocks(section).filter((_, i) => i !== blockIndex);
    updateSection(sectionIndex, { ...section, blocks: blocks.length ? blocks : undefined });
  }

  function toggleContentBlockLayout(sectionIndex: number, blockIndex: number) {
    const section = draft.sections[sectionIndex];
    if (!section) return;
    const blocks = contentBlocks(section).map((b, i) =>
      i === blockIndex ? { ...b, mediaPosition: b.mediaPosition === "left" ? "right" : "left" } as ContentBlock : b,
    );
    updateSection(sectionIndex, { ...section, blocks });
  }

  function updateLocalizedSectionField(index: number, key: string, value: string) {
    if (activeLocale === "ko") {
      updateSectionField(index, key, value);
      return;
    }

    const section = draft.sections[index];
    if (!section) return;

    const translations = normalizeTranslations(section.translations) ?? {};
    updateSection(index, {
      ...section,
      translations: {
        ...translations,
        [activeLocale]: {
          ...(translations[activeLocale] ?? {}),
          [key]: value,
        },
      },
    });
  }

  function updateHeroSlide(
    sectionIndex: number,
    slideIndex: number,
    key: keyof HeroSlide,
    value: string,
  ) {
    const section = draft.sections[sectionIndex];
    if (!section) return;

    const slides = heroSlides(section);
    const slide = slides[slideIndex];
    if (!slide) return;

    slides[slideIndex] =
      activeLocale === "ko"
        ? { ...slide, [key]: value }
        : {
            ...slide,
            translations: {
              ...(slide.translations ?? {}),
              [activeLocale]: {
                ...(slide.translations?.[activeLocale] ?? {}),
                [key]: value,
              },
            },
          };
    updateSection(sectionIndex, { ...section, slides });
  }

  function addHeroSlide() {
    if (!selectedSection) return;

    const slides = heroSlides(selectedSection);
    const nextIndex = slides.length;
    updateSection(selectedIndex, {
      ...selectedSection,
      slides: [...slides, createHeroSlide(nextIndex)],
    });
    setSelectedSlideIndex(nextIndex);
  }

  function removeHeroSlide(slideIndex: number) {
    if (!selectedSection) return;

    const slides = heroSlides(selectedSection);
    if (slides.length <= 1) return;

    const nextSlides = slides.filter((_, index) => index !== slideIndex);
    updateSection(selectedIndex, { ...selectedSection, slides: nextSlides });
    setSelectedSlideIndex(Math.max(0, Math.min(slideIndex - 1, nextSlides.length - 1)));
  }

  function updateAnimation(
    element: Exclude<SelectedElement, "site">,
    value: AnimationValue,
  ) {
    updateSectionField(selectedIndex, animationField(element), value);
    setAnimationPreview((current) => ({
      element,
      token: (current?.token ?? 0) + 1,
    }));
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

  function updateLocalizedSectionItems(index: number, value: string) {
    const items = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (activeLocale === "ko") {
      updateSectionItems(index, value);
      return;
    }

    const section = draft.sections[index];
    if (!section) return;

    const translations = normalizeTranslations(section.translations) ?? {};
    updateSection(index, {
      ...section,
      translations: {
        ...translations,
        [activeLocale]: {
          ...(translations[activeLocale] ?? {}),
          items,
        },
      },
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
      setSelectedSlideIndex(0);
      return;
    }

    updateSection(selectedIndex, nextSection);
    setSelectedSlideIndex(0);
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
      return true;
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "저장 중 문제가 생겼습니다.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function saveAndPublish() {
    const saved = await saveDraft();

    if (!saved) {
      return;
    }

    if (isDemoSite) {
      setSaveMessage("데모 사이트는 저장까지만 지원됩니다.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("게시 중...");

    try {
      const formData = new FormData();

      formData.set("site_id", site.id);
      formData.set("slug", site.slug);
      await publishSite(formData);
      setSaveMessage("저장 후 게시되었습니다.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "게시 중 문제가 생겼습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function previewDraft() {
    const previewWindow = window.open("about:blank", "_blank");
    const saved = await saveDraft();

    if (!saved) {
      previewWindow?.close();
      return;
    }

    const previewUrl = `/dashboard/preview/${site.id}?pageId=${page.id}`;

    if (previewWindow) {
      previewWindow.location.href = previewUrl;
    } else {
      window.location.href = previewUrl;
    }

    setSaveMessage("초안 미리보기를 열었습니다.");
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
    const contentSection = localizedSelectedSection ?? selectedSection;

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
    const alignKey = isTitle ? "titleAlign" : "descriptionAlign";
    const layoutAlign = alignmentValue(selectedSection, "align");

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
              value={stringValue(contentSection, contentKey)}
              onChange={(event) =>
                updateLocalizedSectionField(selectedIndex, contentKey, event.target.value)
              }
            />
          ) : (
            <Textarea
              className="min-h-28"
              value={stringValue(contentSection, contentKey)}
              onChange={(event) =>
                updateLocalizedSectionField(selectedIndex, contentKey, event.target.value)
              }
            />
          )}
        </section>

        <AnimationControl
          value={animationValue(selectedSection, element)}
          onChange={(value) => updateAnimation(element, value)}
        />

        {isBadge ? (
          <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="text-sm font-semibold">배지 스타일</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              배지는 섹션 톤에 맞춰 자동 스타일이 적용됩니다. 색상 세부 조정은 제목/본문/버튼에서 다룰 수 있습니다.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <AlignmentControl
              label="텍스트 정렬"
              value={alignmentValue(selectedSection, alignKey, layoutAlign)}
              onChange={(value) =>
                updateSectionField(selectedIndex, alignKey, value)
              }
            />
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
    const contentSection = localizedSelectedSection ?? selectedSection;

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
                value={stringValue(contentSection, labelKey)}
                onChange={(event) =>
                  updateLocalizedSectionField(selectedIndex, labelKey, event.target.value)
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs text-slate-500">버튼 링크</span>
              <Input
                value={stringValue(contentSection, linkKey)}
                onChange={(event) =>
                  updateLocalizedSectionField(selectedIndex, linkKey, event.target.value)
                }
              />
            </label>
          </div>
        </section>

        <AnimationControl
          value={animationValue(selectedSection, element)}
          onChange={(value) => updateAnimation(element, value)}
        />

        <section className="space-y-4">
          <h3 className="text-sm font-semibold">버튼 배치</h3>
          <AlignmentControl
            label="버튼 정렬"
            value={alignmentValue(
              selectedSection,
              "buttonAlign",
              alignmentValue(selectedSection, "align"),
            )}
            onChange={(value) =>
              updateSectionField(selectedIndex, "buttonAlign", value)
            }
          />
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

        <AnimationControl
          value={animationValue(selectedSection, "visual")}
          onChange={(value) => updateAnimation("visual", value)}
        />

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

  function renderSlideContentSettings() {
    if (!selectedSection) return null;

    const slides = heroSlides(localizedSelectedSection ?? selectedSection);
    const safeIndex = Math.min(selectedSlideIndex, Math.max(slides.length - 1, 0));
    const slide = slides[safeIndex];

    if (!slide) return null;

    return (
      <>
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">슬라이드</h3>
              <p className="mt-1 text-xs text-slate-500">기본 3장, 필요한 만큼 추가할 수 있습니다.</p>
            </div>
            <Button size="sm" type="button" variant="outline" onClick={addHeroSlide}>
              <Plus />
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {slides.map((item, index) => (
              <button
                aria-pressed={safeIndex === index}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md border text-xs font-bold",
                  safeIndex === index
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-500",
                )}
                key={item.id}
                type="button"
                onClick={() => setSelectedSlideIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">슬라이드 {safeIndex + 1} 내용</h3>
            <Button
              className="text-red-600"
              disabled={slides.length <= 1}
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => removeHeroSlide(safeIndex)}
            >
              <Trash2 />
              삭제
            </Button>
          </div>
          <label className="space-y-2">
            <span className="text-xs text-slate-500">배지</span>
            <Input
              value={slide.badge}
              onChange={(event) =>
                updateHeroSlide(selectedIndex, safeIndex, "badge", event.target.value)
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs text-slate-500">제목</span>
            <Textarea
              className="min-h-24"
              value={slide.title}
              onChange={(event) =>
                updateHeroSlide(selectedIndex, safeIndex, "title", event.target.value)
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs text-slate-500">설명</span>
            <Textarea
              className="min-h-20"
              value={slide.description}
              onChange={(event) =>
                updateHeroSlide(selectedIndex, safeIndex, "description", event.target.value)
              }
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2">
              <span className="text-xs text-slate-500">기본 버튼</span>
              <Input
                value={slide.buttonLabel}
                onChange={(event) =>
                  updateHeroSlide(
                    selectedIndex,
                    safeIndex,
                    "buttonLabel",
                    event.target.value,
                  )
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs text-slate-500">보조 버튼</span>
              <Input
                value={slide.secondaryButtonLabel}
                onChange={(event) =>
                  updateHeroSlide(
                    selectedIndex,
                    safeIndex,
                    "secondaryButtonLabel",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold">슬라이드 배경</h3>
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200">
            {[
              ["배경색", "color"],
              ["배경 이미지", "image"],
            ].map(([label, value]) => (
              <button
                className={cn(
                  "h-10 text-xs font-semibold",
                  slide.backgroundType === value
                    ? "bg-blue-50 text-blue-600"
                    : "bg-white text-slate-500",
                )}
                key={value}
                type="button"
                onClick={() =>
                  updateHeroSlide(
                    selectedIndex,
                    safeIndex,
                    "backgroundType",
                    value,
                  )
                }
              >
                {label}
              </button>
            ))}
          </div>
          {slide.backgroundType === "color" ? (
            <label className="space-y-2">
              <span className="text-xs text-slate-500">배경 색상</span>
              <Input
                className="h-11 p-1"
                type="color"
                value={slide.bgColor}
                onChange={(event) =>
                  updateHeroSlide(selectedIndex, safeIndex, "bgColor", event.target.value)
                }
              />
            </label>
          ) : (
            <>
              <Input
                placeholder="이미지 URL"
                value={slide.imageUrl}
                onChange={(event) =>
                  updateHeroSlide(selectedIndex, safeIndex, "imageUrl", event.target.value)
                }
              />
              <Button
                className="w-full"
                disabled={isUploading}
                type="button"
                variant="outline"
                onClick={() => {
                  setSlideUploadTarget({
                    sectionIndex: selectedIndex,
                    slideIndex: safeIndex,
                  });
                  slideMediaInputRef.current?.click();
                }}
              >
                <UploadCloud />
                {isUploading ? "업로드 중..." : "배경 이미지 업로드"}
              </Button>
            </>
          )}
        </section>
      </>
    );
  }

  function renderSliderControls() {
    if (!selectedSection) return null;

    const arrowStyle = stringValue(selectedSection, "arrowStyle", "simple");
    const paginationStyle = stringValue(selectedSection, "paginationStyle", "circle");

    return (
      <>
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">슬라이드 화살표</h3>
            <p className="mt-1 text-xs text-slate-500">SVG 스타일 또는 직접 올린 이미지를 사용합니다.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "일반형", value: "simple" },
              { label: "원형 배경", value: "circle" },
              { label: "이미지", value: "image" },
            ].map((option) => (
              <button
                className={cn(
                  "h-16 rounded-lg border text-xs font-semibold",
                  arrowStyle === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-500",
                )}
                key={option.value}
                type="button"
                onClick={() =>
                  updateSectionField(selectedIndex, "arrowStyle", option.value)
                }
              >
                {option.label}
              </button>
            ))}
          </div>
          {arrowStyle === "image" ? (
            <div className="space-y-3">
              <Input
                placeholder="화살표 이미지 URL"
                value={stringValue(selectedSection, "arrowImageUrl")}
                onChange={(event) =>
                  updateSectionField(selectedIndex, "arrowImageUrl", event.target.value)
                }
              />
              <Button
                className="w-full"
                disabled={isUploading}
                type="button"
                variant="outline"
                onClick={() => arrowMediaInputRef.current?.click()}
              >
                <UploadCloud />
                화살표 이미지 업로드
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-xs text-slate-500">화살표 색상</span>
                <Input
                  className="h-10 p-1"
                  type="color"
                  value={stringValue(selectedSection, "arrowColor", "#ffffff")}
                  onChange={(event) =>
                    updateSectionField(selectedIndex, "arrowColor", event.target.value)
                  }
                />
              </label>
              {arrowStyle === "circle" ? (
                <label className="space-y-2">
                  <span className="text-xs text-slate-500">원형 배경</span>
                  <Input
                    className="h-10 p-1"
                    type="color"
                    value={stringValue(selectedSection, "arrowBgColor", "#0f172a")}
                    onChange={(event) =>
                      updateSectionField(selectedIndex, "arrowBgColor", event.target.value)
                    }
                  />
                </label>
              ) : null}
            </div>
          )}
          <label className="block space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>화살표 크기</span>
              <span>{stringValue(selectedSection, "arrowSize", "24")}px</span>
            </div>
            <input
              className="w-full accent-blue-600"
              max="48"
              min="12"
              type="range"
              value={stringValue(selectedSection, "arrowSize", "24")}
              onChange={(event) =>
                updateSectionField(selectedIndex, "arrowSize", event.target.value)
              }
            />
          </label>
          {arrowStyle === "circle" ? (
            <label className="block space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>원형 크기</span>
                <span>{stringValue(selectedSection, "arrowButtonSize", "48")}px</span>
              </div>
              <input
                className="w-full accent-blue-600"
                max="80"
                min="32"
                type="range"
                value={stringValue(selectedSection, "arrowButtonSize", "48")}
                onChange={(event) =>
                  updateSectionField(selectedIndex, "arrowButtonSize", event.target.value)
                }
              />
            </label>
          ) : null}
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">페이지 표시</h3>
            <p className="mt-1 text-xs text-slate-500">슬라이드 위치와 자동 전환 진행을 표시합니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "원형", value: "circle" },
              { label: "네모", value: "square" },
              { label: "활성 확장형", value: "long-active" },
              { label: "숫자형", value: "numeric" },
              { label: "프로그레스형", value: "progress" },
            ].map((option) => (
              <button
                className={cn(
                  "h-12 rounded-lg border text-xs font-semibold",
                  paginationStyle === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-500",
                )}
                key={option.value}
                type="button"
                onClick={() =>
                  updateSectionField(selectedIndex, "paginationStyle", option.value)
                }
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="block space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>자동 전환 시간</span>
              <span>{(numberValue(selectedSection, "autoplayDelay", 4500) / 1000).toFixed(1)}초</span>
            </div>
            <input
              className="w-full accent-blue-600"
              max="10000"
              min="2000"
              step="500"
              type="range"
              value={stringValue(selectedSection, "autoplayDelay", "4500")}
              onChange={(event) =>
                updateSectionField(selectedIndex, "autoplayDelay", event.target.value)
              }
            />
          </label>
        </section>
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
      blockIndex?: number;
      sectionIndex?: number;
      sectionField?: string;
      slideIndex?: number;
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
      const applyUploadedUrl = (url: string) => {
        if (typeof options?.slideIndex === "number") {
          const slides = heroSlides(section);
          slides[options.slideIndex] = {
            ...slides[options.slideIndex],
            backgroundType: "image",
            imageUrl: url,
          };
          updateSection(targetIndex, { ...section, slides });
          return;
        }

        if (typeof options?.blockIndex === "number") {
          const blocks = contentBlocks(section).map((b, i) =>
            i === options.blockIndex ? { ...b, imageUrl: url } : b,
          );
          updateSection(targetIndex, { ...section, blocks });
          return;
        }

        if (options?.sectionField) {
          updateSection(targetIndex, {
            ...section,
            [options.sectionField]: url,
          });
          return;
        }

        updateSection(targetIndex, {
          ...section,
          ...(applyAsBackground ? { backgroundType: mediaType } : {}),
          [urlKey]: url,
        });
      };

      if (isDemoSite) {
        const dataUrl = await readFileAsDataUrl(file);

        applyUploadedUrl(dataUrl);
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
      applyUploadedUrl(data.publicUrl);
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
  const isPageSettingsMode = leftPanel === "settings" && settingsSubPanel === "pages";
  const isHeaderSettingsMode = leftPanel === "settings" && settingsSubPanel === "menu";
  const isFooterSettingsMode = leftPanel === "settings" && settingsSubPanel === "footer";
  const isLanguageSettingsMode =
    leftPanel === "settings" && settingsSubPanel === "language";
  const headerLayout = draft.design.headerLayout;
  const footerLayout = draft.design.footerLayout;
  const pageById = new Map(draft.pages.map((page) => [page.id, page]));
  const localeCopy =
    activeLocale === "en"
      ? {
          builderDescription: "A simple website builder with polished results.",
          ctaDescription: "From template selection to publishing in one flow.",
          ctaTitle: "Start your website with KEYUN",
          information: "Information",
          inquiry: "Contact",
          menu: "Menu",
          privacy: "Privacy Policy",
          start: "Get started",
          terms: "Terms",
        }
      : {
          builderDescription: "쉬운데 결과물이 예쁜 웹사이트 빌더, KEYUN.",
          ctaDescription: "템플릿 선택부터 게시까지 한 번에 이어집니다.",
          ctaTitle: "지금 KEYUN으로 사이트를 시작하세요",
          information: "정보",
          inquiry: "문의하기",
          menu: "메뉴",
          privacy: "개인정보처리방침",
          start: "시작하기",
          terms: "이용약관",
        };
  const localizedSiteName = draft.i18n.siteName[activeLocale] || site.name;
  const localizedCopyright =
    draft.i18n.footerCopyright[activeLocale] ||
    (activeLocale === "en" ? "All rights reserved." : "모든 권리 보유.");
  const headerMenuItems = draft.navigation
    .filter((item) => item.enabled)
    .filter((item) => pageById.get(item.pageId)?.status === "public")
    .map((item) =>
      activeLocale === "ko"
        ? item.label
        : stringValue(item.translations?.[activeLocale] ?? {}, "label", item.label),
    );
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
  const focusPreviewClass =
    "relative z-30 ring-2 ring-blue-500 ring-offset-4 ring-offset-white shadow-[0_0_0_9999px_rgba(15,23,42,0.10)]";

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
              blockIndex: visualUploadBlockIndex ?? undefined,
              sectionIndex: visualUploadIndex,
            });
          }

          setVisualUploadBlockIndex(null);
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={slideMediaInputRef}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        disabled={isUploading}
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file && slideUploadTarget) {
            void uploadSectionMedia(file, "image", {
              sectionIndex: slideUploadTarget.sectionIndex,
              slideIndex: slideUploadTarget.slideIndex,
            });
          }

          event.currentTarget.value = "";
        }}
      />
      <input
        ref={arrowMediaInputRef}
        accept="image/svg+xml,image/png,image/webp"
        className="hidden"
        disabled={isUploading}
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            void uploadSectionMedia(file, "image", {
              applyAsBackground: false,
              sectionField: "arrowImageUrl",
              sectionIndex: selectedIndex,
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
                  <p className="truncate text-sm font-semibold">{site.name}</p>
                  <p className="truncate text-xs text-slate-500">/s/{site.slug}</p>
                </div>
                <ChevronDown className="ml-auto size-4 text-slate-400" />
              </div>
            </div>

            <nav className="mt-8 space-y-1">
              {[
                { label: "기본 설정", icon: Settings, panel: "settings" as const },
                { label: "디자인", icon: Palette, panel: "sections" as const },
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
                      if (item.panel === "settings") setSettingsSubPanel(null);
                    }}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {leftPanel === "pages" ? (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">페이지</p>
                    <p className="mt-1 text-xs text-slate-400">{sitePages.length}개</p>
                  </div>
                  <Button
                    className="h-8 px-3 text-xs"
                    type="button"
                    onClick={() => setIsPageComposerOpen((current) => !current)}
                  >
                    <Plus className="size-3.5" />
                    추가
                  </Button>
                </div>

                {isPageComposerOpen ? (
                  <div className="mt-3 space-y-3 rounded-lg border border-blue-200 bg-white p-3">
                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        페이지명
                      </span>
                      <Input
                        autoFocus
                        className="h-9 text-sm"
                        placeholder="예: 회사 소개"
                        value={newPageTitle}
                        onChange={(event) => {
                          const title = event.target.value;
                          setNewPageTitle(title);
                          if (!isPagePathTouched) {
                            setNewPagePath(slugifyPath(title).replace(/^\//, ""));
                          }
                        }}
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        페이지 주소
                      </span>
                      <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-2">
                        <span className="text-xs text-slate-400">/</span>
                        <input
                          className="min-w-0 flex-1 bg-transparent px-1 text-xs outline-none"
                          placeholder="company"
                          value={newPagePath}
                          onChange={(event) => {
                            setIsPagePathTouched(true);
                            setNewPagePath(
                              event.target.value.replace(/^\/+/, "").replace(/\s+/g, "-"),
                            );
                          }}
                        />
                      </div>
                    </label>
                    <div className="flex gap-2">
                      <Button
                        className="h-8 flex-1 text-xs"
                        disabled={isCreatingPage || !newPageTitle.trim()}
                        type="button"
                        onClick={() => void addPage()}
                      >
                        {isCreatingPage ? "생성 중..." : "페이지 만들기"}
                      </Button>
                      <Button
                        className="h-8 px-3 text-xs"
                        type="button"
                        variant="outline"
                        onClick={() => setIsPageComposerOpen(false)}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 space-y-2">
                  {sitePages.map((sitePage) => {
                    const isActive = sitePage.id === page.id;
                    const PageIcon = sitePage.path === "/" ? Home : FileText;

                    return (
                      <button
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                          isActive
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-blue-200",
                        )}
                        key={sitePage.id}
                        type="button"
                        onClick={() => openEditorPage(sitePage.id)}
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-md",
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600",
                          )}
                        >
                          <PageIcon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {sitePage.title}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                            {sitePage.path}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            sitePage.status === "public"
                              ? "bg-emerald-500"
                              : "bg-slate-300",
                          )}
                          title={sitePage.status === "public" ? "공개" : "비공개"}
                        />
                        <ArrowRight
                          className={cn(
                            "size-4 shrink-0 text-slate-300 transition-transform",
                            !isActive && "group-hover:translate-x-0.5 group-hover:text-blue-500",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* 디자인 탭 — 페이지 스위처 + 섹션 순서 */}
            {leftPanel === "sections" && (
              <>
                {/* 페이지 스위처 */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">페이지</p>
                    <button
                      className="flex size-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      type="button"
                      title="새 페이지 추가"
                      onClick={() => setIsPageComposerOpen((v) => !v)}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  {isPageComposerOpen && (
                    <div className="mb-3 space-y-3 rounded-lg border border-blue-200 bg-white p-3">
                      <label className="block space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-500">페이지명</span>
                        <Input
                          autoFocus
                          className="h-9 text-sm"
                          placeholder="예: 서비스 소개"
                          value={newPageTitle}
                          onChange={(event) => {
                            const title = event.target.value;
                            setNewPageTitle(title);
                            if (!isPagePathTouched) {
                              setNewPagePath(slugifyPath(title).replace(/^\//, ""));
                            }
                          }}
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-500">페이지 주소</span>
                        <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-2">
                          <span className="text-xs text-slate-400">/</span>
                          <input
                            className="min-w-0 flex-1 bg-transparent px-1 text-xs outline-none"
                            placeholder="service"
                            value={newPagePath}
                            onChange={(event) => {
                              setIsPagePathTouched(true);
                              setNewPagePath(
                                event.target.value.replace(/^\/+/, "").replace(/\s+/g, "-"),
                              );
                            }}
                          />
                        </div>
                      </label>
                      <div className="flex gap-2">
                        <Button
                          className="h-8 flex-1 text-xs"
                          disabled={isCreatingPage || !newPageTitle.trim()}
                          type="button"
                          onClick={() => void addPage()}
                        >
                          {isCreatingPage ? "생성 중..." : "페이지 만들기"}
                        </Button>
                        <Button
                          className="h-8 px-3 text-xs"
                          type="button"
                          variant="outline"
                          onClick={() => setIsPageComposerOpen(false)}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    {sitePages.map((sitePage) => {
                      const isActive = sitePage.id === page.id;
                      const PageIcon = sitePage.path === "/" ? Home : FileText;
                      return (
                        <button
                          key={sitePage.id}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
                            isActive
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                          )}
                          type="button"
                          onClick={() => openEditorPage(sitePage.id)}
                        >
                          <PageIcon className={cn("size-3.5 shrink-0", isActive ? "text-blue-200" : "text-slate-400")} />
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                            {sitePage.title}
                          </span>
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              sitePage.status === "public" ? "bg-emerald-400" : isActive ? "bg-blue-300" : "bg-slate-300",
                            )}
                            title={sitePage.status === "public" ? "공개" : "비공개"}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="my-5 border-t border-slate-100" />

                {/* 섹션 목록 */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">섹션 위치</p>
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
                            {stringValue(
                              localizedSection(section, activeLocale),
                              "title",
                              "Untitled",
                            )}
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
                <div className="space-y-2">
                  {[
                    {
                      key: "language" as const,
                      label: "언어 설정",
                      desc: "한국어 · English · 다국어 SEO",
                      preview: (
                        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 flex-1 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold text-white">
                              KO
                            </span>
                            <span
                              className={cn(
                                "flex h-7 flex-1 items-center justify-center rounded-md border text-[10px] font-bold",
                                draft.i18n.locales.includes("en")
                                  ? "border-blue-200 bg-white text-blue-600"
                                  : "border-slate-200 bg-white text-slate-300",
                              )}
                            >
                              EN
                            </span>
                            <Languages className="size-4 text-slate-400" />
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "menu" as const,
                      label: "메뉴 설정",
                      desc: "GNB 연결 · 헤더 레이아웃",
                      preview: (
                        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                          <div className="flex h-7 items-center justify-between rounded-lg border border-slate-200 bg-white px-3">
                            <div className="h-2 w-10 rounded-full bg-blue-500" />
                            <div className="flex gap-1.5">
                              {["제품","솔루션","가격","회사"].map((m) => (
                                <span key={m} className="text-[9px] font-semibold text-slate-400">{m}</span>
                              ))}
                            </div>
                            <div className="h-4 w-9 rounded-full bg-slate-800" />
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "footer" as const,
                      label: "하단 정보 설정",
                      desc: "레이아웃 · 카피라이트 · 색상",
                      preview: (
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
                      ),
                    },
                  ].map((item) => {
                    const isSelected = settingsSubPanel === item.key;
                    return (
                      <button
                        key={item.key}
                        className={cn(
                          "group w-full overflow-hidden rounded-xl border-2 bg-white transition-all",
                          isSelected
                            ? "border-blue-500"
                            : "border-slate-200 hover:border-blue-300",
                        )}
                        type="button"
                        onClick={() => setSettingsSubPanel(item.key)}
                      >
                        {item.preview}
                        <div className={cn(
                          "flex items-center justify-between px-4 py-3",
                          isSelected && "bg-blue-50/60",
                        )}>
                          <div className="text-left">
                            <p className={cn("text-sm font-semibold", isSelected ? "text-blue-700" : "text-slate-800")}>{item.label}</p>
                            <p className="mt-0.5 text-[11px] text-slate-400">{item.desc}</p>
                          </div>
                          {isSelected
                            ? <Check className="size-4 text-blue-500" />
                            : <ArrowRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          <section className="min-w-0">
            <header className="flex h-[74px] items-center justify-between border-b border-blue-100 bg-white px-8">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">디자인</span>
                <span className="text-slate-300">&gt;</span>
                <span className="font-semibold">{page.title}</span>
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
                <div className="flex rounded-lg border border-slate-200 bg-white p-1">
                  {draft.i18n.locales.map((locale) => (
                    <button
                      className={cn(
                        "h-8 rounded-md px-3 text-xs font-semibold transition-colors",
                        activeLocale === locale
                          ? "bg-slate-950 text-white"
                          : "text-slate-500 hover:bg-slate-50",
                      )}
                      key={locale}
                      type="button"
                      onClick={() => setActiveLocale(locale)}
                    >
                      {locale === "ko" ? "한국어" : "English"}
                    </button>
                  ))}
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
                <Button
                  disabled={isSaving}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void previewDraft();
                  }}
                >
                  미리보기
                </Button>
                <Button
                  disabled={isSaving}
                  type="button"
                  onClick={() => {
                    void saveAndPublish();
                  }}
                >
                  {isSaving ? "처리 중..." : "저장 및 게시"}
                  <ChevronDown />
                </Button>
              </div>
            </header>

            <div ref={canvasScrollRef} className="h-[calc(100vh-74px)] overflow-auto px-8 py-5">
              <div
                className={cn(
                  "mx-auto rounded-lg border border-blue-100 bg-white transition-all",
                  draft.design.headerPosition === "fixed" ? "overflow-visible" : "overflow-hidden",
                  canvasWidthClass,
                )}
                style={canvasStyle}
                onContextMenu={openSiteContextMenu}
              >
                <div
                  ref={headerPreviewRef}
                  className={cn(
                    "flex min-h-20 items-center gap-8 px-10 transition-all",
                    draft.design.headerPosition === "fixed" && "sticky top-0 z-40 shadow-sm",
                    headerLayout === "left" ? "justify-between" : "justify-between",
                    isHeaderSettingsMode && focusPreviewClass,
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
                      {localeCopy.start}
                    </button>
                </div>

                
                  <div className="space-y-[var(--section-gap)]" style={{ "--section-gap": `${draft.design.sectionGap}px` } as CSSProperties}>
                    {draft.sections.map((section, index) => (
                      <CanvasSection
                        key={stringValue(section, "builderId") || `${stringValue(section, "type")}-${index}`}
                        addContentBlock={addContentBlock}
                        animationPreview={index === selectedIndex ? animationPreview : null}
                        design={draft.design}
                        index={index}
                        isSelected={index === selectedIndex}
                        moveSection={moveSection}
                        openContextMenu={openContextMenu}
                        removeContentBlock={removeContentBlock}
                        requestVisualUpload={requestVisualUpload}
                        requestContentBlockUpload={(sIdx, bIdx) => {
                          setVisualUploadIndex(sIdx);
                          setVisualUploadBlockIndex(bIdx);
                          visualMediaInputRef.current?.click();
                        }}
                        removeSection={removeSection}
                        selectedSlideIndex={selectedSlideIndex}
                        section={localizedSection(section, activeLocale)}
                        selectedElement={selectedElement}
                        selectElement={selectElementForEdit}
                        selectSection={selectSectionForEdit}
                        selectSlide={setSelectedSlideIndex}
                        toggleContentBlockLayout={toggleContentBlockLayout}
                        updateContentBlock={updateContentBlock}
                        updateField={updateLocalizedSectionField}
                        updateItems={updateLocalizedSectionItems}
                        updateSlideField={updateHeroSlide}
                        viewport={viewport}
                      />
                    ))}
                  </div>
                

                <footer
                  ref={footerPreviewRef}
                  className={cn(
                    "px-10 py-10 transition-all",
                    isFooterSettingsMode && focusPreviewClass,
                  )}
                  style={footerStyle}
                >
                    {footerLayout === "simple" ? (
                      <div className="flex flex-wrap items-center justify-between gap-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="keyun" className="h-7 w-auto brightness-0 invert" src="/keyun-logo.svg" />
                        <div className="flex flex-wrap items-center gap-6 text-sm font-medium opacity-80">
                          <span>{localeCopy.terms}</span>
                          <span>{localeCopy.privacy}</span>
                          <span>{localeCopy.inquiry}</span>
                        </div>
                        <p className="text-sm opacity-60">
                          © {localizedSiteName}. {localizedCopyright}
                        </p>
                      </div>
                    ) : footerLayout === "cta" ? (
                      <div className="space-y-8">
                        <div className="rounded-2xl border border-white/10 bg-white/10 px-8 py-7 text-center">
                          <p className="text-2xl font-bold">{localeCopy.ctaTitle}</p>
                          <p className="mt-2 text-sm opacity-70">
                            {localeCopy.ctaDescription}
                          </p>
                          <button
                            className="mt-5 rounded-full px-6 py-3 text-sm font-semibold"
                            style={{
                              backgroundColor: draft.design.footerAccentColor,
                              color: draft.design.footerTextColor,
                            }}
                            type="button"
                          >
                            {localeCopy.inquiry}
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm opacity-70">
                          <span>© {localizedSiteName}. {localizedCopyright}</span>
                          <span>Instagram · Blog · Kakao</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
                        <div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="keyun" className="h-8 w-auto brightness-0 invert" src="/keyun-logo.svg" />
                          <p className="mt-4 text-sm leading-6 opacity-70">
                            {localeCopy.builderDescription}
                          </p>
                          <p className="mt-5 text-xs opacity-50">
                            © {localizedSiteName}. {localizedCopyright}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={footerAccentStyle}>{localeCopy.menu}</p>
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
              </div>

            </div>

            {/* 언어 설정 floating 패널 */}
            {isLanguageSettingsMode ? (
              <div className="fixed bottom-5 left-[340px] right-[380px] z-40">
                <div className="rounded-2xl border border-blue-100 bg-white/95 backdrop-blur">
                  <div className="max-h-[420px] overflow-auto p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">언어 설정</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          한국어 디자인을 공유하고 영어 콘텐츠만 따로 관리합니다.
                        </p>
                      </div>
                      <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => setSettingsSubPanel(null)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                      <div className="space-y-2">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-blue-700">한국어</p>
                              <p className="mt-1 text-[11px] text-blue-600/70">기본 언어 · /s/{site.slug}</p>
                            </div>
                            <Check className="size-4 text-blue-600" />
                          </div>
                        </div>
                        <button
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg border p-3 text-left",
                            draft.i18n.locales.includes("en")
                              ? "border-emerald-200 bg-emerald-50"
                              : "border-slate-200 bg-white",
                          )}
                          type="button"
                          onClick={() =>
                            setEnglishEnabled(!draft.i18n.locales.includes("en"))
                          }
                        >
                          <div>
                            <p className="text-xs font-bold">English</p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              /s/{site.slug}/en
                            </p>
                          </div>
                          <span
                            className={cn(
                              "flex h-6 w-11 items-center rounded-full p-0.5 transition-colors",
                              draft.i18n.locales.includes("en")
                                ? "justify-end bg-emerald-500"
                                : "justify-start bg-slate-200",
                            )}
                          >
                            <span className="size-5 rounded-full bg-white" />
                          </span>
                        </button>
                      </div>

                      {draft.i18n.locales.includes("en") ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-500">
                              영문 사이트명
                            </span>
                            <Input
                              className="h-9"
                              placeholder={site.name}
                              value={draft.i18n.siteName.en ?? ""}
                              onChange={(event) =>
                                updateI18nSiteField("siteName", "en", event.target.value)
                              }
                            />
                          </label>
                          <label className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-500">
                              영문 SEO 제목
                            </span>
                            <Input
                              className="h-9"
                              placeholder={site.name}
                              value={draft.i18n.seo.en?.title ?? ""}
                              onChange={(event) =>
                                updateI18nSeo("en", "title", event.target.value)
                              }
                            />
                          </label>
                          <label className="space-y-1.5 md:col-span-2">
                            <span className="text-[11px] font-semibold text-slate-500">
                              영문 SEO 설명
                            </span>
                            <Textarea
                              className="min-h-16"
                              value={draft.i18n.seo.en?.description ?? ""}
                              onChange={(event) =>
                                updateI18nSeo("en", "description", event.target.value)
                              }
                            />
                          </label>
                          <label className="space-y-1.5 md:col-span-2">
                            <span className="text-[11px] font-semibold text-slate-500">
                              영문 카피라이트
                            </span>
                            <Input
                              className="h-9"
                              value={draft.i18n.footerCopyright.en ?? ""}
                              onChange={(event) =>
                                updateI18nSiteField(
                                  "footerCopyright",
                                  "en",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <p className="text-[11px] leading-5 text-slate-400 md:col-span-2">
                            상단의 EN을 선택하면 페이지명, GNB, 섹션과 슬라이드 내용을 영문으로 입력할 수 있습니다.
                          </p>
                        </div>
                      ) : (
                        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
                          <div>
                            <Languages className="mx-auto size-6 text-slate-300" />
                            <p className="mt-2 text-xs font-semibold text-slate-500">
                              English를 활성화하면 번역 설정이 열립니다.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 페이지 관리 floating 패널 */}
            {isPageSettingsMode ? (
              <div className="fixed bottom-5 left-[340px] right-[380px] z-40">
                <div className="rounded-2xl border border-blue-100 bg-white/95 shadow-2xl shadow-blue-950/10 backdrop-blur">
                  <div className="max-h-[420px] overflow-hidden p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">페이지 생성 및 관리</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          페이지를 추가하고 공개 상태, 경로, 메뉴 연결 기준을 관리합니다.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          className="h-8 px-3 text-xs"
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSettingsSubPanel(null);
                            setLeftPanel("sections");
                            setIsPageComposerOpen(true);
                          }}
                        >
                          <Plus className="size-3.5" />
                          페이지 추가
                        </Button>
                        <Button size="icon" type="button" variant="ghost" onClick={() => setSettingsSubPanel(null)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-[330px] space-y-2 overflow-auto pr-1">
                      {draft.pages.map((pageItem, index) => (
                        <div
                          key={pageItem.id}
                          className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 md:grid-cols-[56px_1.1fr_1fr_88px_128px] md:items-center"
                        >
                          <div className="flex items-center gap-1">
                            <GripVertical className="size-4 text-slate-300" />
                            <Button className="size-6" disabled={index === 0} size="icon" title="위로" type="button" variant="ghost" onClick={() => movePage(pageItem.id, -1)}>
                              <ArrowUp className="size-3" />
                            </Button>
                            <Button className="size-6" disabled={index === draft.pages.length - 1} size="icon" title="아래로" type="button" variant="ghost" onClick={() => movePage(pageItem.id, 1)}>
                              <ArrowDown className="size-3" />
                            </Button>
                          </div>

                          <label className="space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400">페이지명</span>
                            <Input
                              className="h-8 bg-white text-xs"
                              value={localizedPageTitle(pageItem, activeLocale)}
                              onChange={(event) =>
                                updateLocalizedPageTitle(pageItem.id, event.target.value)
                              }
                            />
                          </label>

                          <label className="space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400">주소</span>
                            <Input
                              className="h-8 bg-white font-mono text-xs"
                              disabled={activeLocale !== "ko"}
                              value={pageItem.path}
                              onChange={(event) => updatePage(pageItem.id, { path: event.target.value })}
                            />
                          </label>

                          <button
                            className={cn(
                              "mt-4 h-8 rounded-md border px-2 text-xs font-semibold md:mt-5",
                              pageItem.status === "public"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-500",
                            )}
                            type="button"
                            onClick={() => updatePage(pageItem.id, { status: pageItem.status === "public" ? "private" : "public" })}
                          >
                            {pageItem.status === "public" ? "공개" : "비공개"}
                          </button>

                          <div className="mt-4 flex items-center justify-end gap-1 md:mt-5">
                            <Button className="h-8 px-2 text-xs" type="button" variant="outline" onClick={() => duplicatePage(pageItem.id)}>
                              <Copy className="size-3.5" />
                              복제
                            </Button>
                            <Button
                              className="h-8 px-2 text-xs"
                              disabled={pageItem.id === "home" || draft.pages.length <= 1}
                              type="button"
                              variant="outline"
                              onClick={() => removePage(pageItem.id)}
                            >
                              <Trash2 className="size-3.5" />
                              삭제
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 헤더 설정 floating 패널 */}
            {isHeaderSettingsMode ? (
              <div className="fixed bottom-5 left-[340px] right-[380px] z-40">
                <div className="rounded-2xl border border-blue-100 bg-white/95 shadow-2xl shadow-blue-950/10 backdrop-blur">
                  <div className="max-h-[360px] overflow-hidden p-4">
                    {/* 헤더 */}
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">메뉴 설정</p>
                        <p className="mt-0.5 text-xs text-slate-500">헤더 레이아웃과 색상을 편집합니다.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className={cn(
                            "flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
                            draft.design.headerPosition === "fixed"
                              ? "bg-blue-600 text-white"
                              : "border border-slate-200 bg-white text-slate-500 hover:border-blue-300",
                          )}
                          type="button"
                          onClick={() => updateDesign("headerPosition", draft.design.headerPosition === "fixed" ? "scroll" : "fixed")}
                        >
                          {draft.design.headerPosition === "fixed" ? "고정됨" : "스크롤"}
                        </button>
                        <Button size="icon" type="button" variant="ghost" onClick={() => setSettingsSubPanel(null)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                    {/* 탭 + 컨텐츠 */}
                    <div className="grid gap-4 md:grid-cols-[100px_1fr]">
                      {/* 좌측 탭 */}
                      <div className="space-y-1">
                        {(["layout", "color", "menu"] as const).map((tab) => (
                          <button
                            key={tab}
                            className={cn(
                              "block h-8 w-full rounded-md px-3 text-left text-sm",
                              headerSettingsTab === tab ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50",
                            )}
                            type="button"
                            onClick={() => setHeaderSettingsTab(tab)}
                          >
                            {tab === "layout" ? "레이아웃" : tab === "color" ? "색상" : "GNB 메뉴"}
                          </button>
                        ))}
                      </div>
                      {/* 우측 컨텐츠 */}
                      <div className="max-h-[260px] overflow-auto pr-1">
                        {headerSettingsTab === "layout" && (
                          <>
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-sm font-semibold">헤더 섹션</p>
                              <span className="text-xs text-slate-400">3개 레이아웃</span>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                              {[
                                { label: "기본형", value: "center", desc: "로고 / 중앙 GNB / 우측 버튼", preview: (
                                  <div className="flex h-10 items-center justify-between rounded-lg bg-slate-50 px-2">
                                    <div className="h-2 w-8 rounded-full bg-blue-500" />
                                    <div className="flex gap-1.5">{[1,2,3].map(i=><div key={i} className="h-1.5 w-5 rounded-full bg-slate-300"/>)}</div>
                                    <div className="h-5 w-10 rounded-full bg-slate-900" />
                                  </div>
                                )},
                                { label: "좌측 메뉴형", value: "left", desc: "로고 옆에 GNB 메뉴 배치", preview: (
                                  <div className="flex h-10 items-center justify-between rounded-lg bg-slate-50 px-2">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-8 rounded-full bg-blue-500" />
                                      <div className="flex gap-1.5">{[1,2,3].map(i=><div key={i} className="h-1.5 w-4 rounded-full bg-slate-300"/>)}</div>
                                    </div>
                                    <div className="h-5 w-10 rounded-full bg-slate-900" />
                                  </div>
                                )},
                                { label: "CTA 강조형", value: "cta", desc: "우측 버튼을 강조한 구성", preview: (
                                  <div className="flex h-10 items-center justify-between rounded-lg bg-slate-50 px-2">
                                    <div className="h-2 w-8 rounded-full bg-blue-500" />
                                    <div className="flex gap-1.5">{[1,2,3].map(i=><div key={i} className="h-1.5 w-5 rounded-full bg-slate-300"/>)}</div>
                                    <div className="h-5 w-14 rounded-full bg-blue-600" />
                                  </div>
                                )},
                              ].map((opt) => (
                                <div
                                  key={opt.value}
                                  role="button"
                                  tabIndex={0}
                                  className={cn(
                                    "rounded-lg border p-2 text-left transition hover:border-blue-300 hover:bg-blue-50/40",
                                    draft.design.headerLayout === opt.value ? "border-blue-500" : "border-slate-100",
                                  )}
                                  onClick={() => updateDesign("headerLayout", opt.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateDesign("headerLayout", opt.value); }}}
                                >
                                  {opt.preview}
                                  <p className="mt-2 truncate text-xs font-semibold">{opt.label}</p>
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{opt.desc}</p>
                                  <Button
                                    className="mt-2 h-8 w-full text-xs"
                                    type="button"
                                    variant={draft.design.headerLayout === opt.value ? "default" : "outline"}
                                    onClick={(e) => { e.stopPropagation(); updateDesign("headerLayout", opt.value); }}
                                  >
                                    {draft.design.headerLayout === opt.value ? <><Check className="size-3.5" /> 적용됨</> : "적용"}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {headerSettingsTab === "color" && (
                          <>
                            <div className="mb-3">
                              <p className="text-sm font-semibold">헤더 색상</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { key: "headerBgColor", label: "배경", value: draft.design.headerBgColor },
                                { key: "headerTextColor", label: "메뉴 텍스트", value: draft.design.headerTextColor },
                                { key: "headerButtonBgColor", label: "버튼 배경", value: draft.design.headerButtonBgColor },
                                { key: "headerButtonTextColor", label: "버튼 텍스트", value: draft.design.headerButtonTextColor },
                              ].map((item) => (
                                <label key={item.key} className="space-y-1.5">
                                  <span className="text-[11px] text-slate-500">{item.label}</span>
                                  <div className="relative h-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <input className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="color" value={item.value}
                                      onChange={(e) => updateDesign(item.key as keyof DesignSettings, e.target.value)}
                                      onInput={(e) => updateDesign(item.key as keyof DesignSettings, e.currentTarget.value)} />
                                    <div className="pointer-events-none flex h-full items-center gap-2 px-2">
                                      <span className="inline-block size-4 rounded border border-slate-200" style={{ backgroundColor: item.value }} />
                                      <span className="font-mono text-[11px] uppercase text-slate-500">{item.value}</span>
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </>
                        )}
                        {headerSettingsTab === "menu" && (
                          <>
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-sm font-semibold">GNB 메뉴</p>
                              <Button className="h-6 px-2 text-[11px]" size="sm" type="button" variant="outline" onClick={addNavigationItem}>
                                <Plus className="size-3" /> 추가
                              </Button>
                            </div>
                            <div className="space-y-1.5">
                              {draft.navigation.map((item, index) => {
                                const linkedPage = pageById.get(item.pageId);

                                return (
                                  <div key={item.id} className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 md:grid-cols-[64px_1fr_1.1fr_74px_72px] md:items-center">
                                    <div className="flex items-center gap-1">
                                      <Button className="size-6" disabled={index === 0} size="icon" type="button" variant="ghost" onClick={() => moveNavigationItem(item.id, -1)}>
                                        <ArrowUp className="size-3" />
                                      </Button>
                                      <Button className="size-6" disabled={index === draft.navigation.length - 1} size="icon" type="button" variant="ghost" onClick={() => moveNavigationItem(item.id, 1)}>
                                        <ArrowDown className="size-3" />
                                      </Button>
                                    </div>
                                    <Input
                                      className="h-8 text-xs"
                                      value={localizedNavigationLabel(item, activeLocale)}
                                      onChange={(event) =>
                                        updateLocalizedNavigationLabel(
                                          item.id,
                                          event.target.value,
                                        )
                                      }
                                    />
                                    <select
                                      className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                                      value={item.pageId}
                                      onChange={(event) => updateNavigationItem(item.id, { pageId: event.target.value })}
                                    >
                                      {draft.pages.map((page) => (
                                        <option key={page.id} value={page.id}>
                                          {localizedPageTitle(page, activeLocale)}
                                          {page.status === "private" ? " (비공개)" : ""}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      className={cn(
                                        "h-8 rounded-md border px-2 text-xs font-semibold",
                                        item.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500",
                                      )}
                                      type="button"
                                      onClick={() => updateNavigationItem(item.id, { enabled: !item.enabled })}
                                    >
                                      {item.enabled ? "노출" : "숨김"}
                                    </button>
                                    <Button className="h-8 px-2 text-xs" type="button" variant="outline" onClick={() => removeNavigationItem(item.id)}>
                                      삭제
                                    </Button>
                                    <p className="md:col-span-5 text-[10px] text-slate-400">
                                      연결 페이지: {linkedPage ? localizedPageTitle(linkedPage, activeLocale) : "없음"} {linkedPage?.status === "private" ? "· 공개 페이지에서는 메뉴 숨김" : ""}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 하단 정보 설정 floating 패널 */}
            {isFooterSettingsMode ? (
              <div className="fixed bottom-5 left-[340px] right-[380px] z-40">
                <div className="rounded-2xl border border-blue-100 bg-white/95 shadow-2xl shadow-blue-950/10 backdrop-blur">
                  <div className="max-h-[360px] overflow-hidden p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">하단 정보 설정</p>
                        <p className="mt-0.5 text-xs text-slate-500">푸터 레이아웃과 색상을 편집합니다.</p>
                      </div>
                      <Button size="icon" type="button" variant="ghost" onClick={() => setSettingsSubPanel(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[100px_1fr]">
                      {/* 좌측 탭 */}
                      <div className="space-y-1">
                        {(["layout", "color"] as const).map((tab) => (
                          <button
                            key={tab}
                            className={cn(
                              "block h-8 w-full rounded-md px-3 text-left text-sm",
                              footerSettingsTab === tab ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50",
                            )}
                            type="button"
                            onClick={() => setFooterSettingsTab(tab)}
                          >
                            {tab === "layout" ? "레이아웃" : "색상"}
                          </button>
                        ))}
                      </div>
                      {/* 우측 컨텐츠 */}
                      <div className="max-h-[260px] overflow-auto pr-1">
                        {footerSettingsTab === "layout" && (
                          <>
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-sm font-semibold">하단 정보 섹션</p>
                              <span className="text-xs text-slate-400">3개 레이아웃</span>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                              {[
                                { label: "정보형", value: "info", desc: "회사 소개 + 링크 컬럼 구성", preview: (
                                  <div className="rounded-lg bg-slate-800 px-3 py-3">
                                    <div className="grid grid-cols-3 gap-1.5">
                                      {[1,2,3].map(i=>(
                                        <div key={i} className="space-y-1">
                                          <div className="h-1.5 w-8 rounded-full bg-white/40" />
                                          <div className="h-1 w-6 rounded-full bg-white/20" />
                                          <div className="h-1 w-7 rounded-full bg-white/20" />
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-2 h-px bg-white/10" />
                                    <div className="mt-1.5 h-1 w-16 rounded-full bg-white/15" />
                                  </div>
                                )},
                                { label: "미니멀형", value: "minimal", desc: "로고와 카피라이트만 표시", preview: (
                                  <div className="flex h-16 items-center justify-between rounded-lg bg-slate-800 px-3">
                                    <div className="h-2 w-10 rounded-full bg-white/40" />
                                    <div className="h-1.5 w-16 rounded-full bg-white/20" />
                                  </div>
                                )},
                                { label: "소셜형", value: "social", desc: "SNS 링크를 중앙에 배치", preview: (
                                  <div className="rounded-lg bg-slate-800 px-3 py-3">
                                    <div className="flex justify-center gap-2">
                                      {[1,2,3,4].map(i=><div key={i} className="size-5 rounded bg-white/20" />)}
                                    </div>
                                    <div className="mt-2 h-1 w-20 mx-auto rounded-full bg-white/15" />
                                  </div>
                                )},
                              ].map((opt) => (
                                <div
                                  key={opt.value}
                                  role="button"
                                  tabIndex={0}
                                  className={cn(
                                    "rounded-lg border p-2 text-left transition hover:border-blue-300 hover:bg-blue-50/40",
                                    draft.design.footerLayout === opt.value ? "border-blue-500" : "border-slate-100",
                                  )}
                                  onClick={() => updateDesign("footerLayout", opt.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateDesign("footerLayout", opt.value); }}}
                                >
                                  {opt.preview}
                                  <p className="mt-2 truncate text-xs font-semibold">{opt.label}</p>
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{opt.desc}</p>
                                  <Button
                                    className="mt-2 h-8 w-full text-xs"
                                    type="button"
                                    variant={draft.design.footerLayout === opt.value ? "default" : "outline"}
                                    onClick={(e) => { e.stopPropagation(); updateDesign("footerLayout", opt.value); }}
                                  >
                                    {draft.design.footerLayout === opt.value ? <><Check className="size-3.5" /> 적용됨</> : "적용"}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {footerSettingsTab === "color" && (
                          <>
                            <div className="mb-3">
                              <p className="text-sm font-semibold">하단 정보 색상</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { key: "footerBgColor", label: "배경", value: draft.design.footerBgColor },
                                { key: "footerTextColor", label: "텍스트", value: draft.design.footerTextColor },
                                { key: "footerAccentColor", label: "강조색", value: draft.design.footerAccentColor },
                              ].map((item) => (
                                <label key={item.key} className="space-y-1.5">
                                  <span className="text-[11px] text-slate-500">{item.label}</span>
                                  <div className="relative h-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <input className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="color" value={item.value}
                                      onChange={(e) => updateDesign(item.key as keyof DesignSettings, e.target.value)}
                                      onInput={(e) => updateDesign(item.key as keyof DesignSettings, e.currentTarget.value)} />
                                    <div className="pointer-events-none flex h-full items-center gap-2 px-2">
                                      <span className="inline-block size-4 rounded border border-slate-200" style={{ backgroundColor: item.value }} />
                                      <span className="font-mono text-[11px] uppercase text-slate-500">{item.value}</span>
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {!settingsSubPanel ? (
              <div className="fixed bottom-5 left-[340px] right-[380px] z-40">
                <div className="rounded-2xl border border-blue-100 bg-white/95 shadow-2xl shadow-blue-950/10 backdrop-blur">
                  {isLibraryFullOpen ? (
                    /* ── 전체 라이브러리 확장 뷰 ── */
                    <div className="flex max-h-[72vh] flex-col">
                      {/* 헤더 */}
                      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3">
                        <div>
                          <p className="text-sm font-semibold">섹션 라이브러리</p>
                          <p className="text-xs text-slate-500">검증된 레이아웃을 골라 현재 페이지에 추가합니다.</p>
                        </div>
                        <Button
                          size="icon"
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setIsLibraryFullOpen(false);
                            setIsSectionLibraryOpen(false);
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      {/* 카테고리 탭 */}
                      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-100 px-4 py-2">
                        {availableLibraryCategories.map((category) => (
                          <button
                            key={category}
                            className={cn(
                              "h-7 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors",
                              activeLibraryCategory === category
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600",
                            )}
                            type="button"
                            onClick={() => setActiveLibraryCategory(category)}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      {/* 프리셋 그리드 */}
                      <div className="overflow-y-auto p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-semibold">{activeLibraryCategory} 섹션</p>
                          <span className="text-xs text-slate-400">{visibleModules.length}개 레이아웃</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                          {visibleModules.map((preset) => (
                            <div
                              key={`${preset.type}-${preset.layout}-full`}
                              role="button"
                              tabIndex={0}
                              className={cn(
                                "cursor-pointer rounded-xl border p-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50/40",
                                selectedSection &&
                                  stringValue(selectedSection, "type") === preset.type &&
                                  stringValue(selectedSection, "layout") === preset.layout
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-slate-100 bg-white",
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
                              <p className="mt-2.5 truncate text-xs font-semibold">{preset.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-slate-500">{preset.description}</p>
                              <Button
                                className="mt-2.5 h-7 w-full text-[11px]"
                                type="button"
                                variant="outline"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openModulePreview(preset);
                                }}
                              >
                                <Eye className="size-3" />
                                미리보기
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : isSectionLibraryOpen ? (
                    /* ── 카테고리별 미니 뷰 ── */
                    <div className="p-4">
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
                            onClick={() => setIsLibraryFullOpen(true)}
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
                    /* ── 기본 바 ── */
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
                        {availableLibraryCategories.map((category) => (
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
                        onClick={() => {
                          setIsLibraryFullOpen(true);
                          setIsSectionLibraryOpen(false);
                        }}
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
                    stringValue(selectedSection, "layout") === "slide" ? (
                      renderSlideContentSettings()
                    ) : (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold">제목</span>
                        <Input
                          value={stringValue(
                            localizedSelectedSection ?? selectedSection,
                            "title",
                          )}
                          onChange={(event) =>
                            updateLocalizedSectionField(
                              selectedIndex,
                              "title",
                              event.target.value,
                            )
                          }
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold">설명</span>
                        <Textarea
                          className="min-h-28"
                          value={stringValue(
                            localizedSelectedSection ?? selectedSection,
                            "description",
                          )}
                          onChange={(event) =>
                            updateLocalizedSectionField(
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
                            value={stringValue(
                              localizedSelectedSection ?? selectedSection,
                              "buttonLabel",
                            )}
                            onChange={(event) =>
                              updateLocalizedSectionField(
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
                            value={stringValue(
                              localizedSelectedSection ?? selectedSection,
                              "buttonLink",
                            )}
                            onChange={(event) =>
                              updateLocalizedSectionField(
                                selectedIndex,
                                "buttonLink",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      </div>
                      {/* location 전용 필드 */}
                      {stringValue(selectedSection, "type") === "location" ? (
                        <div className="space-y-4">
                          {(["address", "phone", "email"] as const).map((field) => (
                            <label key={field} className="space-y-2">
                              <span className="text-sm font-semibold">
                                {field === "address" ? "주소" : field === "phone" ? "전화번호" : "이메일"}
                              </span>
                              <Input
                                placeholder={
                                  field === "address" ? "서울특별시 강남구 테헤란로 123" :
                                  field === "phone" ? "02-1234-5678" : "hello@example.com"
                                }
                                value={stringValue(selectedSection, field, "")}
                                onChange={(e) => updateSectionField(selectedIndex, field, e.target.value)}
                              />
                            </label>
                          ))}
                          <label className="space-y-2">
                            <span className="text-sm font-semibold">교통편 안내</span>
                            <p className="text-xs text-slate-400">한 줄에 하나 · 형식: 교통수단|설명</p>
                            <Textarea
                              className="min-h-24 font-mono text-xs"
                              placeholder={"지하철|2호선 강남역 3번 출구 도보 5분\n버스|강남역 정류장 하차"}
                              value={itemsValue(selectedSection)}
                              onChange={(e) => updateLocalizedSectionItems(selectedIndex, e.target.value)}
                            />
                          </label>
                        </div>
                      ) : null}

                      {/* items 편집기 — 타입별 안내 문구 포함 */}
                      {/* 게시판 선택 — board 타입 전용 */}
                      {stringValue(selectedSection, "type") === "board" ? (
                        <div className="space-y-4">
                          <label className="block space-y-2">
                            <span className="text-sm font-semibold">게시판 선택</span>
                            <p className="text-xs text-slate-400">표시할 게시판을 선택하세요</p>
                            <select
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                              value={stringValue(selectedSection, "boardName", "")}
                              onChange={(e) => updateSectionField(selectedIndex, "boardName", e.target.value)}
                            >
                              <option value="">전체 게시글</option>
                              {initialBoards.map((board) => (
                                <option key={board.id ?? board.name} value={board.name}>{board.name}</option>
                              ))}
                            </select>
                          </label>
                          <label className="block space-y-2">
                            <span className="text-sm font-semibold">표시 개수</span>
                            <Input
                              className="h-9"
                              max="50"
                              min="1"
                              type="number"
                              value={stringValue(selectedSection, "postsPerPage", "10")}
                              onChange={(e) => updateSectionField(selectedIndex, "postsPerPage", e.target.value)}
                            />
                          </label>
                        </div>
                      ) : null}

                      {(() => {
                        const t = stringValue(selectedSection, "type");
                        const itemsTypes: Record<string, { label: string; hint: string }> = {
                          features:     { label: "항목",     hint: "한 줄에 하나" },
                          review:       { label: "후기",     hint: "형식: 이름|직책·회사|후기 내용" },
                          team:         { label: "팀원",     hint: "형식: 이름|직책|소개" },
                          faq:          { label: "FAQ",      hint: "형식: 질문|답변" },
                          stats:        { label: "수치",     hint: "형식: 라벨|숫자|단위(예: 고객사|5000|+)" },
                          pricing:      { label: "플랜",     hint: "형식: 이름|가격|설명|기능1,기능2" },
                          "org-chart":  { label: "구성원",   hint: "형식: 이름|직책|레벨(0=최상위)|" },
                          history:      { label: "연혁",     hint: "형식: 연도|제목|설명" },
                          vision:       { label: "핵심 항목", hint: "형식: 이름|설명" },
                          values:       { label: "가치",     hint: "형식: 이름|아이콘|설명" },
                          partners:     { label: "파트너",   hint: "한 줄에 하나 (파트너 이름)" },
                          awards:       { label: "수상·인증", hint: "형식: 제목|기관|연도" },
                          press:        { label: "보도자료",  hint: "형식: 제목|매체|날짜" },
                          jobs:         { label: "채용공고",  hint: "형식: 직책|부서|경력조건|마감일" },
                          downloads:    { label: "파일",     hint: "형식: 파일명|확장자|날짜|경로" },
                          breadcrumb:   { label: "경로",     hint: "형식: 라벨|URL" },
                        };
                        const cfg = itemsTypes[t];
                        if (!cfg || t === "location") return null;
                        return (
                          <label className="space-y-2">
                            <span className="text-sm font-semibold">{cfg.label} 목록</span>
                            <p className="text-xs text-slate-400">{cfg.hint}</p>
                            <Textarea
                              className="min-h-36 font-mono text-xs"
                              value={itemsValue(localizedSelectedSection ?? selectedSection)}
                              onChange={(e) => updateLocalizedSectionItems(selectedIndex, e.target.value)}
                            />
                          </label>
                        );
                      })()}
                    </>
                    )
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
                        {stringValue(selectedSection, "layout") !== "slide" ? (
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
                        ) : null}
                      </section>

                      <AnimationControl
                        value={animationValue(selectedSection, "section")}
                        onChange={(value) => updateAnimation("section", value)}
                      />

                      {stringValue(selectedSection, "layout") === "slide"
                        ? renderSliderControls()
                        : null}

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
                        {stringValue(selectedSection, "layout") !== "slide" ? (
                          <>
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
                          </>
                        ) : null}
                        {stringValue(selectedSection, "layout") === "slide" ||
                        ["image", "video"].includes(selectedBackgroundType) ? (
                          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-700">
                                배경 오버레이
                              </span>
                              <span className="text-xs text-slate-500">
                                {Math.round(
                                  numberValue(selectedSection, "overlayOpacity", 0.3) * 100,
                                )}
                                %
                              </span>
                            </div>
                            <label className="grid grid-cols-[72px_1fr] items-center gap-3">
                              <span className="text-xs text-slate-500">색상</span>
                              <Input
                                className="h-10 p-1"
                                type="color"
                                value={stringValue(
                                  selectedSection,
                                  "overlayColor",
                                  "#000000",
                                )}
                                onChange={(event) =>
                                  updateSectionField(
                                    selectedIndex,
                                    "overlayColor",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <input
                              className="w-full accent-blue-600"
                              max="0.9"
                              min="0"
                              step="0.05"
                              type="range"
                              value={stringValue(
                                selectedSection,
                                "overlayOpacity",
                                "0.3",
                              )}
                              onChange={(event) =>
                                updateSectionField(
                                  selectedIndex,
                                  "overlayOpacity",
                                  event.target.value,
                                )
                              }
                            />
                          </div>
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
                        <AlignmentControl
                          label="레이아웃 정렬"
                          value={alignmentValue(selectedSection, "align")}
                          onChange={(value) =>
                            updateSectionField(selectedIndex, "align", value)
                          }
                        />

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
                      addContentBlock={() => undefined}
                      animationPreview={null}
                      design={draft.design}
                      index={0}
                      isSelected={false}
                      moveSection={() => undefined}
                      openContextMenu={() => undefined}
                      removeContentBlock={() => undefined}
                      requestVisualUpload={() => undefined}
                      requestContentBlockUpload={() => undefined}
                      removeSection={() => undefined}
                      selectedSlideIndex={0}
                      section={previewSection}
                      selectedElement="section"
                      selectElement={() => undefined}
                      selectSection={() => undefined}
                      selectSlide={() => undefined}
                      toggleContentBlockLayout={() => undefined}
                      updateContentBlock={() => undefined}
                      updateField={() => undefined}
                      updateItems={() => undefined}
                      updateSlideField={() => undefined}
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
