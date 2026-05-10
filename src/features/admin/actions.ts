"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function getCurrentAdminId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("id", user.id)
    .single();

  if (error || !profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("슈퍼관리자 권한이 필요합니다.");
  }

  return user.id;
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function boolValue(formData: FormData, key: string) {
  return ["true", "on", "1", "yes"].includes(value(formData, key));
}

async function writeAdminLog(
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown> = {},
) {
  const supabase = await createClient();
  const actorId = await getCurrentAdminId();

  await supabase.from("admin_logs").insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata,
  });
}

export async function updateUserProfile(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const name = value(formData, "name");
  const role = value(formData, "role") || "user";
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ name, role })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("사용자 정보 수정", "profile", id, { name, role });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function updateWorkspace(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const name = value(formData, "name");
  const plan = value(formData, "plan") || "free";
  const status = value(formData, "status") || "active";
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspaces")
    .update({ name, plan, status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("워크스페이스 정보 수정", "workspace", id, {
    name,
    plan,
    status,
  });
  revalidatePath("/admin/workspaces");
  revalidatePath(`/admin/workspaces/${id}`);
}

export async function updateSite(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const name = value(formData, "name");
  const slug = value(formData, "slug");
  const status = value(formData, "status") || "draft";
  const publishedUrl = value(formData, "published_url") || null;
  const supabase = await createClient();

  const { error } = await supabase
    .from("sites")
    .update({
      name,
      slug,
      status,
      published_url: publishedUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("사이트 정보 수정", "site", id, {
    name,
    slug,
    status,
    published_url: publishedUrl,
  });
  revalidatePath("/admin/sites");
  revalidatePath(`/admin/sites/${id}`);
}

export async function updateTemplate(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const name = value(formData, "name");
  const description = value(formData, "description") || null;
  const visibility = value(formData, "visibility") || "private";
  const status = value(formData, "status") || "draft";
  const isFeatured = boolValue(formData, "is_featured");
  const thumbnailUrl = value(formData, "thumbnail_url") || null;
  const supabase = await createClient();

  const { error } = await supabase
    .from("templates")
    .update({
      name,
      description,
      visibility,
      status,
      is_featured: isFeatured,
      thumbnail_url: thumbnailUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("템플릿 정보 수정", "template", id, {
    name,
    visibility,
    status,
    is_featured: isFeatured,
  });
  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${id}`);
  revalidatePath(`/admin/templates/${id}/preview`);
}

export async function updateTemplateJson(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const rawJson = value(formData, "template_json");
  let templateJson: unknown;

  try {
    templateJson = JSON.parse(rawJson);
  } catch {
    throw new Error("템플릿 JSON 형식이 올바르지 않아.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("templates")
    .update({
      template_json: templateJson,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("템플릿 JSON 수정", "template", id);
  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${id}`);
  revalidatePath(`/admin/templates/${id}/preview`);
}

export async function updateReport(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const reason = value(formData, "reason");
  const severity = value(formData, "severity") || "medium";
  const status = value(formData, "status") || "open";
  const resolution = value(formData, "resolution") || null;
  const supabase = await createClient();

  const { error } = await supabase
    .from("reports")
    .update({
      reason,
      severity,
      status,
      resolution,
      updated_at: new Date().toISOString(),
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("신고 검수 정보 수정", "report", id, {
    severity,
    status,
  });
  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${id}`);
}

export async function createTemplate(formData: FormData) {
  const adminId = await getCurrentAdminId();

  const name = value(formData, "name");
  const description = value(formData, "description") || null;
  const visibility = value(formData, "visibility") || "private";
  const status = value(formData, "status") || "draft";
  const thumbnailUrl = value(formData, "thumbnail_url") || null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("templates")
    .insert({
      name,
      description,
      visibility,
      status,
      thumbnail_url: thumbnailUrl,
      created_by: adminId,
      template_json: {
        version: 1,
        sections: [],
        theme: "keyun-default",
      },
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "템플릿 생성에 실패했어.");
  }

  await writeAdminLog("템플릿 생성", "template", data.id, {
    name,
    visibility,
    status,
  });
  revalidatePath("/admin/templates");
  redirect(`/admin/templates/${data.id}`);
}

export async function createAdminNote(formData: FormData) {
  const actorId = await getCurrentAdminId();
  const targetType = value(formData, "targetType");
  const targetId = value(formData, "targetId");
  const note = value(formData, "note");

  if (!note) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("admin_notes").insert({
    target_type: targetType,
    target_id: targetId,
    note,
    created_by: actorId,
  });

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("운영 메모 추가", targetType, targetId);
  revalidatePath(`/admin/${targetType}s/${targetId}`);
}
