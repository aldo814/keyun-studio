import { Download, Inbox } from "lucide-react";

import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const submissions = [
  ["상담 신청", "김민지", "확인 전", "2026.06.05 14:22"],
  ["견적 문의", "박서준", "처리 중", "2026.06.05 11:08"],
  ["제휴 문의", "이하늘", "완료", "2026.06.04 17:40"],
  ["상담 신청", "정다은", "완료", "2026.06.03 09:18"],
];

export default function DashboardFormsPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              콘텐츠 / 문의폼
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              문의폼
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              사이트 폼으로 들어온 응답을 확인하고, 처리 상태를 관리합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download />
              내보내기
            </Button>
            <Button>
              <Inbox />
              새 폼 만들기
            </Button>
          </div>
        </div>

        <Card className="rounded-lg p-5 shadow-sm">
          <AdminTable
            columns={["폼", "이름", "처리 상태", "접수일"]}
            rows={submissions.map(([form, name, status, receivedAt]) => [
              form,
              <span key={name} className="font-medium">
                {name}
              </span>,
              <StatusBadge
                key={status}
                tone={status === "완료" ? "published" : status === "처리 중" ? "draft" : "review"}
              >
                {status}
              </StatusBadge>,
              receivedAt,
            ])}
          />
        </Card>
      </div>
    </main>
  );
}
