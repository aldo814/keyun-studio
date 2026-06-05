import Link from "next/link";
import { ImageIcon, Inbox, Megaphone, Newspaper } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const contentItems = [
  {
    title: "게시글",
    description: "공지사항, 블로그, FAQ처럼 사이트에 노출되는 글을 관리합니다.",
    href: "/dashboard/content/posts",
    icon: Newspaper,
    metric: "12개 글",
  },
  {
    title: "문의폼",
    description: "상담 신청, 견적 문의, 일반 문의 응답을 확인합니다.",
    href: "/dashboard/content/forms",
    icon: Inbox,
    metric: "8개 응답",
  },
  {
    title: "미디어",
    description: "이미지와 파일을 업로드하고 사이트 섹션에 재사용합니다.",
    href: "/dashboard/content/media",
    icon: ImageIcon,
    metric: "34개 파일",
  },
  {
    title: "팝업",
    description: "기간, 노출 위치, 링크가 있는 운영 팝업을 관리합니다.",
    href: "/dashboard/content/popups",
    icon: Megaphone,
    metric: "2개 활성",
  },
];

export default function DashboardContentPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Dashboard / Content
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              콘텐츠 관리
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              디자인은 에디터에서 배치하고, 운영 중 자주 바뀌는 글과 응답,
              이미지, 팝업은 콘텐츠 메뉴에서 관리합니다.
            </p>
          </div>
          <Button render={<Link href="/dashboard/content/posts" />}>
            게시글 작성
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {contentItems.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.href} className="rounded-lg shadow-sm">
                <CardHeader>
                  <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="leading-6">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-600">
                    {item.metric}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={item.href} />}
                  >
                    관리
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
