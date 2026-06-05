"use client";

type ThemePreviewProps = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  buttonRadius: string;
};

export function ThemePreview({
  primary,
  background,
  textColor,
  headingFont,
  bodyFont,
  buttonRadius,
}: ThemePreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      {/* Browser chrome */}
      <div className="flex h-9 items-center gap-1.5 border-b border-border bg-muted/40 px-3">
        <span className="size-2.5 rounded-full bg-red-300" />
        <span className="size-2.5 rounded-full bg-amber-300" />
        <span className="size-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 flex-1 rounded-full bg-muted px-3 py-0.5 text-[10px] text-muted-foreground">
          keyun.studio/s/my-site
        </span>
      </div>
      {/* Fake nav */}
      <div
        className="flex h-10 items-center justify-between border-b border-border px-5"
        style={{ background }}
      >
        <div
          className="h-3 w-16 rounded-full"
          style={{ background: primary }}
        />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2 w-8 rounded-full bg-slate-200" />
          ))}
        </div>
      </div>
      {/* Hero */}
      <div
        className="flex flex-col items-center px-8 py-10 text-center"
        style={{ background, fontFamily: bodyFont }}
      >
        <div
          className="mb-3 h-2 w-20 rounded-full"
          style={{ background: primary, opacity: 0.3 }}
        />
        <div
          className="mb-2 h-5 w-48 rounded"
          style={{ background: textColor, opacity: 0.85, fontFamily: headingFont }}
        />
        <div
          className="mb-1 h-3 w-36 rounded"
          style={{ background: textColor, opacity: 0.35 }}
        />
        <div
          className="mb-6 h-3 w-28 rounded"
          style={{ background: textColor, opacity: 0.25 }}
        />
        <div
          className="px-5 py-2 text-[11px] font-semibold text-white"
          style={{ background: primary, borderRadius: buttonRadius }}
        >
          시작하기 →
        </div>
      </div>
    </div>
  );
}
