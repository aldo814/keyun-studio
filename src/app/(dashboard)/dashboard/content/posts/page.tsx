import { ContentPostsManager } from "@/features/dashboard/content-posts-manager";
import { canUseContentPostDatabase, getDashboardPosts } from "@/features/dashboard/queries";

type DashboardPostsPageProps = {
  searchParams?: Promise<{
    notice?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function DashboardPostsPage({ searchParams }: DashboardPostsPageProps) {
  const query = await searchParams;
  const [posts, canUseDatabase] = await Promise.all([
    getDashboardPosts(),
    canUseContentPostDatabase(),
  ]);

  return (
    <ContentPostsManager
      notice={firstSearchValue(query?.notice)}
      posts={posts}
      useLocalFallback={!canUseDatabase}
    />
  );
}
