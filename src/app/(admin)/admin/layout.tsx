import { redirect } from "next/navigation";

import { canAccessDesignMode } from "@/features/dashboard/queries";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const canAccessAdmin = await canAccessDesignMode();

  if (!canAccessAdmin) {
    redirect("/login?next=/admin");
  }

  return children;
}
