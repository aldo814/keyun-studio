"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, Code2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/admin/status-badge";
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
import { updateDraftJson } from "@/features/dashboard/actions";
import type { Json } from "@/types/database";

type EditorSection = Record<string, unknown>;

type EditorMvpProps = {
  site: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  page: {
    id: string;
    draftJson: Json;
    updatedAt: string;
  };
};

function toEditableJson(draftJson: Json) {
  if (draftJson && typeof draftJson === "object" && !Array.isArray(draftJson)) {
    const sections = Array.isArray(draftJson.sections)
      ? draftJson.sections.map((section) => {
          if (typeof section === "string") {
            return createSection(section);
          }

          if (section && typeof section === "object" && !Array.isArray(section)) {
            return section as EditorSection;
          }

          return createSection("content");
        })
      : [];

    return {
      ...draftJson,
      sections,
    } as Record<string, unknown> & { sections: EditorSection[] };
  }

  return {
    version: 1,
    sections: [],
  };
}

function sectionSummary(section: EditorSection, index: number) {
  return {
    key: `${String(section.type ?? "section")}-${index}`,
    type: String(section.type ?? "section"),
    title: String(section.title ?? section.type ?? "Untitled"),
    description: String(
      section.description ?? section.subtitle ?? "섹션 설정을 JSON에서 수정하세요.",
    ),
  };
}

function createSection(type: string): EditorSection {
  if (type === "hero") {
    return {
      type: "hero",
      title: "새로운 메인 문구",
      description: "브랜드를 소개하는 설명을 입력하세요.",
      buttonLabel: "문의하기",
    };
  }

  if (type === "features") {
    return {
      type: "features",
      title: "핵심 장점",
      description: "서비스의 강점을 짧게 정리하세요.",
      items: ["빠른 제작", "반응형", "SEO 최적화"],
    };
  }

  if (type === "cta") {
    return {
      type: "cta",
      title: "지금 시작하세요",
      description: "고객이 다음 행동을 하도록 안내합니다.",
      buttonLabel: "상담 신청",
    };
  }

  return {
    type: "content",
    title: "콘텐츠 섹션",
    description: "본문 내용을 입력하세요.",
  };
}

function getTextValue(section: EditorSection, key: string) {
  const value = section[key];

  return typeof value === "string" ? value : "";
}

function getItemsValue(section: EditorSection) {
  const items = section.items;

  return Array.isArray(items) ? items.map(String).join("\n") : "";
}

