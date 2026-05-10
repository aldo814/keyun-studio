import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTemplate } from "@/features/admin/actions";

export default function AdminNewTemplatePage() {
  return (
    <AdminShell
      title="새 템플릿 만들기"
      description="웹빌더에서 사용할 템플릿의 메타데이터, 카테고리, 공개 상태를 등록합니다."
    >
      <AdminSection title="템플릿 기본 정보">
        <form
          action={createTemplate}
          className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-sm md:grid-cols-2"
        >
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              템플릿 이름
            </span>
            <Input name="name" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">공개 상태</span>
            <Input defaultValue="private" name="visibility" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">운영 상태</span>
            <Input defaultValue="draft" name="status" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              썸네일 URL
            </span>
            <Input name="thumbnail_url" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">설명</span>
            <Textarea className="min-h-28" name="description" />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">템플릿 생성</Button>
          </div>
        </form>
      </AdminSection>
    </AdminShell>
  );
}
