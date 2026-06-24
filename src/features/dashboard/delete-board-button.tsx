"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteContentBoard } from "@/features/dashboard/actions";

type DeleteBoardButtonProps = {
  boardId: string;
  name: string;
};

export function DeleteBoardButton({ boardId, name }: DeleteBoardButtonProps) {
  return (
    <form
      action={deleteContentBoard}
      onSubmit={(event) => {
        if (!window.confirm(`${name} 게시판을 삭제할까요? 게시글의 게시판 연결은 해제됩니다.`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="board_id" type="hidden" value={boardId} />
      <Button
        size="icon"
        title="삭제"
        type="submit"
        variant="destructive"
      >
        <Trash2 />
      </Button>
    </form>
  );
}
