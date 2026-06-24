import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { resolveEffectiveRole } from "@/lib/auth/super-admin";
import type { Json } from "@/types/database";

type DashboardSiteRow = {
  id: string;
  workspace_id: string;
  template_id: string | null;
  name: string;
  slug: string;
  status: string;
  published_url: string | null;
  published_at?: string | null;
  updated_at: string;
};

type DashboardTemplateRow = {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  visibility: string;
  is_featured: boolean;
  template_json: Json;
};

type SiteSeoRow = {
  id: string;
  site_id: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  favicon_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
};

type PublishedPageRow = {
  id: string;
  site_id: string;
  title: string;
  path: string;
  published_json: Json;
};

type EditorPageRow = {
  id: string;
  site_id: string;
  title: string;
  path: string;
  draft_json: Json;
  published_json: Json;
  updated_at: string;
};

type SitePageRow = {
  draft_json?: Json | null;
  id: string;
  site_id: string;
  parent_id: string | null;
  title: string;
  path: string;
  menu_code: string | null;
  menu_name: string | null;
  page_type: string | null;
  sub_layout: string | null;
  is_hidden: boolean | null;
  sort_order: number | null;
  locale_json: Json | null;
  updated_at: string;
};

type CurrentDashboardProfile = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
};

type ContentBoardRow = {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

type ContactSubmissionRow = {
  id: string;
  site_id: string;
  form_name: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  admin_note: string | null;
  source_path: string | null;
  created_at: string;
  updated_at: string;
  sites?:
    | {
    name: string | null;
    slug: string | null;
      }
    | Array<{
        name: string | null;
        slug: string | null;
      }>
    | null;
};

type ContentPopupRow = {
  id: string;
  site_id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  button_label: string | null;
  button_url: string | null;
  placement: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  sites?:
    | {
        name: string | null;
        slug: string | null;
      }
    | Array<{
        name: string | null;
        slug: string | null;
      }>
    | null;
};

export type ContactSubmissionStatus = "new" | "in_progress" | "done";

export type PopupStatus = "active" | "inactive";

export type PopupPlacement = "all" | "home";

export type DashboardSitePage = {
  bodyText: string;
  children: DashboardSitePage[];
  contentTitle: string;
  id: string;
  isHidden: boolean;
  level: number;
  localeJson: Json;
  menuCode: string;
  menuName: string;
  pageType: string;
  parentId: string | null;
  path: string;
  siteId: string;
  sortOrder: number;
  summary: string;
  subLayout: string;
  title: string;
  updatedAt: string;
};

export type DashboardContactSubmission = {
  adminNote: string;
  createdAt: string;
  createdAtRaw: string;
  email: string;
  formName: string;
  id: string;
  message: string;
  name: string;
  phone: string;
  siteId: string;
  siteName: string;
  siteSlug: string;
  sourcePath: string;
  status: ContactSubmissionStatus;
  subject: string;
  updatedAt: string;
};

export type DashboardMediaAsset = {
  createdAt: string;
  id: string;
  isImage: boolean;
  isVideo: boolean;
  mimeType: string;
  name: string;
  path: string;
  publicUrl: string;
  size: string;
  sizeBytes: number;
  updatedAt: string;
};

export type DashboardPopup = {
  body: string;
  buttonLabel: string;
  buttonUrl: string;
  createdAt: string;
  endsAt: string;
  endsAtInput: string;
  id: string;
  imageUrl: string;
  placement: PopupPlacement;
  siteId: string;
  siteName: string;
  siteSlug: string;
  startsAt: string;
  startsAtInput: string;
  status: PopupStatus;
  title: string;
  updatedAt: string;
};

const demoUpdatedAt = new Date("2026-05-13T09:00:00+09:00").toISOString();

const demoTemplateJson: Json = {
  version: 1,
  theme: "keyun-demo",
  sections: [
    {
      type: "hero",
      title: "키운 스튜디오 데모 사이트",
      description:
        "로그인 없이도 웹빌더 흐름을 확인할 수 있는 샘플 화면입니다.",
      buttonLabel: "상담 신청",
    },
    {
      type: "features",
      title: "웹사이트 제작 흐름",
      description: "템플릿 선택부터 SEO와 게시까지 한 번에 이어집니다.",
      items: ["섹션 폼 편집", "SEO 설정", "공개 사이트 게시"],
    },
    {
      type: "cta",
      title: "로그인하면 저장할 수 있어요",
      description: "데모를 확인한 뒤 계정을 만들면 실제 사이트로 저장됩니다.",
      buttonLabel: "시작하기",
    },
  ],
};

const demoTemplates = [
  {
    id: "demo_template_landing",
    name: "데모 브랜드 랜딩",
    description: "Hero, Features, CTA로 구성된 기본 랜딩 템플릿",
    thumbnailUrl: "",
    status: "featured",
    templateJson: demoTemplateJson,
  },
  {
    id: "demo_template_portfolio",
    name: "데모 포트폴리오",
    description: "개인/스튜디오 포트폴리오 시작용 템플릿",
    thumbnailUrl: "",
    status: "active",
    templateJson: demoTemplateJson,
  },
];

const demoSites = [
  {
    id: "demo_site_keyun",
    workspaceId: "demo_workspace",
    templateId: "demo_template_landing",
    name: "키운 스튜디오 데모",
    slug: "keyun-demo",
    status: "draft",
    publishedUrl: "",
    publishedAt: "-",
    updatedAt: formatDateTime(demoUpdatedAt),
    isDemo: true,
  },
];

const demoContactSubmissions: DashboardContactSubmission[] = [
  {
    adminNote: "",
    createdAt: "2026.06.05 오후 2:22",
    createdAtRaw: "2026-06-05T14:22:00+09:00",
    email: "minji@example.com",
    formName: "상담 신청",
    id: "demo-contact-1",
    message: "키운으로 회사 소개 사이트를 만들고 싶습니다. 상담 가능 시간을 알려주세요.",
    name: "김민지",
    phone: "010-1234-5678",
    siteId: "demo_site_keyun",
    siteName: "키운 스튜디오 데모",
    siteSlug: "keyun-demo",
    sourcePath: "/s/keyun-demo",
    status: "new",
    subject: "상담 신청",
    updatedAt: "2026.06.05 오후 2:22",
  },
  {
    adminNote: "요금제 안내 필요",
    createdAt: "2026.06.05 오전 11:08",
    createdAtRaw: "2026-06-05T11:08:00+09:00",
    email: "seojoon@example.com",
    formName: "견적 문의",
    id: "demo-contact-2",
    message: "랜딩페이지와 게시판 기능 포함 견적을 받고 싶습니다.",
    name: "박서준",
    phone: "010-2222-8899",
    siteId: "demo_site_keyun",
    siteName: "키운 스튜디오 데모",
    siteSlug: "keyun-demo",
    sourcePath: "/s/keyun-demo/posts",
    status: "in_progress",
    subject: "견적 문의",
    updatedAt: "2026.06.05 오전 11:08",
  },
  {
    adminNote: "처리 완료",
    createdAt: "2026.06.04 오후 5:40",
    createdAtRaw: "2026-06-04T17:40:00+09:00",
    email: "sky@example.com",
    formName: "제휴 문의",
    id: "demo-contact-3",
    message: "파트너 제휴 관련해서 담당자와 연결 부탁드립니다.",
    name: "이하늘",
    phone: "",
    siteId: "demo_site_keyun",
    siteName: "키운 스튜디오 데모",
    siteSlug: "keyun-demo",
    sourcePath: "/s/keyun-demo",
    status: "done",
    subject: "제휴 문의",
    updatedAt: "2026.06.04 오후 5:40",
  },
];

const demoMediaAssets: DashboardMediaAsset[] = [
  {
    createdAt: "2026.06.05 오후 2:22",
    id: "demo-media-1",
    isImage: true,
    isVideo: false,
    mimeType: "image/png",
    name: "hero-keyun.png",
    path: "demo/hero-keyun.png",
    publicUrl: "/keyun-logo.svg",
    size: "1.8 MB",
    sizeBytes: 1800000,
    updatedAt: "2026.06.05 오후 2:22",
  },
  {
    createdAt: "2026.06.04 오후 5:40",
    id: "demo-media-2",
    isImage: true,
    isVideo: false,
    mimeType: "image/jpeg",
    name: "popup-event.jpg",
    path: "demo/popup-event.jpg",
    publicUrl: "/keyun-logo.svg",
    size: "940 KB",
    sizeBytes: 940000,
    updatedAt: "2026.06.04 오후 5:40",
  },
];

const demoPopups: DashboardPopup[] = [
  {
    body: "키운 스튜디오 데모 관리자에서 운영 팝업을 설정할 수 있습니다.",
    buttonLabel: "문의하기",
    buttonUrl: "#contact",
    createdAt: "2026.06.05 오후 2:22",
    endsAt: "2026.06.30 오후 11:59",
    endsAtInput: "2026-06-30T23:59",
    id: "demo-popup-1",
    imageUrl: "",
    placement: "home",
    siteId: "demo_site_keyun",
    siteName: "키운 스튜디오 데모",
    siteSlug: "keyun-demo",
    startsAt: "2026.06.01 오전 9:00",
    startsAtInput: "2026-06-01T09:00",
    status: "active",
    title: "초기 사용자 이벤트",
    updatedAt: "2026.06.05 오후 2:22",
  },
  {
    body: "상담 신청은 페이지 하단 문의폼을 통해 접수할 수 있습니다.",
    buttonLabel: "문의 남기기",
    buttonUrl: "#contact",
    createdAt: "2026.06.04 오후 5:40",
    endsAt: "상시",
    endsAtInput: "",
    id: "demo-popup-2",
    imageUrl: "",
    placement: "all",
    siteId: "demo_site_keyun",
    siteName: "키운 스튜디오 데모",
    siteSlug: "keyun-demo",
    startsAt: "상시",
    startsAtInput: "",
    status: "inactive",
    title: "상담 신청 안내",
    updatedAt: "2026.06.04 오후 5:40",
  },
];

const demoSeoSettings = {
  id: "demo_seo_keyun",
  siteId: "demo_site_keyun",
  title: "키운 스튜디오 데모",
  description: "로그인 없이 확인하는 키운 스튜디오 웹빌더 데모입니다.",
  ogTitle: "키운 스튜디오 데모",
  ogDescription: "템플릿, 에디터, SEO, 게시 흐름을 확인하세요.",
  ogImageUrl: "",
  canonicalUrl: "",
  faviconUrl: "",
  robotsIndex: true,
  robotsFollow: true,
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function isAuthenticated() {
  if (!hasSupabaseEnv()) {
    return false;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return Boolean(user);
}

export async function getCurrentDashboardProfile() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,email,name,role")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as CurrentDashboardProfile | null;

  return {
    email: profile?.email ?? user.email ?? "",
    id: user.id,
    name: profile?.name ?? user.user_metadata?.name ?? user.email ?? "사용자",
    role: resolveEffectiveRole(profile?.role, user.email ?? profile?.email),
  };
}

export async function canAccessDesignMode() {
  const profile = await getCurrentDashboardProfile();

  return profile?.role === "super_admin";
}

export async function canUseContentPostDatabase() {
  if (!hasSupabaseEnv()) {
    return false;
  }

  return isAuthenticated();
}

export async function getDashboardTemplates() {
  if (!hasSupabaseEnv()) {
    return demoTemplates;
  }

  const supabase = await createClient();
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return demoTemplates;
  }

  const { data } = await supabase
    .from("templates")
    .select("id,name,description,thumbnail_url,status,visibility,is_featured,template_json")
    .eq("visibility", "public")
    .in("status", ["active", "featured"])
    .order("is_featured", { ascending: false })
    .order("updated_at", { ascending: false });

  return ((data ?? []) as DashboardTemplateRow[]).map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    thumbnailUrl: template.thumbnail_url ?? "",
    status: template.is_featured ? "featured" : template.status,
    templateJson: template.template_json,
  }));
}

