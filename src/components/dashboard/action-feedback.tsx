import { cn } from "@/lib/utils";

const feedbackMessages = {
  board_created: "게시판을 만들었습니다.",
  board_deleted: "게시판을 삭제했습니다.",
  board_moved: "게시판 순서를 변경했습니다.",
  board_updated: "게시판 설정을 저장했습니다.",
  contact_deleted: "문의를 삭제했습니다.",
  contact_saved: "문의 처리 상태를 저장했습니다.",
  media_deleted: "미디어를 삭제했습니다.",
  media_uploaded: "미디어를 업로드했습니다.",
  post_created: "게시글을 저장했습니다.",
  post_deleted: "게시글을 삭제했습니다.",
  post_pinned: "게시글을 상단에 고정했습니다.",
  post_unpinned: "게시글 상단 고정을 해제했습니다.",
  post_updated: "게시글을 수정했습니다.",
  popup_created: "팝업을 만들었습니다.",
  popup_deleted: "팝업을 삭제했습니다.",
  popup_updated: "팝업 설정을 저장했습니다.",
  seo_saved: "SEO 설정을 저장했습니다.",
  site_created: "사이트를 만들었습니다. 다음 단계부터 차근차근 진행해 주세요.",
  site_saved: "사이트 기본 정보를 저장했습니다.",
  site_published: "사이트를 게시했습니다.",
  sitemap_deleted: "선택한 페이지를 삭제했습니다.",
  sitemap_saved: "사이트맵 설정을 저장했습니다.",
} as const;

type ActionFeedbackProps = {
  notice?: string;
};

export function ActionFeedback({ notice }: ActionFeedbackProps) {
  if (!notice || !(notice in feedbackMessages)) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700",
      )}
    >
      {feedbackMessages[notice as keyof typeof feedbackMessages]}
    </div>
  );
}
