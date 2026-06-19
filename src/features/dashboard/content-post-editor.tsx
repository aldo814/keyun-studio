"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  Bold,
  CalendarClock,
  ChevronDown,
  Globe,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Pin,
  Quote,
  Redo2,
  Save,
  Send,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createContentPost, updateContentPost } from "@/features/dashboard/actions";
import {
  initialBoards,
  type DashboardBoard,
  type DashboardPost,
  type PostStatus,
} from "@/features/dashboard/content-posts-data";
import { usePosts } from "@/lib/posts-store";
import { cn } from "@/lib/utils";

const postEditorSchema = z.object({
  boardId: z.string().optional(),
  board: z.string().min(1),
  category: z.string().optional(),
  title: z.string().min(1, "제목을 입력해 주세요."),
  summary: z.string().optional(),
  author: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled"]),
  scheduled_at: z.string().optional(),
  pinned: z.boolean().optional(),
});

type PostEditorFields = z.infer<typeof postEditorSchema>;

type Props = {
  boards?: DashboardBoard[];
  post?: DashboardPost | null;
  useLocalFallback?: boolean;
};

function textToHtml(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => "<p>" + line + "</p>")
    .join("");
}

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function slugifyLocal(input: string) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "post"
  );
}

function parseContentJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export function ContentPostEditor({
  boards = initialBoards,
  post,
  useLocalFallback = false,
}: Props) {
  const boardChoices = boards.length ? boards : initialBoards;
  const router = useRouter();
  const localPosts = usePosts();
  const isEdit = Boolean(post?.id);
  const initialHtml =
    post?.contentHtml || textToHtml(post?.content || "");

  const { register, watch, formState } = useForm<PostEditorFields>({
    resolver: zodResolver(postEditorSchema),
    defaultValues: {
      boardId: post?.boardId || "",
      board: post?.board || boardChoices[0]?.name || "공지사항",
      category: post?.category || "",
      title: post?.title || "",
      summary: post?.summary || "",
      author: post?.author || "김운영",
      status: post?.status || "draft",
      scheduled_at: toDateTimeLocal(post?.scheduledAt),
      pinned: post?.pinned || false,
    },
  });

  const [contentHtml, setContentHtml] = useState(initialHtml);
  const [contentJson, setContentJson] = useState(
    JSON.stringify(post?.contentJson || {}),
  );
  const [boardOpen, setBoardOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const [bubblePos, setBubblePos] = useState<{ top: number; left: number } | null>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);

  const updateBubble = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setBubblePos(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const wrap = editorWrapRef.current;
    if (!wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    setBubblePos({
      top: rect.top - wrapRect.top - 44,
      left: Math.max(0, rect.left - wrapRect.left + rect.width / 2 - 80),
    });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateBubble);
    return () => document.removeEventListener("selectionchange", updateBubble);
  }, [updateBubble]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[520px] w-full px-1 py-4 text-[15px] leading-8 text-foreground outline-none prose prose-sm max-w-none " +
          "prose-headings:font-semibold prose-headings:tracking-tight " +
          "prose-p:my-1 prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:text-muted-foreground",
      },
    },
    onUpdate({ editor: e }) {
      setContentHtml(e.getHTML());
      setContentJson(JSON.stringify(e.getJSON()));
    },
  });

  const title = watch("title");
  const summary = watch("summary");
  const boardId = watch("boardId");
  const board = watch("board");
  const category = watch("category");
  const selectedBoard = boardChoices.find((option) => {
    if (boardId && option.id === boardId) return true;
    return option.name === board;
  });
  const author = watch("author");
  const status = watch("status") as PostStatus;
  const scheduledAt = watch("scheduled_at");
  const pinned = watch("pinned");

  const action = isEdit ? updateContentPost : createContentPost;

  function handleLocalSubmit(event: FormEvent<HTMLFormElement>) {
    if (!useLocalFallback) return;
    event.preventDefault();

    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const targetStatus =
      submitter?.name === "status_override" &&
      (submitter.value === "draft" ||
        submitter.value === "published" ||
        submitter.value === "scheduled")
        ? (submitter.value as PostStatus)
        : status;

    const normalizedTitle = title?.trim() || "제목 없는 게시물";
    const payload = {
      siteId: post?.siteId || "demo_site_keyun",
      boardId: post?.boardId || null,
      board: board || "공지사항",
      category: category || "",
      title: normalizedTitle,
      slug: post?.slug || slugifyLocal(normalizedTitle),
      summary: summary || "",
      content: editor?.getText() || "",
      contentHtml: contentHtml || "<p>본문이 없습니다.</p>",
      contentJson: parseContentJson(contentJson),
      author: author || "김운영",
      status: targetStatus,
      pinned: Boolean(pinned),
      scheduledAt: targetStatus === "scheduled" ? scheduledAt || "" : "",
    };

    if (isEdit && post?.id) {
      localPosts.updatePost(post.id, payload);
    } else {
      localPosts.createPost(payload);
    }
    router.push("/dashboard/content/posts");
  }

  const toolbarItems = [
    {
      label: "굵게",
      icon: Bold,
      active: editor?.isActive("bold"),
      onClick: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: "기울임",
      icon: Italic,
      active: editor?.isActive("italic"),
      onClick: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      label: "제목",
      icon: Heading2,
      active: editor?.isActive("heading", { level: 2 }),
      onClick: () =>
        editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "목록",
      icon: List,
      active: editor?.isActive("bulletList"),
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "번호 목록",
      icon: ListOrdered,
      active: editor?.isActive("orderedList"),
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "인용",
      icon: Quote,
      active: editor?.isActive("blockquote"),
      onClick: () => editor?.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fb]">
      <form
        action={action}
        className="flex min-h-screen flex-col"
        onSubmit={handleLocalSubmit}
      >
        <input name="post_id" type="hidden" value={post?.id || ""} />
        <input name="site_id" type="hidden" value={post?.siteId || selectedBoard?.siteId || ""} />
        <input name="board_id" type="hidden" value={selectedBoard?.id || ""} />
        <input name="content_html" type="hidden" value={contentHtml} />
        <input name="content_json" type="hidden" value={contentJson} />

        {/* 상단 헤더 */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/60 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              render={<Link href="/dashboard/content/posts" />}
              size="sm"
              variant="ghost"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">게시글</span>
            </Button>
            <span className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">
              {isEdit ? "게시물 수정" : "새 게시물"}
            </span>
            {useLocalFallback && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                데모 모드
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              name="status_override"
              size="sm"
              type="submit"
              value="draft"
              variant="outline"
              className="gap-1.5"
            >
              <Save className="size-4" />
              임시저장
            </Button>
            <Button
              name="status_override"
              size="sm"
              type="submit"
              value="published"
              className="gap-1.5 bg-blue-600 hover:bg-blue-700"
            >
              <Send className="size-4" />
              게시하기
            </Button>
          </div>
        </header>

        {/* 본문 레이아웃 */}
        <div className="flex flex-1 gap-0">
          {/* 메인 에디터 영역 */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
              {/* 게시판 뱃지 */}
              <div className="relative mb-6" ref={boardRef}>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-blue-300 hover:text-blue-600"
                  onClick={() => setBoardOpen((v) => !v)}
                >
                  <Globe className="size-3.5" />
                  {selectedBoard?.name || board || "공지사항"}
                  <ChevronDown className="size-3" />
                </button>
                {boardOpen && (
                  <div className="absolute left-0 top-full z-10 mt-1.5 min-w-[220px] overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                    {boardChoices.map((option) => (
                      <label
                        key={option.id || option.slug || option.name}
                        className={cn(
                          "flex cursor-pointer items-start gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-muted/60",
                          selectedBoard?.name === option.name && "bg-blue-50 font-medium text-blue-600",
                        )}
                        onClick={() => setBoardOpen(false)}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          value={option.name}
                          {...register("board")}
                        />
                        <span>
                          <span className="block">{option.name}</span>
                          {option.description ? (
                            <span className="mt-0.5 block text-xs font-normal leading-5 text-muted-foreground">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 제목 */}
              <input
                autoFocus
                placeholder="제목을 입력하세요"
                className="w-full border-none bg-transparent text-[2rem] font-bold leading-tight tracking-tight text-foreground outline-none placeholder:text-muted-foreground/30"
                {...register("title")}
              />
              {formState.errors.title && (
                <p className="mt-1 text-xs text-destructive">
                  {formState.errors.title.message}
                </p>
              )}

              {/* 요약 */}
              <input
                placeholder="한 줄 요약 (목록·미리보기에 표시)"
                className="mt-3 w-full border-none bg-transparent text-base text-muted-foreground outline-none placeholder:text-muted-foreground/30"
                {...register("summary")}
              />

              <div className="my-6 h-px bg-border/60" />

              {/* 툴바 */}
              <div className="mb-3 flex items-center gap-0.5">
                {toolbarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        item.active && "bg-slate-900 text-white hover:bg-slate-800 hover:text-white",
                      )}
                      disabled={!editor}
                      title={item.label}
                      type="button"
                      onClick={item.onClick}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })}
                <span className="mx-2 h-4 w-px bg-border" />
                <button
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                  disabled={!editor || !editor.can().undo()}
                  title="되돌리기"
                  type="button"
                  onClick={() => editor?.chain().focus().undo().run()}
                >
                  <Undo2 className="size-4" />
                </button>
                <button
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                  disabled={!editor || !editor.can().redo()}
                  title="다시 실행"
                  type="button"
                  onClick={() => editor?.chain().focus().redo().run()}
                >
                  <Redo2 className="size-4" />
                </button>
              </div>

              {/* 에디터 본문 */}
              <div className="relative" ref={editorWrapRef}>
                {bubblePos && editor && !editor.state.selection.empty && (
                  <div
                    className="absolute z-10 flex items-center gap-0.5 overflow-hidden rounded-lg border border-border bg-white shadow-lg"
                    style={{ top: bubblePos.top, left: bubblePos.left }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {toolbarItems.slice(0, 3).map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          className={cn(
                            "flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                            item.active && "bg-slate-900 text-white hover:bg-slate-800 hover:text-white",
                          )}
                          type="button"
                          onClick={item.onClick}
                        >
                          <Icon className="size-4" />
                        </button>
                      );
                    })}
                  </div>
                )}
                <EditorContent editor={editor} />
                {!editor?.getText().trim() && (
                  <p className="pointer-events-none absolute left-1 top-4 select-none text-[15px] leading-8 text-muted-foreground/30">
                    본문을 작성하세요...
                  </p>
                )}
              </div>
            </div>
          </main>

          {/* 오른쪽 설정 사이드바 */}
          <aside className="hidden w-[280px] shrink-0 border-l border-border/60 bg-white xl:block">
            <div className="sticky top-14 space-y-0 overflow-y-auto" style={{ maxHeight: "calc(100vh - 56px)" }}>

              {/* 게시 상태 */}
              <section className="border-b border-border/60 px-5 py-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  게시 상태
                </p>
                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-muted/50 p-1">
                  {(["draft", "published", "scheduled"] as const).map((s) => {
                    const labels = { draft: "임시저장", published: "게시", scheduled: "예약" };
                    return (
                      <label
                        key={s}
                        className={cn(
                          "flex cursor-pointer items-center justify-center rounded-lg py-2 text-xs font-medium transition-all",
                          status === s
                            ? "bg-white shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <input className="sr-only" type="radio" value={s} {...register("status")} />
                        {labels[s]}
                      </label>
                    );
                  })}
                </div>

                {status === "scheduled" && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                      <CalendarClock className="size-3.5" />
                      예약 시간
                    </div>
                    <Input
                      className="bg-white text-xs"
                      type="datetime-local"
                      {...register("scheduled_at")}
                    />
                  </div>
                )}
              </section>

              {/* 카테고리 */}
              <section className="border-b border-border/60 px-5 py-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  카테고리
                </p>
                <Input
                  className="bg-muted/40 text-sm"
                  placeholder="예: 업데이트"
                  {...register("category")}
                />
              </section>

              {/* 작성자 */}
              <section className="border-b border-border/60 px-5 py-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  작성자
                </p>
                <Input className="bg-muted/40 text-sm" {...register("author")} />
              </section>

              {/* 고정 */}
              <section className="px-5 py-5">
                <label className="flex cursor-pointer items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Pin className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">상단 고정</span>
                  </div>
                  <div
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors",
                      pinned ? "bg-blue-600" : "bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
                        pinned ? "translate-x-4" : "translate-x-0.5",
                      )}
                    />
                    <input className="sr-only" type="checkbox" {...register("pinned")} />
                  </div>
                </label>
              </section>

            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
