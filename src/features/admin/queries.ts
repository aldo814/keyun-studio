import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Json } from "@/types/database";

import {
  logs as mockLogs,
  overviewStats as mockOverviewStats,
  sites as mockSites,
  reports as mockReports,
  subscriptions as mockSubscriptions,
  templates as mockTemplates,
  users as mockUsers,
  workspaces as mockWorkspaces,
} from "./data";

type WorkspaceMemberRow = {
  workspace_id: string;
  user_id: string;
  role: string;
};

type WorkspaceRow = {
  id: string;
  name: string;
  owner_id: string;
  plan: string;
  status: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  email: string;
  name: string | null;
  username?: string | null;
  role: string;
  created_at: string;
  visit_count?: number | null;
  last_seen_at?: string | null;
};

type SiteRow = {
  id: string;
  workspace_id: string;
  template_id: string | null;
  name: string;
  slug: string;
  status: string;
  published_url: string | null;
  updated_at: string;
};

type TemplateRow = {
  id: string;
  name: string;
  category_id: string | null;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  visibility: string;
  is_featured: boolean;
  template_json: Json;
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  name: string;
};

type AdminLogRow = {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  created_at: string;
};

type ReportRow = {
  id: string;
  site_id: string | null;
  target_label: string;
  reason: string;
  description: string | null;
  severity: string;
  status: string;
  resolution: string | null;
  created_at: string;
  updated_at: string;
};

type SubscriptionRow = {
  id: string;
  workspace_id: string | null;
  customer_label: string;
  plan: string;
  amount_krw: number;
  status: string;
  provider: string;
  provider_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPercent(used: number, total = 100) {
  if (!total) {
    return "0%";
  }

  return `${Math.min(100, Math.round((used / total) * 100))}%`;
}

async function countTable(table: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  return count ?? 0;
}

function normalizeTemplate(template: {
  id: string;
  name: string;
  category: string;
  visibility: string;
  used: number;
  status: string;
  description?: string;
  thumbnailUrl?: string;
  templateJson?: Json;
}) {
  return {
    ...template,
    description: template.description ?? "",
    thumbnailUrl: template.thumbnailUrl ?? "",
    templateJson: template.templateJson ?? {
      version: 1,
      sections: ["hero", "features", "pricing", "footer"],
      theme: "keyun-default",
    },
  };
}

function normalizeReport(report: {
  id: string;
  target: string;
  reason: string;
  severity: string;
  status: string;
  createdAt: string;
  siteId?: string | null;
  description?: string;
  resolution?: string;
  updatedAt?: string;
}) {
  return {
    ...report,
    siteId: report.siteId ?? null,
    description: report.description ?? "",
    resolution: report.resolution ?? "",
    updatedAt: report.updatedAt ?? report.createdAt,
  };
}

function normalizeSubscription(subscription: {
  id: string;
  customer: string;
  plan: string;
  amount: string;
  status: string;
  renewal: string;
  provider?: string;
  providerSubscriptionId?: string;
  workspaceId?: string | null;
  cancelAtPeriodEnd?: boolean;
}) {
  return {
    ...subscription,
    provider: subscription.provider ?? "stripe",
    providerSubscriptionId: subscription.providerSubscriptionId ?? "-",
    workspaceId: subscription.workspaceId ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
  };
}

export async function getAdminOverviewStats() {
  if (!hasSupabaseEnv()) {
    return mockOverviewStats;
  }

  const [userCount, workspaceCount, siteCount, templateCount] =
    await Promise.all([
      countTable("profiles"),
      countTable("workspaces"),
      countTable("sites"),
      countTable("templates"),
    ]);

  return [
    { label: "전체 사용자", value: userCount.toLocaleString("ko-KR"), delta: "DB 연결" },
    {
      label: "활성 워크스페이스",
      value: workspaceCount.toLocaleString("ko-KR"),
      delta: "Supabase",
    },
    {
      label: "전체 사이트",
      value: siteCount.toLocaleString("ko-KR"),
      delta: "실시간",
    },
    {
      label: "등록 템플릿",
      value: templateCount.toLocaleString("ko-KR"),
      delta: "라이브러리",
    },
  ];
}

export async function getAdminUsers() {
  if (!hasSupabaseEnv()) {
    return mockUsers.map((user) => ({
      ...user,
      visitCount: 0,
    }));
  }

  const supabase = await createClient();
  const [
    { data: enhancedProfiles, error: enhancedProfilesError },
    { data: members },
    { data: workspaces },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,name,username,role,created_at,visit_count,last_seen_at")
      .order("created_at", { ascending: false }),
    supabase.from("workspace_members").select("workspace_id,user_id,role"),
    supabase.from("workspaces").select("id,name,plan"),
  ]);

  const profiles = enhancedProfilesError
    ? (
        await supabase
          .from("profiles")
          .select("id,email,name,role,created_at")
          .order("created_at", { ascending: false })
      ).data
    : enhancedProfiles;

  const workspaceById = new Map(
    ((workspaces ?? []) as Array<Pick<WorkspaceRow, "id" | "name" | "plan">>).map(
      (workspace) => [workspace.id, workspace],
    ),
  );

  return ((profiles ?? []) as ProfileRow[]).map((profile) => {
    const member = ((members ?? []) as WorkspaceMemberRow[]).find(
      (item) => item.user_id === profile.id,
    );
    const workspace = member ? workspaceById.get(member.workspace_id) : null;

    return {
      id: profile.id,
      name: profile.name ?? profile.email,
      email: profile.email,
      username: profile.username ?? "-",
      role: member?.role ?? profile.role,
      workspace: workspace?.name ?? "-",
      plan: workspace?.plan ?? "-",
      status: profile.role === "admin" ? "admin" : "active",
      joinedAt: formatDateTime(profile.created_at),
      visitCount: profile.visit_count ?? 0,
      lastSeen: formatDateTime(profile.last_seen_at),
    };
  });
}

