import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { getAdminSites } from "@/features/admin/queries";

export default async function AdminSitesPage() {
  const sites = await getAdminSites();

  return (
    <AdminShell
      title="사이트 관리"
      description="전체 사이트의 공개 상태, 도메인, 검수 상태, 배포 상태를 운영합니다."
    >
      <AdminSection
        title="전체 사이트"
        description="신고 대응, 공개 제한, 배포 실패 추적의 중심 화면입니다."
      >
        <AdminTable
          columns={["사이트", "소유자", "상태", "도메인", "수정일", "배포", "관리"]}
          rows={sites.map((site) => [
            <div key={site.id}>
              <Link
                href={`/admin/sites/${site.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {site.name}
              </Link>
              <p className="text-xs text-muted-foreground">{site.id}</p>
            </div>,
            site.owner,
            <StatusBadge key={site.status} tone={site.status}>
              {site.status}
            </StatusBadge>,
            site.domain,
            site.updatedAt,
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
