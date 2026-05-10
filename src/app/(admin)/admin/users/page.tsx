import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { getAdminUsers } from "@/features/admin/queries";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <AdminShell
      title="사용자 관리"
      description="전체 계정의 가입 상태, 역할, 소속 워크스페이스, 접근 제한을 관리합니다."
    >
      <AdminSection
        title="사용자 목록"
        description="이름이나 상세 버튼을 누르면 사용자 상세로 이동합니다."
      >
        <AdminTable
          columns={[
            "사용자",
            "역할",
            "가입일",
            "방문",
            "워크스페이스",
            "상태",
            "최근 접속",
            "관리",
          ]}
          rows={users.map((user) => [
            <div key={user.id}>
              <Link
                href={`/admin/users/${user.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {user.name}
              </Link>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>,
            user.role,
            user.joinedAt,
            `${user.visitCount}회`,
            user.workspace,
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
    </AdminShell>
  );
}
