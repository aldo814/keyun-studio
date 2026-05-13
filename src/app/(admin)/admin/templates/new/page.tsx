import { AdminSection } from "@/components/admin/admin-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTemplate } from "@/features/admin/actions";
import { getAdminTemplateCategories } from "@/features/admin/queries";

export default async function AdminNewTemplatePage() {
  const categories = await getAdminTemplateCategories();

  return (
    <AdminShell
      title="새 템플릿 만들기"
      description="메타데이터, 카테고리, 기본 섹션 구조를 한 번에 등록합니다."
    >
      <AdminSection
        title="템플릿 등록 플로우"
        description="처음에는 draft/private로 저장하고, 미리보기 검수 후 공개 전환하는 흐름을 권장합니다."
      >
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
            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              defaultValue="private"
              name="visibility"
            >
              <option value="private">private</option>
              <option value="public">public</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">운영 상태</span>
            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              defaultValue="draft"
              name="status"
            >
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="disabled">disabled</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">카테고리</span>
            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              defaultValue=""
              name="category_id"
            >
              <option value="">새 카테고리 또는 미분류</option>
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
            <Input name="category_name" placeholder="예: 병원, 랜딩, 포트폴리오" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">
              썸네일 URL
            </span>
            <Input name="thumbnail_url" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">설명</span>
            <Textarea className="min-h-28" name="description" />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 md:col-span-2">
            <input name="is_featured" type="checkbox" value="true" />
            <span className="text-sm font-medium text-foreground">
              추천 템플릿으로 등록
            </span>
          </label>
          <div className="rounded-lg border border-border bg-muted/30 p-4 md:col-span-2">
            <p className="text-sm font-semibold">기본 섹션 구성</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Hero 제목</span>
                <Input name="hero_title" placeholder="브랜드를 크게 보여주는 문구" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Hero 버튼</span>
                <Input defaultValue="문의하기" name="hero_button_label" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">Hero 설명</span>
                <Textarea className="min-h-24" name="hero_description" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Features 제목</span>
                <Input defaultValue="핵심 장점" name="features_title" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">테마</span>
                <Input defaultValue="keyun-default" name="theme" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">Features 설명</span>
                <Textarea className="min-h-20" name="features_description" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">
                  Features 항목, 한 줄에 하나
                </span>
                <Textarea
                  className="min-h-28"
                  defaultValue={"빠른 제작\n반응형\nSEO 최적화"}
                  name="feature_items"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">CTA 제목</span>
                <Input defaultValue="지금 시작하세요" name="cta_title" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">CTA 버튼</span>
                <Input defaultValue="상담 신청" name="cta_button_label" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">CTA 설명</span>
                <Textarea className="min-h-20" name="cta_description" />
              </label>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">템플릿 생성</Button>
          </div>
        </form>
      </AdminSection>
    </AdminShell>
  );
}
