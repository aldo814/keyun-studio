import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import { ActionPanel, EditPanel, NotesPanel } from "@/components/admin/detail-panels";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { reports } from "@/features/admin/data";
import { createAdminNote, updateSite } from "@/features/admin/actions";
import { getAdminLogs, getAdminSite } from "@/features/admin/queries";

type AdminSiteDetailPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function AdminSiteDetailPage({
  params,
}: AdminSiteDetailPageProps) {
  const { siteId } = await params;
  const [site, logs] = await Promise.all([
    getAdminSite(siteId),
    getAdminLogs(),
  ]);

  if (!site) {
    notFound();
  }

  return (
    <AdminShell
      title="사이트 상세 관리"
      description="사이트 공개 상태, 도메인, 배포 이력, 신고 상태를 운영자 관점에서 관리합니다."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <EditPanel
          title="사이트 정보 수정"
          description="사이트명, slug, 도메인, 공개 상태, 소유 워크스페이스를 관리합니다."
          action={updateSite}
          fields={[
            { label: "사이트명", name: "name", value: site.name },
            { label: "사이트 ID", value: site.id, readOnly: true },
            { label: "소유자", value: site.owner, readOnly: true },
            { label: "Slug", name: "slug", value: site.slug },
            { label: "공개 URL", name: "published_url", value: site.domain },
            { label: "상태", name: "status", value: site.status },
          ]}
        >
          <input name="id" type="hidden" value={site.id} />
        </EditPanel>
        <ActionPanel
          title="사이트 운영 액션"
          description={`최근 배포: ${site.lastDeploy}`}
          actions={[
            { label: "사이트 비공개", variant: "destructive" },
            { label: "삭제 잠금" },
            { label: "강제 배포 중단", variant: "destructive" },
            { label: "도메인 재검증", variant: "outline" },
          ]}
        />
      </div>

      <NotesPanel
        action={createAdminNote}
        placeholder="신고 대응, 도메인 문의, 배포 실패 원인, 고객 안내 내역을 적어두세요."
        targetId={site.id}
        targetType="site"
      />

      <AdminSection title="신고 이력">
        <AdminTable
          columns={["대상", "사유", "심각도", "상태", "접수", "처리"]}
          rows={reports.map((report) => [
            <Link
              key={report.id}
              href={`/admin/reports/${report.id}`}
              className="font-medium text-foreground hover:underline"
            >
              {report.target}
            </Link>,
            report.reason,
            <StatusBadge key={report.severity} tone={report.severity}>
              {report.severity}
            </StatusBadge>,
            <StatusBadge key={report.status} tone={report.status}>
              {report.status}
            </StatusBadge>,
            report.createdAt,
            <Button
              key={`${report.id}-action`}
              variant="outline"
              size="sm"
              render={<Link href={`/admin/reports/${report.id}`} />}
            >
              상세
            </Button>,
          ])}
        />
      </AdminSection>

      <AdminSection title="사이트 운영 로그">
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
