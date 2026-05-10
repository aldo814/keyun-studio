"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = mode === "signup";

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

      router.push("/dashboard");
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
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
            </Button>
          </form>
          <div className="mt-5 text-center text-sm text-muted-foreground">
            {isSignup ? (
              <Link className="font-medium text-foreground hover:underline" href="/login">
                이미 계정이 있어요
              </Link>
            ) : (
              <Link className="font-medium text-foreground hover:underline" href="/signup">
                새 계정 만들기
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
