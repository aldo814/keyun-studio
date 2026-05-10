import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { getAdminWorkspaces } from "@/features/admin/queries";

export default async function AdminWorkspacesPage() {
  const workspaces = await getAdminWorkspaces();

  return (
    <AdminShell
      title="워크스페이스 관리"
      description="고객 팀 단위의 멤버, 사이트 수, 플랜, 사용량 제한을 관리합니다."
    >
      <AdminSection title="워크스페이스 목록">
        <AdminTable
          columns={["워크스페이스", "소유자", "멤버", "사이트", "플랜", "사용량", "상태", "관리"]}
          rows={workspaces.map((workspace) => [
            <Link
              key={workspace.id}
              href={`/admin/workspaces/${workspace.id}`}
              className="font-medium text-foreground hover:underline"
            >
              {workspace.name}
            </Link>,
            workspace.owner,
            workspace.members,
            workspace.sites,
            workspace.plan,
            workspace.usage,
            <StatusBadge key={workspace.status} tone={workspace.status}>
              {workspace.status}
            </StatusBadge>,
            <Button
              key={`${workspace.id}-action`}
              variant="outline"
              size="sm"
              render={<Link href={`/admin/workspaces/${workspace.id}`} />}
            >
              상세
            </Button>,
          ])}
        />
      </AdminSection>
    </AdminShell>
  );
}
