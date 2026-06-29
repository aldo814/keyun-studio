import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/auth-form";
import { redirectAuthenticatedUser } from "@/features/auth/auth-page-redirect";

export const metadata: Metadata = {
  title: "무료 회원가입",
  description: "KEYUN 계정을 만들고 첫 웹사이트를 무료로 시작하세요.",
};

type SignupPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  await redirectAuthenticatedUser(searchParams);

  return <AuthForm mode="signup" />;
}
