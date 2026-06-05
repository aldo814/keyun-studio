"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  CalendarClock,
  Eye,
  ImageIcon,
  Italic,
  Link2,
  List,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const boardOptions = ["공지사항", "블로그", "FAQ", "이벤트"];
const toolbarItems = [
  { label: "굵게", icon: Bold },
  { label: "기울임", icon: Italic },
  { label: "링크", icon: Link2 },
  { label: "이미지", icon: ImageIcon },
  { label: "목록", icon: List },
  { label: "좌측 정렬", icon: AlignLeft },
  { label: "중앙 정렬", icon: AlignCenter },
  { label: "우측 정렬", icon: AlignRight },
];

export function ContentPostEditor() {
  const [board, setBoard] = useState("공지사항");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [author, setAuthor] = useState("김운영");
  const [status, setStatus] = useState("draft");
  const [isPinned, setIsPinned] = useState(false);
  const [content, setContent] = useState(
    "여기에 게시글 본문을 작성하세요.\n\n이미지, 링크, 목록 같은 서식 도구는 상단 툴바에서 선택할 수 있습니다.",
  );

  const displayTitle = title || "제목 없는 게시물";
  const displaySummary =
    summary || "목록과 미리보기에 표시될 짧은 설명이 여기에 표시됩니다.";
  const saveState = useMemo(() => {
    if (!title.trim() && !summary.trim()) return "새 글 작성 중";
    if (status === "published") return "게시 준비됨";
    if (status === "scheduled") return "예약 게시 준비됨";
    return "임시저장 준비됨";
  }, [status, summary, title]);

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Button
              render={<Link href="/dashboard/content/posts" />}
              size="sm"
              variant="ghost"
            >
              <ArrowLeft />
              게시글 목록
            </Button>
            <p className="mt-5 text-sm font-medium text-muted-foreground">
              콘텐츠 / 게시글 / 새 게시물
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              게시물 작성
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              게시판에 노출될 글을 작성하고, 상태와 고정 여부를 설정합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Eye />
              미리보기
            </Button>
            <Button variant="outline">
              <Save />
              임시저장
            </Button>
            <Button>
              <Send />
              게시하기
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-4">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>
                  제목과 요약은 게시글 목록, 검색 결과, 미리보기에 사용됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="space-y-2.5 text-sm font-medium">
                  제목
                  <Input
                    className="h-12 text-base font-semibold"
                    placeholder="게시물 제목을 입력하세요"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>
                <label className="space-y-2.5 text-sm font-medium">
                  요약
                  <Textarea
                    className="min-h-20"
                    placeholder="목록과 미리보기에 표시될 짧은 설명"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                  />
                </label>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-lg shadow-sm">
              <div className="flex flex-wrap items-center gap-1 border-b border-border bg-card px-4 py-3">
                {toolbarItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Button
                      key={item.label}
                      size="icon"
                      title={item.label}
                      type="button"
                      variant="ghost"
                    >
                      <Icon />
                    </Button>
                  );
                })}
                <div className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                  <Sparkles className="size-4 text-blue-500" />
                  글 구조를 유지하면서 내용만 작성합니다.
                </div>
              </div>

              <div className="bg-white p-5">
                <div
                  className="min-h-[420px] rounded-lg border border-dashed border-blue-200 bg-gradient-to-b from-white to-blue-50/30 p-6 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => {
                    setContent(event.currentTarget.innerText);
                  }}
                >
                  {content.split("\n").map((line, index) => (
                    <p key={`${line}-${index}`} className={cn(index ? "mt-4" : "")}>
                      {line || "\u00a0"}
                    </p>
                  ))}
                </div>
              </div>
            </Card>
          </section>

          <aside className="space-y-4">
            <Card className="rounded-lg border-slate-950 bg-slate-950 text-white shadow-sm">
              <CardHeader>
                <CardTitle>게시 설정</CardTitle>
                <CardDescription className="text-white/60">
                  어느 게시판에 노출할지와 게시 상태를 정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="space-y-2.5 text-sm font-medium text-white">
                  게시판
                  <select
                    className="h-10 w-full rounded-lg border border-white/20 bg-white px-3 text-sm text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    value={board}
                    onChange={(event) => setBoard(event.target.value)}
                  >
                    {boardOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2.5 text-sm font-medium text-white">
                  카테고리
                  <Input
                    className="border-white/20 bg-white text-slate-950 focus-visible:ring-white/30"
                    placeholder="예: 업데이트"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  />
                </label>

                <label className="space-y-2.5 text-sm font-medium text-white">
                  작성자
                  <Input
                    className="border-white/20 bg-white text-slate-950 focus-visible:ring-white/30"
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                  />
                </label>

                <label className="space-y-2.5 text-sm font-medium text-white">
                  상태
                  <select
                    className="h-10 w-full rounded-lg border border-white/20 bg-white px-3 text-sm text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="draft">임시저장</option>
                    <option value="published">게시</option>
                    <option value="scheduled">예약</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 p-3 text-sm text-white">
                  <input
                    checked={isPinned}
                    type="checkbox"
                    onChange={(event) => setIsPinned(event.target.checked)}
                  />
                  상단 고정 게시물로 표시
                </label>

                {status === "scheduled" ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <CalendarClock className="size-4" />
                      예약 게시
                    </div>
                    <Input className="mt-3 bg-white" type="datetime-local" />
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle>게시물 미리보기</CardTitle>
                <CardDescription>{saveState}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border bg-white p-4">
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <span>{board}</span>
                    <span>·</span>
                    <span>{category || "일반"}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold leading-7">
                    {displayTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {displaySummary}
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {author || "관리자"} · {isPinned ? "상단 고정" : "일반 게시"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
