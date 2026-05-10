import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDashboardSite } from "@/features/dashboard/actions";
import { getDashboardTemplates } from "@/features/dashboard/queries";

export default async function NewSitePage() {
  const templates = await getDashboardTemplates();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-lg bg-zinc-950 text-white shadow-sm">
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_320px] md:p-8">
            <div>
              <p className="text-sm font-medium text-blue-300">Site Launch</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-normal sm:text-5xl">
                새 사이트 만들기
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
                템플릿, 주소, 기본 SEO를 한 번에 설정합니다.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-zinc-200">Launch stack</p>
              <div className="mt-4 grid gap-2 text-sm text-zinc-300">
                <span>Template</span>
                <span>Site record</span>
                <span>Home page</span>
                <span>SEO settings</span>
              </div>
            </div>
          </div>
        </section>

        <form action={createDashboardSite} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-lg border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>사이트 이름과 기본 주소를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium">사이트 이름</span>
                <Input name="name" placeholder="브랜드 랜딩" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Slug</span>
                <Input name="slug" placeholder="brand-landing" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">SEO 제목</span>
                <Input name="seo_title" placeholder="검색 결과에 보일 제목" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">SEO 설명</span>
                <Textarea
                  className="min-h-28"
                  name="seo_description"
                  placeholder="검색 결과와 공유 카드에 쓰일 설명"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">OG 이미지 URL</span>
                <Input name="og_image_url" placeholder="https://..." />
              </label>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-lg border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>템플릿</CardTitle>
                <CardDescription>공개 템플릿 중 하나를 선택합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.length ? (
                  templates.map((template, index) => (
                    <label
                      key={template.id}
                      className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted/60"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          className="mt-1"
                          defaultChecked={index === 0}
                          name="template_id"
                          type="radio"
                          value={template.id}
                        />
                        <div>
                          <p className="text-sm font-semibold">{template.name}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {template.description || template.status}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    공개 템플릿이 아직 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" render={<Link href="/dashboard/sites" />}>
                취소
              </Button>
              <Button type="submit">사이트 생성</Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
