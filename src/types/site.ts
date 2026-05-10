export type SiteStatus = "draft" | "published" | "suspended";

export type Site = {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  status: SiteStatus;
};
