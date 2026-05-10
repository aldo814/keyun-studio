import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import {
  ActionPanel,
  EditPanel,
  NotesPanel,
} from "@/components/admin/detail-panels";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { createAdminNote, updateWorkspace } from "@/features/admin/actions";
import {
  getAdminSites,
  getAdminUsers,
  getAdminWorkspace,
} from "@/features/admin/queries";

type AdminWorkspaceDetailPageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export default async function AdminWorkspaceDetailPage({
  params,
}: AdminWorkspaceDetailPageProps) {
  const { workspaceId } = await params;
  const [workspace, users, sites] = await Promise.all([
    getAdminWorkspace(workspaceId),
    getAdminUsers(),
    getAdminSites(),
  ]);

  if (!workspace) {
    notFound();
  }

  return (
    <AdminShell
      title="워크스페이스 상세"
      description="고객 팀 단위의 멤버, 사이트, 플랜, 사용량 제한을 종합적으로 확인합니다."
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["워크스페이스", workspace.name],
          ["소유자", workspace.owner],
          ["멤버", `${workspace.members}명`],
          ["사이트", `${workspace.sites}개`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <EditPanel
          title="워크스페이스 정보 수정"
          description="소유자, 플랜, 사용량 제한, 운영 상태를 관리합니다."
          action={updateWorkspace}
          fields={[
            { label: "워크스페이스명", name: "name", value: workspace.name },
            { label: "소유자", value: workspace.owner, readOnly: true },
            { label: "플랜", name: "plan", value: workspace.plan },
            { label: "운영 상태", name: "status", value: workspace.status },
            { label: "멤버 수", value: workspace.members, readOnly: true },
            { label: "사이트 수", value: workspace.sites, readOnly: true },
          ]}
        >
          <input name="id" type="hidden" value={workspace.id} />
        </EditPanel>
        <ActionPanel
          title="워크스페이스 액션"
          description={`현재 상태: ${workspace.status}`}
          actions={[
            { label: "플랜 강제 변경" },
            { label: "멤버 초대 제한" },
            { label: "배포 일시 중지", variant: "destructive" },
          ]}
        />
      </div>

      <NotesPanel
        action={createAdminNote}
        placeholder="결제 문의, 팀 권한 변경 요청, 사용량 예외 처리 내역을 적어두세요."
        targetId={workspace.id}
        targetType="workspace"
      />

      <AdminSection title="멤버">
        <AdminTable
          columns={["사용자", "역할", "상태", "최근 접속", "관리"]}
          rows={users.slice(0, 3).map((user) => [
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="font-medium text-foreground hover:underline"
            >
              {user.name}
            </Link>,
            user.role,
            <StatusBadge key={user.status} tone={user.status}>
              {user.status}
            </StatusBadge>,
            user.lastSeen,
            <Button
              key={`${user.id}-action`}
              variant="outline"
              size="sm"
              render={<Link href={`/admin/users/${user.id}`} />}
            >
              상세
            </Button>,
          ])}
        />
      </AdminSection>

      <AdminSection title="연결된 사이트">
        <AdminTable
          columns={["사이트", "상태", "도메인", "배포", "관리"]}
          rows={sites.map((site) => [
            <Link
              key={site.id}
              href={`/admin/sites/${site.id}`}
              className="font-medium text-foreground hover:underline"
            >
              {site.name}
            </Link>,
            <StatusBadge key={site.status} tone={site.status}>
              {site.status}
            </StatusBadge>,
            site.domain,
            site.lastDeploy,
            <Button
              key={`${site.id}-action`}
              variant="outline"
              size="sm"
              render={<Link href={`/admin/sites/${site.id}`} />}
            >
              상세
            </Button>,
          ])}
        />
      </AdminSection>
    </AdminShell>
  );
}
