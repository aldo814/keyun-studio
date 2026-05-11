"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type SocialProvider = "google" | "kakao" | "custom:naver";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [socialName, setSocialName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = mode === "signup";

  function getNextPath() {
    if (typeof window === "undefined") {
      return "/dashboard";
    }

    const next = new URLSearchParams(window.location.search).get("next");

    return next?.startsWith("/") ? next : "/dashboard";
  }

  function getAuthCallbackUrl() {
    if (typeof window === "undefined") {
      return "/auth/callback?next=/dashboard";
    }

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", getNextPath());

    return callbackUrl.toString();
  }

  async function trackProfileLogin() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const enhancedProfile = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email ?? email,
        name: name || socialName || user.user_metadata?.name || user.email || "",
        username: name || socialName || user.user_metadata?.name || "",
        last_seen_at: new Date().toISOString(),
      });

    if (enhancedProfile.error) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email ?? email,
        name: name || socialName || user.user_metadata?.name || user.email || "",
      });
    }

    await supabase.rpc("track_profile_visit");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getAuthCallbackUrl(),
            data: {
              name,
            },
          },
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage("가입 완료. 이메일 인증 설정이 켜져 있으면 메일 확인 후 로그인하면 돼.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      await trackProfileLogin();
      router.push(getNextPath());
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Supabase 연결 정보를 확인해줘.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function onSocialLogin(provider: SocialProvider) {
    setIsLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const nextPath = getNextPath();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", nextPath);

      if (socialName || name) {
        callbackUrl.searchParams.set("display_name", socialName || name);
      }

      if (email) {
        callbackUrl.searchParams.set("display_email", email);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as unknown as "google",
        options: {
          redirectTo: callbackUrl.toString(),
          scopes: getSocialScopes(provider),
        },
      });

      if (error) {
        setMessage(error.message);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "SNS 로그인 연결 정보를 확인해줘.",
      );
      setIsLoading(false);
    }
  }

  function getSocialScopes(provider: SocialProvider) {
    if (provider === "google") {
      return "email profile";
    }

    if (provider === "kakao") {
      return "profile_nickname profile_image account_email";
    }

    return "name email profile_image";
  }

  return (
    <main className="grid min-h-screen bg-muted/60 px-4 py-10 text-foreground lg:grid-cols-[1fr_480px]">
      <section className="hidden min-h-full items-center justify-center rounded-[32px] bg-zinc-950 p-10 text-white lg:flex">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-300">
            <Sparkles className="size-4 text-blue-300" />
            Keyun Studio Account
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-normal text-balance">
            로그인 후 바로 내 사이트 대시보드로 이동합니다.
          </h1>
          <p className="mt-5 text-sm leading-7 text-zinc-300">
            홈페이지 제작 버튼에서 들어온 사용자는 계정 확인 뒤 템플릿, 사이트,
            SEO 작업을 이어갑니다.
          </p>
        </div>
      </section>

      <div className="flex items-center justify-center">
      <Card className="w-full max-w-md rounded-lg border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>{isSignup ? "회원가입" : "로그인"}</CardTitle>
          <CardDescription>
            {isSignup
              ? "키운 스튜디오 계정을 만들고 워크스페이스를 시작합니다."
              : "Supabase Auth로 키운 스튜디오에 접속합니다."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {isSignup ? (
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">이름</span>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="김은요"
                />
              </label>
            ) : null}
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">이메일</span>
              <Input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="eunyo@example.com"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">비밀번호</span>
              <Input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="6자 이상"
              />
            </label>
            {message ? (
              <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                {message}
              </p>
            ) : null}
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "처리 중..." : isSignup ? "가입하기" : "로그인"}
              <ArrowRight />
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            SNS 로그인
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                SNS 표시 아이디/이름
              </span>
              <Input
                value={socialName}
                onChange={(event) => setSocialName(event.target.value)}
                placeholder="키운스튜디오에서 보여줄 이름"
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onSocialLogin("google")}
              >
                <Mail />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onSocialLogin("kakao")}
              >
                K
                Kakao
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                title="Supabase Custom OAuth provider identifier를 custom:naver로 설정해야 작동합니다."
                onClick={() => onSocialLogin("custom:naver")}
              >
                N
                Naver
              </Button>
            </div>
            <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <LockKeyhole className="mt-0.5 size-3.5" />
              Google/Kakao는 Supabase 기본 Provider, Naver는 custom:naver
              Provider 설정 후 연결됩니다.
            </p>
          </div>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {isSignup ? (
              <Link
                className="font-medium text-foreground hover:underline"
                href="/login?next=/dashboard"
              >
                이미 계정이 있어요
              </Link>
            ) : (
              <Link
                className="font-medium text-foreground hover:underline"
                href="/signup?next=/dashboard"
              >
                새 계정 만들기
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </main>
  );
}
