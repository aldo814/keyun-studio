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

function linesValue(formData: FormData, key: string) {
  return value(formData, key)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildTemplateJson(formData: FormData) {
  const heroTitle = value(formData, "hero_title") || "새로운 웹사이트";
  const heroDescription =
    value(formData, "hero_description") ||
    "브랜드를 소개하는 첫 문장을 입력하세요.";
  const ctaTitle = value(formData, "cta_title") || "지금 시작하세요";
  const ctaDescription =
    value(formData, "cta_description") ||
    "고객이 다음 행동을 하도록 안내합니다.";
  const features = linesValue(formData, "feature_items");

  return {
    version: 1,
    theme: value(formData, "theme") || "keyun-default",
    sections: [
      {
        type: "hero",
        title: heroTitle,
        description: heroDescription,
        buttonLabel: value(formData, "hero_button_label") || "문의하기",
      },
      {
        type: "features",
        title: value(formData, "features_title") || "핵심 장점",
        description:
          value(formData, "features_description") ||
          "서비스의 강점을 짧게 정리하세요.",
        items: features.length
          ? features
          : ["빠른 제작", "반응형", "SEO 최적화"],
      },
      {
        type: "cta",
        title: ctaTitle,
        description: ctaDescription,
        buttonLabel: value(formData, "cta_button_label") || "상담 신청",
      },
    ],
  };
}

async function resolveTemplateCategoryId(formData: FormData) {
  const categoryId = value(formData, "category_id");
  const categoryName = value(formData, "category_name");

  if (categoryId) {
    return categoryId;
  }

  if (!categoryName) {
    return null;
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("template_categories")
    .select("id")
    .eq("name", categoryName)
    .maybeSingle();

  if (existing?.id) {
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("template_categories")
    .insert({ name: categoryName })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "카테고리 생성에 실패했어.");
  }

  return data.id as string;
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
  const categoryId = await resolveTemplateCategoryId(formData);
  const visibility = value(formData, "visibility") || "private";
  const status = value(formData, "status") || "draft";
  const isFeatured = boolValue(formData, "is_featured");
  const thumbnailUrl = value(formData, "thumbnail_url") || null;
  const supabase = await createClient();

  const { error } = await supabase
    .from("templates")
    .update({
      name,
      category_id: categoryId,
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
    category_id: categoryId,
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

export async function setUserRoleAction(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const role = value(formData, "role") || "user";
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("사용자 역할 변경", "profile", id, { role });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function sendPasswordResetAction(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const email = value(formData, "email");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("비밀번호 재설정 메일 발송", "profile", id, { email });
  revalidatePath(`/admin/users/${id}`);
}

export async function setWorkspaceStatusAction(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const status = value(formData, "status") || "active";
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update({ status }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("워크스페이스 상태 변경", "workspace", id, { status });
  revalidatePath("/admin/workspaces");
  revalidatePath(`/admin/workspaces/${id}`);
}

export async function setSiteStatusAction(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const status = value(formData, "status") || "draft";
  const supabase = await createClient();
  const { error } = await supabase
    .from("sites")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("사이트 상태 변경", "site", id, { status });
  revalidatePath("/admin/sites");
  revalidatePath(`/admin/sites/${id}`);
}

export async function setTemplateStateAction(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const status = value(formData, "status");
  const visibility = value(formData, "visibility");
  const featuredValue = value(formData, "is_featured");
  const payload: Record<string, string | boolean> = {
    updated_at: new Date().toISOString(),
  };

  if (status) {
    payload.status = status;
  }

  if (visibility) {
    payload.visibility = visibility;
  }

  if (featuredValue) {
    payload.is_featured = boolValue(formData, "is_featured");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("templates").update(payload).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("템플릿 상태 변경", "template", id, payload);
  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${id}`);
  revalidatePath(`/admin/templates/${id}/preview`);
}

export async function setReportStatusAction(formData: FormData) {
  await getCurrentAdminId();

  const id = value(formData, "id");
  const status = value(formData, "status") || "reviewing";
  const resolution = value(formData, "resolution") || null;
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({
      status,
      resolution,
      updated_at: new Date().toISOString(),
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog("신고 처리 상태 변경", "report", id, {
    status,
    resolution,
  });
  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${id}`);
}

export async function createTemplate(formData: FormData) {
  const adminId = await getCurrentAdminId();

  const name = value(formData, "name");
  const description = value(formData, "description") || null;
  const categoryId = await resolveTemplateCategoryId(formData);
  const visibility = value(formData, "visibility") || "private";
  const status = value(formData, "status") || "draft";
  const thumbnailUrl = value(formData, "thumbnail_url") || null;
  const isFeatured = boolValue(formData, "is_featured");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("templates")
    .insert({
      name,
      category_id: categoryId,
      description,
      visibility,
      status,
      is_featured: isFeatured,
      thumbnail_url: thumbnailUrl,
      created_by: adminId,
      template_json: buildTemplateJson(formData),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "템플릿 생성에 실패했어.");
  }

  await writeAdminLog("템플릿 생성", "template", data.id, {
    name,
    category_id: categoryId,
    visibility,
    status,
    is_featured: isFeatured,
  });
  revalidatePath("/admin/templates");
  redirect(`/admin/templates/${data.id}`);
}

export async function duplicateTemplate(formData: FormData) {
  const adminId = await getCurrentAdminId();
  const id = value(formData, "id");
  const supabase = await createClient();
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select(
      "name,category_id,description,thumbnail_url,visibility,status,template_json",
    )
    .eq("id", id)
    .single();

  if (templateError || !template) {
    throw new Error(templateError?.message ?? "복제할 템플릿을 찾지 못했어.");
  }

  const { data, error } = await supabase
    .from("templates")
    .insert({
      name: `${template.name} Copy`,
      category_id: template.category_id,
      description: template.description,
      thumbnail_url: template.thumbnail_url,
      visibility: "private",
      status: "draft",
      is_featured: false,
      created_by: adminId,
      template_json: template.template_json,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "템플릿 복제에 실패했어.");
  }

  await writeAdminLog("템플릿 복제", "template", data.id, {
    source_template_id: id,
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
