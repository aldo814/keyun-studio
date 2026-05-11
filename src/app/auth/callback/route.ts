import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function getCookieValue(request: NextRequest, key: string) {
  const value = request.cookies.get(key)?.value;

  return value ? decodeURIComponent(value) : "";
}

function getCallbackValue(request: NextRequest, key: string, cookieKey: string) {
  return request.nextUrl.searchParams.get(key) ?? getCookieValue(request, cookieKey);
}

function getSafeNext(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");

  return next?.startsWith("/") ? next : "/dashboard";
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

        const enhancedProfile = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email ?? preferredEmail,
            name: preferredName || user.email || "",
            username: preferredName,
            last_seen_at: new Date().toISOString(),
          });

        if (enhancedProfile.error) {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email ?? preferredEmail,
            name: preferredName || user.email || "",
          });
        }

        await supabase.rpc("track_profile_visit");
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.delete("keyun_oauth_name");
      response.cookies.delete("keyun_oauth_email");

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?next=${encodeURIComponent(next)}`);
}
