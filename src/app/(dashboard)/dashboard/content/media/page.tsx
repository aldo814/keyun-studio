import { ImageIcon, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const mediaItems = [
  ["hero-keyun.png", "1.8MB", "히어로"],
  ["service-card.webp", "820KB", "서비스"],
  ["logo-symbol.svg", "24KB", "브랜드"],
  ["popup-event.jpg", "1.2MB", "팝업"],
  ["team-photo.png", "2.4MB", "회사소개"],
  ["og-image.png", "960KB", "SEO"],
];

export default function DashboardMediaPage() {
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
          <Button>
            <UploadCloud />
            업로드
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mediaItems.map(([name, size, tag]) => (
            <Card key={name} className="overflow-hidden rounded-lg">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100">
                <ImageIcon className="size-10 text-blue-500" />
              </div>
              <div className="p-4">
                <p className="truncate font-medium">{name}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{size}</span>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600">
                    {tag}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
