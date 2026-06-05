import { Megaphone, Plus } from "lucide-react";

import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const popups = [
  ["초기 사용자 이벤트", "메인 페이지", "활성", "2026.06.01 - 2026.06.30"],
  ["상담 신청 안내", "전체 페이지", "활성", "상시"],
  ["휴무 안내", "메인 페이지", "비활성", "2026.05.01 - 2026.05.05"],
];

export default function DashboardPopupsPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              콘텐츠 / 팝업
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              팝업
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              운영자가 자주 바꾸는 이벤트, 공지, 안내 팝업의 노출 기간과
              위치를 관리합니다.
            </p>
          </div>
          <Button>
            <Plus />
            팝업 만들기
          </Button>
        </div>

        <Card className="rounded-lg p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-blue-700">
            <Megaphone className="size-5" />
            <p className="text-sm">
              페이지 안 배너는 디자인 에디터에서, 운영 팝업은 이곳에서
              관리합니다.
            </p>
          </div>
          <AdminTable
            columns={["팝업명", "노출 위치", "상태", "기간"]}
            rows={popups.map(([name, position, status, period]) => [
              <span key={name} className="font-medium">
                {name}
              </span>,
              position,
              <StatusBadge key={status} tone={status === "활성" ? "published" : "draft"}>
                {status}
              </StatusBadge>,
              period,
            ])}
          />
        </Card>
      </div>
    </main>
  );
}
