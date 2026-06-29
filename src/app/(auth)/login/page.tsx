import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/auth-form";
import { redirectAuthenticatedUser } from "@/features/auth/auth-page-redirect";

export const metadata: Metadata = {
  title: "로그인",
  description: "KEYUN에 로그인하고 사이트 작업을 이어서 완성하세요.",
};

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectAuthenticatedUser(searchParams);

  return <AuthForm mode="login" />;
}
