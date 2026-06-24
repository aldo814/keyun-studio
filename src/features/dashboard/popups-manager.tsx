"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ExternalLink, Megaphone, Search, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { ActionFeedback } from "@/components/dashboard/action-feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createDashboardPopup,
  deleteDashboardPopup,
  updateDashboardPopup,
} from "@/features/dashboard/actions";
import type { DashboardPopup, PopupPlacement, PopupStatus } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";

type SiteOption = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

type PopupFilter = "all" | PopupStatus;

const popupFilters: Array<{ label: string; value: PopupFilter }> = [
  { label: "전체", value: "all" },
  { label: "활성", value: "active" },
  { label: "비활성", value: "inactive" },
];

const placementLabels: Record<PopupPlacement, string> = {
  all: "전체 페이지",
  home: "메인 페이지",
};

function popupStatusLabel(status: PopupStatus) {
  return status === "active" ? "활성" : "비활성";
}

function popupStatusTone(status: PopupStatus) {
  return status === "active" ? "published" : "draft";
}

function PopupFields({
  popup,
  sites,
}: {
  popup?: DashboardPopup;
  sites: SiteOption[];
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold">
          팝업명
          <Input
            defaultValue={popup?.title}
            name="title"
            placeholder="예: 여름 이벤트 안내"
            required
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          연결 사이트
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={popup?.siteId || sites[0]?.id || ""}
            name="site_id"
          >
            {sites.length ? (
              sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} / {site.slug}
                </option>
              ))
            ) : (
              <option value="">최근 사이트에 자동 연결</option>
            )}
          </select>
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-semibold">
        내용
        <textarea
          className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue={popup?.body}
          name="body"
          placeholder="팝업에 보여줄 안내 문구를 입력하세요."
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold">
          이미지 URL
          <Input
            defaultValue={popup?.imageUrl}
            name="image_url"
            placeholder="미디어에서 복사한 이미지 URL"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          버튼 링크
          <Input
            defaultValue={popup?.buttonUrl}
            name="button_url"
            placeholder="예: /event 또는 #contact"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <label className="grid gap-1.5 text-sm font-semibold">
          버튼 문구
          <Input
            defaultValue={popup?.buttonLabel}
            name="button_label"
            placeholder="자세히 보기"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          노출 위치
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={popup?.placement || "home"}
            name="placement"
          >
            <option value="home">메인 페이지</option>
            <option value="all">전체 페이지</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          상태
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={popup?.status || "inactive"}
            name="status"
          >
            <option value="inactive">비활성</option>
            <option value="active">활성</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1.5 text-sm font-semibold">
            시작
            <Input defaultValue={popup?.startsAtInput} name="starts_at" type="datetime-local" />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            종료
            <Input defaultValue={popup?.endsAtInput} name="ends_at" type="datetime-local" />
          </label>
        </div>
      </div>
    </div>
  );
}

export function PopupsManager({
  notice,
  popups,
  sites,
}: {
  notice?: string;
  popups: DashboardPopup[];
  sites: SiteOption[];
}) {
  const [activeFilter, setActiveFilter] = useState<PopupFilter>("all");
  const [search, setSearch] = useState("");

  const keyword = search.trim().toLowerCase();
  const filteredPopups = useMemo(() => {
    return popups.filter((popup) => {
      const statusMatched = activeFilter === "all" || popup.status === activeFilter;
      const keywordMatched =
        !keyword ||
        [popup.title, popup.body, popup.siteName, popup.siteSlug]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return statusMatched && keywordMatched;
    });
  }, [activeFilter, keyword, popups]);

  function getFilterCount(filter: PopupFilter) {
    const keywordMatched = popups.filter((popup) => {
      if (!keyword) return true;
      return [popup.title, popup.body, popup.siteName, popup.siteSlug]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });

    if (filter === "all") return keywordMatched.length;
    return keywordMatched.filter((popup) => popup.status === filter).length;
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              콘텐츠 / 팝업
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              팝업
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              이벤트, 공지, 휴무 안내처럼 운영자가 자주 바꾸는 팝업의 노출 기간과 위치를 관리합니다.
            </p>
          </div>
        </div>

        <ActionFeedback notice={notice} />

        <Card className="rounded-lg bg-white p-5">
          <div className="mb-5 flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-slate-700">
            <Megaphone className="size-5" />
            <p className="text-sm">
              팝업은 게시된 사용자 사이트에만 노출됩니다. 이미지가 필요하면 미디어에서 업로드 후 URL을 복사해 붙여넣으세요.
            </p>
          </div>
          <form action={createDashboardPopup} className="grid gap-5">
            <PopupFields sites={sites} />
            <div className="flex justify-end">
              <Button type="submit">팝업 만들기</Button>
            </div>
          </form>
        </Card>

        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 bg-white pl-9"
              placeholder="팝업명, 내용, 사이트 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 border-b border-border">
            {popupFilters.map((filter) => (
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

        {filteredPopups.length ? (
          <div className="grid gap-4">
            {filteredPopups.map((popup) => (
              <Card className="rounded-lg bg-white p-5" key={popup.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={popupStatusTone(popup.status)}>
                        {popupStatusLabel(popup.status)}
                      </StatusBadge>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {placementLabels[popup.placement]}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {popup.siteName}
                      </span>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold tracking-normal">{popup.title}</h2>
                    {popup.body ? (
                      <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-7 text-foreground/80">
                        {popup.body}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="size-3.5" />
                        {popup.startsAt} - {popup.endsAt}
                      </span>
                      {popup.buttonUrl ? (
                        <a
                          className="inline-flex items-center gap-1 font-semibold text-foreground underline-offset-4 hover:underline"
                          href={popup.buttonUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="size-3.5" />
                          버튼 링크
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <form
                    action={deleteDashboardPopup}
                    onSubmit={(event) => {
                      if (!window.confirm(`${popup.title} 팝업을 삭제할까요?`)) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input name="popup_id" type="hidden" value={popup.id} />
                    <input name="site_id" type="hidden" value={popup.siteId} />
                    <Button size="sm" type="submit" variant="ghost">
                      <Trash2 className="size-4 text-rose-600" />
                      삭제
                    </Button>
                  </form>
                </div>

                <details className="mt-5 rounded-lg border border-border bg-muted/20 p-4">
                  <summary className="cursor-pointer text-sm font-semibold">
                    세부 설정 수정
                  </summary>
                  <form action={updateDashboardPopup} className="mt-5 grid gap-5">
                    <input name="popup_id" type="hidden" value={popup.id} />
                    <PopupFields popup={popup} sites={sites} />
                    <div className="flex justify-end">
                      <Button type="submit">저장</Button>
                    </div>
                  </form>
                </details>
              </Card>
            ))}
          </div>
        ) : popups.length ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
            <p className="text-lg font-semibold">조건에 맞는 팝업이 없습니다.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              검색어를 줄이거나 다른 상태를 선택해 주세요.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
            <p className="text-lg font-semibold">아직 만든 팝업이 없습니다.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              이벤트, 공지, 휴무 안내 팝업을 만들어 사용자 사이트에 노출해 보세요.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
