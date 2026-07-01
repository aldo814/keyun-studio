import { notFound } from "next/navigation";

import { DesignEditorLoader } from "@/features/dashboard/design-editor-loader";
import {
  getDashboardContentBoards,
  getSiteEditorState,
} from "@/features/dashboard/queries";

type EditorPageProps = {
  params: Promise<{
    siteId: string;
  }>;
  searchParams?: Promise<{
    pageId?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function EditorPage({ params, searchParams }: EditorPageProps) {
  const { siteId } = await params;
  const query = await searchParams;
  const [state, boards] = await Promise.all([
    getSiteEditorState(siteId, firstSearchValue(query?.pageId)),
    getDashboardContentBoards(),
  ]);

  if (!state) {
    notFound();
  }

  return (
    <DesignEditorLoader
      key={state.page.id}
      page={state.page}
      site={state.site}
      siteBoards={boards
        .filter((board) => board.siteId === siteId)
        .map((board) => ({ id: board.id, name: board.name }))}
      sitePages={state.sitePages}
    />
  );
}
