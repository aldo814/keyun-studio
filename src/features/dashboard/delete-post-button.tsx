"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteContentPost } from "@/features/dashboard/actions";

type DeletePostButtonProps = {
  postId: string;
  title: string;
};

export function DeletePostButton({ postId, title }: DeletePostButtonProps) {
  return (
    <form
      action={deleteContentPost}
      onSubmit={(event) => {
        if (!window.confirm(`${title} 게시글을 삭제할까요?`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="post_id" type="hidden" value={postId} />
      <Button type="submit" variant="outline">
        <Trash2 className="size-4 text-rose-600" />
        삭제
      </Button>
    </form>
  );
}
