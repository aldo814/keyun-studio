import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneClasses = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  featured: "border-blue-200 bg-blue-50 text-blue-700",
  review: "border-amber-200 bg-amber-50 text-amber-700",
  reviewing: "border-amber-200 bg-amber-50 text-amber-700",
  open: "border-rose-200 bg-rose-50 text-rose-700",
  suspended: "border-rose-200 bg-rose-50 text-rose-700",
  past_due: "border-rose-200 bg-rose-50 text-rose-700",
  limit: "border-orange-200 bg-orange-50 text-orange-700",
  draft: "border-zinc-200 bg-zinc-100 text-zinc-700",
  private: "border-zinc-200 bg-zinc-100 text-zinc-700",
  public: "border-cyan-200 bg-cyan-50 text-cyan-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
} as const;

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses | string;
};

export function StatusBadge({ children, tone = "draft" }: StatusBadgeProps) {
  const normalizedTone =
    tone in toneClasses ? (tone as keyof typeof toneClasses) : "draft";

  return (
    <Badge
      variant="outline"
      className={cn("h-7 rounded-full px-2.5", toneClasses[normalizedTone])}
    >
      {children}
    </Badge>
  );
}
