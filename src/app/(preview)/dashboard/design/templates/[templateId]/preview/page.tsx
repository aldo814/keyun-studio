import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { notFound } from "next/navigation";

import { getDashboardTemplates } from "@/features/dashboard/queries";
import { PublicSiteRenderer } from "@/features/site/public-site-renderer";

type TemplatePreviewPageProps = {
  params: Promise<{
    templateId: string;
  }>;
};

export const metadata: Metadata = {
  title: "템플릿 미리보기",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function TemplatePreviewPage({
  params,
}: TemplatePreviewPageProps) {
  const { templateId } = await params;
  const templates = await getDashboardTemplates();
  const template = templates.find((item) => item.id === templateId);

  if (!template) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              aria-label="템플릿 갤러리로 돌아가기"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
              href="/dashboard/design/templates"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                <Eye className="size-3.5" />
                템플릿 미리보기
              </p>
              <h1 className="mt-0.5 truncate text-sm font-semibold text-slate-950">
                {template.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:block">
              저장되지 않는 미리보기입니다.
            </span>
            <Link
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              href={`/dashboard/sites/new?templateId=${template.id}`}
            >
              이 템플릿 사용
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] border-x border-slate-200 bg-white">
        <PublicSiteRenderer
          contactEnabled={false}
          publishedJson={template.templateJson}
          siteName={template.name}
        />
      </div>
    </div>
  );
}
