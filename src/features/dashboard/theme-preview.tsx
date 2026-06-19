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
  contentWidth?: number;
  headingSize: number;
  bodySize: number;
  lineHeight: number;
  letterSpacing: number;
  englishFont: string;
  sectionGap: number;
};

export function ThemePreview({
  primary,
  secondary,
  accent,
  background,
  textColor,
  headingFont,
  bodyFont,
  buttonRadius,
  contentWidth = 1200,
  headingSize,
  bodySize,
  lineHeight,
  letterSpacing,
  englishFont,
  sectionGap,
}: ThemePreviewProps) {
  const widthPercent = contentWidth === 0 ? 100 : Math.round((contentWidth / 1440) * 100);
  const previewSectionGap = Math.round(sectionGap * 0.45);
  const sectionInnerStyle = {
    maxWidth: contentWidth === 0 ? "100%" : `${contentWidth}px`,
  };

  return (
    <div
      className="min-w-[320px] overflow-hidden rounded-xl bg-white"
      style={{ color: textColor, fontFamily: bodyFont }}
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3">
        <span className="size-2.5 rounded-full bg-red-300" />
        <span className="size-2.5 rounded-full bg-amber-300" />
        <span className="size-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 flex-1 rounded-full bg-muted px-3 py-0.5 text-[10px] text-muted-foreground">
          keyun.studio/s/my-site
        </span>
      </div>

      <div
        className="flex h-11 items-center justify-between border-b border-slate-100 px-5"
        style={{ background }}
      >
        <div
          className="text-sm font-bold tracking-tight"
          style={{ color: textColor, fontFamily: englishFont }}
        >
          keyun
        </div>
        <div className="flex gap-4 text-[10px] font-semibold text-slate-400">
          <span>제품</span>
          <span>가격</span>
          <span>문의</span>
        </div>
      </div>

      <main className="grid" style={{ background, gap: `${previewSectionGap}px` }}>
        <section
          className="relative overflow-hidden"
          style={{
            background,
            paddingBottom: 40,
            paddingTop: 42,
          }}
        >
          <div
            className="absolute inset-y-0 mx-auto border-x border-dashed border-blue-200/60 transition-all duration-300"
            style={{ width: `${widthPercent}%`, left: "50%", transform: "translateX(-50%)" }}
          />
          <div
            className="relative mx-auto flex flex-col items-center px-8 text-center"
            style={sectionInnerStyle}
          >
            <p
              className="mb-3 rounded-full px-3 py-1 text-[10px] font-semibold"
              style={{ background: `${primary}1a`, color: primary, fontFamily: englishFont }}
            >
              KEYUN Brand Theme
            </p>
            <h2
              className="font-bold"
              style={{
                fontFamily: headingFont,
                fontSize: `${Math.round(headingSize * 0.42)}px`,
                letterSpacing: `${letterSpacing}px`,
                lineHeight: 1.22,
                maxWidth: "620px",
              }}
            >
              브랜드 분위기를 바로 확인하는 라이브 프리뷰
            </h2>
            <p
              className="mt-4 opacity-75"
              style={{
                fontSize: `${Math.round(bodySize * 0.72)}px`,
                letterSpacing: `${letterSpacing / 2}px`,
                lineHeight,
                maxWidth: "620px",
              }}
            >
              색상 팔레트, 제목과 본문 폰트, 줄간격과 자간을 조정하면 이 영역에서 즉시 반영됩니다.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <div
                className="px-4 py-2 text-[11px] font-semibold text-white"
                style={{ background: primary, borderRadius: buttonRadius, fontFamily: bodyFont }}
              >
                무료로 시작하기
              </div>
              <div
                className="px-4 py-2 text-[11px] font-semibold"
                style={{ border: `1px solid ${secondary}`, borderRadius: buttonRadius, color: secondary, fontFamily: bodyFont }}
              >
                템플릿 보기
              </div>
            </div>
          </div>
        </section>

        <section className="px-6" style={{ background }}>
          <div className="mx-auto" style={sectionInnerStyle}>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                ["빠른 제작", "AI와 섹션 프리셋으로 첫 화면을 구성합니다."],
                ["쉬운 편집", "텍스트와 색상은 프리뷰에서 바로 확인합니다."],
                ["브랜드 통일", "공통 폰트와 컬러로 전체 톤을 맞춥니다."],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-lg border border-slate-100 bg-white/65 p-3">
                  <span
                    className="mb-3 block size-6 rounded-md"
                    style={{
                      background: `linear-gradient(135deg, ${primary}1f, ${accent}33)`,
                    }}
                  />
                  <h3 className="text-[11px] font-bold" style={{ fontFamily: headingFont }}>
                    {title}
                  </h3>
                  <p className="mt-2 text-[10px] opacity-65" style={{ lineHeight }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6" style={{ background }}>
          <div className="mx-auto rounded-xl border border-slate-100 bg-white/65 p-5" style={sectionInnerStyle}>
            <p className="text-[10px] font-semibold" style={{ color: primary, fontFamily: englishFont }}>
              Section Spacing
            </p>
            <h3
              className="mt-2 font-bold"
              style={{
                fontFamily: headingFont,
                fontSize: `${Math.round(headingSize * 0.27)}px`,
                letterSpacing: `${letterSpacing}px`,
              }}
            >
              섹션 간격 {sectionGap}px 적용 중
            </h3>
            <p className="mt-3 text-[11px] opacity-65" style={{ lineHeight }}>
              왼쪽 설정에서 섹션 간격을 조정하면 히어로와 아래 섹션 사이 간격이 함께 변합니다.
            </p>
          </div>
        </section>

        <section className="px-6" style={{ background }}>
          <div className="mx-auto grid grid-cols-[1fr_0.85fr] gap-3 rounded-xl p-5" style={{ ...sectionInnerStyle, background: `${secondary}12` }}>
            <div>
              <p className="text-[10px] font-semibold" style={{ color: secondary, fontFamily: englishFont }}>
                CTA
              </p>
              <h3 className="mt-2 text-[15px] font-bold" style={{ fontFamily: headingFont }}>
                지금 설정한 톤으로 페이지를 계속 편집하세요
              </h3>
            </div>
            <div className="flex items-end justify-end">
              <span
                className="px-3 py-2 text-[10px] font-semibold text-white"
                style={{ background: primary, borderRadius: buttonRadius }}
              >
                편집 시작
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-slate-950 px-6 py-8 text-white">
        <div className="mx-auto flex items-center justify-between gap-4" style={sectionInnerStyle}>
          <div>
            <p className="text-sm font-bold" style={{ fontFamily: englishFont }}>
              keyun
            </p>
            <p className="mt-2 text-[10px] text-white/55">Brand builder preview</p>
          </div>
          <div className="flex gap-3 text-[10px] text-white/60">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
