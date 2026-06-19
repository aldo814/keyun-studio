import { AuthForm } from "@/features/auth/auth-form";
import { redirectAuthenticatedUser } from "@/features/auth/auth-page-redirect";

type SignupPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  await redirectAuthenticatedUser(searchParams);

  return <AuthForm mode="signup" />;
}
