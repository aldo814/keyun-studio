"use client";

import Link from "next/link";
import { type CSSProperties, type PointerEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemePreview } from "./theme-preview";

const fontOptions = [
  "Pretendard",
  "Noto Sans KR",
  "Noto Serif KR",
  "IBM Plex Sans KR",
  "Nanum Gothic",
  "Nanum Myeongjo",
  "NanumSquareRound",
  "Gmarket Sans",
  "Escoredream",
  "Mona12 Text KR",
  "Gowun Dodum",
  "Black Han Sans",
  "Do Hyeon",
  "Jua",
  "Sunflower",
  "Inter",
  "Google Sans Flex",
  "Poppins",
  "Montserrat",
  "Roboto",
  "Lora",
];

const englishFontOptions = fontOptions;

const radiusOptions = [
  { label: "둥근형", value: "9999px" },
  { label: "기본형", value: "8px" },
  { label: "각진형", value: "2px" },
];

const contentWidthOptions = [
  { label: "960", value: 960, desc: "좁은" },
  { label: "1080", value: 1080, desc: "기본" },
  { label: "1200", value: 1200, desc: "넓은" },
  { label: "1440", value: 1440, desc: "와이드" },
  { label: "100%", value: 0, desc: "풀" },
];

const colorTokens = [
  { key: "primary", label: "Primary", defaultValue: "#3b6ef0" },
  { key: "secondary", label: "Secondary", defaultValue: "#6d28d9" },
  { key: "accent", label: "Accent", defaultValue: "#10b981" },
  { key: "background", label: "Background", defaultValue: "#f8f9fa" },
  { key: "text", label: "Text", defaultValue: "#111111" },
  { key: "danger", label: "Danger", defaultValue: "#ef4444" },
] as const;

type ColorKey = (typeof colorTokens)[number]["key"];
type Colors = Record<ColorKey, string>;

