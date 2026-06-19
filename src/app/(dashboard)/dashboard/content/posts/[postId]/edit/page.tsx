import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContentPostEditor } from "@/features/dashboard/content-post-editor";
import {
  canUseContentPostDatabase,
  getDashboardContentBoards,
  getDashboardPost,
} from "@/features/dashboard/queries";

type Props = {
  params: Promise<{ postId: string }>;
};

export default async function DashboardEditPostPage({ params }: Props) {
  const { postId } = await params;
  const [post, canUseDatabase, boards] = await Promise.all([
    getDashboardPost(postId),
    canUseContentPostDatabase(),
    getDashboardContentBoards(),
  ]);

  if (!post) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <Button render={<Link href="/dashboard/content/posts" />} size="sm" variant="ghost">
            <ArrowLeft />
            게시글 목록
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">게시글을 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  return <ContentPostEditor boards={boards} post={post} useLocalFallback={!canUseDatabase} />;
}
