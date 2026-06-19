import { ContentPostEditor } from "@/features/dashboard/content-post-editor";
import { canUseContentPostDatabase, getDashboardContentBoards } from "@/features/dashboard/queries";

export default async function DashboardNewPostPage() {
  const [canUseDatabase, boards] = await Promise.all([
    canUseContentPostDatabase(),
    getDashboardContentBoards(),
  ]);

  return <ContentPostEditor boards={boards} useLocalFallback={!canUseDatabase} />;
}
