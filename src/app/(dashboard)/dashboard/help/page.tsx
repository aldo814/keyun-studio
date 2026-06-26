import Link from "next/link";
import { ArrowRight, FileText, Globe2, ImageIcon, Inbox, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const guideSections = [
  {
    description: "사이트 생성 후 기본 페이지와 메뉴를 확인하고 필요한 서브페이지를 추가합니다.",
    href: "/dashboard/sites",
    icon: Globe2,
    steps: ["사이트 선택", "사이트맵 설정", "페이지 추가/숨김", "초안 미리보기"],
    title: "사이트와 페이지",
  },
  {
    description: "공지사항, 블로그, FAQ 글을 작성하고 공개 상태를 관리합니다.",
    href: "/dashboard/content/posts",
    icon: FileText,
    steps: ["새 게시물", "게시판 선택", "임시저장/게시", "공개 페이지 확인"],
    title: "게시글 운영",
  },
  {
    description: "방문자가 남긴 상담/견적 문의를 확인하고 처리 상태를 기록합니다.",
    href: "/dashboard/content/forms",
    icon: Inbox,
    steps: ["신규 문의 확인", "처리 중 변경", "내부 메모 저장", "CSV 내보내기"],
    title: "문의 관리",
  },
  {
    description: "사이트에서 사용할 이미지, 영상, 문서 파일을 업로드하고 URL을 복사합니다.",
    href: "/dashboard/content/media",
    icon: ImageIcon,
    steps: ["파일 업로드", "검색/필터", "URL 복사", "불필요한 파일 삭제"],
    title: "미디어 관리",
  },
  {
    description: "이벤트, 휴무, 중요 공지 팝업을 만들고 노출 기간을 설정합니다.",
    href: "/dashboard/content/popups",
    icon: Megaphone,
    steps: ["팝업 생성", "노출 위치 선택", "기간 설정", "활성/비활성 관리"],
    title: "팝업 운영",
  },
];

const launchChecklist = [
  "사이트맵 공개 메뉴 확인",
  "SEO 제목/설명 저장",
  "게시글 1개 이상 공개 테스트",
  "문의폼 접수 테스트",
  "모바일 화면 주요 버튼 확인",
  "게시 후 공개 주소 전달",
];

export default function DashboardHelpPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="rounded-2xl bg-zinc-950 px-6 py-8 text-white">
          <p className="text-sm font-medium text-blue-200">운영 가이드</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-normal">
            고객이 직접 운영해야 하는 기능만 빠르게 확인합니다.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
            디자인 편집은 추후 오픈하고, 현재 MVP에서는 사이트 관리, 게시글, 문의, 미디어,
            팝업 운영 흐름을 안정적으로 제공합니다.
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4">
            {guideSections.map((section) => {
              const Icon = section.icon;

              return (
                <Card className="rounded-xl" key={section.title}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="size-5" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {section.steps.map((step) => (
                        <span
                          className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                          key={step}
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" render={<Link href={section.href} />}>
                      이동
                      <ArrowRight />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>오픈 전 체크리스트</CardTitle>
                <CardDescription>사이트를 고객에게 전달하기 전 확인합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {launchChecklist.map((item) => (
                  <label className="flex items-start gap-2 text-sm" key={item}>
                    <input className="mt-1 size-4" type="checkbox" />
                    <span>{item}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-xl border-zinc-200 bg-zinc-950 text-white">
              <CardHeader>
                <CardTitle>고객 전달 문구</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
                <p>
                  사이트 제작이 완료되었습니다. 관리자에서 게시글, 문의, 이미지, 팝업을
                  직접 운영할 수 있습니다.
                </p>
                <p>
                  페이지 내용 변경이나 메뉴 추가가 필요하면 사이트 관리 메뉴에서 초안
                  미리보기 후 게시해주세요.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
