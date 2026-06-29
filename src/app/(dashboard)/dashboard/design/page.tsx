import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  LayoutTemplate,
  Palette,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardSites } from "@/features/dashboard/queries";

export default async function DashboardDesignPage() {
  const sites = await getDashboardSites();

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Dashboard / 디자인
              </p>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                Beta
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              디자인 모드
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              편집할 사이트를 선택하거나 전체 테마와 템플릿을 관리하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              render={<Link href="/dashboard/design/theme" />}
            >
              <Palette className="size-4" />
              테마
            </Button>
            <Button
              variant="outline"
              render={<Link href="/dashboard/design/templates" />}
            >
              <LayoutTemplate className="size-4" />
              템플릿
            </Button>
          </div>
        </header>

        {sites.length ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sites.map((site) => (
              <Card className="rounded-lg" key={site.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Palette className="size-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                      {site.status === "published" ? "게시됨" : "초안"}
                    </span>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold">{site.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    /s/{site.slug}
                  </p>
                  <div className="mt-5 flex gap-2">
                    <Button
                      className="flex-1"
                      render={<Link href={`/dashboard/editor/${site.id}`} />}
                    >
                      디자인 편집
                      <ArrowRight className="size-4" />
                    </Button>
                    {site.status === "published" ? (
                      <Button
                        size="icon"
                        variant="outline"
                        render={
                          <Link
                            aria-label={`${site.name} 사이트 보기`}
                            href={`/s/${site.slug}`}
                            target="_blank"
                          />
                        }
                      >
                        <ExternalLink className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : (
          <Card className="rounded-lg border-dashed">
            <CardContent className="flex flex-col items-center py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Plus className="size-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">
                먼저 사이트를 만들어주세요
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                사이트 생성 후 바로 디자인 에디터를 사용할 수 있습니다.
              </p>
              <Button
                className="mt-5"
                render={<Link href="/dashboard/sites/new" />}
              >
                새 사이트 만들기
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
