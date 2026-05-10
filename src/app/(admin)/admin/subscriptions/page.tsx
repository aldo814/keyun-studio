import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { subscriptions } from "@/features/admin/data";

export default function AdminSubscriptionsPage() {
  return (
    <AdminShell
      title="구독과 결제"
      description="Stripe 구독, 결제 실패, 갱신일, 플랜 권한을 운영자가 확인합니다."
    >
      <AdminSection title="구독 목록">
        <AdminTable
          columns={["고객", "플랜", "금액", "상태", "다음 갱신"]}
          rows={subscriptions.map((subscription) => [
            <span key={subscription.id} className="font-medium text-foreground">
              {subscription.customer}
            </span>,
            subscription.plan,
            subscription.amount,
            <StatusBadge key={subscription.status} tone={subscription.status}>
              {subscription.status}
            </StatusBadge>,
            subscription.renewal,
          ])}
        />
      </AdminSection>
    </AdminShell>
  );
}
