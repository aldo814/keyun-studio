import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
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

export async function getSiteEditorState(siteId: string) {
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

  const { data } = await supabase
    .from("site_pages")
    .select("id,site_id,title,path,draft_json,published_json,updated_at")
    .eq("site_id", siteId)
    .eq("path", "/")
    .maybeSingle();

  const page = data as EditorPageRow | null;

  if (!page) {
    return null;
  }

  return {
    site,
    page: {
      id: page.id,
      title: page.title,
      path: page.path,
      draftJson: page.draft_json,
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

export async function getPublishedSiteBySlug(siteSlug: string) {
  if (!hasSupabaseEnv()) {
    return null;
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
    return null;
  }

  const [{ data: pageData }, seo] = await Promise.all([
    supabase
      .from("site_pages")
      .select("id,site_id,title,path,published_json")
      .eq("site_id", site.id)
      .eq("path", "/")
      .maybeSingle(),
    getSiteSeoSettings(site.id),
  ]);

  const page = pageData as PublishedPageRow | null;

  return {
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
          publishedJson: page.published_json,
        }
      : null,
    seo,
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
