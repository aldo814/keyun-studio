import type { Role } from "./roles";

export function canAccessSuperAdmin(role: Role) {
  return role === "super_admin";
}

export function canManageWorkspace(role: Role) {
  return ["super_admin", "workspace_owner", "workspace_admin"].includes(role);
}

export function canEditSite(role: Role) {
  return [
    "super_admin",
    "workspace_owner",
    "workspace_admin",
    "editor",
  ].includes(role);
}
