import Link from "next/link";
import { ArrowRight, Bell, BookOpen, Globe2, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCurrentDashboardProfile,
  getDashboardSites,
} from "@/features/dashboard/queries";

const operationGuides = [
  {
    description: "페이지 추가, 메뉴 노출, 공개 전 미리보기 흐름을 확인합니다.",
    href: "/dashboard/sites",
    title: "사이트와 페이지 관리",
  },
  {
    description: "게시글, 문의, 미디어, 팝업 운영 메뉴로 이동합니다.",
    href: "/dashboard/content",
    title: "콘텐츠 운영",
  },
  {
    description: "오픈 전 점검 항목은 문서와 대시보드 체크 카드에서 관리합니다.",
    href: "/dashboard",
    title: "오픈 전 체크",
  },
];

export default async function DashboardSettingsPage() {
  const [profile, sites] = await Promise.all([
    getCurrentDashboardProfile(),
    getDashboardSites(),
  ]);
  const publishedCount = sites.filter((site) => site.status === "published").length;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground">워크스페이스</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">설정</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            계정 상태와 운영에 필요한 기본 정보를 확인합니다.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="size-4" />
                계정
              </CardTitle>
              <CardDescription>현재 로그인한 관리자 정보</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{profile?.name || "관리자"}</p>
              <p className="text-muted-foreground">{profile?.email || "-"}</p>
              <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                {profile?.role === "super_admin" ? "슈퍼관리자" : "관리자"}
              </span>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe2 className="size-4" />
                사이트
              </CardTitle>
              <CardDescription>운영 중인 사이트 현황</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-3xl font-semibold">{sites.length.toLocaleString("ko-KR")}</p>
              <p className="text-muted-foreground">
                공개 {publishedCount.toLocaleString("ko-KR")}개 · 초안{" "}
                {(sites.length - publishedCount).toLocaleString("ko-KR")}개
              </p>
              <Button size="sm" variant="outline" render={<Link href="/dashboard/sites" />}>
                사이트 관리
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4" />
                권한
              </CardTitle>
              <CardDescription>디자인 메뉴 노출 기준</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">디자인 모드 접근 가능</p>
              <p className="leading-6 text-muted-foreground">
                로그인한 사이트 관리자는 베타 디자인 편집 기능을 사용할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5" />
              운영 알림 준비
            </CardTitle>
            <CardDescription>
              자동 이메일/메신저 알림 연동 전까지는 문의 메뉴에서 신규 문의를 확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold">문의 접수</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                신규 문의는 대시보드와 문의폼 화면 상단에서 확인합니다.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold">처리 상태</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                신규, 처리 중, 완료 상태와 내부 메모로 상담 이력을 남깁니다.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold">다음 고도화</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Resend 또는 카카오 알림톡 연동 시 이 영역에 수신 설정을 연결합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              고객 운영 가이드
            </CardTitle>
            <CardDescription>
              판매 후 고객에게 안내할 핵심 운영 동선을 관리자 안에서 바로 볼 수 있게 정리했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border rounded-lg border border-border p-0">
            {operationGuides.map((guide) => (
              <Link
                className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/40"
                href={guide.href}
                key={guide.title}
              >
                <div>
                  <p className="text-sm font-semibold">{guide.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {guide.description}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
