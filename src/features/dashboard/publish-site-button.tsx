"use client";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { publishSite } from "@/features/dashboard/actions";

type PublishSiteButtonProps = {
  returnTo: string;
  siteId: string;
  siteName: string;
  slug: string;
};

export function PublishSiteButton({
  returnTo,
  siteId,
  siteName,
  slug,
}: PublishSiteButtonProps) {
  return (
    <form
      action={publishSite}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      onSubmit={(event) => {
        if (!window.confirm(`${siteName} 사이트를 공개 상태로 게시할까요?`)) {
          event.preventDefault();
        }
      }}
    >
      <div className="text-sm text-muted-foreground">
        게시 주소: <span className="font-medium text-foreground">/s/{slug}</span>
      </div>
      <input name="site_id" type="hidden" value={siteId} />
      <input name="slug" type="hidden" value={slug} />
      <input name="return_to" type="hidden" value={returnTo} />
      <Button type="submit">
        <Send className="size-4" />
        게시하기
      </Button>
    </form>
  );
}
