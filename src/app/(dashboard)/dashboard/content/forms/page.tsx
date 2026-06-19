import { Download } from "lucide-react";

import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

const submissions = [
  ["상담 신청", "김민지", "확인 전", "2026.06.05 14:22"],
  ["견적 문의", "박서준", "처리 중", "2026.06.05 11:08"],
  ["제휴 문의", "이하늘", "완료", "2026.06.04 17:40"],
  ["상담 신청", "정다은", "완료", "2026.06.03 09:18"],
];

export default function DashboardFormsPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">콘텐츠 / 문의폼</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">문의폼</h1>
          </div>
          <Button size="sm" variant="outline">
            <Download className="size-4" />
            내보내기
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <AdminTable
            columns={["폼", "이름", "처리 상태", "접수일"]}
            rows={submissions.map(([form, name, status, receivedAt]) => [
              form,
              <span key={name} className="font-medium">{name}</span>,
              <StatusBadge
                key={status}
                tone={status === "완료" ? "published" : status === "처리 중" ? "draft" : "review"}
              >
                {status}
              </StatusBadge>,
              receivedAt,
            ])}
          />
        </div>
      </div>
    </main>
  );
}
