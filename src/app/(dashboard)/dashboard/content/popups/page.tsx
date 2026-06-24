import { PopupsManager } from "@/features/dashboard/popups-manager";
import { getDashboardPopups, getDashboardSites } from "@/features/dashboard/queries";

type DashboardPopupsPageProps = {
  searchParams?: Promise<{
    notice?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function DashboardPopupsPage({ searchParams }: DashboardPopupsPageProps) {
  const query = await searchParams;
  const [popups, dashboardSites] = await Promise.all([
    getDashboardPopups(),
    getDashboardSites(),
  ]);

  const sites = dashboardSites.map((site) => ({
    id: site.id,
    name: site.name,
    slug: site.slug,
    status: site.status,
  }));

  return (
    <PopupsManager
      notice={firstSearchValue(query?.notice)}
      popups={popups}
      sites={sites}
    />
  );
}
