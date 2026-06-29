import { getPublicTemplates } from "@/features/dashboard/queries";
import { TemplateGallery } from "@/features/dashboard/template-gallery";

export default async function TemplatesPage() {
  const templates = await getPublicTemplates();

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">디자인 / 템플릿</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">템플릿 갤러리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            마음에 드는 템플릿으로 사이트를 빠르게 시작하세요.
          </p>
        </div>

        <TemplateGallery templates={templates} />
      </div>
    </main>
  );
}
