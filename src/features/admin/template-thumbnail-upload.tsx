"use client";

import { ImageIcon, UploadCloud } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type TemplateThumbnailUploadProps = {
  templateId: string;
  initialUrl?: string;
};

export function TemplateThumbnailUpload({
  templateId,
  initialUrl = "",
}: TemplateThumbnailUploadProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState(initialUrl);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function uploadThumbnail(file: File) {
    setIsUploading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `templates/${templateId}/thumbnail-${Date.now()}.${extension}`;

      const { error } = await supabase.storage
        .from("template-assets")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        setMessage(error.message);
        return;
      }

      const { data } = supabase.storage
        .from("template-assets")
        .getPublicUrl(path);

      setThumbnailUrl(data.publicUrl);
      setMessage("업로드 완료. 이제 수정 저장을 누르면 DB에 반영돼.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "업로드 중 문제가 생겼어.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <input name="thumbnail_url" type="hidden" value={thumbnailUrl} />
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="템플릿 썸네일"
              className="h-full w-full object-cover"
              src={thumbnailUrl}
            />
          ) : (
            <ImageIcon className="size-8 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">썸네일 이미지</p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WebP를 업로드하면 template-assets 버킷에 저장됩니다.
            </p>
          </div>
          <Input
            accept="image/png,image/jpeg,image/webp"
            disabled={isUploading}
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                void uploadThumbnail(file);
              }
            }}
          />
          <Input
            aria-label="썸네일 public URL"
            readOnly
            value={thumbnailUrl}
          />
          {message ? (
            <p className="rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
              {message}
            </p>
          ) : null}
          <Button disabled={isUploading} type="button" variant="outline">
            <UploadCloud />
            {isUploading ? "업로드 중..." : "파일 선택 후 자동 업로드"}
          </Button>
        </div>
      </div>
    </div>
  );
}
