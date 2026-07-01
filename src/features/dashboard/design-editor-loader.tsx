"use client";

import dynamic from "next/dynamic";

import type { Json } from "@/types/database";

type DesignEditorLoaderProps = {
  site: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  page: {
    id: string;
    draftJson: Json;
    path: string;
    title: string;
    updatedAt: string;
  };
  siteBoards: Array<{
    id: string | null;
    name: string;
  }>;
  sitePages: Array<{
    id: string;
    path: string;
    status: "public" | "private";
    title: string;
  }>;
};

const DynamicDesignEditor = dynamic(
  () => import("./design-editor").then((mod) => mod.DesignEditor),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        디자인 편집기를 불러오는 중입니다...
      </div>
    ),
    ssr: false,
  },
);

export function DesignEditorLoader(props: DesignEditorLoaderProps) {
  return <DynamicDesignEditor {...props} />;
}
