import { notFound, redirect } from "next/navigation";

import { DesignEditorLoader } from "@/features/dashboard/design-editor-loader";
import { canAccessDesignMode, getSiteEditorState } from "@/features/dashboard/queries";

type EditorPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const canAccessDesign = await canAccessDesignMode();

  if (!canAccessDesign) {
    redirect("/dashboard/content");
  }

  const { siteId } = await params;
  const state = await getSiteEditorState(siteId);

  if (!state) {
    notFound();
  }

  return <DesignEditorLoader page={state.page} site={state.site} />;
}
