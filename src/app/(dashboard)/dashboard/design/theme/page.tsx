import { ThemeEditor } from "@/features/dashboard/theme-editor";

export default function ThemePage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">디자인 / 테마</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal">테마 설정</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              색상, 폰트, 버튼 스타일을 조정해 사이트 전체 분위기를 결정합니다.
            </p>
          </div>
        </div>

        <ThemeEditor />
      </div>
    </main>
  );
}
