"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function redirectWithNotice(path: string, notice: string): never {
  redirect(`${path}?notice=${encodeURIComponent(notice)}`);
}

function dashboardPathWithSite(path: string, siteId: string, slug: string) {
  return path
    .replaceAll(":siteId", siteId)
    .replaceAll("{siteId}", siteId)
    .replaceAll(":slug", slug)
    .replaceAll("{slug}", slug);
}

function checkboxValue(formData: FormData, key: string) {
  return value(formData, key) === "on";
}

function pagePathFromMenuCode(menuCode: string, parentPath?: string) {
  if (!menuCode || menuCode === "home") return "/";
  const cleanCode = slugify(menuCode) || "page";
  const cleanParent = parentPath && parentPath !== "/" ? parentPath.replace(/\/$/, "") : "";

  return `${cleanParent}/${cleanCode}`.replace(/\/+/g, "/");
}

function readRecord(value: Json | null | undefined) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Json>;
  }

  return {};
}

function readLocaleSettings(formData: FormData) {
  return {
    chn: {
      hidden: checkboxValue(formData, "locale_chn_hidden"),
      link: value(formData, "locale_chn_link"),
      menuName: value(formData, "locale_chn_menu_name"),
      deleted: checkboxValue(formData, "locale_chn_deleted"),
    },
    eng: {
      hidden: checkboxValue(formData, "locale_eng_hidden"),
      link: value(formData, "locale_eng_link"),
      menuName: value(formData, "locale_eng_menu_name"),
      deleted: checkboxValue(formData, "locale_eng_deleted"),
    },
  } satisfies Json;
}

function buildPageContentJson(formData: FormData, fallbackTitle: string, existing?: Json) {
  const existingRecord = readRecord(existing);
  const design = existingRecord.design;
  const navigation = existingRecord.navigation;
  const pages = existingRecord.pages;
  const pageType = value(formData, "page_type") || "auto";
  const contentTitle = value(formData, "content_title") || fallbackTitle;
  const summary = value(formData, "content_summary");
  const bodyText = String(formData.get("content_body") ?? "").trim();

  return {
    ...existingRecord,
    ...(design ? { design } : {}),
    ...(navigation ? { navigation } : {}),
    ...(pages ? { pages } : {}),
    pageType,
    sections: [
      {
        backgroundType: "color",
        badge: "",
        bgColor: "#ffffff",
        bodyText,
        description: summary,
        layout: "text-focus",
        mediaPosition: "right",
        paddingBottom: "96",
        paddingTop: "96",
        title: contentTitle,
        type: "content",
        width: "960",
      },
    ],
    title: fallbackTitle,
    version: Number(existingRecord.version ?? 1),
  } satisfies Json;
}

