import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  ActionPanel,
  NotesPanel,
} from "@/components/admin/detail-panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminNote,
  duplicateTemplate,
  setTemplateStateAction,
  updateTemplate,
  updateTemplateJson,
} from "@/features/admin/actions";
import {
  getAdminTemplate,
  getAdminTemplateCategories,
} from "@/features/admin/queries";
import { TemplateJsonBuilder } from "@/features/admin/template-json-builder";
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
  const [template, categories] = await Promise.all([
    getAdminTemplate(templateId),
    getAdminTemplateCategories(),
  ]);

  if (!template) {
    redirect("/admin/templates");
  }

  return (
    <AdminShell
      title="템플릿 상세"
      description="템플릿 구성 JSON, 공개 상태, 추천 여부, 사용량을 관리합니다."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <AdminSection
          title="템플릿 정보 수정"
          description="템플릿명, 카테고리, 공개 상태, 추천 노출을 관리합니다."
        >
          <form
            action={updateTemplate}
            className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <input name="id" type="hidden" value={template.id} />
            <TemplateThumbnailUpload
              initialUrl={template.thumbnailUrl}
              templateId={template.id}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  템플릿명
                </span>
                <Input defaultValue={template.name} name="name" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  템플릿 ID
                </span>
                <Input readOnly value={template.id} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  카테고리
                </span>
                <select
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue={template.categoryId ?? ""}
                  name="category_id"
                >
                  <option value="">미분류</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  새 카테고리
                </span>
                <Input name="category_name" placeholder="새 카테고리명" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  공개 상태
                </span>
                <select
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue={template.visibility}
                  name="visibility"
                >
                  <option value="private">private</option>
                  <option value="public">public</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  운영 상태
                </span>
                <select
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue={template.rawStatus ?? template.status}
                  name="status"
                >
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 md:col-span-2">
                <input
                  defaultChecked={template.isFeatured}
                  name="is_featured"
                  type="checkbox"
                  value="true"
                />
                <span className="text-sm font-medium text-foreground">
                  추천 템플릿
                </span>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-foreground">설명</span>
                <Textarea
                  className="min-h-28"
                  defaultValue={template.description}
                  name="description"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="reset" variant="outline">
                변경 취소
              </Button>
              <Button type="submit">수정 저장</Button>
            </div>
          </form>
        </AdminSection>
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
            {
              label: "템플릿 복제",
              action: duplicateTemplate,
              fields: { id: template.id },
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

      <TemplateJsonBuilder
        action={updateTemplateJson}
        templateId={template.id}
        templateJson={template.templateJson}
      />
    </AdminShell>
  );
}
