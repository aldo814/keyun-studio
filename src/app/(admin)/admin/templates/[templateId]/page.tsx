import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  ActionPanel,
  EditPanel,
  NotesPanel,
} from "@/components/admin/detail-panels";
import { Button } from "@/components/ui/button";
import { createAdminNote, updateTemplate } from "@/features/admin/actions";
import { getAdminTemplate } from "@/features/admin/queries";
import { TemplateThumbnailUpload } from "@/features/admin/template-thumbnail-upload";

type AdminTemplateDetailPageProps = {
  params: Promise<{
    templateId: string;
  }>;
};

export default async function AdminTemplateDetailPage({
  params,
}: AdminTemplateDetailPageProps) {
  const { templateId } = await params;
  const template = await getAdminTemplate(templateId);

  if (!template) {
    notFound();
  }

  return (
    <AdminShell
      title="템플릿 상세"
      description="템플릿 구성 JSON, 공개 상태, 추천 여부, 사용량을 관리합니다."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <EditPanel
          title="템플릿 정보 수정"
          description="템플릿명, 카테고리, 공개 상태, 추천 노출을 관리합니다."
          action={updateTemplate}
          fields={[
            { label: "템플릿명", name: "name", value: template.name },
            { label: "템플릿 ID", value: template.id, readOnly: true },
            { label: "카테고리", value: template.category, readOnly: true },
            { label: "공개 상태", name: "visibility", value: template.visibility },
            { label: "운영 상태", name: "status", value: template.status },
            { label: "추천 여부", name: "is_featured", value: template.status === "featured" ? "true" : "false" },
            { label: "설명", name: "description", value: template.description },
          ]}
        >
          <input name="id" type="hidden" value={template.id} />
          <TemplateThumbnailUpload
            initialUrl={template.thumbnailUrl}
            templateId={template.id}
          />
        </EditPanel>
        <ActionPanel
          title="템플릿 액션"
          description={`현재 상태: ${template.status}`}
          actions={[
            { label: "추천 템플릿 지정" },
            { label: "비공개 전환" },
            { label: "사용 중지", variant: "destructive" },
          ]}
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          render={
            <Link
              href={`/admin/templates/${template.id}/preview`}
              target="_blank"
            />
          }
        >
          새 창에서 미리보기
        </Button>
      </div>

      <NotesPanel
        action={createAdminNote}
        placeholder="템플릿 수정 사유, 검수 메모, 고객 요청 기반 개선점을 적어두세요."
        targetId={template.id}
        targetType="template"
      />

      <AdminSection title="템플릿 JSON">
        <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-sm leading-6 text-zinc-100">
          {JSON.stringify(
            {
              version: 1,
              sections: ["hero", "features", "pricing", "footer"],
              theme: "keyun-default",
            },
            null,
            2,
          )}
        </pre>
      </AdminSection>
    </AdminShell>
  );
}
