export default function EditorLoading() {
  return (
    <div className="flex h-screen w-full flex-col">
      {/* top bar skeleton */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-24 animate-pulse rounded-md bg-slate-100" />
          <div className="h-7 w-32 animate-pulse rounded-md bg-slate-100" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 animate-pulse rounded-md bg-slate-100" />
          <div className="h-8 w-20 animate-pulse rounded-md bg-blue-100" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* left panel skeleton */}
        <div className="hidden w-64 flex-col gap-3 border-r border-slate-200 bg-white p-4 lg:flex">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-4 h-4 w-16 animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
        </div>

        {/* canvas skeleton */}
        <div className="flex flex-1 items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-10">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600" />
            </div>
            <p className="text-sm text-slate-400">에디터 불러오는 중...</p>
          </div>
        </div>

        {/* right panel skeleton */}
        <div className="hidden w-72 flex-col gap-3 border-l border-slate-200 bg-white p-4 lg:flex">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-4 h-4 w-12 animate-pulse rounded bg-slate-100" />
          <div className="h-24 w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="h-24 w-full animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