export async function getDashboardSites() {
  if (!hasSupabaseEnv()) {
    return demoSites;
  }

  const supabase = await createClient();
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return demoSites;
  }

  const { data } = await supabase
    .from("sites")
    .select("id,workspace_id,template_id,name,slug,status,published_url,published_at,updated_at")
    .order("updated_at", { ascending: false });

  return ((data ?? []) as DashboardSiteRow[]).map((site) => ({
    id: site.id,
    workspaceId: site.workspace_id,
    templateId: site.template_id,
    name: site.name,
    slug: site.slug,
    status: site.status,
    publishedUrl: site.published_url ?? "",
    publishedAt: formatDateTime(site.published_at),
    updatedAt: formatDateTime(site.updated_at),
  }));
}

export async function getDashboardOverview() {
  const sites = await getDashboardSites();
  const publishedCount = sites.filter((site) => site.status === "published").length;
  const draftCount = sites.filter((site) => site.status === "draft").length;
  const latestSite = sites[0] ?? null;

  return {
    sites,
    stats: [
      {
        label: "전체 사이트",
        value: sites.length.toLocaleString("ko-KR"),
        delta: "내 작업",
      },
      {
        label: "공개 사이트",
        value: publishedCount.toLocaleString("ko-KR"),
        delta: "published",
      },
      {
        label: "초안",
        value: draftCount.toLocaleString("ko-KR"),
        delta: "draft",
      },
      {
        label: "최근 작업",
        value: latestSite?.updatedAt ?? "-",
        delta: latestSite?.name ?? "대기",
      },
    ],
  };
}

