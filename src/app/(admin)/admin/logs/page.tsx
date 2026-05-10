import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import { getAdminLogs } from "@/features/admin/queries";

export default async function AdminLogsPage() {
  const logs = await getAdminLogs();

  return (
    <AdminShell
      title="운영 로그"
      description="관리자 액션, 결제 웹훅, 배포 이벤트, 보안 이벤트를 추적합니다."
    >
      <AdminSection
        title="감사 로그"
        description="슈퍼관리자 권한으로 실행된 민감한 변경은 모두 이곳에 남깁니다."
      >
        <AdminTable
          columns={["ID", "행위자", "액션", "대상", "시각"]}
          rows={logs.map((log) => [
            log.id,
            log.actor,
            <span key={log.id} className="font-medium text-zinc-950">
              {log.action}
            </span>,
            log.target,
            log.createdAt,
          ])}
        />
      </AdminSection>
    </AdminShell>
  );
}
