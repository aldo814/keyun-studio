export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center gap-10">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Keyun Studio
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-balance sm:text-6xl">
            노코드 웹빌더 SaaS를 위한 기본 세팅 완료.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            React, TypeScript, Next.js, Supabase, Tailwind CSS 기반으로 시작할
            준비가 됐습니다.
          </p>
        </div>
      </section>
    </main>
  );
}