export async function getDashboardSite(siteId: string) {
  const sites = await getDashboardSites();

  return sites.find((site) => site.id === siteId) ?? null;
}

function mapSitePage(row: SitePageRow): DashboardSitePage {
  const fallbackCode = row.path === "/" ? "home" : row.path.replace(/^\/+/, "");
  const menuCode = row.menu_code || fallbackCode || row.id;
  const menuName = row.menu_name || row.title || menuCode;
  const draft = readPageJsonRecord(row.draft_json);
  const sections = Array.isArray(draft.sections) ? draft.sections : [];
  const firstSection = sections.find(
    (section) => section && typeof section === "object" && !Array.isArray(section),
  ) as Record<string, Json> | undefined;

  return {
    bodyText: typeof firstSection?.bodyText === "string" ? firstSection.bodyText : "",
    children: [],
    contentTitle: typeof firstSection?.title === "string" ? firstSection.title : menuName,
    id: row.id,
    isHidden: Boolean(row.is_hidden),
    level: 1,
    localeJson: row.locale_json ?? {},
    menuCode,
    menuName,
    pageType: row.page_type || "auto",
    parentId: row.parent_id,
    path: row.path,
    siteId: row.site_id,
    sortOrder: row.sort_order ?? 0,
    summary:
      typeof firstSection?.description === "string"
        ? firstSection.description
        : "",
    subLayout: row.sub_layout ?? "",
    title: row.title,
    updatedAt: formatDateTime(row.updated_at),
  };
}

