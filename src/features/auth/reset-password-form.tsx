"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

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

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("success");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (!email) {
        setMessageTone("error");
        setMessage("비밀번호를 재설정할 이메일을 입력해줘.");
        return;
      }

      const supabase = createClient();
      const redirectTo =
        typeof window === "undefined"
          ? undefined
          : `${window.location.origin}/login?next=/dashboard`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        setMessageTone("error");
        setMessage(error.message);
        return;
      }

      setMessageTone("success");
      setMessage("재설정 메일을 보냈습니다. 메일함에서 안내 링크를 확인해주세요.");
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

  return (
    <main className="grid min-h-screen place-items-center bg-muted/60 px-4 py-10 text-foreground">
      <Card className="w-full max-w-md rounded-lg border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>비밀번호 재설정</CardTitle>
          <CardDescription>
            가입한 이메일로 비밀번호 재설정 링크를 보내드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
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
              <Mail />
              {isLoading ? "메일 발송 중..." : "재설정 메일 받기"}
            </Button>
          </form>

          <Link
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            href="/login?next=/dashboard"
          >
            <ArrowLeft className="size-4" />
            로그인으로 돌아가기
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
