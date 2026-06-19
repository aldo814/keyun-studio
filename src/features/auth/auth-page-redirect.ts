import { redirect } from "next/navigation";

import { resolvePostLoginPath } from "@/features/auth/post-login-redirect";
import { hasAnySiteForUser } from "@/features/auth/session-context";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{
  next?: string | string[];
}> | {
  next?: string | string[];
} | undefined;

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function redirectAuthenticatedUser(searchParams?: SearchParams) {
  if (!hasSupabaseEnv()) {
    return;
  }

  const params = await searchParams;
  const requestedNext = firstParam(params?.next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  redirect(
    resolvePostLoginPath({
      hasSites: await hasAnySiteForUser(supabase, user.id),
      requestedNext,
      role: profile?.role ?? "user",
    }),
  );
}