async function syncSiteNavigationDraft(siteId: string) {
  if (!hasSupabaseEnv()) return;

  const supabase = await createClient();
  const { data: pages, error: pagesError } = await supabase
    .from("site_pages")
    .select("id,title,path,parent_id,menu_code,menu_name,is_hidden,sort_order")
    .eq("site_id", siteId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (pagesError) {
    throw new Error(pagesError.message);
  }

  const sitePages = (pages ?? []).map((page) => ({
    id: String(page.id),
    path: String(page.path),
    status: page.is_hidden ? "private" : "public",
    title: String(page.menu_name || page.title || page.menu_code || "페이지"),
  }));

  const navigation = (pages ?? [])
    .filter((page) => !page.parent_id)
    .map((page) => ({
      enabled: !page.is_hidden,
      id: `nav-${page.id}`,
      label: String(page.menu_name || page.title || page.menu_code || "페이지"),
      pageId: String(page.id),
      path: String(page.path),
    }));

  const { data: homePage, error: homeError } = await supabase
    .from("site_pages")
    .select("id,draft_json")
    .eq("site_id", siteId)
    .eq("path", "/")
    .maybeSingle();

  if (homeError) {
    throw new Error(homeError.message);
  }

  if (!homePage?.id) return;

  const draft = readRecord(homePage.draft_json as Json);
  const nextDraft = {
    ...draft,
    navigation,
    pages: sitePages,
    version: Number(draft.version ?? 1),
  } satisfies Json;

  const { error: updateError } = await supabase
    .from("site_pages")
    .update({
      draft_json: nextDraft,
      page_json: nextDraft,
      updated_at: new Date().toISOString(),
    })
    .eq("id", homePage.id);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

function revalidateSiteSitemap(siteId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sites");
  revalidatePath(`/dashboard/sites/${siteId}`);
  revalidatePath(`/dashboard/sites/${siteId}/sitemap`);
  revalidatePath(`/dashboard/sites/${siteId}/settings`);
  revalidatePath(`/dashboard/editor/${siteId}`);
  revalidatePath(`/dashboard/preview/${siteId}`);
  revalidatePath("/sitemap.xml");
}

function buildInitialSiteJson({
  businessType,
  contactPhone,
  launchGoal,
  name,
}: {
  businessType: string;
  contactPhone: string;
  launchGoal: string;
  name: string;
}) {
  const purpose = [businessType, launchGoal].filter(Boolean).join(" · ");
  const description =
    purpose || contactPhone
      ? `${name}의 ${purpose || "서비스"} 정보를 한눈에 확인하고 문의할 수 있는 공식 사이트입니다.`
      : `${name}의 소식과 서비스를 확인하고 문의할 수 있는 공식 사이트입니다.`;

  return {
    design: {
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
    },
    navigation: [
      { enabled: true, id: "nav-home", label: "홈", pageId: "home" },
      { enabled: true, id: "nav-service", label: "서비스", pageId: "service" },
      { enabled: true, id: "nav-blog", label: "게시글", pageId: "blog" },
      { enabled: true, id: "nav-contact", label: "문의", pageId: "contact" },
    ],
    pages: [
      { id: "home", path: "/", status: "public", title: "메인 페이지" },
      { id: "service", path: "/service", status: "public", title: "서비스" },
      { id: "blog", path: "/posts", status: "public", title: "게시글" },
      { id: "contact", path: "#contact", status: "public", title: "문의" },
    ],
    sections: [
      {
        backgroundType: "gradient",
        badge: purpose || "Official Website",
        buttonLabel: contactPhone ? "문의하기" : "상담 신청",
        buttonLink: "#contact",
        description,
        gradientFrom: "#f3f7ff",
        gradientTo: "#ffffff",
        layout: "slide",
        mediaPosition: "right",
        paddingBottom: "110",
        paddingTop: "110",
        secondaryButtonLabel: "게시글 보기",
        title: `${name}, 이제 온라인에서 바로 시작하세요`,
        type: "hero",
        width: "1200",
      },
      {
        backgroundType: "color",
        badge: "Features",
        bgColor: "#ffffff",
        description: `${name}의 핵심 정보를 방문자가 빠르게 이해할 수 있도록 정리했습니다.`,
        items: [
          businessType || "브랜드 소개",
          launchGoal || "문의 운영",
          contactPhone ? `대표 연락처 ${contactPhone}` : "콘텐츠 운영",
        ],
        layout: "cards",
        paddingBottom: "90",
        paddingTop: "90",
        title: "운영에 필요한 기본 구성을 준비했습니다",
        type: "features",
        width: "1200",
      },
      {
        backgroundType: "gradient",
        buttonLabel: contactPhone ? "전화 문의" : "문의 남기기",
        buttonLink: contactPhone ? `tel:${contactPhone.replaceAll("-", "")}` : "#contact",
        description: "관리자에서 게시글, 문의폼, 팝업을 추가하며 사이트를 바로 운영할 수 있습니다.",
        gradientFrom: "#0f172a",
        gradientTo: "#1d4ed8",
        layout: "banner",
        paddingBottom: "86",
        paddingTop: "86",
        title: "첫 세팅은 완료됐습니다",
        type: "cta",
        width: "1200",
      },
    ],
    version: 1,
  } satisfies Json;
}

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

async function ensureWorkspace() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile?.id) {
    await supabase
      .from("profiles")
      .update({
        email: user.email ?? "",
        name: user.user_metadata?.name ?? user.email ?? "",
      })
      .eq("id", user.id);
  } else {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.name ?? user.email ?? "",
      role: "user",
    });
  }

  const { data: existingMember } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingMember?.workspace_id) {
    return existingMember.workspace_id as string;
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: "내 워크스페이스",
      owner_id: user.id,
      plan: "free",
      status: "active",
    })
    .select("id")
    .single();

  if (workspaceError || !workspace) {
    throw new Error(workspaceError?.message ?? "워크스페이스 생성에 실패했어.");
  }

  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  return workspace.id as string;
}

