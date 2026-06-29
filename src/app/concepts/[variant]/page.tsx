import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Home from "@/app/page";
import { ConceptSwitcher } from "@/components/marketing/concept-switcher";
import { Interactive3DLanding } from "@/components/marketing/interactive-3d-landing";
import { TemplateShowcaseLanding } from "@/components/marketing/template-showcase-landing";

const variants = ["product-first", "interactive-3d", "template-showcase"] as const;
type Variant = (typeof variants)[number];

function isVariant(value: string): value is Variant {
  return variants.includes(value as Variant);
}

export function generateStaticParams() {
  return variants.map((variant) => ({ variant }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variant: string }>;
}): Promise<Metadata> {
  const { variant } = await params;
  const names: Record<Variant, string> = {
    "product-first": "A · Product First",
    "interactive-3d": "B · Interactive 3D",
    "template-showcase": "C · Template Showcase",
  };

  if (!isVariant(variant)) return {};

  return {
    title: `${names[variant]} 시안`,
    robots: { index: false, follow: false },
  };
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;

  if (!isVariant(variant)) notFound();

  return (
    <>
      {variant === "product-first" && <Home />}
      {variant === "interactive-3d" && <Interactive3DLanding />}
      {variant === "template-showcase" && <TemplateShowcaseLanding />}
      <ConceptSwitcher active={variant} />
    </>
  );
}