function readPageJsonRecord(value: Json | null | undefined) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Json>;
  }

  return {};
}

function buildPageTree(rows: SitePageRow[]) {
  const pages = rows.map(mapSitePage);
  const pageById = new Map(pages.map((page) => [page.id, page]));
  const roots: DashboardSitePage[] = [];

  pages.forEach((page) => {
    if (page.parentId && pageById.has(page.parentId)) {
      const parent = pageById.get(page.parentId);
      page.level = Math.min((parent?.level ?? 1) + 1, 3);
      parent?.children.push(page);
      return;
    }

    page.level = 1;
    roots.push(page);
  });

  const sortPages = (items: DashboardSitePage[]) => {
    items.sort((a, b) => a.sortOrder - b.sortOrder || a.menuName.localeCompare(b.menuName));
    items.forEach((item) => sortPages(item.children));
  };

  sortPages(roots);

  return roots;
}

export async function getDashboardSitePages(siteId: string): Promise<DashboardSitePage[]> {
  if (siteId === "demo_site_keyun" || !hasSupabaseEnv()) {
    return buildPageTree([
      {
        id: "demo-page-home",
        is_hidden: false,
        locale_json: {},
        menu_code: "home",
        menu_name: "홈",
        page_type: "auto",
        parent_id: null,
        path: "/",
        site_id: siteId,
        sort_order: 0,
        sub_layout: "",
        title: "홈",
        updated_at: demoUpdatedAt,
      },
      {
        id: "demo-page-company",
        is_hidden: false,
        locale_json: {},
        menu_code: "company",
        menu_name: "회사소개",
        page_type: "auto",
        parent_id: null,
        path: "/company",
        site_id: siteId,
        sort_order: 1,
        sub_layout: "",
        title: "회사소개",
        updated_at: demoUpdatedAt,
      },
    ]);
  }

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_pages")
    .select("id,site_id,parent_id,title,path,menu_code,menu_name,page_type,sub_layout,is_hidden,sort_order,locale_json,draft_json,updated_at")
    .eq("site_id", siteId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error.message);
    return [];
  }

  return buildPageTree((data ?? []) as SitePageRow[]);
}