export async function createDashboardSite(formData: FormData) {
  const workspaceId = await ensureWorkspace();
  const supabase = await createClient();
  const name = value(formData, "name");
  const templateId = value(formData, "template_id") || null;
  const slug = slugify(value(formData, "slug") || name);
  const businessType = value(formData, "business_type");
  const launchGoal = value(formData, "launch_goal");
  const contactPhone = value(formData, "contact_phone");
  const seoTitle = value(formData, "seo_title") || name;
  const seoDescription =
    value(formData, "seo_description") ||
    [businessType, launchGoal, contactPhone ? `문의 ${contactPhone}` : ""]
      .filter(Boolean)
      .join(" · ");
  const ogImageUrl = value(formData, "og_image_url") || null;
  const completionPath = value(formData, "completion_path");

  if (!name || !slug) {
    throw new Error("사이트 이름과 slug가 필요해.");
  }

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .insert({
      workspace_id: workspaceId,
      template_id: templateId,
      name,
      slug,
      status: "draft",
    })
    .select("id")
    .single();

  if (siteError || !site) {
    throw new Error(siteError?.message ?? "사이트 생성에 실패했어.");
  }

  const initialSiteJson = buildInitialSiteJson({
    businessType,
    contactPhone,
    launchGoal,
    name,
  });

  const { data: page, error: pageError } = await supabase
    .from("site_pages")
    .insert({
      site_id: site.id,
      title: "Home",
      path: "/",
      menu_code: "home",
      menu_name: "홈",
      page_type: "auto",
      is_hidden: false,
      sort_order: 0,
      locale_json: {},
      page_json: initialSiteJson,
      draft_json: initialSiteJson,
    } as never)
    .select("id")
    .single();

  if (pageError || !page) {
    throw new Error(pageError?.message ?? "홈 페이지 생성에 실패했어.");
  }

  const { error: seoError } = await supabase.from("site_seo_settings").insert({
    site_id: site.id,
    page_id: page.id,
    scope: "site",
    title: seoTitle,
    description: seoDescription,
    og_title: seoTitle,
    og_description: seoDescription,
    og_image_url: ogImageUrl,
    robots_index: true,
    robots_follow: true,
  });

  if (seoError) {
    throw new Error(seoError.message);
  }

  await supabase.from("content_boards").insert([
    {
      site_id: site.id,
      name: "공지사항",
      slug: "notice",
      description: "방문자에게 알려야 할 소식을 관리합니다.",
      sort_order: 1,
    },
    {
      site_id: site.id,
      name: "블로그",
      slug: "blog",
      description: "브랜드 소식과 콘텐츠를 발행합니다.",
      sort_order: 2,
    },
    {
      site_id: site.id,
      name: "FAQ",
      slug: "faq",
      description: "자주 묻는 질문을 정리합니다.",
      sort_order: 3,
    },
  ]);

  revalidatePath("/dashboard/sites");
  revalidatePath("/dashboard/content/posts");
  revalidatePath(`/dashboard/sites/${site.id}`);
  revalidatePath(`/dashboard/sites/${site.id}/settings`);

  if (completionPath.startsWith("/dashboard")) {
    redirectWithNotice(
      dashboardPathWithSite(completionPath, site.id as string, slug),
      "site_created",
    );
  }

  redirectWithNotice(`/dashboard/sites/${site.id}`, "site_created");
}

