import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";

export default function AdminSettingsPage() {
  return (
    <AdminShell
      title="서비스 설정"
      description="플랜 제한, 업로드 용량, 템플릿 카테고리, 보안 정책, 관리자 권한을 설정합니다."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ["무료 플랜 사이트 수", "1개"],
          ["무료 업로드 용량", "500MB"],
          ["커스텀 도메인", "Pro 이상"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <AdminSection title="운영 정책">
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            ["신규 사이트 자동 공개", "비활성", "draft"],
            ["신고 3회 이상 자동 검수", "활성", "active"],
            ["결제 실패 시 배포 제한", "활성", "active"],
            ["관리자 2단계 확인", "활성", "active"],
          ].map(([label, value, tone]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="font-medium">{label}</p>
                <p className="mt-1 text-sm text-zinc-500">정책 설정</p>
              </div>
              <StatusBadge tone={tone as "active" | "draft"}>
                {value}
              </StatusBadge>
            </div>
          ))}
        </div>
      </AdminSection>
    </AdminShell>
  );
}
