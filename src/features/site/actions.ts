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
    .select("id")
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

  revalidatePath("/dashboard/content/forms");
  redirectWithResult(siteSlug, "sent");
}
