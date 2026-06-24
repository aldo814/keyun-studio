"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  Inbox,
  LoaderCircle,
  Mail,
  MessageSquareText,
  Phone,
  Search,
} from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { ActionFeedback } from "@/components/dashboard/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateContactSubmission } from "@/features/dashboard/actions";
import { DeleteContactSubmissionButton } from "@/features/dashboard/delete-contact-submission-button";
import type {
  ContactSubmissionStatus,
  DashboardContactSubmission,
} from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | ContactSubmissionStatus;

const statusTabs: Array<{ label: string; value: StatusFilter }> = [
  { label: "전체", value: "all" },
  { label: "신규", value: "new" },
  { label: "처리 중", value: "in_progress" },
  { label: "완료", value: "done" },
];

type Props = {
  notice?: string;
  submissions: DashboardContactSubmission[];
};

function contactStatusLabel(status: ContactSubmissionStatus) {
  if (status === "done") return "완료";
  if (status === "in_progress") return "처리 중";
  return "신규";
}

function contactStatusTone(status: ContactSubmissionStatus) {
  if (status === "done") return "published";
  if (status === "in_progress") return "review";
  return "open";
}

function matchesKeyword(submission: DashboardContactSubmission, keyword: string) {
  if (!keyword) return true;

  return [
    submission.formName,
    submission.name,
    submission.email,
    submission.phone,
    submission.subject,
    submission.message,
    submission.siteName,
    submission.sourcePath,
  ]
    .join(" ")
    .toLowerCase()
    .includes(keyword);
}

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadCsv(submissions: DashboardContactSubmission[]) {
  const header = ["상태", "사이트", "폼", "이름", "이메일", "연락처", "제목", "내용", "접수일", "메모"];
  const rows = submissions.map((submission) => [
    contactStatusLabel(submission.status),
    submission.siteName,
    submission.formName,
    submission.name,
    submission.email,
    submission.phone,
    submission.subject,
    submission.message,
    submission.createdAt,
    submission.adminNote,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvValue(cell ?? "")).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `keyun-contact-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ContactSubmissionsManager({ notice, submissions }: Props) {
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const keyword = search.trim().toLowerCase();
  const summary = useMemo(() => {
    return {
      all: submissions.length,
      done: submissions.filter((submission) => submission.status === "done").length,
      inProgress: submissions.filter((submission) => submission.status === "in_progress").length,
      latest: submissions[0]?.createdAt ?? "-",
      new: submissions.filter((submission) => submission.status === "new").length,
    };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const statusMatched = activeStatus === "all" || submission.status === activeStatus;
      return statusMatched && matchesKeyword(submission, keyword);
    });
  }, [activeStatus, keyword, submissions]);

  function getStatusCount(status: StatusFilter) {
    const keywordMatched = submissions.filter((submission) => matchesKeyword(submission, keyword));
    if (status === "all") return keywordMatched.length;
    return keywordMatched.filter((submission) => submission.status === status).length;
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">콘텐츠 / 문의폼</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">문의폼</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              공개 사이트에서 접수된 문의를 확인하고 처리 상태를 관리합니다.
            </p>
          </div>
          <Button
            disabled={!filteredSubmissions.length}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => downloadCsv(filteredSubmissions)}
          >
            <Download className="size-4" />
            CSV 내보내기
          </Button>
        </div>

        <ActionFeedback notice={notice} />

        <section
          className={cn(
            "rounded-xl border p-4",
            summary.new
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-emerald-200 bg-emerald-50 text-emerald-950",
          )}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {summary.new
                  ? `새 문의 ${summary.new.toLocaleString("ko-KR")}건이 대기 중입니다.`
                  : "현재 신규 문의는 없습니다."}
              </p>
              <p className="mt-1 text-xs leading-5 opacity-80">
                신규 문의는 이 화면 상단 카드와 알림 영역에 표시됩니다. 확인 후 상태를 `처리 중` 또는 `완료`로 바꾸고 내부 메모를 남겨주세요.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setActiveStatus("new")}
              >
                신규 문의 보기
              </Button>
              <Button
                disabled={!filteredSubmissions.length}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => downloadCsv(filteredSubmissions)}
              >
                <Download className="size-4" />
                현재 목록 저장
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            className={cn(
              "rounded-xl border bg-white p-4 text-left transition-colors hover:border-foreground",
              activeStatus === "all" ? "border-foreground" : "border-border",
            )}
            type="button"
            onClick={() => setActiveStatus("all")}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">전체 문의</p>
              <Inbox className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {summary.all.toLocaleString("ko-KR")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">현재 조회 가능한 전체 접수</p>
          </button>

          <button
            className={cn(
              "rounded-xl border bg-white p-4 text-left transition-colors hover:border-foreground",
              activeStatus === "new" ? "border-foreground" : "border-border",
            )}
            type="button"
            onClick={() => setActiveStatus("new")}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">신규</p>
              <Clock3 className="size-5 text-rose-500" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {summary.new.toLocaleString("ko-KR")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">아직 처리하지 않은 문의</p>
          </button>

          <button
            className={cn(
              "rounded-xl border bg-white p-4 text-left transition-colors hover:border-foreground",
              activeStatus === "in_progress" ? "border-foreground" : "border-border",
            )}
            type="button"
            onClick={() => setActiveStatus("in_progress")}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">처리 중</p>
              <LoaderCircle className="size-5 text-amber-500" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {summary.inProgress.toLocaleString("ko-KR")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">상담 또는 후속 처리 진행</p>
          </button>

          <button
            className={cn(
              "rounded-xl border bg-white p-4 text-left transition-colors hover:border-foreground",
              activeStatus === "done" ? "border-foreground" : "border-border",
            )}
            type="button"
            onClick={() => setActiveStatus("done")}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">완료</p>
              <CheckCircle2 className="size-5 text-emerald-500" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {summary.done.toLocaleString("ko-KR")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              최근 접수 {summary.latest}
            </p>
          </button>
        </div>

        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 bg-white pl-9"
              placeholder="이름, 연락처, 제목, 내용 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 border-b border-border">
            {statusTabs.map((tab) => (
              <button
                className={cn(
                  "relative -mb-px flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                  activeStatus === tab.value
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                key={tab.value}
                type="button"
                onClick={() => setActiveStatus(tab.value)}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                    activeStatus === tab.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {getStatusCount(tab.value).toLocaleString("ko-KR")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredSubmissions.length ? (
          <div className="grid gap-4">
            {filteredSubmissions.map((submission) => (
              <article
                className="rounded-xl border border-border bg-white p-5"
                key={submission.id}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={contactStatusTone(submission.status)}>
                        {contactStatusLabel(submission.status)}
                      </StatusBadge>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {submission.formName}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {submission.siteName}
                      </span>
                    </div>

                    <h2 className="mt-4 text-lg font-semibold tracking-normal">
                      {submission.subject || "문의"}
                    </h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground/80">
                      {submission.message}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{submission.name}</span>
                      {submission.email ? (
                        <a className="inline-flex items-center gap-1 hover:text-foreground" href={`mailto:${submission.email}`}>
                          <Mail className="size-3.5" />
                          {submission.email}
                        </a>
                      ) : null}
                      {submission.phone ? (
                        <a className="inline-flex items-center gap-1 hover:text-foreground" href={`tel:${submission.phone}`}>
                          <Phone className="size-3.5" />
                          {submission.phone}
                        </a>
                      ) : null}
                      <span>{submission.createdAt}</span>
                    </div>

                    {submission.sourcePath ? (
                      <Link
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground underline-offset-4 hover:underline"
                        href={submission.sourcePath}
                        target="_blank"
                      >
                        접수 페이지 보기
                      </Link>
                    ) : null}
                  </div>

                  <div className="grid w-full gap-3 rounded-lg border border-border bg-muted/30 p-4 lg:w-[320px]">
                    <form action={updateContactSubmission} className="grid gap-3">
                      <input name="submission_id" type="hidden" value={submission.id} />
                      <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                        처리 상태
                        <select
                          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-foreground"
                          defaultValue={submission.status}
                          name="status"
                        >
                          <option value="new">신규</option>
                          <option value="in_progress">처리 중</option>
                          <option value="done">완료</option>
                        </select>
                      </label>
                      <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                        내부 메모
                        <textarea
                          className="min-h-24 resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
                          defaultValue={submission.adminNote}
                          name="admin_note"
                          placeholder="처리 내용이나 후속 작업을 메모하세요."
                        />
                      </label>
                      <Button size="sm" type="submit">
                        <MessageSquareText className="size-4" />
                        저장
                      </Button>
                    </form>
                    <div className="border-t border-border pt-3">
                      <DeleteContactSubmissionButton
                        name={submission.name}
                        submissionId={submission.id}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : submissions.length ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
            <p className="text-lg font-semibold">조건에 맞는 문의가 없습니다.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              검색어를 줄이거나 다른 처리 상태를 선택해 주세요.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
            <p className="text-lg font-semibold">아직 접수된 문의가 없습니다.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              공개 사이트의 문의폼으로 제출된 내용이 이곳에 표시됩니다.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              코드 데모 페이지인 <span className="font-semibold text-foreground">keyun-demo</span>는 DB에 연결된 실제 게시 사이트가 아니면
              문의가 저장되지 않습니다. 사이트를 생성하고 게시한 뒤 <span className="font-semibold text-foreground">/s/사이트주소</span>에서
              문의를 제출해 주세요.
            </p>
            <Button
              className="mt-6"
              render={<Link href="/dashboard/sites" />}
              size="sm"
              variant="outline"
            >
              사이트 확인하기
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
