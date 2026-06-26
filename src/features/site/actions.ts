"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithResult(siteSlug: string, result: "sent" | "failed") {
  redirect(`/s/${siteSlug}?contact=${result}#contact`);
}

type ContactNotificationPayload = {
  email: string;
  message: string;
  name: string;
  phone: string;
  siteName: string;
  siteSlug: string;
  sourcePath: string;
  subject: string;
};

function getContactNotificationConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;
  const from = process.env.CONTACT_NOTIFICATION_FROM || "Keyun Studio <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return null;
  }

  return { apiKey, from, to };
}

function buildContactNotificationText(payload: ContactNotificationPayload) {
  return [
    `[${payload.siteName}] 새 문의가 접수되었습니다.`,
    "",
    `사이트: ${payload.siteName} (/s/${payload.siteSlug})`,
    `문의 제목: ${payload.subject}`,
    `이름: ${payload.name}`,
    `이메일: ${payload.email || "-"}`,
    `전화번호: ${payload.phone || "-"}`,
    `접수 경로: ${payload.sourcePath || `/s/${payload.siteSlug}`}`,
    "",
    "문의 내용",
    payload.message,
    "",
    "관리자에서 처리 상태와 내부 메모를 관리해 주세요.",
  ].join("\n");
}

async function sendContactSubmissionNotification(payload: ContactNotificationPayload) {
  const config = getContactNotificationConfig();

  if (!config) {
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from: config.from,
        subject: `[${payload.siteName}] 새 문의: ${payload.subject}`,
        text: buildContactNotificationText(payload),
        to: [config.to],
      }),
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`Contact notification failed: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error("Contact notification failed:", error);
  }
}

export async function submitPublicContact(formData: FormData) {
  const siteSlug = value(formData, "site_slug");
  const name = value(formData, "name");
  const email = value(formData, "email");
  const phone = value(formData, "phone");
  const subject = value(formData, "subject") || "문의";
  const message = value(formData, "message");
  const sourcePath = value(formData, "source_path") || `/s/${siteSlug}`;
  const honeypot = value(formData, "company");

  if (!siteSlug || honeypot) {
    redirectWithResult(siteSlug || "keyun-demo", "failed");
  }

  if (!name || !message || (!email && !phone)) {
    redirectWithResult(siteSlug, "failed");
  }

  if (!hasSupabaseEnv()) {
    redirectWithResult(siteSlug, "sent");
  }

  const supabase = await createClient();
  const { data: site } = await supabase
    .from("sites")
    .select("id,name,slug")
    .eq("slug", siteSlug)
    .eq("status", "published")
    .maybeSingle();

  const siteId = site?.id;

  if (!siteId) {
    redirectWithResult(siteSlug, "failed");
  }

  const { error } = await supabase.from("contact_submissions").insert({
    email: email || null,
    form_name: "문의폼",
    message,
    name,
    phone: phone || null,
    site_id: siteId,
    source_path: sourcePath,
    subject,
  });

  if (error) {
    console.error(error.message);
    redirectWithResult(siteSlug, "failed");
  }

  await sendContactSubmissionNotification({
    email,
    message,
    name,
    phone,
    siteName: site?.name || siteSlug,
    siteSlug: site?.slug || siteSlug,
    sourcePath,
    subject,
  });

  revalidatePath("/dashboard/content/forms");
  redirectWithResult(siteSlug, "sent");
}
