"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  ImageIcon,
  Search,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";

import { ActionFeedback } from "@/components/dashboard/action-feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteDashboardMedia,
  uploadDashboardMedia,
} from "@/features/dashboard/actions";
import type { DashboardMediaAsset } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";

type MediaFilter = "all" | "image" | "video" | "file";

const mediaFilters: Array<{ label: string; value: MediaFilter }> = [
  { label: "전체", value: "all" },
  { label: "이미지", value: "image" },
  { label: "동영상", value: "video" },
  { label: "파일", value: "file" },
];

type Props = {
  assets: DashboardMediaAsset[];
  notice?: string;
};

function mediaKind(asset: DashboardMediaAsset): MediaFilter {
  if (asset.isImage) return "image";
  if (asset.isVideo) return "video";
  return "file";
}

function mediaKindLabel(asset: DashboardMediaAsset) {
  const kind = mediaKind(asset);
  if (kind === "image") return "이미지";
  if (kind === "video") return "동영상";
  return "파일";
}

function MediaIcon({ asset }: { asset: DashboardMediaAsset }) {
  if (asset.isImage) return <ImageIcon className="size-10 text-blue-500" />;
  if (asset.isVideo) return <Video className="size-10 text-violet-500" />;
  return <FileText className="size-10 text-slate-500" />;
}

export function MediaManager({ assets, notice }: Props) {
  const [activeFilter, setActiveFilter] = useState<MediaFilter>("all");
  const [copiedPath, setCopiedPath] = useState("");
  const [search, setSearch] = useState("");

  const keyword = search.trim().toLowerCase();

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const kindMatched = activeFilter === "all" || mediaKind(asset) === activeFilter;
      const keywordMatched =
        !keyword ||
        [asset.name, asset.mimeType, asset.path]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return kindMatched && keywordMatched;
    });
  }, [activeFilter, assets, keyword]);

  function getFilterCount(filter: MediaFilter) {
    const keywordMatched = assets.filter((asset) => {
      if (!keyword) return true;
      return [asset.name, asset.mimeType, asset.path].join(" ").toLowerCase().includes(keyword);
    });

    if (filter === "all") return keywordMatched.length;
    return keywordMatched.filter((asset) => mediaKind(asset) === filter).length;
  }

  async function copyUrl(asset: DashboardMediaAsset) {
    try {
      await navigator.clipboard.writeText(asset.publicUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = asset.publicUrl;
      textarea.setAttribute("readonly", "");
      textarea.style.left = "-9999px";
      textarea.style.position = "fixed";
      textarea.style.top = "0";

      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedPath(asset.path);
    window.setTimeout(() => setCopiedPath(""), 1300);
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              콘텐츠 / 미디어
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              미디어
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              게시글, 팝업, 문의 안내에 사용할 이미지와 파일을 관리합니다.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <form action={uploadDashboardMedia}>
              <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <UploadCloud className="size-4" />
                업로드
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,application/pdf"
                  className="sr-only"
                  name="file"
                  type="file"
                  onChange={(event) => {
                    if (event.currentTarget.files?.length) {
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
              </label>
            </form>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP, GIF, SVG, MP4, WebM, PDF · 최대 15MB
            </p>
          </div>
        </div>

        <ActionFeedback notice={notice} />

        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 bg-white pl-9"
              placeholder="파일명, 확장자 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 border-b border-border">
            {mediaFilters.map((filter) => (
              <button
                className={cn(
                  "relative -mb-px flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                  activeFilter === filter.value
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                    activeFilter === filter.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {getFilterCount(filter.value).toLocaleString("ko-KR")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredAssets.length ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              총 {filteredAssets.length.toLocaleString("ko-KR")}개 파일
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAssets.map((asset) => (
                <Card key={asset.path} className="overflow-hidden rounded-lg bg-white">
                  <div className="flex aspect-video items-center justify-center overflow-hidden bg-slate-50">
                    {asset.isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={asset.name}
                        className="size-full object-cover"
                        src={asset.publicUrl}
                      />
                    ) : (
                      <MediaIcon asset={asset} />
                    )}
                  </div>
                  <div className="space-y-4 p-4">
                    <div>
                      <p className="truncate font-medium">{asset.name}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{asset.size}</span>
                        <span className="text-border">·</span>
                        <span>{asset.updatedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {mediaKindLabel(asset)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          title={copiedPath === asset.path ? "복사됨" : "URL 복사"}
                          type="button"
                          variant="ghost"
                          onClick={() => void copyUrl(asset)}
                        >
                          {copiedPath === asset.path ? (
                            <Check className="size-4 text-emerald-600" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                        <Button
                          render={<a href={asset.publicUrl} target="_blank" rel="noreferrer" />}
                          size="icon"
                          title="새 창에서 보기"
                          variant="ghost"
                        >
                          <ExternalLink className="size-4" />
                        </Button>
                        <form
                          action={deleteDashboardMedia}
                          onSubmit={(event) => {
                            if (!window.confirm(`${asset.name} 파일을 삭제할까요?`)) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input name="path" type="hidden" value={asset.path} />
                          <Button
                            size="icon"
                            title="삭제"
                            type="submit"
                            variant="ghost"
                          >
                            <Trash2 className="size-4 text-rose-600" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : assets.length ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
            <p className="text-lg font-semibold">조건에 맞는 미디어가 없습니다.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              검색어를 줄이거나 다른 파일 유형을 선택해 주세요.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
            <p className="text-lg font-semibold">아직 업로드된 미디어가 없습니다.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              이미지, 동영상, PDF를 업로드하면 이곳에서 URL을 복사하고 관리할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
