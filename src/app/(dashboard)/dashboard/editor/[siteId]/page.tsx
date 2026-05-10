import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { updateDraftJson } from "@/features/dashboard/actions";
import { getSiteEditorState } from "@/features/dashboard/queries";

type EditorPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

function getSections(draftJson: unknown) {
  if (
    draftJson &&
    typeof draftJson === "object" &&
    "sections" in draftJson &&
    Array.isArray(draftJson.sections)
  ) {
    return draftJson.sections.map((section, index) => {
      if (typeof section === "string") {
        return {
          key: `${section}-${index}`,
          type: section,
          title: section,
          description: "섹션 설정을 JSON에서 수정하세요.",
        };
      }

      if (section && typeof section === "object") {
        const record = section as Record<string, unknown>;

        return {
          key: `${String(record.type ?? "section")}-${index}`,
          type: String(record.type ?? "section"),
          title: String(record.title ?? record.type ?? "Untitled"),
          description: String(
            record.description ?? record.subtitle ?? "섹션 설정을 JSON에서 수정하세요.",
          ),
        };
      }

      return {
        key: `section-${index}`,
        type: "section",
        title: "Untitled",
        description: "섹션 설정을 JSON에서 수정하세요.",
      };
    });
  }

  return [];
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { siteId } = await params;
  const state = await getSiteEditorState(siteId);

  if (!state) {
    notFound();
  }

  const sections = getSections(state.page.draftJson);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Web Builder</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              {state.site.name}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge tone={state.site.status}>{state.site.status}</StatusBadge>
              <span className="text-sm text-muted-foreground">
                draft updated {state.page.updatedAt}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              render={<Link href={`/dashboard/sites/${state.site.id}`} />}
            >
              사이트 상세
            </Button>
            <Button
              variant="outline"
              render={<Link href={`/dashboard/sites/${state.site.id}/settings`} />}
            >
              SEO 설정
            </Button>
            {state.site.status === "published" ? (
              <Button render={<Link href={`/s/${state.site.slug}`} target="_blank" />}>
                공개 보기
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="rounded-lg border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>draft_json 편집</CardTitle>
              <CardDescription>
                저장하면 초안만 변경됩니다. 사이트 상세에서 게시해야 공개본에 반영됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateDraftJson} className="space-y-4">
                <input name="site_id" type="hidden" value={state.site.id} />
                <input name="page_id" type="hidden" value={state.page.id} />
                <Textarea
                  className="min-h-[620px] font-mono text-sm leading-6"
                  defaultValue={JSON.stringify(state.page.draftJson, null, 2)}
                  name="draft_json"
                />
                <div className="flex justify-end gap-2">
                  <Button type="reset" variant="outline">
                    변경 취소
                  </Button>
                  <Button type="submit">임시 저장</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-lg border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>섹션 미리보기</CardTitle>
                <CardDescription>
                  현재 draft_json의 sections 배열을 카드로 보여줍니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sections.length ? (
                  sections.map((section, index) => (
                    <div
                      key={section.key}
                      className="rounded-lg border border-border bg-muted/40 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          {String(index + 1).padStart(2, "0")} / {section.type}
                        </p>
                        <span className="rounded-full bg-background px-2 py-1 text-xs text-muted-foreground">
                          draft
                        </span>
                      </div>
                      <h2 className="mt-4 text-lg font-semibold">{section.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
                    sections 배열이 비어 있습니다.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-lg border-border bg-zinc-950 text-white shadow-sm">
              <CardHeader>
                <CardTitle>라이브 프레임</CardTitle>
                <CardDescription className="text-zinc-400">
                  공개 렌더러와 비슷한 톤으로 초안 구조를 확인합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-[radial-gradient(circle_at_50%_20%,rgba(37,99,235,0.5),transparent_34%),linear-gradient(180deg,#020617,#000)] p-5">
                  <p className="text-xs font-medium text-blue-300">Preview</p>
                  <h3 className="mt-3 text-2xl font-semibold">{state.site.name}</h3>
                  <div className="mt-6 grid gap-2">
                    {sections.slice(0, 4).map((section) => (
                      <div
                        key={`${section.key}-frame`}
                        className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm"
                      >
                        {section.title}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
