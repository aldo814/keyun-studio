export const roles = [
  "super_admin",
  "workspace_owner",
  "workspace_admin",
  "editor",
  "viewer",
] as const;

export type Role = (typeof roles)[number];
