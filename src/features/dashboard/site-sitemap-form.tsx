import Link from "next/link";

import { ArrowLeft, ExternalLink, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createSiteSitemapPage,
  updateSiteSitemapPage,
} from "@/features/dashboard/actions";
import {
  flattenSitemapPages,
  getLocaleValue,
} from "@/features/dashboard/site-sitemap-manager";
import type { DashboardSitePage } from "@/features/dashboard/queries";

type SiteSummary = {
  id: string;
  name: string;
};

type SiteSitemapFormProps = {
  mode: "create" | "edit";
  page?: DashboardSitePage;
  pages: DashboardSitePage[];
  parentId?: string | null;
  site: SiteSummary;
};

const pageTypeOptions = [
  { label: "자동연결", value: "auto" },
  { label: "직접작성", value: "custom" },
  { label: "게시판", value: "board" },
  { label: "외부링크", value: "external" },
];

const layoutOptions = [
  { label: "= 선택 =", value: "" },
  { label: "기본 서브 레이아웃", value: "default" },
  { label: "넓은 콘텐츠", value: "wide" },
  { label: "게시판형", value: "board" },
  { label: "문의형", value: "contact" },
];

export function SiteSitemapForm({
  mode,
  page,
  pages,
  parentId,
  site,
}: SiteSitemapFormProps) {
  const flatPages = flattenSitemapPages(pages);
  const isEdit = mode === "edit";
  const isHome = page?.path === "/";
  const action = isEdit ? updateSiteSitemapPage : createSiteSitemapPage;
  const parentOptions = flatPages.filter(
    (item) => item.level < 3 && item.id !== page?.id && item.path !== "/",
  );
  const selectedParentId = page?.parentId ?? parentId ?? "";
  const defaultMenuCode = page?.menuCode ?? "";
  const defaultMenuName = page?.menuName ?? "";
  const defaultType = page?.pageType ?? "auto";
  const defaultLayout = page?.subLayout ?? "";

  return (
    <form action={action} className="space-y-6">
      <input name="site_id" type="hidden" value={site.id} />
      {page?.id ? <input name="page_id" type="hidden" value={page.id} /> : null}

      <Card className="rounded-lg border-border bg-card">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{isEdit ? "사이트맵 수정" : "사이트맵 추가"}</CardTitle>
              <CardDescription>
                메뉴 주소와 제목을 입력하면 사용자 사이트의 페이지 구조로 저장됩니다.
              </CardDescription>
            </div>
            {page?.id ? (
              <Button
                size="sm"
                type="button"
                variant="outline"
                render={<Link href={`/dashboard/preview/${site.id}?pageId=${page.id}`} target="_blank" />}
              >
                <ExternalLink />
                초안 미리보기
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">페이지 종류</span>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={defaultType}
                name="page_type"
              >
                {pageTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">상위 메뉴</span>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={selectedParentId}
                disabled={isHome}
                name="parent_id"
              >
                <option value="">1차 메뉴로 등록</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {"— ".repeat(Math.max(option.level - 1, 0))}
                    {option.menuName}
                  </option>
                ))}
              </select>
              {isHome ? (
                <input name="parent_id" type="hidden" value="" />
              ) : null}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">메뉴코드(주소)</span>
              <Input
                defaultValue={isHome ? "home" : defaultMenuCode}
                name="menu_code"
                readOnly={isHome}
                required
              />
              <span className="block text-xs text-muted-foreground">
                예: company, products, support. 메인은 home으로 고정됩니다.
              </span>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">메뉴명(타이틀)</span>
              <Input defaultValue={defaultMenuName} name="menu_name" required />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">서브 레이아웃</span>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={defaultLayout}
                name="sub_layout"
              >
                {layoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="block text-xs text-muted-foreground">
                추후 디자인 모드가 열리면 선택한 레이아웃 기준으로 페이지 템플릿을 연결합니다.
              </span>
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <input
              className="mt-1 size-4 rounded border-border accent-zinc-950"
              defaultChecked={page?.isHidden ?? false}
              disabled={isHome}
              name="is_hidden"
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-semibold">메뉴 노출 여부: 숨김</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                체크하면 사이트 메뉴에서 해당 메뉴를 보이지 않게 설정합니다. 메인 페이지는 항상 노출됩니다.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-border bg-card">
        <CardHeader>
          <CardTitle>페이지 내용</CardTitle>
          <CardDescription>
            디자인 모드 없이도 공개 페이지에 보여줄 기본 콘텐츠를 입력합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="space-y-2">
            <span className="text-sm font-medium">페이지 제목</span>
            <Input
              defaultValue={page?.contentTitle || defaultMenuName}
              name="content_title"
              placeholder="예: 회사소개"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">요약 문구</span>
            <Textarea
              className="min-h-24"
              defaultValue={page?.summary ?? ""}
              name="content_summary"
              placeholder="페이지 상단에 노출될 짧은 설명을 입력하세요."
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">본문</span>
            <Textarea
              className="min-h-52"
              defaultValue={page?.bodyText ?? ""}
              name="content_body"
              placeholder={`예: ${site.name}는 고객의 성장을 돕는 서비스를 제공합니다.`}
            />
            <span className="block text-xs text-muted-foreground">
              줄바꿈은 공개 페이지에 그대로 반영됩니다. 세부 디자인은 추후 디자인 모드에서 고도화할 수 있습니다.
            </span>
          </label>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-border bg-card">
        <CardHeader>
          <CardTitle>다국어 설정</CardTitle>
          <CardDescription>
            메뉴명과 링크를 입력한 언어만 노출됩니다. 비워두면 기본 메뉴명을 사용합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-2">
          {[
            { label: "다국어설정 (eng)", locale: "eng" as const },
            { label: "다국어설정 (chn)", locale: "chn" as const },
          ].map((item) => (
            <div key={item.locale} className="space-y-4 rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">{item.label}</p>
              <label className="space-y-2">
                <span className="text-sm font-medium">메뉴명</span>
                <Input
                  defaultValue={getLocaleValue(page?.localeJson ?? {}, item.locale, "menuName")}
                  name={`locale_${item.locale}_menu_name`}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">링크</span>
                <Input
                  defaultValue={getLocaleValue(page?.localeJson ?? {}, item.locale, "link")}
                  name={`locale_${item.locale}_link`}
                  placeholder="https:// 또는 /path"
                />
              </label>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    className="size-4 rounded border-border accent-zinc-950"
                    defaultChecked={getLocaleValue(page?.localeJson ?? {}, item.locale, "hidden") === "on"}
                    name={`locale_${item.locale}_hidden`}
                    type="checkbox"
                  />
                  숨김
                </label>
                <label className="flex items-center gap-2">
                  <input
                    className="size-4 rounded border-border accent-zinc-950"
                    defaultChecked={getLocaleValue(page?.localeJson ?? {}, item.locale, "deleted") === "on"}
                    name={`locale_${item.locale}_deleted`}
                    type="checkbox"
                  />
                  삭제
                </label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          render={<Link href={`/dashboard/sites/${site.id}/sitemap`} />}
        >
          <ArrowLeft />
          취소
        </Button>
        <Button type="submit">
          <Save />
          저장
        </Button>
      </div>
    </form>
  );
}
