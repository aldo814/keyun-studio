import { PageShell } from "@/components/layout/page-shell";

export default function SiteSettingsPage() {
  return (
    <PageShell
      eyebrow="Dashboard"
      title="사이트 설정"
      description="사이트 이름, 공개 상태, 도메인, 삭제 잠금 같은 설정을 관리합니다."
    />
  );
}
