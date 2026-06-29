"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolvePostLoginPath, sanitizeDashboardNext } from "@/features/auth/post-login-redirect";
import { hasAnySiteForUser } from "@/features/auth/session-context";
import {
  getConfiguredSuperAdminEmail,
  isConfiguredSuperAdminEmail,
  resolveEffectiveRole,
} from "@/lib/auth/super-admin";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type SocialProvider = "google" | "kakao" | "custom:naver";

type AuthFormProps = {
  mode: AuthMode;
};

const SUPER_ADMIN_LOGIN_ID = "admin";

function normalizeLoginEmail(input: string) {
  const trimmed = input.trim();

  if (trimmed.toLowerCase() === SUPER_ADMIN_LOGIN_ID) {
    return getConfiguredSuperAdminEmail();
  }

  return trimmed;
}

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

  async function trackProfileLogin(authEmail: string) {
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
      email: user.email ?? authEmail,
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
      ? await supabase
          .from("profiles")
          .update({
            ...profilePayload,
            ...(isConfiguredSuperAdminEmail(user.email ?? authEmail)
              ? { role: "super_admin" }
              : {}),
          })
          .eq("id", user.id)
      : await supabase.from("profiles").insert({
          id: user.id,
          ...profilePayload,
          role: isConfiguredSuperAdminEmail(user.email ?? authEmail) ? "super_admin" : "user",
        });

    if (profileResult.error) {
      const fallbackPayload = {
        email: user.email ?? authEmail,
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
      role: resolveEffectiveRole(freshProfile?.role, user.email ?? authEmail),
    };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const authEmail = isSignup ? email.trim() : normalizeLoginEmail(email);

      if (!authEmail || !password) {
        setMessageTone("error");
        setMessage(isSignup ? "이메일과 비밀번호를 입력해줘." : "아이디 또는 이메일과 비밀번호를 입력해줘.");
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
          email: authEmail,
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
        email: authEmail,
        password,
      });

      if (error) {
        setMessageTone("error");
        setMessage(error.message);
        return;
      }

      const loginContext = await trackProfileLogin(authEmail);

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
    <main className="grid min-h-screen bg-white text-slate-950 lg:grid-cols-[minmax(480px,0.82fr)_1.18fr]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Link aria-label="KEYUN 홈" href="/">
            <Image
              alt="KEYUN"
              className="h-7 w-auto"
              height={30}
              priority
              src="/keyun-logo.svg"
              width={126}
            />
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-950"
            href="/"
          >
            <ArrowLeft className="size-3.5" />
            홈으로
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-10">
          <div className="w-full">
            <p className="text-xs font-semibold text-blue-600">
              {isSignup ? "무료로 시작하기" : "다시 만나서 반가워요"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">
              {isSignup ? "첫 사이트를 시작해볼까요?" : "작업을 이어서 완성하세요."}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {isSignup
                ? "계정을 만들면 업종과 목적에 맞는 사이트 구성을 바로 추천해드려요."
                : "로그인하면 최근 사이트와 콘텐츠 작업으로 바로 이동합니다."}
            </p>

            <form className="mt-8 space-y-4" onSubmit={onSubmit}>
              {isSignup ? (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">이름</span>
                  <Input
                    className="h-11"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="김은영"
                    required
                  />
                </label>
              ) : null}
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  {isSignup ? "이메일" : "아이디 또는 이메일"}
                </span>
                <Input
                  className="h-11"
                  required
                  type={isSignup ? "email" : "text"}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={
                    isSignup
                      ? "hello@example.com"
                      : "admin 또는 hello@example.com"
                  }
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">비밀번호</span>
                <div className="relative">
                  <Input
                    className="h-11 pr-11"
                    required
                    minLength={6}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="6자 이상"
                  />
                  <button
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {isSignup || password ? (
                  <div className="flex flex-wrap gap-1.5">
                    {passwordChecks.map((check) => (
                      <span
                        key={check.label}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
                          check.ok
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {check.ok && <Check className="size-3" />}
                        {check.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </label>

              {!isSignup ? (
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <input
                      checked={rememberEmail}
                      className="size-4 rounded border-slate-300 accent-blue-600"
                      type="checkbox"
                      onChange={(event) => setRememberEmail(event.target.checked)}
                    />
                    이메일 저장
                  </span>
                  <Link
                    className="font-medium text-slate-700 hover:text-blue-600"
                    href="/reset-password"
                  >
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
                  role="status"
                >
                  {message}
                </p>
              ) : null}

              <Button
                className="h-11 w-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "처리 중..." : isSignup ? "무료로 가입하기" : "로그인"}
                <ArrowRight />
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              간편 로그인
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <label className="mb-4 block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                SNS 표시 아이디/이름
              </span>
              <Input
                className="h-11"
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
                className="border-[#f5d000] bg-[#fee500] text-slate-950 hover:bg-[#f5d000]"
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onSocialLogin("kakao")}
              >
                K
                Kakao
              </Button>
              <Button
                className="border-[#03c75a] bg-[#03c75a] text-white hover:bg-[#02b351]"
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

            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-400">
              <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
              계정 정보는 로그인과 사이트 저장을 위해서만 사용됩니다.
            </p>

            <div className="mt-7 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
              {isSignup ? "이미 계정이 있나요? " : "KEYUN이 처음인가요? "}
              <Link
                className="font-semibold text-blue-600 hover:text-blue-700"
                href={
                  isSignup
                    ? "/login?next=/dashboard"
                    : "/signup?next=/dashboard/sites/new"
                }
              >
                {isSignup ? "로그인" : "무료 회원가입"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative hidden min-h-screen overflow-hidden border-l border-slate-200 bg-slate-50 lg:block">
        <Image
          alt="KEYUN으로 웹사이트를 만드는 과정"
          className="absolute inset-0 h-full w-full object-cover object-center"
          fill
          priority
          sizes="55vw"
          src="/keyun-builder-hero.png"
        />
        <div className="absolute inset-x-0 bottom-0 bg-slate-950/92 p-10 text-white">
          <p className="text-sm font-semibold text-blue-300">
            {isSignup ? "몇 분이면 첫 화면이 완성됩니다" : "최근 작업부터 바로 이어서"}
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-normal">
            {isSignup
              ? "업종을 선택하면 페이지와 섹션을 추천해드려요."
              : "사이트 편집과 콘텐츠 운영을 한곳에서 관리하세요."}
          </h2>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300">
            {["카드 등록 없이 시작", "반응형 자동 적용", "언제든 직접 수정"].map(
              (item) => (
                <span className="flex items-center gap-1.5" key={item}>
                  <Check className="size-3.5 text-emerald-300" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
