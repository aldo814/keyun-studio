import Link from "next/link";

import { StatusBadge } from "@/components/admin/status-badge";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSites } from "@/features/dashboard/queries";

export default async function SitesPage() {
  const sites = await getDashboardSites();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">내 사이트</h1>
          </div>
          <Button render={<Link href="/dashboard/sites/new" />}>새 사이트</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>전체 사이트</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{sites.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>공개</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {sites.filter((site) => site.status === "published").length}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>초안</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {sites.filter((site) => site.status === "draft").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <AdminTable
          columns={["사이트", "주소", "상태", "수정일", "관리"]}
          rows={sites.map((site) => [
            <Link
              key={site.id}
              className="font-medium text-foreground hover:underline"
              href={`/dashboard/sites/${site.id}`}
            >
              {site.name}
            </Link>,
            `/s/${site.slug}`,
            <StatusBadge key={site.status} tone={site.status}>
              {site.status}
            </StatusBadge>,
            site.updatedAt,
            <Button
              key={`${site.id}-settings`}
              size="sm"
              variant="outline"
              render={<Link href={`/dashboard/sites/${site.id}/settings`} />}
            >
              설정
            </Button>,
          ])}
        />
      </div>
    </main>
  );
}
