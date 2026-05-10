import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { getAdminReports } from "@/features/admin/queries";

export default async function AdminReportsPage() {
  const reports = await getAdminReports();
  const openCount = reports.filter((report) => report.status === "open").length;
  const reviewingCount = reports.filter(
    (report) => report.status === "reviewing",
  ).length;
  const resolvedCount = reports.filter(
    (report) => report.status === "resolved",
  ).length;

  return (
    <AdminShell
      title="신고와 검수"
      description="신고된 사이트, 수동 검수, 정책 위반 가능성이 있는 콘텐츠를 처리합니다."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["열린 신고", openCount.toLocaleString("ko-KR")],
          ["검수 중", reviewingCount.toLocaleString("ko-KR")],
          ["처리 완료", resolvedCount.toLocaleString("ko-KR")],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <AdminSection title="신고 큐">
        <AdminTable
          columns={["대상", "사유", "심각도", "상태", "접수 시각", "처리"]}
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
    </AdminShell>
  );
}
