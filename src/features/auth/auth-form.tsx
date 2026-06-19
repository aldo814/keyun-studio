"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resolvePostLoginPath, sanitizeDashboardNext } from "@/features/auth/post-login-redirect";
import { hasAnySiteForUser } from "@/features/auth/session-context";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type SocialProvider = "google" | "kakao" | "custom:naver";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(() =>
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem("keyun_login_email") || "",
  );
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [socialName, setSocialName] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(() =>
    typeof window === "undefined"
      ? true
      : Boolean(window.localStorage.getItem("keyun_login_email")),
  );

  const isSignup = mode === "signup";
  const passwordChecks = useMemo(
    () => [
      { label: "6자 이상", ok: password.length >= 6 },
      { label: "영문 포함", ok: /[a-zA-Z]/.test(password) },
      { label: "숫자 포함", ok: /\d/.test(password) },
    ],
    [password],
  );


  function getNextPath() {
    if (typeof window === "undefined") {
      return "/dashboard";
    }

    const next = new URLSearchParams(window.location.search).get("next");

    return sanitizeDashboardNext(next);
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
      return {
        hasSites: false,
        role: "user",
      };
    }

    const profilePayload = {
      email: user.email ?? email,
      name: name || socialName || user.user_metadata?.name || user.email || "",
      username: name || socialName || user.user_metadata?.name || "",
      last_seen_at: new Date().toISOString(),
    };

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    const profileResult = existingProfile?.id
      ? await supabase.from("profiles").update(profilePayload).eq("id", user.id)
      : await supabase.from("profiles").insert({
          id: user.id,
          ...profilePayload,
          role: "user",
        });

    if (profileResult.error) {
      const fallbackPayload = {
        email: user.email ?? email,
        name: name || socialName || user.user_metadata?.name || user.email || "",
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

    return {
      hasSites: await hasAnySiteForUser(supabase, user.id),
      role: freshProfile?.role ?? "user",
    };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (!email || !password) {
        setMessageTone("error");
        setMessage("이메일과 비밀번호를 입력해줘.");
        return;
      }

      if (password.length < 6) {
        setMessageTone("error");
        setMessage("비밀번호는 6자 이상 입력해줘.");
        return;
      }

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
          setMessageTone("error");
          setMessage(error.message);
          return;
        }

        setMessageTone("success");
        setMessage("가입 신청이 완료되었습니다. 이메일 인증이 켜져 있다면 메일 확인 후 로그인해주세요.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessageTone("error");
        setMessage(error.message);
        return;
      }

      const loginContext = await trackProfileLogin();

      if (rememberEmail) {
        window.localStorage.setItem("keyun_login_email", email);
      } else {
        window.localStorage.removeItem("keyun_login_email");
      }

      router.push(
        resolvePostLoginPath({
          hasSites: loginContext.hasSites,
          requestedNext: getNextPath(),
          role: loginContext.role,
        }),
      );
      router.refresh();
    } catch (error) {
      setMessageTone("error");
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
        setMessageTone("error");
        setMessage(error.message);
      }
    } catch (error) {
      setMessageTone("error");
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
            KEYUN Admin
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-normal text-balance">
            고객은 콘텐츠를 운영하고, 디자인은 슈퍼관리자가 관리합니다.
          </h1>
          <p className="mt-5 text-sm leading-7 text-zinc-300">
            판매용 관리자에서는 게시글, 문의폼, 미디어, 팝업을 먼저 제공합니다.
            디자인 모드는 슈퍼관리자에게만 노출됩니다.
          </p>
          <div className="mt-8 grid gap-3">
            {["게시글 작성 및 게시", "문의폼 응답 확인", "팝업과 미디어 운영", "슈퍼관리자 디자인 접근 제어"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-200">
                <ShieldCheck className="size-4 text-blue-300" />
                {item}
              </div>
            ))}
          </div>
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
          <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-950">
                  {isSignup ? "관리자 계정 만들기" : "관리자 기능으로 바로 이동"}
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  일반 사용자는 콘텐츠 운영 메뉴를 사용하고, 디자인 메뉴는 슈퍼관리자에게만 표시됩니다.
                </p>
              </div>
            </div>
          </div>

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
              <div className="relative">
                <Input
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="6자 이상"
                  className="pr-11"
                />
                <button
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {isSignup || password ? (
                <div className="flex flex-wrap gap-1.5">
                  {passwordChecks.map((check) => (
                    <span
                      key={check.label}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        check.ok
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {check.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </label>
            {!isSignup ? (
              <label className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <input
                    checked={rememberEmail}
                    className="size-4 rounded border-border"
                    type="checkbox"
                    onChange={(event) => setRememberEmail(event.target.checked)}
                  />
                  이메일 저장
                </span>
                <Link className="font-medium text-foreground hover:underline" href="/reset-password">
                  비밀번호 찾기
                </Link>
              </label>
            ) : null}

            {message ? (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${
                  messageTone === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
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
