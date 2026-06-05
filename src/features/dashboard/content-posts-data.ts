export type PostStatus = "published" | "draft" | "scheduled";

export type BoardPost = {
  id: number;
  board: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  status: PostStatus;
  updatedAt: string;
  views: number;
  pinned: boolean;
};

export const boardOptions = ["전체", "공지사항", "블로그", "FAQ", "이벤트"];

export const statusOptions = [
  { label: "전체", value: "all" },
  { label: "게시", value: "published" },
  { label: "임시저장", value: "draft" },
  { label: "예약", value: "scheduled" },
];

export const initialPosts: BoardPost[] = [
  {
    id: 1,
    board: "공지사항",
    category: "업데이트",
    title: "KEYUN 디자인 에디터 업데이트 안내",
    summary: "섹션 기반 디자인 편집과 콘텐츠 관리 메뉴가 추가되었습니다.",
    content:
      "KEYUN 디자인 에디터에서 섹션을 선택하고 콘텐츠와 스타일을 더 쉽게 조정할 수 있도록 개선했습니다.\n\n이번 업데이트에서는 콘텐츠 메뉴와 게시글 관리 흐름을 정리해 운영자가 더 빠르게 글을 작성하고 상태를 확인할 수 있습니다.",
    author: "김운영",
    status: "published",
    updatedAt: "2026.06.05",
    views: 1248,
    pinned: true,
  },
  {
    id: 2,
    board: "블로그",
    category: "가이드",
    title: "노코드 빌더로 랜딩페이지 만들기",
    summary: "템플릿 선택부터 게시까지 이어지는 제작 흐름을 소개합니다.",
    content:
      "노코드 빌더는 섹션을 조합하고 텍스트와 이미지를 바꾸는 방식으로 품질을 유지합니다.\n\n사용자는 자유도를 적절히 제한한 디자인 프리셋 안에서 콘텐츠를 교체하므로 결과물이 안정적으로 유지됩니다.",
    author: "이디자인",
    status: "draft",
    updatedAt: "2026.06.03",
    views: 346,
    pinned: false,
  },
  {
    id: 3,
    board: "FAQ",
    category: "결제",
    title: "결제와 게시 관련 자주 묻는 질문",
    summary: "요금제, 게시 상태, 도메인 연결에 대한 답변을 정리했습니다.",
    content:
      "결제와 게시 설정은 사이트 운영 메뉴에서 확인할 수 있습니다.\n\n게시 전에는 미리보기로 화면을 확인하고, 도메인 연결 상태를 점검한 뒤 공개 상태로 전환하는 흐름을 권장합니다.",
    author: "김운영",
    status: "published",
    updatedAt: "2026.05.29",
    views: 689,
    pinned: false,
  },
  {
    id: 4,
    board: "이벤트",
    category: "프로모션",
    title: "초기 사용자 무료 세팅 이벤트",
    summary: "초기 고객에게 사이트 기본 세팅을 지원하는 이벤트입니다.",
    content:
      "이벤트 기간 동안 신청한 사용자는 KEYUN 팀의 기본 세팅 지원을 받을 수 있습니다.\n\n브랜드 컬러, 기본 폰트, 메인 페이지 섹션 구성까지 빠르게 정리할 수 있도록 돕습니다.",
    author: "마케팅팀",
    status: "scheduled",
    updatedAt: "2026.05.20",
    views: 128,
    pinned: false,
  },
];

export function statusLabel(status: PostStatus) {
  if (status === "published") return "게시";
  if (status === "scheduled") return "예약";
  return "임시저장";
}

export function statusTone(status: PostStatus) {
  if (status === "published") return "published";
  if (status === "scheduled") return "review";
  return "draft";
}
