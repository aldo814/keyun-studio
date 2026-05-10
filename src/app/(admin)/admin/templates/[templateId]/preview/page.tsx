import { templates } from "@/features/admin/data";

export default function AdminTemplatePreviewPage() {
  const template = templates[0];

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Template Preview
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-normal text-balance">
          {template.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
          이 화면은 슈퍼관리자가 템플릿을 새 창으로 확인하는 미리보기입니다.
          실제 웹빌더 렌더러가 붙으면 템플릿 JSON을 그대로 렌더링합니다.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {["Hero", "Features", "Pricing"].map((section) => (
            <div
              key={section}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-6"
            >
              <p className="text-sm font-medium text-zinc-500">{section}</p>
              <div className="mt-6 h-28 rounded-md bg-white shadow-sm" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
