import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import { MetricCard } from "@/components/admin/metric-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { alertCards, reports } from "@/features/admin/data";
import {
  getAdminLogs,
  getAdminOverviewStats,
  getAdminSites,
} from "@/features/admin/queries";

export default async function AdminPage() {
  const [overviewStats, sites, logs] = await Promise.all([
    getAdminOverviewStats(),
    getAdminSites(),
    getAdminLogs(),
  ]);

  return (
    <AdminShell
      title="운영 개요"
      description="키운 스튜디오 전체 사용량, 매출, 검수 상태, 시스템 이벤트를 한 화면에서 추적합니다."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => (
          <MetricCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {alertCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    {card.title}
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-zinc-950">
                    {card.value}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-zinc-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
        <AdminSection
          title="최근 사이트"
          description="공개 상태와 배포 상태를 빠르게 확인합니다."
        >
          <AdminTable
            columns={["사이트", "소유자", "상태", "도메인", "최근 배포"]}
            rows={sites.map((site) => [
              <div key={site.id}>
                <p className="font-medium text-zinc-950">{site.name}</p>
                <p className="text-xs text-zinc-500">/{site.slug}</p>
              </div>,
              site.owner,
              <StatusBadge key={site.status} tone={site.status}>
                {site.status}
              </StatusBadge>,
              site.domain,
              site.lastDeploy,
            ])}
          />
        </AdminSection>

        <AdminSection
          title="긴급 처리"
          description="검수와 운영 판단이 필요한 항목입니다."
        >
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-zinc-950">
                      {report.target}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {report.reason}
                    </p>
                  </div>
                  <StatusBadge tone={report.severity}>
                    {report.severity}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  접수 {report.createdAt}
                </p>
              </div>
            ))}
          </div>
        </AdminSection>
      </div>

      <AdminSection title="최근 운영 로그">
        <AdminTable
          columns={["행위자", "액션", "대상", "시각"]}
          rows={logs.map((log) => [
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