export async function getSiteEditorState(siteId: string, pageId?: string) {
  if (siteId === "demo_site_keyun") {
    return getDemoEditorState(siteId);
  }

  if (!hasSupabaseEnv()) {
    return getDemoEditorState(siteId);
  }

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return getDemoEditorState(siteId);
  }

  const [site, supabase] = await Promise.all([
    getDashboardSite(siteId),
    createClient(),
  ]);

  if (!site) {
    return null;
  }

  const pageQuery = supabase
    .from("site_pages")
    .select("id,site_id,title,path,draft_json,published_json,updated_at")
    .eq("site_id", siteId);

  const { data } = pageId
    ? await pageQuery.eq("id", pageId).maybeSingle()
    : await pageQuery.eq("path", "/").maybeSingle();

  const { data: homeData } = await supabase
    .from("site_pages")
    .select("id,site_id,title,path,draft_json,published_json,updated_at")
    .eq("site_id", siteId)
    .eq("path", "/")
    .maybeSingle();

  const page = data as EditorPageRow | null;
  const homePage = homeData as EditorPageRow | null;

  if (!page) {
    return null;
  }

  const pageDraft = readPublicJson(page.draft_json);
  const homeDraft = readPublicJson(homePage?.draft_json);
  const draftJson = {
    ...pageDraft,
    design: pageDraft.design ?? homeDraft.design,
    navigation: pageDraft.navigation ?? homeDraft.navigation,
    pages: pageDraft.pages ?? homeDraft.pages,
  } satisfies Json;

  return {
    site,
    page: {
      id: page.id,
      title: page.title,
      path: page.path,
      draftJson,
      publishedJson: page.published_json,
      updatedAt: formatDateTime(page.updated_at),
    },
  };
}

export async function getSiteSeoSettings(siteId: string) {
  if (!hasSupabaseEnv()) {
    return siteId === "demo_site_keyun" ? demoSeoSettings : null;
  }

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return siteId === "demo_site_keyun" ? demoSeoSettings : null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_seo_settings")
    .select(
      "id,site_id,title,description,og_title,og_description,og_image_url,canonical_url,favicon_url,robots_index,robots_follow",
    )
    .eq("site_id", siteId)
    .eq("scope", "site")
    .maybeSingle();

  const seo = data as SiteSeoRow | null;

  if (!seo) {
    return null;
  }

  return {
    id: seo.id,
    siteId: seo.site_id,
    title: seo.title ?? "",
    description: seo.description ?? "",
    ogTitle: seo.og_title ?? "",
    ogDescription: seo.og_description ?? "",
    ogImageUrl: seo.og_image_url ?? "",
    canonicalUrl: seo.canonical_url ?? "",
    faviconUrl: seo.favicon_url ?? "",
    robotsIndex: seo.robots_index,
    robotsFollow: seo.robots_follow,
  };
}

function getDemoEditorState(siteId: string) {
  const site = demoSites.find((item) => item.id === siteId) ?? null;

  if (!site) {
    return null;
  }

  return {
    site,
    page: {
      id: "demo_page_home",
      title: "Home",
      path: "/",
      draftJson: demoTemplateJson,
      publishedJson: demoTemplateJson,
      updatedAt: site.updatedAt,
    },
  };
}

export async function getPublicTemplates() {
  const templates = await getDashboardTemplates();
  return templates.map((t) => ({
    ...t,
    category: t.id.includes("portfolio")
      ? "포트폴리오"
      : t.id.includes("shop")
        ? "쇼핑몰"
        : "비즈니스",
    isFeatured: t.status === "featured",
  }));
}

export async function getPublishedSiteBySlug(siteSlug: string) {
  return getPublishedSitePageBySlug(siteSlug, "/");
}

export async function getPublishedSitePageBySlug(siteSlug: string, pagePath = "/") {
  if (!hasSupabaseEnv()) {
    return getDemoPublishedSiteBySlug(siteSlug, pagePath);
  }

  const supabase = await createClient();
  const { data: siteData } = await supabase
    .from("sites")
    .select("id,workspace_id,template_id,name,slug,status,published_url,published_at,updated_at")
    .eq("slug", siteSlug)
    .eq("status", "published")
    .maybeSingle();

  const site = siteData as DashboardSiteRow | null;

  if (!site) {
    return getDemoPublishedSiteBySlug(siteSlug, pagePath);
  }

  const normalizedPath = pagePath === "/" ? "/" : `/${pagePath.replace(/^\/+|\/+$/g, "")}`;

  const [{ data: pageData }, { data: homePageData }, seo] = await Promise.all([
    supabase
      .from("site_pages")
      .select("id,site_id,title,path,published_json")
      .eq("site_id", site.id)
      .eq("path", normalizedPath)
      .maybeSingle(),
    supabase
      .from("site_pages")
      .select("id,site_id,title,path,published_json")
      .eq("site_id", site.id)
      .eq("path", "/")
      .maybeSingle(),
    getSiteSeoSettings(site.id),
  ]);

  const page = pageData as PublishedPageRow | null;
  const homePage = homePageData as PublishedPageRow | null;
  const pageJson = readPublicJson(page?.published_json);
  const homeJson = readPublicJson(homePage?.published_json);
  const publishedJson = {
    ...pageJson,
    design: pageJson.design ?? homeJson.design,
    navigation: pageJson.navigation ?? homeJson.navigation,
    pages: pageJson.pages ?? homeJson.pages,
  } satisfies Json;

  return {
    isDemo: false,
    site: {
      id: site.id,
      name: site.name,
      slug: site.slug,
      publishedUrl: site.published_url ?? "",
      publishedAt: formatDateTime(site.published_at),
    },
    page: page
      ? {
          id: page.id,
          title: page.title,
          path: page.path,
          publishedJson,
        }
      : null,
    seo,
  };
}