export function EditorMvp({ site, page }: EditorMvpProps) {
  const [draft, setDraft] = useState(() => toEditableJson(page.draftJson));
  const [sectionType, setSectionType] = useState("hero");
  const serializedDraft = useMemo(() => JSON.stringify(draft, null, 2), [draft]);
  const sections = draft.sections.map(sectionSummary);

  function updateSections(nextSections: EditorSection[]) {
    setDraft((current) => ({
      ...current,
      sections: nextSections,
    }));
  }

  function updateSection(index: number, nextSection: EditorSection) {
    updateSections(
      draft.sections.map((section, itemIndex) =>
        itemIndex === index ? nextSection : section,
      ),
    );
  }

  function updateSectionField(index: number, key: string, value: string) {
    const section = draft.sections[index];

    updateSection(index, {
      ...section,
      [key]: value,
    });
  }

  function updateSectionItems(index: number, value: string) {
    const section = draft.sections[index];

    updateSection(index, {
      ...section,
      items: value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  }

  function addSection() {
    updateSections([...draft.sections, createSection(sectionType)]);
  }

  function removeSection(index: number) {
    updateSections(draft.sections.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveSection(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= draft.sections.length) {
      return;
    }

    const nextSections = [...draft.sections];
    const current = nextSections[index];
    nextSections[index] = nextSections[targetIndex];
    nextSections[targetIndex] = current;
    updateSections(nextSections);
  }

  function onJsonChange(value: string) {
    try {
      const parsed = JSON.parse(value) as Json;
      setDraft(toEditableJson(parsed));
    } catch {
      // Keep the last valid draft while the user is mid-editing invalid JSON.
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Web Builder</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              {site.name}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge tone={site.status}>{site.status}</StatusBadge>
              <span className="text-sm text-muted-foreground">
                draft updated {page.updatedAt}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              render={<Link href={`/dashboard/sites/${site.id}`} />}
            >
              사이트 상세
            </Button>
            <Button
              variant="outline"
              render={<Link href={`/dashboard/sites/${site.id}/settings`} />}
            >
              SEO 설정
            </Button>
            {site.status === "published" ? (
              <Button render={<Link href={`/s/${site.slug}`} target="_blank" />}>
                공개 보기
              </Button>
            ) : null}
          </div>
        </div>

        <form action={updateDraftJson} className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <Card className="rounded-lg border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>섹션 폼 편집</CardTitle>
                <CardDescription>
                  제목, 설명, 버튼, 리스트를 입력칸으로 수정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input name="site_id" type="hidden" value={site.id} />
                <input name="page_id" type="hidden" value={page.id} />
                <input name="draft_json" type="hidden" value={serializedDraft} />

                {draft.sections.length ? (
                  <div className="space-y-4">
                    {draft.sections.map((section, index) => {
                      const type = String(section.type ?? "content");
                      const summary = sectionSummary(section, index);

                      return (
                        <div
                          key={summary.key}
                          className="rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-xs font-medium uppercase text-muted-foreground">
                                {String(index + 1).padStart(2, "0")} / {type}
                              </p>
                              <h2 className="mt-2 text-lg font-semibold">
                                {summary.title}
                              </h2>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                type="button"
                                variant="outline"
                                onClick={() => moveSection(index, -1)}
                              >
                                <ArrowUp />
                              </Button>
                              <Button
                                size="icon"
                                type="button"
                                variant="outline"
                                onClick={() => moveSection(index, 1)}
                              >
                                <ArrowDown />
                              </Button>
                              <Button
                                size="icon"
                                type="button"
                                variant="destructive"
                                onClick={() => removeSection(index)}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm font-medium">제목</span>
                              <Input
                                value={getTextValue(section, "title")}
                                onChange={(event) =>
                                  updateSectionField(index, "title", event.target.value)
                                }
                                placeholder="섹션 제목"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium">버튼 문구</span>
                              <Input
                                value={getTextValue(section, "buttonLabel")}
                                onChange={(event) =>
                                  updateSectionField(
                                    index,
                                    "buttonLabel",
                                    event.target.value,
                                  )
                                }
                                placeholder="문의하기"
                              />
                            </label>
                            <label className="space-y-2 md:col-span-2">
                              <span className="text-sm font-medium">설명</span>
                              <Textarea
                                className="min-h-24"
                                value={getTextValue(section, "description")}
                                onChange={(event) =>
                                  updateSectionField(
                                    index,
                                    "description",
                                    event.target.value,
                                  )
                                }
                                placeholder="섹션 설명"
                              />
                            </label>
                            {type === "features" ? (
                              <label className="space-y-2 md:col-span-2">
                                <span className="text-sm font-medium">
                                  항목 리스트
                                </span>
                                <Textarea
                                  className="min-h-28"
                                  value={getItemsValue(section)}
                                  onChange={(event) =>
                                    updateSectionItems(index, event.target.value)
                                  }
                                  placeholder={"빠른 제작\n반응형\nSEO 최적화"}
                                />
                              </label>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
                    sections 배열이 비어 있습니다. 오른쪽에서 섹션을 추가하세요.
                  </div>
                )}

                <details className="rounded-lg border border-border bg-background p-4">
                  <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <Code2 className="size-4" />
                    JSON 원본 보기
                  </summary>
                  <Textarea
                    className="mt-4 min-h-72 font-mono text-xs leading-5"
                    value={serializedDraft}
                    onChange={(event) => onJsonChange(event.target.value)}
                  />
                </details>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-lg border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>섹션 관리</CardTitle>
                <CardDescription>
                  추가, 삭제, 순서 변경 후 임시 저장을 눌러 반영합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <select
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    value={sectionType}
                    onChange={(event) => setSectionType(event.target.value)}
                  >
                    <option value="hero">Hero</option>
                    <option value="features">Features</option>
                    <option value="content">Content</option>
                    <option value="cta">CTA</option>
                  </select>
                  <Button type="button" onClick={addSection}>
                    <Plus />
                    추가
                  </Button>
                </div>

                {sections.length ? (
                  <div className="space-y-3">
                    {sections.map((section, index) => (
                      <div
                        key={section.key}
                        className="rounded-lg border border-border bg-muted/40 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground">
                              {String(index + 1).padStart(2, "0")} / {section.type}
                            </p>
                            <h2 className="mt-3 text-lg font-semibold">
                              {section.title}
                            </h2>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              type="button"
                              variant="outline"
                              onClick={() => moveSection(index, -1)}
                            >
                              <ArrowUp />
                            </Button>
                            <Button
                              size="icon"
                              type="button"
                              variant="outline"
                              onClick={() => moveSection(index, 1)}
                            >
                              <ArrowDown />
                            </Button>
                            <Button
                              size="icon"
                              type="button"
                              variant="destructive"
                              onClick={() => removeSection(index)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    ))}
                  </div>
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
                  <h3 className="mt-3 text-2xl font-semibold">{site.name}</h3>
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

            <Card className="rounded-lg border-border bg-card shadow-sm">
              <CardContent className="flex items-center justify-end gap-2 p-4">
                <Button type="reset" variant="outline">
                  변경 취소
                </Button>
                <Button type="submit">임시 저장</Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </main>
  );
}
