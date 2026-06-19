import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const sections = [
  {
    title: "워크스페이스",
    fields: [
      { label: "워크스페이스 이름", value: "KEYUN Official", type: "text" },
      { label: "슬러그", value: "keyun-official", type: "text" },
    ],
  },
  {
    title: "도메인",
    fields: [
      { label: "연결된 도메인", value: "keyun.io", type: "text" },
    ],
  },
];

export default function DashboardSettingsPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-medium text-muted-foreground">워크스페이스</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">설정</h1>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground">{section.title}</h2>
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              {section.fields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-center justify-between gap-6 border-b border-border/60 px-5 py-4 last:border-0"
                >
                  <label className="min-w-[160px] text-sm font-medium">{field.label}</label>
                  <div className="flex flex-1 items-center justify-end gap-3">
                    <Input
                      className="max-w-sm bg-muted/40 text-sm"
                      defaultValue={field.value}
                      type={field.type}
                    />
                    <Button size="sm" variant="outline">저장</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-red-100 bg-red-50/60 px-5 py-4">
          <p className="text-sm font-semibold text-red-700">위험 구역</p>
          <p className="mt-1 text-xs text-red-500">워크스페이스를 삭제하면 모든 사이트와 콘텐츠가 영구 삭제됩니다.</p>
          <Button className="mt-3" size="sm" variant="outline">
            워크스페이스 삭제
          </Button>
        </div>
      </div>
    </main>
  );
}
