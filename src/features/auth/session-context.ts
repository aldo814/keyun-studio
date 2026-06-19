type WorkspaceMembersQuery = {
  select: (columns: string) => {
    eq: (
      column: string,
      value: string,
    ) => PromiseLike<{
      data?: Array<{ workspace_id?: string | null }> | null;
      error?: unknown;
    }>;
  };
};

type SitesQuery = {
  select: (columns: string) => {
    in: (
      column: string,
      values: string[],
    ) => {
      limit: (count: number) => PromiseLike<{
        data?: Array<{ id?: string | null }> | null;
        error?: unknown;
      }>;
    };
  };
};

type SupabaseClientLike = {
  from: (table: string) => unknown;
};

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export async function hasAnySiteForUser(
  supabase: SupabaseClientLike,
  userId: string,
) {
  const workspaceMembers = supabase.from("workspace_members") as WorkspaceMembersQuery;
  const { data: memberRows, error: memberError } = await workspaceMembers
    .select("workspace_id")
    .eq("user_id", userId);

  if (memberError || !memberRows?.length) {
    return false;
  }

  const workspaceIds = memberRows
    .map((member) => member.workspace_id)
    .filter(isString);

  if (!workspaceIds.length) {
    return false;
  }

  const sites = supabase.from("sites") as SitesQuery;
  const { data: siteRows, error: siteError } = await sites
    .select("id")
    .in("workspace_id", workspaceIds)
    .limit(1);

  if (siteError) {
    return true;
  }

  return Boolean(siteRows?.length);
}
