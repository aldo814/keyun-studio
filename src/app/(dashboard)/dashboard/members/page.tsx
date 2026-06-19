import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

const members = [
  { name: "김은영", email: "eunyo@keyun.io", role: "소유자", joined: "2026.01.12" },
  { name: "이디자인", email: "design@keyun.io", role: "편집자", joined: "2026.03.05" },
  { name: "마케팅팀", email: "marketing@keyun.io", role: "뷰어", joined: "2026.04.20" },
];

const roleColor: Record<string, string> = {
  소유자: "bg-blue-50 text-blue-700",
  편집자: "bg-violet-50 text-violet-700",
  뷰어: "bg-muted text-muted-foreground",
};

export default function MembersPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">워크스페이스</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">멤버 관리</h1>
          </div>
          <Button size="sm">
            <UserPlus className="size-4" />
            멤버 초대
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="grid grid-cols-[1fr_1fr_120px_100px] border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold text-muted-foreground">
            <span>이름</span>
            <span>이메일</span>
            <span>역할</span>
            <span>가입일</span>
          </div>
          {members.map((m) => (
            <div
              key={m.email}
              className="grid grid-cols-[1fr_1fr_120px_100px] items-center border-b border-border/60 px-5 py-4 last:border-0"
            >
              <span className="text-sm font-semibold">{m.name}</span>
              <span className="text-sm text-muted-foreground">{m.email}</span>
              <span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${roleColor[m.role]}`}>
                  {m.role}
                </span>
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">{m.joined}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          멤버 초대 및 역할 변경 기능은 곧 지원 예정입니다.
        </p>
      </div>
    </main>
  );
}
