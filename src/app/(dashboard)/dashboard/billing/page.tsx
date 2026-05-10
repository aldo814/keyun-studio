import { PageShell } from "@/components/layout/page-shell";

export default function BillingPage() {
  return (
    <PageShell
      eyebrow="Dashboard"
      title="구독과 결제"
      description="플랜, 결제 상태, 사용량 제한, Stripe 포털 이동을 관리합니다."
    />
  );
}
