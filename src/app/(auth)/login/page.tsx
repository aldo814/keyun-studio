import { AuthForm } from "@/features/auth/auth-form";
import { redirectAuthenticatedUser } from "@/features/auth/auth-page-redirect";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectAuthenticatedUser(searchParams);

  return <AuthForm mode="login" />;
}
