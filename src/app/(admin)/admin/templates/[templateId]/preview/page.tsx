import { redirect } from "next/navigation";

import { getAdminTemplate } from "@/features/admin/queries";

type AdminTemplatePreviewPageProps = {
  params: Promise<{
    templateId: string;
  }>;
};

function getSections(templateJson: unknown) {
  if (
    templateJson &&
    typeof templateJson === "object" &&
    "sections" in templateJson &&
    Array.isArray(templateJson.sections)
  ) {
    return templateJson.sections.map((section, index) => {
      if (typeof section === "string") {
        return {
          key: `${section}-${index}`,
          type: section,
          title: section,
          description: "섹션 내용을 구성하세요.",
        };
      }

      if (section && typeof section === "object") {
        const record = section as Record<string, unknown>;

        return {
          key: `${String(record.type ?? "section")}-${index}`,
          type: String(record.type ?? "section"),
          title: String(record.title ?? record.type ?? "Untitled"),
          description: String(
            record.description ?? record.subtitle ?? "섹션 내용을 구성하세요.",
          ),
        };
      }

      return {
        key: `section-${index}`,
        type: "section",
        title: "Untitled",
        description: "섹션 내용을 구성하세요.",
      };
    });
  }

  return [
    {
      key: "hero",
      type: "hero",
      title: "Hero",
      description: "섹션 내용을 구성하세요.",
    },
    {
      key: "features",
      type: "features",
      title: "Features",
      description: "섹션 내용을 구성하세요.",
    },
    {
      key: "cta",
      type: "cta",
      title: "CTA",
      description: "섹션 내용을 구성하세요.",
    },
  ];
}

export default async function AdminTemplatePreviewPage({
  params,
}: AdminTemplatePreviewPageProps) {
  const { templateId } = await params;
  const template = await getAdminTemplate(templateId);

  if (!template) {
    redirect("/admin/templates");
  }

  const sections = getSections(template.templateJson);

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {template.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="fixed inset-0 h-full w-full object-cover opacity-10"
          src={template.thumbnailUrl}
        />
      ) : null}
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Template Preview
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-normal text-balance">
          {template.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
          {template.description ||
            "템플릿 JSON을 기반으로 섹션 구조를 확인하는 운영 미리보기입니다."}
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.key}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-6"
            >
              <p className="text-sm font-medium text-zinc-500">{section.type}</p>
              <h2 className="mt-4 text-xl font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {section.description}
              </p>
              <div className="mt-6 h-28 rounded-md bg-white shadow-sm" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
