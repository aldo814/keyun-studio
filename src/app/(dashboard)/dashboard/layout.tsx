import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentDashboardProfile } from "@/features/dashboard/queries";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const profile = await getCurrentDashboardProfile();
  const canAccessDesign = profile?.role === "super_admin";

  return (
    <DashboardShell canAccessDesign={canAccessDesign} profile={profile}>
      {children}
    </DashboardShell>
  );
}
