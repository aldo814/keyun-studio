import { ContentPostsManager } from "@/features/dashboard/content-posts-manager";
import { canUseContentPostDatabase, getDashboardPosts } from "@/features/dashboard/queries";

export default async function DashboardPostsPage() {
  const [posts, canUseDatabase] = await Promise.all([
    getDashboardPosts(),
    canUseContentPostDatabase(),
  ]);

  return <ContentPostsManager posts={posts} useLocalFallback={!canUseDatabase} />;
}
