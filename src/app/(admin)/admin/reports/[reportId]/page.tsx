import Link from "next/link";

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
import { reports, sites } from "@/features/admin/data";

export default function AdminReportDetailPage() {
  const report = reports[0];
  const relatedSite = sites.find((site) => site.name === report.target);

  return (
    <AdminShell
      title="신고 상세"
      description="신고 내용, 대상 사이트, 처리 상태, 내부 메모를 한 화면에서 관리합니다."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <EditPanel
          title="신고 정보 수정"
          description="신고 사유, 심각도, 처리 상태를 운영자가 업데이트합니다."
          fields={[
            { label: "신고 ID", value: report.id },
            { label: "대상", value: report.target },
            { label: "사유", value: report.reason },
            { label: "심각도", value: report.severity },
            { label: "상태", value: report.status },
            { label: "접수 시각", value: report.createdAt },
          ]}
        />
        <ActionPanel
          title="검수 액션"
          description={`현재 상태: ${report.status}`}
          actions={[
            { label: "처리 완료" },
            { label: "사이트 비공개", variant: "destructive" },
            { label: "사용자 경고 발송", variant: "outline" },
            { label: "추가 자료 요청", variant: "secondary" },
          ]}
        />
      </div>

      <NotesPanel placeholder="신고 판단 근거, 고객 응대 내용, 후속 조치 계획을 적어두세요." />

      <AdminSection title="연결된 사이트">
        <AdminTable
          columns={["사이트", "상태", "도메인", "배포", "관리"]}
          rows={[
            [
              <Link
                key="site"
                href={`/admin/sites/${relatedSite?.id ?? "site_8003"}`}
                className="font-medium text-foreground hover:underline"
              >
                {relatedSite?.name ?? report.target}
              </Link>,
              <StatusBadge key="status" tone={relatedSite?.status ?? "review"}>
                {relatedSite?.status ?? "review"}
              </StatusBadge>,
              relatedSite?.domain ?? "-",
              relatedSite?.lastDeploy ?? "검수 필요",
              <Button
                key="action"
                variant="outline"
                size="sm"
                render={
                  <Link href={`/admin/sites/${relatedSite?.id ?? "site_8003"}`} />
                }
              >
                사이트 상세
              </Button>,
            ],
          ]}
        />
      </AdminSection>
    </AdminShell>
  );
}