export function ThemeEditor() {
  const [colors, setColors] = useState<Colors>(() =>
    Object.fromEntries(colorTokens.map((t) => [t.key, t.defaultValue])) as Colors,
  );
  const [headingFont, setHeadingFont] = useState(fontOptions[0]);
  const [bodyFont, setBodyFont] = useState(fontOptions[0]);
  const [englishFont, setEnglishFont] = useState(englishFontOptions[0]);
  const [headingSize, setHeadingSize] = useState(48);
  const [bodySize, setBodySize] = useState(17);
  const [lineHeight, setLineHeight] = useState(1.65);
  const [letterSpacing, setLetterSpacing] = useState(-0.2);
  const [buttonRadius, setButtonRadius] = useState(radiusOptions[1].value);
  const [sectionGap, setSectionGap] = useState(64);
  const [contentWidth, setContentWidth] = useState(1200);
  const [previewWidth, setPreviewWidth] = useState(360);
  const [saveMessage, setSaveMessage] = useState("");

  function handleThemeSave() {
    console.log("저장", { colors, headingFont, bodyFont, englishFont, headingSize, bodySize, lineHeight, letterSpacing, buttonRadius, sectionGap, contentWidth });
    setSaveMessage("테마 설정이 저장되었습니다.");

    window.setTimeout(() => {
      setSaveMessage("");
    }, 2400);
  }

  function handlePreviewResizeStart(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = previewWidth;

    function handlePointerMove(moveEvent: globalThis.PointerEvent) {
      const nextWidth = startWidth - (moveEvent.clientX - startX);
      setPreviewWidth(Math.min(720, Math.max(320, nextWidth)));
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
      {/* 설정 패널 */}
      <div className="space-y-5">
        {/* 색상 팔레트 */}
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>색상 팔레트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {colorTokens.map((token) => (
                <div key={token.key} className="flex items-center gap-3">
                  <label
                    className="relative cursor-pointer"
                    htmlFor={`color-${token.key}`}
                  >
                    <span
                      className="block size-9 rounded-lg border border-border"
                      style={{ background: colors[token.key] }}
                    />
                    <input
                      className="absolute inset-0 cursor-pointer opacity-0"
                      id={`color-${token.key}`}
                      type="color"
                      value={colors[token.key]}
                      onChange={(e) =>
                        setColors((prev) => ({ ...prev, [token.key]: e.target.value }))
                      }
                    />
                  </label>
                  <div>
                    <p className="text-xs font-semibold">{token.label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {colors[token.key]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 폰트 */}
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>폰트 기본 세팅</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="heading-font">
                제목 폰트
              </label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                id="heading-font"
                value={headingFont}
                onChange={(e) => setHeadingFont(e.target.value)}
              >
                {fontOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="body-font">
                본문 폰트
              </label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                id="body-font"
                value={bodyFont}
                onChange={(e) => setBodyFont(e.target.value)}
              >
                {fontOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="english-font">
                영문 폰트
              </label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                id="english-font"
                value={englishFont}
                onChange={(e) => setEnglishFont(e.target.value)}
              >
                {englishFontOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 텍스트 스타일 */}
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>텍스트 스타일</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <RangeField label="제목 폰트 크기" max={72} min={32} suffix="px" value={headingSize} onChange={setHeadingSize} />
            <RangeField label="본문 폰트 크기" max={22} min={14} suffix="px" value={bodySize} onChange={setBodySize} />
            <RangeField label="줄간격" max={2} min={1.2} step={0.05} value={lineHeight} onChange={setLineHeight} />
            <RangeField label="자간" max={1.2} min={-1.2} step={0.1} suffix="px" value={letterSpacing} onChange={setLetterSpacing} />
          </CardContent>
        </Card>

        {/* 버튼 스타일 */}
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>버튼 스타일</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {radiusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    checked={buttonRadius === opt.value}
                    className="accent-blue-600"
                    name="button-radius"
                    type="radio"
                    value={opt.value}
                    onChange={() => setButtonRadius(opt.value)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              {radiusOptions.map((opt) => (
                <button
                  key={opt.value}
                  className="px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{
                    background: colors.primary,
                    borderRadius: opt.value,
                  }}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 콘텐츠 넓이 */}
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>콘텐츠 넓이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {contentWidthOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${
                    contentWidth === opt.value
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-border text-muted-foreground hover:border-blue-200 hover:text-foreground"
                  }`}
                  onClick={() => setContentWidth(opt.value)}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className="text-[10px] opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-end gap-2">
              <div className="flex-1 overflow-hidden rounded-md border border-border bg-muted/30 p-2">
                <div
                  className="mx-auto h-2 rounded-full bg-blue-200 transition-all duration-300"
                  style={{
                    width: contentWidth === 0 ? "100%" : `${Math.round((contentWidth / 1440) * 100)}%`,
                  }}
                />
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {contentWidth === 0 ? "제한 없음" : `최대 ${contentWidth}px`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 섹션 간격 */}
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>섹션 간격</CardTitle>
          </CardHeader>
          <CardContent>
            <RangeField
              label="간격 값"
              max={128}
              min={32}
              step={8}
              suffix="px"
              value={sectionGap}
              onChange={setSectionGap}
            />
          </CardContent>
        </Card>
      </div>

      {/* 라이브 프리뷰 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-muted-foreground">라이브 프리뷰</p>
          <p className="text-[11px] text-muted-foreground">왼쪽 경계선을 드래그해 크게 보기</p>
        </div>
        <div
          className="relative rounded-xl border border-border bg-white"
          style={{
            maxWidth: "min(720px, calc(100vw - 48px))",
            minWidth: 320,
            width: previewWidth,
          }}
        >
          <button
            aria-label="라이브 프리뷰 너비 조절"
            className="absolute left-0 top-0 z-10 h-full w-3 cursor-ew-resize border-l-2 border-transparent transition-colors hover:border-blue-400 focus-visible:border-blue-500 focus-visible:outline-none"
            onPointerDown={handlePreviewResizeStart}
            type="button"
          />
        <ThemePreview
          accent={colors.accent}
          background={colors.background}
          bodyFont={bodyFont}
          buttonRadius={buttonRadius}
          contentWidth={contentWidth}
          bodySize={bodySize}
          englishFont={englishFont}
          headingFont={headingFont}
          headingSize={headingSize}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          sectionGap={sectionGap}
          primary={colors.primary}
          secondary={colors.secondary}
          textColor={colors.text}
        />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground">
            설정값이 실시간으로 반영됩니다. 저장하면 사이트 전체에 적용됩니다.
          </p>
          {saveMessage ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              {saveMessage}
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <Button className="w-full" onClick={handleThemeSave}>
              테마 저장
            </Button>
            <Button
              className="w-full"
              render={<Link href="/dashboard/editor/demo_site_keyun" />}
              variant="outline"
            >
              디자인 편집으로 이동
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type RangeFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
};

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: RangeFieldProps) {
  const displayValue = Number.isInteger(value) ? value : Number(value.toFixed(2));
  const progress = ((value - min) / (max - min)) * 100;
  const rangeStyle = { "--range-progress": `${progress}%` } as CSSProperties;

  function updateValue(rawValue: string) {
    const nextValue = Number(rawValue);

    if (Number.isNaN(nextValue)) return;

    onChange(Math.min(max, Math.max(min, nextValue)));
  }

  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-medium">
        <span>{label}</span>
        <span className="flex h-10 min-w-24 items-center rounded-lg bg-slate-50 px-2 text-foreground ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-200">
          <input
            className="h-full w-16 bg-transparent text-right text-sm font-semibold outline-none"
            max={max}
            min={min}
            step={step}
            type="number"
            value={displayValue}
            onChange={(event) => updateValue(event.target.value)}
          />
          {suffix ? (
            <span className="ml-1 text-xs font-semibold text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </span>
      </span>
      <input
        className="theme-range w-full"
        max={max}
        min={min}
        step={step}
        style={rangeStyle}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
