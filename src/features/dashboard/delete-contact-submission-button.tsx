"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteContactSubmission } from "@/features/dashboard/actions";

type DeleteContactSubmissionButtonProps = {
  name: string;
  submissionId: string;
};

export function DeleteContactSubmissionButton({
  name,
  submissionId,
}: DeleteContactSubmissionButtonProps) {
  return (
    <form
      action={deleteContactSubmission}
      onSubmit={(event) => {
        if (!window.confirm(`${name || "선택한"} 문의를 삭제할까요?`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="submission_id" type="hidden" value={submissionId} />
      <Button size="sm" type="submit" variant="outline">
        <Trash2 className="size-4 text-rose-600" />
        삭제
      </Button>
    </form>
  );
}
