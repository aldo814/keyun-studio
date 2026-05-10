import { PageShell } from "@/components/layout/page-shell";

export default function ResetPasswordPage() {
  return (
    <PageShell
      eyebrow="Auth"
      title="비밀번호 재설정"
      description="Supabase Auth 이메일 플로우와 연결될 계정 복구 화면입니다."
    />
  );
}