function readPublicJson(value: Json | null | undefined) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Json>;
  }

  return {};
}

function getDemoPublishedSiteBySlug(siteSlug: string, pagePath = "/") {
  if (siteSlug !== "keyun-demo") {
    return null;
  }

  const site = demoSites.find((item) => item.slug === siteSlug) ?? demoSites[0];

  const normalizedPath = pagePath === "/" ? "/" : `/${pagePath.replace(/^\/+|\/+$/g, "")}`;
  const pageTitle =
    normalizedPath === "/"
      ? "Home"
      : normalizedPath
          .replace(/^\/+/, "")
          .split("/")
          .filter(Boolean)
          .map((segment) => segment.replaceAll("-", " "))
          .join(" / ");
  const demoBaseJson = readPublicJson(demoTemplateJson);
  const demoPageJson =
    normalizedPath === "/"
      ? demoTemplateJson
      : ({
          ...demoBaseJson,
          sections: [
            {
              backgroundType: "color",
              bgColor: "#ffffff",
              bodyText:
                "데모 서브페이지입니다. 실제 사이트에서는 사이트맵에서 입력한 제목, 요약, 본문이 이 영역에 표시됩니다.",
              description: "사이트맵 페이지가 공개 사이트에서 열리는 흐름을 확인할 수 있습니다.",
              layout: "text-focus",
              paddingBottom: "96",
              paddingTop: "96",
              title: pageTitle,
              type: "content",
              width: "960",
            },
          ],
        } satisfies Json);

  return {
    isDemo: true,
    site: {
      id: site.id,
      name: site.name,
      publishedAt: site.updatedAt,
      publishedUrl: `/s/${site.slug}`,
      slug: site.slug,
    },
    page: {
      id: "demo_page_home",
      path: normalizedPath,
      publishedJson: demoPageJson,
      title: pageTitle,
    },
    seo: demoSeoSettings,
  };
}

export async function getPublishedSitesForSitemap() {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("id,slug,updated_at,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  return ((data ?? []) as Array<Pick<DashboardSiteRow, "id" | "slug" | "updated_at" | "published_at">>).map(
    (site) => ({
      id: site.id,
      slug: site.slug,
      lastModified: site.published_at ?? site.updated_at,
    }),
  );
}

function normalizeContactStatus(status: string): ContactSubmissionStatus {
  if (status === "in_progress" || status === "done") return status;
  return "new";
}

export function contactStatusLabel(status: ContactSubmissionStatus) {
  if (status === "done") return "완료";
  if (status === "in_progress") return "처리 중";
  return "신규";
}

export function contactStatusTone(status: ContactSubmissionStatus) {
  if (status === "done") return "published";
  if (status === "in_progress") return "review";
  return "open";
}

function mapContactSubmission(row: ContactSubmissionRow): DashboardContactSubmission {
  const site = Array.isArray(row.sites) ? row.sites[0] : row.sites;

  return {
    adminNote: row.admin_note ?? "",
    createdAt: formatDateTime(row.created_at),
    createdAtRaw: row.created_at,
    email: row.email ?? "",
    formName: row.form_name || "문의폼",
    id: row.id,
    message: row.message,
    name: row.name,
    phone: row.phone ?? "",
    siteId: row.site_id,
    siteName: site?.name ?? "사이트",
    siteSlug: site?.slug ?? "",
    sourcePath: row.source_path ?? "",
    status: normalizeContactStatus(row.status),
    subject: row.subject ?? "",
    updatedAt: formatDateTime(row.updated_at),
  };
}

