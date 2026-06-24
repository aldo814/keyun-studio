"use client";

import { useMemo, useState } from "react";
import type { DashboardPopup } from "@/features/dashboard/queries";

type Props = {
  popups: DashboardPopup[];
  siteSlug: string;
};

export function PublicPopups({ popups, siteSlug }: Props) {
  const storageKey = `keyun-popups:${siteSlug}`;
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as string[];
      }
    } catch {
      return [];
    }
    return [];
  });

  const popup = useMemo(
    () => popups.find((item) => !dismissedIds.includes(item.id)) ?? null,
    [dismissedIds, popups],
  );

  if (!popup) return null;

  const activePopup = popup;

  function dismissPopup() {
    const next = Array.from(new Set([...dismissedIds, activePopup.id]));
    setDismissedIds(next);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  }

  return (
    <div className="fixed inset-x-0 bottom-5 z-50 px-4">
      <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {popup.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-40 w-full object-cover" src={popup.imageUrl} />
        ) : null}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold tracking-normal text-slate-950">{popup.title}</p>
              {popup.body ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {popup.body}
                </p>
              ) : null}
            </div>
            <button
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg leading-none text-slate-500 hover:bg-slate-200"
              type="button"
              onClick={dismissPopup}
            >
              ×
            </button>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            <button
              className="h-10 rounded-lg px-4 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              type="button"
              onClick={dismissPopup}
            >
              닫기
            </button>
            {popup.buttonLabel && popup.buttonUrl ? (
              <a
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white"
                href={popup.buttonUrl}
                onClick={dismissPopup}
              >
                {popup.buttonLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
