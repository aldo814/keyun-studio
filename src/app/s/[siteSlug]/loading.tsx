export default function PublicSiteLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-white">
      {/* nav skeleton */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
        <div className="h-6 w-28 rounded-md bg-slate-100" />
        <div className="hidden items-center gap-6 md:flex">
          {[80, 60, 72, 56].map((w, i) => (
            <div key={i} className="h-4 rounded bg-slate-100" style={{ width: w }} />
          ))}
        </div>
        <div className="h-9 w-24 rounded-lg bg-slate-100" />
      </div>

      {/* hero skeleton */}
      <div className="h-[480px] bg-gradient-to-br from-slate-100 to-slate-50" />

      {/* content skeleton */}
      <div className="mx-auto max-w-5xl space-y-16 px-6 py-20">
        <div className="space-y-4">
          <div className="mx-auto h-5 w-20 rounded bg-slate-100" />
          <div className="mx-auto h-9 w-80 rounded-lg bg-slate-100" />
          <div className="mx-auto h-4 w-96 rounded bg-slate-100" />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