export async function getAdminUser(userId: string) {
  const users = await getAdminUsers();

  return users.find((user) => user.id === userId) ?? null;
}

export async function getAdminWorkspaces() {
  if (!hasSupabaseEnv()) {
    return mockWorkspaces;
  }

  const supabase = await createClient();
  const [
    { data: workspaceRows },
    { data: profiles },
    { data: members },
    { data: siteRows },
  ] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id,name,owner_id,plan,status,created_at")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,name,email"),
    supabase.from("workspace_members").select("workspace_id,user_id,role"),
    supabase.from("sites").select("id,workspace_id"),
  ]);

  const profileById = new Map(
    ((profiles ?? []) as Array<Pick<ProfileRow, "id" | "name" | "email">>).map(
      (profile) => [profile.id, profile],
    ),
  );

  return ((workspaceRows ?? []) as WorkspaceRow[]).map((workspace) => {
    const owner = profileById.get(workspace.owner_id);
    const memberCount = ((members ?? []) as WorkspaceMemberRow[]).filter(
      (member) => member.workspace_id === workspace.id,
    ).length;
    const siteCount = (
      (siteRows ?? []) as Array<Pick<SiteRow, "id" | "workspace_id">>
    ).filter((site) => site.workspace_id === workspace.id).length;

    return {
      id: workspace.id,
      name: workspace.name,
      owner: owner?.name ?? owner?.email ?? "-",
      members: memberCount,
      sites: siteCount,
      plan: workspace.plan,
      usage: formatPercent(siteCount, 10),
      status: workspace.status,
    };
  });
}

export async function getAdminWorkspace(workspaceId: string) {
  const workspaces = await getAdminWorkspaces();

  return workspaces.find((workspace) => workspace.id === workspaceId) ?? null;
}

export async function getAdminSites() {
  if (!hasSupabaseEnv()) {
    return mockSites;
  }

  const supabase = await createClient();
  const [{ data: siteRows }, { data: workspaceRows }] = await Promise.all([
    supabase
      .from("sites")
      .select("id,workspace_id,template_id,name,slug,status,published_url,updated_at")
      .order("updated_at", { ascending: false }),
    supabase.from("workspaces").select("id,name"),
  ]);

  const workspaceById = new Map(
    ((workspaceRows ?? []) as Array<Pick<WorkspaceRow, "id" | "name">>).map(
      (workspace) => [workspace.id, workspace],
    ),
  );

  return ((siteRows ?? []) as SiteRow[]).map((site) => ({
    id: site.id,
    name: site.name,
    owner: workspaceById.get(site.workspace_id)?.name ?? "-",
    slug: site.slug,
    status: site.status,
    domain: site.published_url ?? "-",
    updatedAt: formatDateTime(site.updated_at),
    lastDeploy: site.status === "published" ? "공개됨" : "대기",
  }));
}

