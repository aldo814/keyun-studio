import { MediaManager } from "@/features/dashboard/media-manager";
import { getDashboardMediaAssets } from "@/features/dashboard/queries";

type DashboardMediaPageProps = {
  searchParams?: Promise<{
    notice?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function DashboardMediaPage({ searchParams }: DashboardMediaPageProps) {
  const query = await searchParams;
  const assets = await getDashboardMediaAssets();

  return <MediaManager assets={assets} notice={firstSearchValue(query?.notice)} />;
}
