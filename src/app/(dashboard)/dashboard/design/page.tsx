import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock, FileText, ImageIcon, Inbox, Megaphone, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { canAccessDesignMode } from "@/features/dashboard/queries";
const currentAdminItems = [
  {
    title: "게시글 관리",
    description: "공지사항, 블로그, FAQ를 먼저 안정적으로 운영합니다.",
    href: "/dashboard/content/posts",
    icon: FileText,
  },
  {
    title: "문의폼",
    description: "접수된 문의와 상담 신청을 확인합니다.",
    href: "/dashboard/content/forms",
    icon: Inbox,
  },
  {
    title: "미디어",
    description: "게시글과 팝업에 사용할 이미지를 관리합니다.",
    href: "/dashboard/content/media",
    icon: ImageIcon,
  },
  {
    title: "팝업",
    description: "이벤트와 공지 팝업을 운영합니다.",
    href: "/dashboard/content/popups",
    icon: Megaphone,
  },
];

export default async function DashboardDesignPage() {
  const canAccessDesign = await canAccessDesignMode();

  if (!canAccessDesign) {
    redirect("/dashboard/content");
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                <Clock className="size-3.5" />
                추후 오픈 예정
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">
                디자인 모드는 준비 중입니다
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                현재 판매용 관리자에서는 게시글, 문의폼, 미디어, 팝업 운영 기능을
                먼저 제공합니다. 테마, 페이지 디자인, 파비콘, 홈페이지 이름 적용은
                다음 오픈 범위에서 연결할 예정입니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button render={<Link href="/dashboard/content/posts" />}>
                  콘텐츠 관리로 이동
                  <ArrowRight />
                </Button>
                <Button variant="outline" render={<Link href="/dashboard" />}>
                  대시보드로 돌아가기
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
              <div className="flex size-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Palette className="size-6" />
              </div>
              <p className="mt-5 text-sm font-semibold">디자인 오픈 범위</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>테마 색상과 무료 폰트 설정</li>
                <li>홈페이지 이름과 파비콘 적용</li>
                <li>섹션 기반 디자인 편집</li>
                <li>게시 전 디자인 미리보기</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3">
            <p className="text-sm font-semibold">지금 먼저 사용할 관리자 기능</p>
            <p className="mt-1 text-xs text-muted-foreground">
              초기 판매 버전에서는 콘텐츠 운영 기능을 중심으로 제공합니다.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {currentAdminItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-xl border border-border bg-white p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
