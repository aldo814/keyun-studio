import Link from "next/link";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTable } from "@/components/admin/admin-table";
import { MetricCard } from "@/components/admin/metric-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  getAdminTemplateStats,
  getAdminTemplates,
} from "@/features/admin/queries";

export default async function AdminTemplatesPage() {
  const [templates, stats] = await Promise.all([
    getAdminTemplates(),
    getAdminTemplateStats(),
  ]);

  return (
    <AdminShell
      title="템플릿 관리"
      description="사용자가 사이트를 시작하는 템플릿의 공개 상태, 카테고리, 추천 노출을 관리합니다."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard key={stat.label} {...stat} />
        ))}
      </div>

      <AdminSection
        title="템플릿 라이브러리"
        description="상세에서 메타데이터, 썸네일, 섹션 구조를 편집하고 미리보기로 검수합니다."
        action={
          <Button render={<Link href="/admin/templates/new" />}>
            새 템플릿
          </Button>
        }
      >
        <AdminTable
          columns={[
            "템플릿",
            "카테고리",
            "공개",
            "사용",
            "상태",
            "수정일",
            "관리",
          ]}
          rows={templates.map((template) => [
            <div key={template.id}>
              <Link
                href={`/admin/templates/${template.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {template.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {template.description || "설명 없음"}
              </p>
            </div>,
            template.category,
            <StatusBadge key={template.visibility} tone={template.visibility}>
              {template.visibility}
            </StatusBadge>,
            template.used,
            <StatusBadge key={template.status} tone={template.status}>
              {template.status}
            </StatusBadge>,
            template.updatedAt,
            <div key={`${template.id}-actions`} className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/admin/templates/${template.id}`} />}
              >
                상세
              </Button>
              <Button
                variant="secondary"
                size="sm"
                render={
                  <Link
                    href={`/admin/templates/${template.id}/preview`}
                    target="_blank"
                  />
                }
              >
                미리보기
              </Button>
            </div>,
          ])}
        />
      </AdminSection>
    </AdminShell>
  );
}
