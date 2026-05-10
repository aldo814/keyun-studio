import { notFound } from "next/navigation";

import { EditorMvp } from "@/features/dashboard/editor-mvp";
import { getSiteEditorState } from "@/features/dashboard/queries";

type EditorPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { siteId } = await params;
  const state = await getSiteEditorState(siteId);

  if (!state) {
    notFound();
  }

  return <EditorMvp page={state.page} site={state.site} />;
}
