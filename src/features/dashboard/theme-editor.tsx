"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemePreview } from "./theme-preview";

const fontOptions = [
  "Noto Sans KR",
  "IBM Plex Sans KR",
  "Gowun Dodum",
  "Inter",
];

const radiusOptions = [
  { label: "둥근형", value: "9999px" },
  { label: "기본형", value: "8px" },
  { label: "각진형", value: "2px" },
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
  const [buttonRadius, setButtonRadius] = useState(radiusOptions[1].value);
  const [sectionGap, setSectionGap] = useState(64);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* 설정 패널 */}
      <div className="space-y-5">
        {/* 색상 팔레트 */}
        <Card className="rounded-lg shadow-sm">
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
                      className="block size-9 rounded-lg border border-border shadow-sm"
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
        <Card className="rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>폰트</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
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
          </CardContent>
        </Card>

        {/* 버튼 스타일 */}
        <Card className="rounded-lg shadow-sm">
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

        {/* 섹션 간격 */}
        <Card className="rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>섹션 간격</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                className="flex-1 accent-blue-600"
                max={128}
                min={32}
                step={8}
                type="range"
                value={sectionGap}
                onChange={(e) => setSectionGap(Number(e.target.value))}
              />
              <span className="w-14 rounded-lg border border-border px-2 py-1 text-center text-sm font-semibold">
                {sectionGap}px
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 라이브 프리뷰 */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground">라이브 프리뷰</p>
        <ThemePreview
          accent={colors.accent}
          background={colors.background}
          bodyFont={bodyFont}
          buttonRadius={buttonRadius}
          headingFont={headingFont}
          primary={colors.primary}
          secondary={colors.secondary}
          textColor={colors.text}
        />
        <p className="text-[11px] text-muted-foreground">
          설정값이 실시간으로 반영됩니다. 저장하면 사이트 전체에 적용됩니다.
        </p>
        <Button
          className="w-full"
          onClick={() => {
            console.log("저장", { colors, headingFont, bodyFont, buttonRadius, sectionGap });
          }}
        >
          테마 저장
        </Button>
      </div>
    </div>
  );
}
