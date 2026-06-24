import { ContactSubmissionsManager } from "@/features/dashboard/contact-submissions-manager";
import { getDashboardContactSubmissions } from "@/features/dashboard/queries";

type DashboardFormsPageProps = {
  searchParams?: Promise<{
    notice?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function DashboardFormsPage({ searchParams }: DashboardFormsPageProps) {
  const query = await searchParams;
  const submissions = await getDashboardContactSubmissions();

  return (
    <ContactSubmissionsManager
      notice={firstSearchValue(query?.notice)}
      submissions={submissions}
    />
  );
}
