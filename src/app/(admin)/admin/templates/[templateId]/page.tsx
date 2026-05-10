import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  ActionPanel,
  EditPanel,
  NotesPanel,
} from "@/components/admin/detail-panels";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminNote,
  setTemplateStateAction,
  updateTemplate,
  updateTemplateJson,
} from "@/features/admin/actions";
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
    redirect("/admin/templates");
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
            {
              label: "추천 템플릿 지정",
              action: setTemplateStateAction,
              fields: { id: template.id, is_featured: "true", status: "active" },
            },
            {
              label: "비공개 전환",
              action: setTemplateStateAction,
              fields: { id: template.id, visibility: "private" },
            },
            {
              label: "공개 전환",
              action: setTemplateStateAction,
              fields: { id: template.id, visibility: "public", status: "active" },
            },
            {
              label: "사용 중지",
              variant: "destructive",
              action: setTemplateStateAction,
              fields: { id: template.id, status: "disabled", is_featured: "false" },
            },
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
        <form
          action={updateTemplateJson}
          className="rounded-lg border border-border bg-card p-5 shadow-sm"
        >
          <input name="id" type="hidden" value={template.id} />
          <Textarea
            className="min-h-[360px] font-mono text-sm leading-6"
            defaultValue={JSON.stringify(template.templateJson, null, 2)}
            name="template_json"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="reset" variant="outline">
              변경 취소
            </Button>
            <Button type="submit">JSON 저장</Button>
          </div>
        </form>
      </AdminSection>
    </AdminShell>
  );
}
