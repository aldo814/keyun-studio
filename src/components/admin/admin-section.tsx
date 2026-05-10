type AdminSectionProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminSection({
  title,
  description,
  action,
  children,
}: AdminSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
