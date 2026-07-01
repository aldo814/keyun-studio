import { Sparkles } from "lucide-react";

import { getDashboardTemplates } from "@/features/dashboard/queries";
import { SiteCreationWizard } from "@/features/dashboard/site-creation-wizard";

type NewSitePageProps = {
  searchParams?: Promise<{
    notice?: string | string[];
    templateId?: string | string[];
  }>;
};

function firstSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewSitePage({ searchParams }: NewSitePageProps) {
  const query = await searchParams;
  const notice = firstSearchValue(query?.notice);
  const selectedTemplateId = firstSearchValue(query?.templateId);
  const templates = await getDashboardTemplates();

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Sparkles className="size-4" />
              사이트 개설
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal sm:text-3xl">
              새 사이트 만들기
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              네 단계를 따라가면 페이지와 메뉴가 준비된 사이트가 생성됩니다.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">입력 내용은 나중에 언제든 수정할 수 있습니다.</p>
        </header>

        <SiteCreationWizard
          initialTemplateId={selectedTemplateId}
          notice={notice}
          templates={templates.map((template) => ({
            description: template.description,
            id: template.id,
            isFeatured: template.isFeatured,
            name: template.name,
            status: template.status,
            thumbnailUrl: template.thumbnailUrl,
          }))}
        />
      </div>
    </main>
  );
}
