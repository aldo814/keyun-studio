import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  getCurrentDashboardProfile,
  getDashboardSites,
} from "@/features/dashboard/queries";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const [profile, sites] = await Promise.all([
    getCurrentDashboardProfile(),
    getDashboardSites(),
  ]);

  if (!profile) {
    redirect("/login?next=/dashboard");
  }

  const canAccessDesign = profile?.role === "super_admin";

  return (
    <DashboardShell canAccessDesign={canAccessDesign} profile={profile} sites={sites}>
      {children}
    </DashboardShell>
  );
}
