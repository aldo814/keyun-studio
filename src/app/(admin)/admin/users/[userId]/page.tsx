import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import {
  ActionPanel,
  EditPanel,
  NotesPanel,
} from "@/components/admin/detail-panels";
import {
  createAdminNote,
  sendPasswordResetAction,
  setUserRoleAction,
  updateUserProfile,
} from "@/features/admin/actions";
import { getAdminLogs, getAdminUser } from "@/features/admin/queries";

type AdminUserDetailPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { userId } = await params;
  const [user, logs] = await Promise.all([
    getAdminUser(userId),
    getAdminLogs(),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <AdminShell
      title="사용자 상세"
      description="선택한 사용자의 계정 상태, 소속 워크스페이스, 권한, 운영 기록을 확인합니다."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EditPanel
            title="계정 정보 수정"
            description="이름, 이메일, 역할, 소속 워크스페이스를 운영자가 수정할 수 있는 영역입니다."
            action={updateUserProfile}
            fields={[
              { label: "이름", name: "name", value: user.name },
              { label: "이메일", value: user.email, readOnly: true },
              { label: "역할", name: "role", value: user.role },
              { label: "워크스페이스", value: user.workspace, readOnly: true },
              { label: "플랜", value: user.plan, readOnly: true },
              { label: "가입일", value: user.joinedAt, readOnly: true },
            ]}
          >
            <input name="id" type="hidden" value={user.id} />
          </EditPanel>
        </div>
        <ActionPanel
          title="계정 상태"
          description={`현재 상태: ${user.status}`}
          actions={[
            {
              label: "계정 정지",
              variant: "destructive",
              action: setUserRoleAction,
              fields: { id: user.id, role: "suspended" },
            },
            {
              label: "계정 정지 해제",
              action: setUserRoleAction,
              fields: { id: user.id, role: "user" },
            },
            {
              label: "비밀번호 재설정 메일",
              variant: "outline",
              action: sendPasswordResetAction,
              fields: { id: user.id, email: user.email },
            },
            {
              label: "슈퍼관리자 검토 표시",
              variant: "secondary",
              action: setUserRoleAction,
              fields: { id: user.id, role: "review" },
            },
          ]}
        />
      </div>

      <NotesPanel
        action={createAdminNote}
        targetId={user.id}
        targetType="profile"
      />

      <AdminSection title="사용자 관련 운영 로그">
        <AdminTable
          columns={["행위자", "액션", "대상", "시각"]}
          rows={logs.map((log) => [
            log.actor,
            log.action,
            log.target,
            log.createdAt,
          ])}
        />
      </AdminSection>
    </AdminShell>
  );
}