export async function getDashboardContactSubmissions() {
  if (!hasSupabaseEnv()) {
    return demoContactSubmissions;
  }

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return demoContactSubmissions;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_submissions")
    .select(
      "id,site_id,form_name,name,email,phone,subject,message,status,admin_note,source_path,created_at,updated_at,sites(name,slug)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return demoContactSubmissions;
  }

  return ((data ?? []) as unknown as ContactSubmissionRow[]).map(mapContactSubmission);
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
}

function isImageMime(mimeType: string) {
  return mimeType.startsWith("image/");
}

function isVideoMime(mimeType: string) {
  return mimeType.startsWith("video/");
}

function normalizePopupStatus(status: string): PopupStatus {
  return status === "active" ? "active" : "inactive";
}

function normalizePopupPlacement(placement: string): PopupPlacement {
  return placement === "all" ? "all" : "home";
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function mapPopup(row: ContentPopupRow): DashboardPopup {
  const site = Array.isArray(row.sites) ? row.sites[0] : row.sites;

  return {
    body: row.body ?? "",
    buttonLabel: row.button_label ?? "",
    buttonUrl: row.button_url ?? "",
    createdAt: formatDateTime(row.created_at),
    endsAt: row.ends_at ? formatDateTime(row.ends_at) : "상시",
    endsAtInput: toDateTimeLocal(row.ends_at),
    id: row.id,
    imageUrl: row.image_url ?? "",
    placement: normalizePopupPlacement(row.placement),
    siteId: row.site_id,
    siteName: site?.name ?? "사이트",
    siteSlug: site?.slug ?? "",
    startsAt: row.starts_at ? formatDateTime(row.starts_at) : "상시",
    startsAtInput: toDateTimeLocal(row.starts_at),
    status: normalizePopupStatus(row.status),
    title: row.title,
    updatedAt: formatDateTime(row.updated_at),
  };
}

export async function getDashboardMediaAssets(): Promise<DashboardMediaAsset[]> {
  if (!hasSupabaseEnv()) {
    return demoMediaAssets;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return demoMediaAssets;
  }

  const folder = `users/${user.id}/media`;
  const { data, error } = await supabase.storage
    .from("site-assets")
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (data ?? [])
    .filter((item) => item.name && item.id)
    .map((item) => {
      const path = `${folder}/${item.name}`;
      const mimeType = String(item.metadata?.mimetype ?? item.metadata?.mimeType ?? "");
      const sizeBytes = Number(item.metadata?.size ?? 0);
      const { data: publicData } = supabase.storage.from("site-assets").getPublicUrl(path);

      return {
        createdAt: formatDateTime(item.created_at),
        id: item.id ?? path,
        isImage: isImageMime(mimeType),
        isVideo: isVideoMime(mimeType),
        mimeType,
        name: item.name,
        path,
        publicUrl: publicData.publicUrl,
        size: formatFileSize(sizeBytes),
        sizeBytes,
        updatedAt: formatDateTime(item.updated_at),
      };
    });
}

export async function getDashboardPopups(): Promise<DashboardPopup[]> {
  if (!hasSupabaseEnv()) {
    return demoPopups;
  }

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return demoPopups;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_popups")
    .select(
      "id,site_id,title,body,image_url,button_label,button_url,placement,status,starts_at,ends_at,sort_order,created_at,updated_at,sites(name,slug)",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return demoPopups;
  }

  return ((data ?? []) as unknown as ContentPopupRow[]).map(mapPopup);
}

export async function getActivePopupsBySiteSlug(siteSlug: string): Promise<DashboardPopup[]> {
  if (!hasSupabaseEnv()) {
    return siteSlug === "keyun-demo" ? demoPopups.filter((popup) => popup.status === "active") : [];
  }

  const supabase = await createClient();
  const { data: siteData } = await supabase
    .from("sites")
    .select("id")
    .eq("slug", siteSlug)
    .eq("status", "published")
    .maybeSingle();

  const site = siteData as Pick<DashboardSiteRow, "id"> | null;

  if (!site) {
    return siteSlug === "keyun-demo" ? demoPopups.filter((popup) => popup.status === "active") : [];
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("content_popups")
    .select(
      "id,site_id,title,body,image_url,button_label,button_url,placement,status,starts_at,ends_at,sort_order,created_at,updated_at,sites(name,slug)",
    )
    .eq("site_id", site.id)
    .eq("status", "active")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return ((data ?? []) as unknown as ContentPopupRow[]).map(mapPopup);
}

type ContentPostRow = {
  id: string;
  site_id: string;
  board_id: string | null;
  board_name: string;
  category: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: Json;
  content_html: string;
  author_name: string | null;
  status: string;
  is_pinned: boolean;
  views: number;
  scheduled_at: string | null;
  updated_at: string;
  sites?:
    | {
        slug: string | null;
      }
    | Array<{
        slug: string | null;
      }>
    | null;
};

export type PublicContentPost = import("@/features/dashboard/content-posts-data").DashboardPost;

function htmlToText(html: string) {
  return html
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<\/(p|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function normalizePostStatus(status: string): import("@/features/dashboard/content-posts-data").PostStatus {
  if (status === "published" || status === "scheduled") return status;
  return "draft";
}

function mapContentPost(row: ContentPostRow): import("@/features/dashboard/content-posts-data").DashboardPost {
  const content = htmlToText(row.content_html);
  const site = Array.isArray(row.sites) ? row.sites[0] : row.sites;

  return {
    id: row.id,
    siteId: row.site_id,
    siteSlug: site?.slug ?? undefined,
    boardId: row.board_id,
    board: row.board_name || "공지사항",
    category: row.category ?? "",
    title: row.title,
    slug: row.slug,
    summary: row.excerpt ?? "",
    content,
    contentHtml: row.content_html || "",
    contentJson: row.content_json ?? {},
    author: row.author_name || "관리자",
    status: normalizePostStatus(row.status),
    updatedAt: formatDateTime(row.updated_at),
    updatedAtRaw: row.updated_at,
    views: row.views ?? 0,
    pinned: row.is_pinned,
    scheduledAt: row.scheduled_at ?? "",
  };
}

export async function getDashboardPosts() {
  const { initialPosts } = await import("@/features/dashboard/content-posts-data");

  if (!hasSupabaseEnv()) {
    return initialPosts;
  }

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return initialPosts;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_posts")
    .select(
      "id,site_id,board_id,board_name,category,title,slug,excerpt,content_json,content_html,author_name,status,is_pinned,views,scheduled_at,updated_at,sites(slug)",
    )
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return initialPosts;
  }

  return ((data ?? []) as ContentPostRow[]).map(mapContentPost);
}

export async function getDashboardPost(postId: string) {
  const posts = await getDashboardPosts();
  return posts.find((post) => post.id === postId) ?? null;
}

async function getFallbackPublishedPosts(siteSlug: string) {
  if (siteSlug !== "keyun-demo") {
    return [];
  }

  const { initialPosts } = await import("@/features/dashboard/content-posts-data");

  return initialPosts.filter((post) => post.status === "published");
}

export async function getPublishedPostsBySiteSlug(siteSlug: string): Promise<PublicContentPost[]> {
  if (!hasSupabaseEnv()) {
    return getFallbackPublishedPosts(siteSlug);
  }

  const supabase = await createClient();
  const { data: siteData } = await supabase
    .from("sites")
    .select("id")
    .eq("slug", siteSlug)
    .eq("status", "published")
    .maybeSingle();

  const site = siteData as Pick<DashboardSiteRow, "id"> | null;

  if (!site) {
    return getFallbackPublishedPosts(siteSlug);
  }

  const { data, error } = await supabase
    .from("content_posts")
    .select(
      "id,site_id,board_id,board_name,category,title,slug,excerpt,content_json,content_html,author_name,status,is_pinned,views,scheduled_at,updated_at,sites(slug)",
    )
    .eq("site_id", site.id)
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return ((data ?? []) as ContentPostRow[]).map(mapContentPost);
}

export async function getPublishedPostBySlug(siteSlug: string, postSlug: string) {
  const posts = await getPublishedPostsBySiteSlug(siteSlug);

  return posts.find((post) => post.slug === postSlug || post.id === postSlug) ?? null;
}

export async function getDashboardContentBoards() {
  const { initialBoards } = await import("@/features/dashboard/content-posts-data");

  if (!hasSupabaseEnv()) {
    return initialBoards;
  }

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return initialBoards;
  }

  const sites = await getDashboardSites();
  const siteIds = sites
    .filter((site) => !site.id.startsWith("demo_"))
    .map((site) => site.id);

  if (!siteIds.length) {
    return initialBoards;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_boards")
    .select("id,site_id,name,slug,description,sort_order")
    .in("site_id", siteIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error.message);
    return initialBoards;
  }

  const boards = ((data ?? []) as ContentBoardRow[]).map((board) => ({
    id: board.id,
    siteId: board.site_id,
    name: board.name,
    slug: board.slug,
    description: board.description ?? "",
  }));

  return boards.length ? boards : initialBoards;
}
