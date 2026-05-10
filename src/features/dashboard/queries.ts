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

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function getDashboardTemplates() {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
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
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("id,workspace_id,template_id,name,slug,status,published_url,updated_at")
    .order("updated_at", { ascending: false });

  return ((data ?? []) as DashboardSiteRow[]).map((site) => ({
    id: site.id,
    workspaceId: site.workspace_id,
    templateId: site.template_id,
    name: site.name,
    slug: site.slug,
    status: site.status,
    publishedUrl: site.published_url ?? "",
    updatedAt: formatDateTime(site.updated_at),
  }));
}

export async function getDashboardSite(siteId: string) {
  const sites = await getDashboardSites();

  return sites.find((site) => site.id === siteId) ?? null;
}

export async function getSiteSeoSettings(siteId: string) {
  if (!hasSupabaseEnv()) {
    return null;
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
