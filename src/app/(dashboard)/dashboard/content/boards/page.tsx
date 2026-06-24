import { ArrowDown, ArrowUp, Plus, Save } from "lucide-react";

import { ActionFeedback } from "@/components/dashboard/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createContentBoard,
  moveContentBoard,
  updateContentBoard,
} from "@/features/dashboard/actions";
import { DeleteBoardButton } from "@/features/dashboard/delete-board-button";
import { getDashboardContentBoards } from "@/features/dashboard/queries";

type Props = {
  searchParams?: Promise<{ notice?: string | string[] }>;
};

function firstSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardBoardsPage({ searchParams }: Props) {
  const query = await searchParams;
  const boards = await getDashboardContentBoards();
  const editableBoards = boards.filter((board) => Boolean(board.id));
  const fallbackMode = editableBoards.length === 0;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <ActionFeedback notice={firstSearchValue(query?.notice)} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">콘텐츠 / 게시판</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">게시판 관리</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              게시글을 담는 공간을 관리합니다. 첫 사이트 생성 시 만들어진 공지사항,
              블로그, FAQ도 이곳에서 이름과 설명을 바꿀 수 있습니다.
            </p>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            action={createContentBoard}
            className="self-start rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                <Plus className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold">게시판 추가</h2>
                <p className="text-xs text-muted-foreground">새 글 분류 공간을 만듭니다.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium">게시판 이름</span>
                <Input name="name" placeholder="예: 고객 후기" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">설명</span>
                <Input name="description" placeholder="게시판 용도를 짧게 입력" />
              </label>
            </div>

            <Button className="mt-5 w-full bg-zinc-950 text-white hover:bg-zinc-800" type="submit">
              게시판 만들기
            </Button>
          </form>

          <div className="space-y-3">
            {fallbackMode ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-5">
                <p className="text-sm font-semibold">데모 게시판 목록</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  아직 연결된 사이트 게시판이 없어서 기본 예시를 보여주고 있습니다.
                  첫 사이트를 만들면 실제 게시판을 수정할 수 있어요.
                </p>
              </div>
            ) : null}

            {boards.map((board, index) => {
              const canEdit = Boolean(board.id);

              return (
                <div
                  key={board.id || board.slug || board.name}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                    <form action={updateContentBoard} className="grid flex-1 gap-3 md:grid-cols-[220px_1fr]">
                      <input name="board_id" type="hidden" value={board.id || ""} />
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">이름</span>
                        <Input
                          defaultValue={board.name}
                          disabled={!canEdit}
                          name="name"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">설명</span>
                        <Input
                          defaultValue={board.description}
                          disabled={!canEdit}
                          name="description"
                          placeholder="설명 없음"
                        />
                      </label>
                      <div className="md:col-span-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-2 py-1">/{board.slug}</span>
                        <span>{index + 1}번째 게시판</span>
                      </div>
                      {canEdit ? (
                        <div className="md:col-span-2">
                          <Button size="sm" type="submit" variant="outline">
                            <Save />
                            저장
                          </Button>
                        </div>
                      ) : null}
                    </form>

                    <div className="flex shrink-0 gap-2">
                      {canEdit ? (
                        <>
                          <form action={moveContentBoard}>
                            <input name="board_id" type="hidden" value={board.id || ""} />
                            <input name="site_id" type="hidden" value={board.siteId} />
                            <input name="direction" type="hidden" value="up" />
                            <Button
                              disabled={index === 0}
                              size="icon"
                              title="위로 이동"
                              type="submit"
                              variant="outline"
                            >
                              <ArrowUp />
                            </Button>
                          </form>
                          <form action={moveContentBoard}>
                            <input name="board_id" type="hidden" value={board.id || ""} />
                            <input name="site_id" type="hidden" value={board.siteId} />
                            <input name="direction" type="hidden" value="down" />
                            <Button
                              disabled={index === boards.length - 1}
                              size="icon"
                              title="아래로 이동"
                              type="submit"
                              variant="outline"
                            >
                              <ArrowDown />
                            </Button>
                          </form>
                          <DeleteBoardButton boardId={board.id || ""} name={board.name} />
                        </>
                      ) : (
                        <span className="rounded-full bg-muted px-3 py-2 text-xs text-muted-foreground">
                          예시
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
