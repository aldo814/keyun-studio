"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.name ?? user.email ?? "",
    role: "user",
  });

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
  const seoTitle = value(formData, "seo_title") || name;
  const seoDescription = value(formData, "seo_description");
  const ogImageUrl = value(formData, "og_image_url") || null;

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

  revalidatePath("/dashboard/sites");
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
