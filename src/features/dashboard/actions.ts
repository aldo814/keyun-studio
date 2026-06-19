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

  const { data: page, error: pageError } = await supabase
    .from("site_pages")
    .insert({
      site_id: site.id,
      title: "Home",
      path: "/",
      page_json: {
        version: 1,
        sections: ["hero", "content", "cta"],
      },
      draft_json: {
        version: 1,
        sections: ["hero", "content", "cta"],
      },
    })
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

  if (completionPath.startsWith("/dashboard")) {
    redirect(completionPath);
  }

  redirect(`/dashboard/sites/${site.id}/settings`);
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
}

export async function publishSite(formData: FormData) {
  await getCurrentUser();

  const siteId = value(formData, "site_id");
  const slug = value(formData, "slug");
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
    page_json: { version: 1, sections: [] },
    draft_json: { version: 1, sections: [] },
  });

  return site.id as string;
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
    redirect("/dashboard/content/boards");
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
  redirect("/dashboard/content/boards");
}

export async function updateContentBoard(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/boards");
    redirect("/dashboard/content/boards");
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
  redirect("/dashboard/content/boards");
}

export async function moveContentBoard(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/boards");
    redirect("/dashboard/content/boards");
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
    redirect("/dashboard/content/boards");
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
  redirect("/dashboard/content/boards");
}

export async function deleteContentBoard(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/boards");
    redirect("/dashboard/content/boards");
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
  redirect("/dashboard/content/boards");
}

export async function createContentPost(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard/content/posts");
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
  redirect(`/dashboard/content/posts/${created.id}`);
}

export async function updateContentPost(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard/content/posts");
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
  redirect(`/dashboard/content/posts/${data.postId}`);
}

export async function toggleContentPostPinned(formData: FormData) {
  if (!hasSupabaseEnv()) {
    revalidatePath("/dashboard/content/posts");
    return;
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
}