export async function getAdminSite(siteId: string) {
  const sites = await getAdminSites();

  return sites.find((site) => site.id === siteId) ?? null;
}

export async function getAdminReports() {
  if (!hasSupabaseEnv()) {
    return mockReports.map(normalizeReport);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select(
      "id,site_id,target_label,reason,description,severity,status,resolution,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  return ((data ?? []) as ReportRow[]).map((report) => ({
    id: report.id,
    siteId: report.site_id,
    target: report.target_label,
    reason: report.reason,
    description: report.description ?? "",
    severity: report.severity,
    status: report.status,
    resolution: report.resolution ?? "",
    createdAt: formatDateTime(report.created_at),
    updatedAt: formatDateTime(report.updated_at),
  }));
}

export async function getAdminReport(reportId: string) {
  const reports = await getAdminReports();

  return reports.find((report) => report.id === reportId) ?? null;
}

export async function getAdminTemplates() {
  if (!hasSupabaseEnv()) {
    return mockTemplates.map(normalizeTemplate);
  }

  const supabase = await createClient();
  const [{ data: templateRows }, { data: categories }, { data: siteRows }] =
    await Promise.all([
      supabase
        .from("templates")
        .select(
          "id,name,category_id,description,thumbnail_url,status,visibility,is_featured,template_json,created_at,updated_at",
        )
        .order("updated_at", { ascending: false }),
      supabase.from("template_categories").select("id,name"),
      supabase.from("sites").select("id,template_id"),
    ]);

  const categoryById = new Map(
    ((categories ?? []) as CategoryRow[]).map((category) => [
      category.id,
      category.name,
    ]),
  );

  return ((templateRows ?? []) as TemplateRow[]).map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    thumbnailUrl: template.thumbnail_url ?? "",
    templateJson: template.template_json,
    category: template.category_id
      ? categoryById.get(template.category_id) ?? "-"
      : "-",
    visibility: template.visibility,
    used: ((siteRows ?? []) as Array<Pick<SiteRow, "id" | "template_id">>).filter(
      (site) => site.template_id === template.id,
    ).length,
    status: template.is_featured ? "featured" : template.status,
  }));
}

export async function getAdminTemplate(templateId: string) {
  const templates = await getAdminTemplates();

  return templates.find((template) => template.id === templateId) ?? null;
}

export async function getAdminSubscriptions() {
  if (!hasSupabaseEnv()) {
    return mockSubscriptions.map(normalizeSubscription);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "id,workspace_id,customer_label,plan,amount_krw,status,provider,provider_subscription_id,current_period_end,cancel_at_period_end",
    )
    .order("current_period_end", { ascending: true, nullsFirst: false });

  return ((data ?? []) as SubscriptionRow[]).map((subscription) => ({
    id: subscription.id,
    workspaceId: subscription.workspace_id,
    customer: subscription.customer_label,
    plan: subscription.plan,
    amount: `₩${subscription.amount_krw.toLocaleString("ko-KR")}`,
    status: subscription.status,
    provider: subscription.provider,
    providerSubscriptionId: subscription.provider_subscription_id ?? "-",
    renewal: subscription.current_period_end
      ? formatDateTime(subscription.current_period_end)
      : "-",
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  }));
}

export async function getAdminLogs() {
  if (!hasSupabaseEnv()) {
    return mockLogs;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_logs")
    .select("id,actor_id,action,target_type,target_id,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return ((data ?? []) as AdminLogRow[]).map((log) => ({
    id: log.id,
    actor: log.actor_id ?? "system",
    action: log.action,
    target: log.target_id ?? log.target_type,
    createdAt: formatDateTime(log.created_at),
  }));
}