export async function updateSiteBasicSettings(formData: FormData) {
  await getCurrentUser();

  const siteId = value(formData, "site_id");
  const currentSlug = value(formData, "current_slug");
  const name = value(formData, "name");
  const slug = slugify(value(formData, "slug") || name);

  if (!siteId || !name || !slug) {
    throw new Error("사이트 이름과 주소가 필요합니다.");
  }

  if (!hasSupabaseEnv()) {
    revalidatePath(`/dashboard/sites/${siteId}/settings`);
    redirectWithNotice(`/dashboard/sites/${siteId}/settings`, "site_saved");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("sites")
    .update({
      name,
      slug,
      published_url: `/s/${slug}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", siteId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sites");
  revalidatePath(`/dashboard/sites/${siteId}`);
  revalidatePath(`/dashboard/sites/${siteId}/settings`);
  revalidatePath(`/s/${slug}`);
  if (currentSlug && currentSlug !== slug) {
    revalidatePath(`/s/${currentSlug}`);
  }
  revalidatePath("/sitemap.xml");
  redirectWithNotice(`/dashboard/sites/${siteId}/settings`, "site_saved");
}

export async function updateSiteSeoSettings(formData: FormData) {
  await getCurrentUser();

  const siteId = value(formData, "site_id");
  const supabase = await createClient();
  const payload = {
    site_id: siteId,
    scope: "site",
    title: value(formData, "title") || null,
    description: value(formData, "description") || null,
    og_title: value(formData, "og_title") || null,
    og_description: value(formData, "og_description") || null,
    og_image_url: value(formData, "og_image_url") || null,
    canonical_url: value(formData, "canonical_url") || null,
    favicon_url: value(formData, "favicon_url") || null,
    robots_index: value(formData, "robots_index") === "on",
    robots_follow: value(formData, "robots_follow") === "on",
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("site_seo_settings")
    .select("id")
    .eq("site_id", siteId)
    .eq("scope", "site")
    .maybeSingle();

  const { error } = existing?.id
    ? await supabase
        .from("site_seo_settings")
        .update(payload)
        .eq("id", existing.id)
    : await supabase.from("site_seo_settings").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/sites/${siteId}/settings`);
  redirectWithNotice(`/dashboard/sites/${siteId}/settings`, "seo_saved");
}

export async function publishSite(formData: FormData) {
  await getCurrentUser();

  const siteId = value(formData, "site_id");
  const slug = value(formData, "slug");
  const returnTo = value(formData, "return_to");
  const publishedUrl = `/s/${slug}`;
  const supabase = await createClient();

  const { data: pages, error: pagesError } = await supabase
    .from("site_pages")
    .select("id,draft_json")
    .eq("site_id", siteId);

  if (pagesError) {
    throw new Error(pagesError.message);
  }

  await Promise.all(
    (pages ?? []).map((page) =>
      supabase
        .from("site_pages")
        .update({
          published_json: page.draft_json,
          updated_at: new Date().toISOString(),
        })
        .eq("id", page.id),
    ),
  );

  const { error } = await supabase
    .from("sites")
    .update({
      status: "published",
      published_url: publishedUrl,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", siteId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/sites");
  revalidatePath(`/dashboard/sites/${siteId}`);
  revalidatePath(`/s/${slug}`);
  revalidatePath("/sitemap.xml");

  if (returnTo.startsWith("/dashboard")) {
    redirectWithNotice(returnTo, "site_published");
  }
}

export async function updateDraftJson(formData: FormData) {
  await getCurrentUser();

  const siteId = value(formData, "site_id");
  const pageId = value(formData, "page_id");
  const rawJson = value(formData, "draft_json");
  let draftJson: unknown;

  try {
    draftJson = JSON.parse(rawJson);
  } catch {
    throw new Error("draft_json 형식이 올바르지 않아.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_pages")
    .update({
      draft_json: draftJson,
      page_json: draftJson,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("sites")
    .update({
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", siteId);

  revalidatePath(`/dashboard/editor/${siteId}`);
  revalidatePath(`/dashboard/sites/${siteId}`);
  revalidatePath("/dashboard/sites");
}


const contentPostSchema = z.object({
  siteId: z.string().optional(),
  postId: z.string().optional(),
  boardId: z.string().optional(),
  board: z.string().min(1).default("공지사항"),
  category: z.string().optional(),
  title: z.string().min(1),
  summary: z.string().optional(),
  contentHtml: z.string().optional(),
  contentJson: z.string().optional(),
  author: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled"]),
  scheduledAt: z.string().optional(),
  pinned: z.boolean().default(false),
});

function parseJson(value: string | undefined): Json {
  if (!value) return {};

  try {
    return JSON.parse(value) as Json;
  } catch {
    return {};
  }
}

async function getWritableSiteId(siteId?: string) {
  if (siteId) return siteId;

  const workspaceId = await ensureWorkspace();
  const supabase = await createClient();

  const { data: existingSite } = await supabase
    .from("sites")
    .select("id")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingSite?.id) {
    return existingSite.id as string;
  }

  const { data: site, error } = await supabase
    .from("sites")
    .insert({
      workspace_id: workspaceId,
      name: "내 사이트",
      slug: `site-${Date.now()}`,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !site) {
    throw new Error(error?.message ?? "게시글을 연결할 사이트를 만들지 못했어.");
  }

  await supabase.from("site_pages").insert({
    site_id: site.id,
    title: "Home",
    path: "/",
    menu_code: "home",
    menu_name: "홈",
    page_type: "auto",
    is_hidden: false,
    sort_order: 0,
    locale_json: {},
    page_json: { version: 1, sections: [] },
    draft_json: { version: 1, sections: [] },
  } as never);

  return site.id as string;
}

export async function createSiteSitemapPage(formData: FormData) {
  await getCurrentUser();

  const siteId = value(formData, "site_id");
  const parentId = value(formData, "parent_id") || null;
  const menuCode = slugify(value(formData, "menu_code"));
  const menuName = value(formData, "menu_name");
  const pageType = value(formData, "page_type") || "auto";
  const subLayout = value(formData, "sub_layout") || null;
  const isHidden = checkboxValue(formData, "is_hidden");

  if (!siteId || !menuCode || !menuName) {
    throw new Error("메뉴코드와 메뉴명이 필요합니다.");
  }

  if (!hasSupabaseEnv()) {
    revalidateSiteSitemap(siteId);
    redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_saved");
  }

  const supabase = await createClient();
  let parentPath = "";

  if (parentId) {
    const { data: parent, error: parentError } = await supabase
      .from("site_pages")
      .select("path")
      .eq("site_id", siteId)
      .eq("id", parentId)
      .maybeSingle();

    if (parentError) {
      throw new Error(parentError.message);
    }

    parentPath = parent?.path ? String(parent.path) : "";
  }

  const countQuery = supabase
    .from("site_pages")
    .select("id", { count: "exact", head: true })
    .eq("site_id", siteId);

  const { count } = parentId
    ? await countQuery.eq("parent_id", parentId)
    : await countQuery.is("parent_id", null);

  const pageJson = buildPageContentJson(formData, menuName);

  const { error } = await supabase.from("site_pages").insert({
    site_id: siteId,
    parent_id: parentId,
    title: menuName,
    path: pagePathFromMenuCode(menuCode, parentPath),
    menu_code: menuCode,
    menu_name: menuName,
    page_type: pageType,
    sub_layout: subLayout,
    is_hidden: isHidden,
    sort_order: count ?? 0,
    locale_json: readLocaleSettings(formData),
    page_json: pageJson,
    draft_json: pageJson,
  } as never);

  if (error) {
    throw new Error(error.message);
  }

  await syncSiteNavigationDraft(siteId);
  revalidateSiteSitemap(siteId);
  redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_saved");
}

export async function updateSiteSitemapPage(formData: FormData) {
  await getCurrentUser();

  const siteId = value(formData, "site_id");
  const pageId = value(formData, "page_id");
  const rawParentId = value(formData, "parent_id");
  const parentId = rawParentId && rawParentId !== pageId ? rawParentId : null;
  const menuCode = slugify(value(formData, "menu_code"));
  const menuName = value(formData, "menu_name");
  const pageType = value(formData, "page_type") || "auto";
  const subLayout = value(formData, "sub_layout") || null;
  const isHidden = checkboxValue(formData, "is_hidden");

  if (!siteId || !pageId || !menuCode || !menuName) {
    throw new Error("페이지 정보가 부족합니다.");
  }

  if (!hasSupabaseEnv()) {
    revalidateSiteSitemap(siteId);
    redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_saved");
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("site_pages")
    .select("path,draft_json,page_json")
    .eq("site_id", siteId)
    .eq("id", pageId)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!current) {
    throw new Error("수정할 페이지를 찾지 못했습니다.");
  }

  let parentPath = "";

  if (parentId) {
    const { data: parent, error: parentError } = await supabase
      .from("site_pages")
      .select("path")
      .eq("site_id", siteId)
      .eq("id", parentId)
      .maybeSingle();

    if (parentError) {
      throw new Error(parentError.message);
    }

    parentPath = parent?.path ? String(parent.path) : "";
  }

  const isHome = current.path === "/";
  const nextPath = isHome ? "/" : pagePathFromMenuCode(menuCode, parentPath);
  const pageJson = buildPageContentJson(
    formData,
    menuName,
    (current.draft_json ?? current.page_json) as Json,
  );

  const { error } = await supabase
    .from("site_pages")
    .update({
      parent_id: isHome ? null : parentId,
      title: menuName,
      path: nextPath,
      menu_code: isHome ? "home" : menuCode,
      menu_name: menuName,
      page_type: pageType,
      sub_layout: subLayout,
      is_hidden: isHome ? false : isHidden,
      locale_json: readLocaleSettings(formData),
      draft_json: {
        ...pageJson,
        pageType,
        title: menuName,
      },
      page_json: {
        ...pageJson,
        pageType,
        title: menuName,
      },
      updated_at: new Date().toISOString(),
    } as never)
    .eq("site_id", siteId)
    .eq("id", pageId);

  if (error) {
    throw new Error(error.message);
  }

  await syncSiteNavigationDraft(siteId);
  revalidateSiteSitemap(siteId);
  redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_saved");
}

export async function deleteSiteSitemapPages(formData: FormData) {
  await getCurrentUser();

  const siteId = value(formData, "site_id");
  const pageIds = formData
    .getAll("page_id")
    .map((pageId) => String(pageId))
    .filter(Boolean);

  if (!siteId || pageIds.length === 0) {
    redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_saved");
  }

  if (!hasSupabaseEnv()) {
    revalidateSiteSitemap(siteId);
    redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_deleted");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_pages")
    .delete()
    .eq("site_id", siteId)
    .neq("path", "/")
    .in("id", pageIds);

  if (error) {
    throw new Error(error.message);
  }

  await syncSiteNavigationDraft(siteId);
  revalidateSiteSitemap(siteId);
  redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_deleted");
}

export async function moveSiteSitemapPage(formData: FormData) {
  await getCurrentUser();

  const siteId = value(formData, "site_id");
  const pageId = value(formData, "page_id");
  const direction = value(formData, "direction");

  if (!siteId || !pageId || !["up", "down"].includes(direction)) {
    redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_saved");
  }

  if (!hasSupabaseEnv()) {
    revalidateSiteSitemap(siteId);
    redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_saved");
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("site_pages")
    .select("id,parent_id,path,sort_order")
    .eq("site_id", siteId)
    .eq("id", pageId)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!current || current.path === "/") {
    redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_saved");
  }

  const siblingsQuery = supabase
    .from("site_pages")
    .select("id,sort_order,menu_name")
    .eq("site_id", siteId);

  const { data: siblings, error: siblingsError } = current.parent_id
    ? await siblingsQuery.eq("parent_id", current.parent_id)
    : await siblingsQuery.is("parent_id", null);

  if (siblingsError) {
    throw new Error(siblingsError.message);
  }

  const ordered = (siblings ?? [])
    .map((item) => ({
      id: String(item.id),
      menuName: String(item.menu_name ?? ""),
      sortOrder: Number(item.sort_order ?? 0),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.menuName.localeCompare(b.menuName));
  const currentIndex = ordered.findIndex((item) => item.id === pageId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
    redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_saved");
  }

  const target = ordered[targetIndex];
  const currentItem = ordered[currentIndex];

  const { error: firstError } = await supabase
    .from("site_pages")
    .update({ sort_order: target.sortOrder, updated_at: new Date().toISOString() } as never)
    .eq("site_id", siteId)
    .eq("id", currentItem.id);

  if (firstError) {
    throw new Error(firstError.message);
  }

  const { error: secondError } = await supabase
    .from("site_pages")
    .update({ sort_order: currentItem.sortOrder, updated_at: new Date().toISOString() } as never)
    .eq("site_id", siteId)
    .eq("id", target.id);

  if (secondError) {
    throw new Error(secondError.message);
  }

  await syncSiteNavigationDraft(siteId);
  revalidateSiteSitemap(siteId);
  redirectWithNotice(`/dashboard/sites/${siteId}/sitemap`, "sitemap_saved");
}

async function upsertContentBoard(siteId: string, boardName: string, boardId?: string) {
  if (boardId) {
    return boardId;
  }

  const supabase = await createClient();
  const slug = slugify(boardName) || "board";

  const { data: existing } = await supabase
    .from("content_boards")
    .select("id")
    .eq("site_id", siteId)
    .eq("slug", slug)
    .maybeSingle();

  if (existing?.id) {
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("content_boards")
    .insert({ site_id: siteId, name: boardName, slug })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "게시판 생성에 실패했어.");
  }

  return data.id as string;
}

function readContentPostForm(formData: FormData) {
  return contentPostSchema.parse({
    siteId: value(formData, "site_id") || undefined,
    postId: value(formData, "post_id") || undefined,
    boardId: value(formData, "board_id") || undefined,
    board: value(formData, "board") || "공지사항",
    category: value(formData, "category"),
    title: value(formData, "title") || "제목 없는 게시물",
    summary: value(formData, "summary"),
    contentHtml: String(formData.get("content_html") ?? ""),
    contentJson: String(formData.get("content_json") ?? ""),
    author: value(formData, "author") || "관리자",
    status: value(formData, "status_override") || value(formData, "status") || "draft",
    scheduledAt: value(formData, "scheduled_at"),
    pinned: formData.get("pinned") === "on",
  });
}


export async function createContentBoard(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/boards");
    redirectWithNotice("/dashboard/content/boards", "board_created");
  }

  const siteId = await getWritableSiteId(value(formData, "site_id") || undefined);
  const name = value(formData, "name");
  const description = value(formData, "description");

  if (!name) {
    throw new Error("게시판 이름이 필요해.");
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("content_boards")
    .select("id", { count: "exact", head: true })
    .eq("site_id", siteId);

  const { error } = await supabase.from("content_boards").insert({
    site_id: siteId,
    name,
    slug: slugify(name) || `board-${Date.now().toString(36)}`,
    description: description || null,
    sort_order: (count ?? 0) + 1,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/content/boards");
  revalidatePath("/dashboard/content/posts/new");
  redirectWithNotice("/dashboard/content/boards", "board_created");
}

export async function updateContentBoard(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/boards");
    redirectWithNotice("/dashboard/content/boards", "board_updated");
  }

  await getCurrentUser();
  const boardId = value(formData, "board_id");
  const name = value(formData, "name");
  const description = value(formData, "description");

  if (!boardId || !name) {
    throw new Error("수정할 게시판 정보가 필요해.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("content_boards")
    .update({
      name,
      slug: slugify(name) || "board",
      description: description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", boardId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("content_posts")
    .update({ board_name: name, updated_at: new Date().toISOString() })
    .eq("board_id", boardId);

  revalidatePath("/dashboard/content/boards");
  revalidatePath("/dashboard/content/posts");
  redirectWithNotice("/dashboard/content/boards", "board_updated");
}

export async function moveContentBoard(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/boards");
    redirectWithNotice("/dashboard/content/boards", "board_moved");
  }

  await getCurrentUser();
  const boardId = value(formData, "board_id");
  const siteId = value(formData, "site_id");
  const direction = value(formData, "direction");

  if (!boardId || !siteId || !["up", "down"].includes(direction)) {
    throw new Error("이동할 게시판 정보가 필요해.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_boards")
    .select("id,sort_order")
    .eq("site_id", siteId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const boards = data ?? [];
  const currentIndex = boards.findIndex((board) => board.id === boardId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  const current = boards[currentIndex];
  const target = boards[targetIndex];

  if (!current || !target) {
    redirectWithNotice("/dashboard/content/boards", "board_moved");
  }

  await Promise.all([
    supabase
      .from("content_boards")
      .update({ sort_order: target.sort_order, updated_at: new Date().toISOString() })
      .eq("id", current.id),
    supabase
      .from("content_boards")
      .update({ sort_order: current.sort_order, updated_at: new Date().toISOString() })
      .eq("id", target.id),
  ]);

  revalidatePath("/dashboard/content/boards");
  revalidatePath("/dashboard/content/posts/new");
  redirectWithNotice("/dashboard/content/boards", "board_moved");
}

export async function deleteContentBoard(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/boards");
    redirectWithNotice("/dashboard/content/boards", "board_deleted");
  }

  await getCurrentUser();
  const boardId = value(formData, "board_id");

  if (!boardId) {
    throw new Error("삭제할 게시판이 필요해.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("content_boards").delete().eq("id", boardId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/content/boards");
  revalidatePath("/dashboard/content/posts");
  redirectWithNotice("/dashboard/content/boards", "board_deleted");
}

export async function createContentPost(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirectWithNotice("/dashboard/content/posts", "post_created");
  }

  const user = await getCurrentUser();
  const data = readContentPostForm(formData);
  const siteId = await getWritableSiteId(data.siteId);
  const boardId = await upsertContentBoard(siteId, data.board, data.boardId);
  const supabase = await createClient();
  const now = new Date().toISOString();
  const baseSlug = slugify(data.title) || "post";
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: created, error } = await supabase
    .from("content_posts")
    .insert({
      site_id: siteId,
      board_id: boardId,
      board_name: data.board,
      category: data.category || null,
      title: data.title,
      slug,
      excerpt: data.summary || null,
      content_json: parseJson(data.contentJson),
      content_html: data.contentHtml || "",
      author_id: user.id,
      author_name: data.author || user.email || "관리자",
      status: data.status,
      is_pinned: data.pinned,
      scheduled_at: data.status === "scheduled" && data.scheduledAt ? data.scheduledAt : null,
      published_at: data.status === "published" ? now : null,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "게시글 저장에 실패했어.");
  }

  revalidatePath("/dashboard/content/posts");
  redirectWithNotice(`/dashboard/content/posts/${created.id}`, "post_created");
}

export async function updateContentPost(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirectWithNotice("/dashboard/content/posts", "post_updated");
  }

  await getCurrentUser();
  const data = readContentPostForm(formData);

  if (!data.postId) {
    throw new Error("수정할 게시글이 필요해.");
  }

  const siteId = await getWritableSiteId(data.siteId);
  const boardId = await upsertContentBoard(siteId, data.board, data.boardId);
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("content_posts")
    .update({
      site_id: siteId,
      board_id: boardId,
      board_name: data.board,
      category: data.category || null,
      title: data.title,
      excerpt: data.summary || null,
      content_json: parseJson(data.contentJson),
      content_html: data.contentHtml || "",
      author_name: data.author || "관리자",
      status: data.status,
      is_pinned: data.pinned,
      scheduled_at: data.status === "scheduled" && data.scheduledAt ? data.scheduledAt : null,
      published_at: data.status === "published" ? now : null,
      updated_at: now,
    })
    .eq("id", data.postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/content/posts");
  revalidatePath(`/dashboard/content/posts/${data.postId}`);
  redirectWithNotice(`/dashboard/content/posts/${data.postId}`, "post_updated");
}

export async function toggleContentPostPinned(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/posts");
    redirectWithNotice("/dashboard/content/posts", "post_pinned");
  }

  await getCurrentUser();
  const postId = value(formData, "post_id");
  const pinned = value(formData, "pinned") === "true";
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_posts")
    .update({ is_pinned: pinned, updated_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/content/posts");
  redirectWithNotice("/dashboard/content/posts", pinned ? "post_pinned" : "post_unpinned");
}

export async function deleteContentPost(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/posts");
    redirectWithNotice("/dashboard/content/posts", "post_deleted");
  }

  await getCurrentUser();
  const postId = value(formData, "post_id");

  if (!postId) {
    throw new Error("삭제할 게시글이 필요해.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("content_posts").delete().eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/content/posts");
  redirectWithNotice("/dashboard/content/posts", "post_deleted");
}

export async function updateContactSubmission(formData: FormData) {
  await getCurrentUser();

  const submissionId = value(formData, "submission_id");
  const status = value(formData, "status") || "new";
  const adminNote = value(formData, "admin_note") || null;

  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/forms");
    redirectWithNotice("/dashboard/content/forms", "contact_saved");
  }

  if (!submissionId || !["new", "in_progress", "done"].includes(status)) {
    throw new Error("문의 상태 값이 올바르지 않습니다.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({
      admin_note: adminNote,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/content/forms");
  redirectWithNotice("/dashboard/content/forms", "contact_saved");
}

export async function deleteContactSubmission(formData: FormData) {
  await getCurrentUser();

  const submissionId = value(formData, "submission_id");

  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/forms");
    redirectWithNotice("/dashboard/content/forms", "contact_deleted");
  }

  if (!submissionId) {
    throw new Error("삭제할 문의를 찾지 못했습니다.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", submissionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/content/forms");
  redirectWithNotice("/dashboard/content/forms", "contact_deleted");
}

function safeFileName(input: string) {
  const extension = input.split(".").pop()?.toLowerCase() || "file";
  const baseName = input.replace(/\.[^.]+$/, "");
  const safeBase = slugify(baseName) || "media";

  return `${safeBase}.${extension}`;
}

export async function uploadDashboardMedia(formData: FormData) {
  const user = await getCurrentUser();
  const fileValue = formData.get("file");

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    throw new Error("업로드할 파일을 선택해 주세요.");
  }

  const maxSize = 15 * 1024 * 1024;
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "application/pdf",
  ];

  if (fileValue.size > maxSize) {
    throw new Error("15MB 이하 파일만 업로드할 수 있습니다.");
  }

  if (fileValue.type && !allowedTypes.includes(fileValue.type)) {
    throw new Error("JPG, PNG, WebP, GIF, SVG, MP4, WebM, PDF 파일만 업로드할 수 있습니다.");
  }

  const supabase = await createClient();
  const path = `users/${user.id}/media/${Date.now()}-${safeFileName(fileValue.name)}`;
  const { error } = await supabase.storage
    .from("site-assets")
    .upload(path, fileValue, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/content/media");
  redirectWithNotice("/dashboard/content/media", "media_uploaded");
}

export async function deleteDashboardMedia(formData: FormData) {
  const user = await getCurrentUser();
  const path = value(formData, "path");
  const allowedPrefix = `users/${user.id}/media/`;

  if (!path || !path.startsWith(allowedPrefix)) {
    throw new Error("삭제할 수 없는 파일 경로입니다.");
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from("site-assets").remove([path]);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/content/media");
  redirectWithNotice("/dashboard/content/media", "media_deleted");
}

function dateTimeValue(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return null;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function normalizePopupStatusValue(input: string) {
  return input === "active" ? "active" : "inactive";
}

function normalizePopupPlacementValue(input: string) {
  return input === "all" ? "all" : "home";
}

async function revalidatePopupPaths(siteId?: string) {
  revalidatePath("/dashboard/content/popups");

  if (!siteId || !hasSupabaseEnv()) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("slug")
    .eq("id", siteId)
    .maybeSingle();

  const slug = typeof data?.slug === "string" ? data.slug : "";

  if (slug) {
    revalidatePath(`/s/${slug}`);
  }
}

export async function createDashboardPopup(formData: FormData) {
  await getCurrentUser();

  const selectedSiteId = value(formData, "site_id");
  const siteId = selectedSiteId || (await getWritableSiteId());
  const title = value(formData, "title");
  const body = value(formData, "body");

  if (!title) {
    throw new Error("팝업명을 입력해 주세요.");
  }

  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/popups");
    redirectWithNotice("/dashboard/content/popups", "popup_created");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("content_popups").insert({
    body,
    button_label: value(formData, "button_label") || null,
    button_url: value(formData, "button_url") || null,
    ends_at: dateTimeValue(formData, "ends_at"),
    image_url: value(formData, "image_url") || null,
    placement: normalizePopupPlacementValue(value(formData, "placement")),
    site_id: siteId,
    starts_at: dateTimeValue(formData, "starts_at"),
    status: normalizePopupStatusValue(value(formData, "status")),
    title,
  });

  if (error) {
    throw new Error(error.message);
  }

  await revalidatePopupPaths(siteId);
  redirectWithNotice("/dashboard/content/popups", "popup_created");
}

export async function updateDashboardPopup(formData: FormData) {
  await getCurrentUser();

  const popupId = value(formData, "popup_id");
  const siteId = value(formData, "site_id");
  const title = value(formData, "title");

  if (!popupId || !title) {
    throw new Error("팝업 정보가 올바르지 않습니다.");
  }

  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/popups");
    redirectWithNotice("/dashboard/content/popups", "popup_updated");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("content_popups")
    .update({
      body: value(formData, "body"),
      button_label: value(formData, "button_label") || null,
      button_url: value(formData, "button_url") || null,
      ends_at: dateTimeValue(formData, "ends_at"),
      image_url: value(formData, "image_url") || null,
      placement: normalizePopupPlacementValue(value(formData, "placement")),
      starts_at: dateTimeValue(formData, "starts_at"),
      status: normalizePopupStatusValue(value(formData, "status")),
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", popupId);

  if (error) {
    throw new Error(error.message);
  }

  await revalidatePopupPaths(siteId);
  redirectWithNotice("/dashboard/content/popups", "popup_updated");
}

export async function deleteDashboardPopup(formData: FormData) {
  await getCurrentUser();

  const popupId = value(formData, "popup_id");
  const siteId = value(formData, "site_id");

  if (!popupId) {
    throw new Error("삭제할 팝업을 찾지 못했습니다.");
  }

  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/popups");
    redirectWithNotice("/dashboard/content/popups", "popup_deleted");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("content_popups").delete().eq("id", popupId);

  if (error) {
    throw new Error(error.message);
  }

  await revalidatePopupPaths(siteId);
  redirectWithNotice("/dashboard/content/popups", "popup_deleted");
}
