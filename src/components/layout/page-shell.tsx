type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageShell({ eyebrow, title, description }: PageShellProps) {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-balance sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      </section>
    </main>
  );
}
