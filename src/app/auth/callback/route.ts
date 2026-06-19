import { type NextRequest, NextResponse } from "next/server";

import { resolvePostLoginPath, sanitizeDashboardNext } from "@/features/auth/post-login-redirect";
import { hasAnySiteForUser } from "@/features/auth/session-context";
import { createClient } from "@/lib/supabase/server";

function getCookieValue(request: NextRequest, key: string) {
  const value = request.cookies.get(key)?.value;

  return value ? decodeURIComponent(value) : "";
}

function getCallbackValue(request: NextRequest, key: string, cookieKey: string) {
  return request.nextUrl.searchParams.get(key) ?? getCookieValue(request, cookieKey);
}

function getSafeNext(request: NextRequest) {
  return sanitizeDashboardNext(request.nextUrl.searchParams.get("next"));
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;
  const next = getSafeNext(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const preferredName =
          getCallbackValue(request, "display_name", "keyun_oauth_name") ||
          String(user.user_metadata?.name ?? "");
        const preferredEmail =
          getCallbackValue(request, "display_email", "keyun_oauth_email") ||
          user.email ||
          "";

        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id,role")
          .eq("id", user.id)
          .maybeSingle();

        const profilePayload = {
          email: user.email ?? preferredEmail,
          name: preferredName || user.email || "",
          username: preferredName,
          last_seen_at: new Date().toISOString(),
        };

        const profileResult = existingProfile?.id
          ? await supabase.from("profiles").update(profilePayload).eq("id", user.id)
          : await supabase.from("profiles").insert({
              id: user.id,
              ...profilePayload,
              role: "user",
            });

        if (profileResult.error) {
          const fallbackPayload = {
            email: user.email ?? preferredEmail,
            name: preferredName || user.email || "",
          };

          if (existingProfile?.id) {
            await supabase.from("profiles").update(fallbackPayload).eq("id", user.id);
          } else {
            await supabase.from("profiles").insert({
              id: user.id,
              ...fallbackPayload,
              role: "user",
            });
          }
        }

        await supabase.rpc("track_profile_visit");

        const { data: freshProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const destination = resolvePostLoginPath({
          hasSites: await hasAnySiteForUser(supabase, user.id),
          requestedNext: next,
          role: freshProfile?.role ?? existingProfile?.role ?? "user",
        });

        const response = NextResponse.redirect(`${origin}${destination}`);
        response.cookies.delete("keyun_oauth_name");
        response.cookies.delete("keyun_oauth_email");

        return response;
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.delete("keyun_oauth_name");
      response.cookies.delete("keyun_oauth_email");

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?next=${encodeURIComponent(next)}`);
}
