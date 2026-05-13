"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Code2,
  ImageIcon,
  Layers3,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateDraftJson } from "@/features/dashboard/actions";
import { cn } from "@/lib/utils";
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

const sectionTypes = [
  { value: "hero", label: "메인 섹션" },
  { value: "features", label: "장점 카드" },
  { value: "content", label: "서브 콘텐츠" },
  { value: "cta", label: "전환 CTA" },
];

const layoutOptions: Record<string, Array<{ value: string; label: string }>> = {
  hero: [
    { value: "immersive", label: "풀비주얼 히어로" },
    { value: "split", label: "텍스트 + 비주얼" },
    { value: "centered", label: "중앙 집중형" },
  ],
  features: [
    { value: "cards", label: "카드 그리드" },
    { value: "timeline", label: "단계형 리스트" },
    { value: "orbit", label: "비주얼 카드" },
  ],
  content: [
    { value: "statement", label: "강조 문장" },
    { value: "media", label: "이미지 밴드" },
    { value: "columns", label: "2열 설명" },
  ],
  cta: [
    { value: "banner", label: "와이드 배너" },
    { value: "minimal", label: "미니멀 CTA" },
    { value: "footer", label: "푸터형 CTA" },
  ],
};

function createSectionId(type: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${type}-${Date.now()}`;
}

function createSection(type: string): EditorSection {
  if (type === "hero") {
    return {
      builderId: createSectionId(type),
      type: "hero",
      layout: "immersive",
      eyebrow: "Keyun Studio",
      title: "디자인이 깨지지 않는 선택형 웹빌더",
      description:
        "고객은 레이아웃 샘플을 선택하고 텍스트와 이미지만 수정합니다.",
      buttonLabel: "상담 신청",
      imageUrl: "",
    };
  }

  if (type === "features") {
    return {
      builderId: createSectionId(type),
      type: "features",
      layout: "cards",
      eyebrow: "Architecture",
      title: "섹션 단위로 안전하게 편집",
      description: "자유 배치 대신 검증된 블록을 조합합니다.",
      items: ["레이아웃 교체", "실시간 미리보기", "상하 이동"],
      imageUrl: "",
    };
  }

  if (type === "cta") {
    return {
      builderId: createSectionId(type),
      type: "cta",
      layout: "banner",
      title: "이제 사이트를 게시할 시간입니다",
      description: "저장 후 게시하면 공개 URL에 반영됩니다.",
      buttonLabel: "게시하기",
      imageUrl: "",
    };
  }

  return {
    builderId: createSectionId(type),
    type: "content",
    layout: "statement",
    eyebrow: "Experience",
    title: "경험이 설계의 차이를 만듭니다",
    description: "브랜드의 메시지를 구조적으로 보여주는 서브 섹션입니다.",
    buttonLabel: "자세히 보기",
    imageUrl: "",
  };
}

function toEditableJson(draftJson: Json) {
  if (draftJson && typeof draftJson === "object" && !Array.isArray(draftJson)) {
    const sections = Array.isArray(draftJson.sections)
      ? draftJson.sections.map((section, index) => {
          if (typeof section === "string") {
            return createSection(section);
          }

          if (section && typeof section === "object" && !Array.isArray(section)) {
            const record = section as EditorSection;
            const type = stringValue(record, "type") || "content";
            const fallback = createSection(type);

            return {
              ...fallback,
              ...record,
              builderId:
                stringValue(record, "builderId") || `${type}-${index}`,
              layout: stringValue(record, "layout") || stringValue(fallback, "layout"),
            };
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
    theme: "keyun-default",
    sections: [createSection("hero"), createSection("features"), createSection("cta")],
  };
}

function stringValue(section: EditorSection, key: string) {
  const value = section[key];

  return typeof value === "string" ? value : "";
}

function itemsValue(section: EditorSection) {
  const items = section.items;

  return Array.isArray(items) ? items.map(String).join("\n") : "";
}

function itemList(section: EditorSection) {
  const items = section.items;

  return Array.isArray(items) && items.length
    ? items.map(String)
    : ["레이아웃 선택", "텍스트 편집", "이미지 교체"];
}

function layoutLabel(section: EditorSection) {
  const type = stringValue(section, "type") || "content";
  const layout = stringValue(section, "layout");

  return (
    layoutOptions[type]?.find((option) => option.value === layout)?.label ??
    layout ??
    "기본 레이아웃"
  );
}

function visualTile(section: EditorSection, className?: string) {
  const imageUrl = stringValue(section, "imageUrl");

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className={cn("h-full w-full object-cover", className)}
        src={imageUrl}
      />
    );
  }

  return (
    <div
      className={cn(
        "h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(37,99,235,0.85),transparent_30%),radial-gradient(circle_at_75%_70%,rgba(124,58,237,0.5),transparent_35%),linear-gradient(145deg,#020617,#050505)]",
        className,
      )}
    />
  );
}

function PreviewSection({ section }: { section: EditorSection }) {
  const type = stringValue(section, "type") || "content";
  const layout = stringValue(section, "layout");
  const eyebrow = stringValue(section, "eyebrow");
  const title = stringValue(section, "title") || layoutLabel(section);
  const description = stringValue(section, "description");
  const buttonLabel = stringValue(section, "buttonLabel");
  const items = itemList(section);

  if (type === "hero") {
    return (
      <section
        className={cn(
          "relative overflow-hidden border-b border-white/10 px-8 py-16",
          layout === "centered" ? "text-center" : "",
        )}
      >
        <div className="absolute inset-0 opacity-70">{visualTile(section)}</div>
        <div
          className={cn(
            "relative mx-auto grid max-w-5xl items-center gap-8",
            layout === "split" ? "md:grid-cols-[1fr_0.8fr]" : "",
          )}
        >
          <div className={cn(layout === "centered" ? "mx-auto max-w-3xl" : "max-w-3xl")}>
            <p className="text-xs font-semibold uppercase text-blue-300">
              {eyebrow || "Keyun Studio"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300">
              {description}
            </p>
            {buttonLabel ? (
              <span className="mt-7 inline-flex h-9 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">
                {buttonLabel}
              </span>
            ) : null}
          </div>
          {layout === "split" ? (
            <div className="hidden aspect-square rounded-lg border border-white/10 bg-white/[0.06] p-4 md:block">
              <div className="h-full rounded-md border border-blue-300/20 bg-blue-500/15" />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (type === "features") {
    return (
      <section className="border-b border-white/10 px-8 py-14">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase text-blue-300">
            {eyebrow || "Features"}
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-white">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            {description}
          </p>
          <div
            className={cn(
              "mt-8 grid gap-3",
              layout === "timeline" ? "grid-cols-1" : "md:grid-cols-3",
            )}
          >
            {items.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className={cn(
                  "rounded-lg border border-white/10 bg-white/[0.04] p-5",
                  layout === "orbit" ? "min-h-40" : "",
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600/20 text-sm font-semibold text-blue-300">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="mt-5 text-sm font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (type === "cta") {
    return (
      <section className="px-8 py-14">
        <div
          className={cn(
            "mx-auto max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-blue-950/40 p-8",
            layout === "minimal" ? "bg-transparent text-center" : "",
          )}
        >
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-3xl font-semibold text-white">{title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-300">
                {description}
              </p>
            </div>
            {buttonLabel ? (
              <span className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">
                {buttonLabel}
              </span>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-white/10 px-8 py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[0.8fr_1fr]">
        <div className="aspect-video overflow-hidden rounded-lg border border-white/10">
          {visualTile(section)}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-blue-300">
            {eyebrow || "Content"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p>
        </div>
      </div>
    </section>
  );
}

export function EditorMvp({ site, page }: EditorMvpProps) {
  const [draft, setDraft] = useState(() => toEditableJson(page.draftJson));
  const [sectionType, setSectionType] = useState("hero");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const serializedDraft = useMemo(() => JSON.stringify(draft, null, 2), [draft]);
  const selectedSection = draft.sections[selectedIndex] ?? draft.sections[0] ?? null;

  function updateSections(nextSections: EditorSection[]) {
    setDraft((current) => ({
      ...current,
      sections: nextSections,
    }));
    setSelectedIndex((current) =>
      nextSections.length ? Math.min(current, nextSections.length - 1) : 0,
    );
  }

  function addSection() {
    const nextSections = [...draft.sections, createSection(sectionType)];
    updateSections(nextSections);
    setSelectedIndex(nextSections.length - 1);
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
    setSelectedIndex(targetIndex);
  }

  function updateSection(index: number, nextSection: EditorSection) {
    updateSections(
      draft.sections.map((section, itemIndex) =>
        itemIndex === index ? nextSection : section,
      ),
    );
    setSelectedIndex(index);
  }

  function updateSectionField(index: number, key: string, value: string) {
    updateSection(index, {
      ...draft.sections[index],
      [key]: value,
    });
  }

  function updateSectionItems(index: number, value: string) {
    updateSection(index, {
      ...draft.sections[index],
      items: value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  }

  function onJsonChange(value: string) {
    try {
      setDraft(toEditableJson(JSON.parse(value) as Json));
    } catch {
      // Keep the last valid draft while the user is mid-editing invalid JSON.
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <form action={updateDraftJson}>
        <input name="site_id" type="hidden" value={site.id} />
        <input name="page_id" type="hidden" value={page.id} />
        <input name="draft_json" type="hidden" value={serializedDraft} />

        <div className="border-b border-border bg-card px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Block Builder / 선택형 노코드 에디터
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-normal">
                  {site.name}
                </h1>
                <StatusBadge tone={site.status}>{site.status}</StatusBadge>
                <span className="text-xs text-muted-foreground">
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
              <Button type="submit">저장</Button>
            </div>
          </div>
        </div>

        <div className="grid min-h-[calc(100vh-9rem)] xl:grid-cols-[300px_420px_1fr]">
          <aside className="border-b border-border bg-card p-4 xl:border-b-0 xl:border-r">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">섹션 구조</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  섹션 단위로만 상하 이동합니다.
                </p>
              </div>
              <Layers3 className="size-5 text-muted-foreground" />
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              <select
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                value={sectionType}
                onChange={(event) => setSectionType(event.target.value)}
              >
                {sectionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={addSection}>
                <Plus />
                추가
              </Button>
            </div>

            <div className="mt-5 space-y-2">
              {draft.sections.map((section, index) => {
                const type = stringValue(section, "type") || "content";
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={stringValue(section, "builderId") || `${type}-${index}`}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted",
                    )}
                    type="button"
                      onClick={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium opacity-75">
                          {String(index + 1).padStart(2, "0")} / {type}
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          {stringValue(section, "title") || "Untitled"}
                        </p>
                        <p className="mt-1 text-xs opacity-75">
                          {layoutLabel(section)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="border-b border-border bg-zinc-50 p-4 xl:border-b-0 xl:border-r">
            {selectedSection ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold">섹션 편집</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    레이아웃 샘플을 고르고 내용만 바꿉니다.
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    title="섹션 위로 이동"
                    type="button"
                    variant="outline"
                    onClick={() => moveSection(selectedIndex, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    size="icon"
                    title="섹션 아래로 이동"
                    type="button"
                    variant="outline"
                    onClick={() => moveSection(selectedIndex, 1)}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    size="icon"
                    title="섹션 삭제"
                    type="button"
                    variant="destructive"
                    onClick={() => removeSection(selectedIndex)}
                  >
                    <Trash2 />
                  </Button>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium">레이아웃 샘플</span>
                  <select
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    value={stringValue(selectedSection, "layout")}
                    onChange={(event) =>
                      updateSectionField(selectedIndex, "layout", event.target.value)
                    }
                  >
                    {(layoutOptions[stringValue(selectedSection, "type")] ??
                      layoutOptions.content
                    ).map((layout) => (
                      <option key={layout.value} value={layout.value}>
                        {layout.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">섹션 라벨</span>
                  <Input
                    value={stringValue(selectedSection, "eyebrow")}
                    onChange={(event) =>
                      updateSectionField(selectedIndex, "eyebrow", event.target.value)
                    }
                    placeholder="예: Architecture"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">제목</span>
                  <Input
                    value={stringValue(selectedSection, "title")}
                    onChange={(event) =>
                      updateSectionField(selectedIndex, "title", event.target.value)
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">설명</span>
                  <Textarea
                    className="min-h-28"
                    value={stringValue(selectedSection, "description")}
                    onChange={(event) =>
                      updateSectionField(
                        selectedIndex,
                        "description",
                        event.target.value,
                      )
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">버튼 문구</span>
                  <Input
                    value={stringValue(selectedSection, "buttonLabel")}
                    onChange={(event) =>
                      updateSectionField(
                        selectedIndex,
                        "buttonLabel",
                        event.target.value,
                      )
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="size-4" />
                    이미지 URL
                  </span>
                  <Input
                    value={stringValue(selectedSection, "imageUrl")}
                    onChange={(event) =>
                      updateSectionField(selectedIndex, "imageUrl", event.target.value)
                    }
                    placeholder="https://..."
                  />
                </label>
                {stringValue(selectedSection, "type") === "features" ? (
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      항목 리스트, 한 줄에 하나
                    </span>
                    <Textarea
                      className="min-h-32"
                      value={itemsValue(selectedSection)}
                      onChange={(event) =>
                        updateSectionItems(selectedIndex, event.target.value)
                      }
                    />
                  </label>
                ) : null}

                <details className="rounded-lg border border-border bg-background p-4">
                  <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <Code2 className="size-4" />
                    JSON 원본
                  </summary>
                  <Textarea
                    className="mt-4 min-h-56 font-mono text-xs leading-5"
                    value={serializedDraft}
                    onChange={(event) => onJsonChange(event.target.value)}
                  />
                </details>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
                왼쪽에서 섹션을 추가하세요.
              </div>
            )}
          </section>

          <section className="bg-zinc-950 p-4 text-white">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">실시간 미리보기</p>
                <p className="mt-1 text-xs text-zinc-400">
                  레이아웃 교체와 텍스트 변경이 즉시 반영됩니다.
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                /s/{site.slug}
              </span>
            </div>

            <div className="h-[calc(100vh-13rem)] overflow-auto rounded-lg border border-white/10 bg-black shadow-2xl">
              <div className="flex h-12 items-center justify-between border-b border-white/10 px-5">
                <p className="text-sm font-semibold">{site.name}</p>
                <div className="hidden gap-4 text-xs text-zinc-400 sm:flex">
                  <span>ABOUT</span>
                  <span>SERVICE</span>
                  <span>CONTACT</span>
                </div>
              </div>
              {draft.sections.map((section, index) => (
                <PreviewSection
                  key={stringValue(section, "builderId") || `${stringValue(section, "type")}-${index}`}
                  section={section}
                />
              ))}
            </div>
          </section>
        </div>
      </form>
    </main>
  );
}
