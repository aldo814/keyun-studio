"use client";

import { ArrowDown, ArrowUp, Code2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

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
import type { Json } from "@/types/database";

type TemplateSection = Record<string, unknown>;

type TemplateJsonBuilderProps = {
  action: (formData: FormData) => void | Promise<void>;
  templateId: string;
  templateJson: Json;
};

function createSection(type: string): TemplateSection {
  if (type === "hero") {
    return {
      type: "hero",
      title: "메인 문구",
      description: "브랜드를 소개하는 설명을 입력하세요.",
      buttonLabel: "문의하기",
    };
  }

  if (type === "features") {
    return {
      type: "features",
      title: "핵심 장점",
      description: "서비스의 강점을 정리하세요.",
      items: ["빠른 제작", "반응형", "SEO 최적화"],
    };
  }

  if (type === "cta") {
    return {
      type: "cta",
      title: "지금 시작하세요",
      description: "다음 행동을 안내합니다.",
      buttonLabel: "상담 신청",
    };
  }

  return {
    type: "content",
    title: "콘텐츠 섹션",
    description: "본문 내용을 입력하세요.",
  };
}

function normalizeTemplateJson(templateJson: Json) {
  if (templateJson && typeof templateJson === "object" && !Array.isArray(templateJson)) {
    const sections = Array.isArray(templateJson.sections)
      ? templateJson.sections.map((section) => {
          if (typeof section === "string") {
            return createSection(section);
          }

          if (section && typeof section === "object" && !Array.isArray(section)) {
            return section as TemplateSection;
          }

          return createSection("content");
        })
      : [];

    return {
      ...templateJson,
      sections,
    } as Record<string, unknown> & { sections: TemplateSection[] };
  }

  return {
    version: 1,
    theme: "keyun-default",
    sections: [],
  };
}

function textValue(section: TemplateSection, key: string) {
  const value = section[key];

  return typeof value === "string" ? value : "";
}

function itemsValue(section: TemplateSection) {
  const items = section.items;

  return Array.isArray(items) ? items.map(String).join("\n") : "";
}

export function TemplateJsonBuilder({
  action,
  templateId,
  templateJson,
}: TemplateJsonBuilderProps) {
  const [draft, setDraft] = useState(() => normalizeTemplateJson(templateJson));
  const [sectionType, setSectionType] = useState("hero");
  const serialized = useMemo(() => JSON.stringify(draft, null, 2), [draft]);

  function updateSections(sections: TemplateSection[]) {
    setDraft((current) => ({
      ...current,
      sections,
    }));
  }

  function updateSection(index: number, nextSection: TemplateSection) {
    updateSections(
      draft.sections.map((section, itemIndex) =>
        itemIndex === index ? nextSection : section,
      ),
    );
  }

  function updateField(index: number, key: string, value: string) {
    updateSection(index, {
      ...draft.sections[index],
      [key]: value,
    });
  }

  function updateItems(index: number, value: string) {
    updateSection(index, {
      ...draft.sections[index],
      items: value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    });
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

  function updateJson(value: string) {
    try {
      setDraft(normalizeTemplateJson(JSON.parse(value) as Json));
    } catch {
      // Keep the last valid JSON while editing.
    }
  }

  return (
    <Card className="rounded-lg border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle>템플릿 빌더</CardTitle>
        <CardDescription>
          템플릿 JSON을 섹션 폼으로 편집하고 저장합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          <input name="id" type="hidden" value={templateId} />
          <input name="template_json" type="hidden" value={serialized} />

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
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
            <Button
              type="button"
              onClick={() => updateSections([...draft.sections, createSection(sectionType)])}
            >
              <Plus />
              섹션 추가
            </Button>
          </div>

          <div className="space-y-4">
            {draft.sections.map((section, index) => {
              const type = String(section.type ?? "content");

              return (
                <div
                  key={`${type}-${index}`}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        {String(index + 1).padStart(2, "0")} / {type}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">
                        {textValue(section, "title") || "Untitled"}
                      </h3>
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
                        onClick={() =>
                          updateSections(
                            draft.sections.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">제목</span>
                      <Input
                        value={textValue(section, "title")}
                        onChange={(event) =>
                          updateField(index, "title", event.target.value)
                        }
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium">버튼 문구</span>
                      <Input
                        value={textValue(section, "buttonLabel")}
                        onChange={(event) =>
                          updateField(index, "buttonLabel", event.target.value)
                        }
                      />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium">설명</span>
                      <Textarea
                        className="min-h-24"
                        value={textValue(section, "description")}
                        onChange={(event) =>
                          updateField(index, "description", event.target.value)
                        }
                      />
                    </label>
                    {type === "features" ? (
                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-medium">항목 리스트</span>
                        <Textarea
                          className="min-h-28"
                          value={itemsValue(section)}
                          onChange={(event) => updateItems(index, event.target.value)}
                        />
                      </label>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <details className="rounded-lg border border-border bg-background p-4">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Code2 className="size-4" />
              JSON 원본 보기
            </summary>
            <Textarea
              className="mt-4 min-h-72 font-mono text-xs leading-5"
              value={serialized}
              onChange={(event) => updateJson(event.target.value)}
            />
          </details>

          <div className="flex justify-end gap-2">
            <Button type="reset" variant="outline">
              변경 취소
            </Button>
            <Button type="submit">템플릿 저장</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
