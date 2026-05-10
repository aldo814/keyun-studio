import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  delta?: string;
};

export function MetricCard({ label, value, delta }: MetricCardProps) {
  return (
    <Card className="rounded-lg border-border bg-card shadow-sm">
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {delta ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              <ArrowUpRight className="size-3" />
              {delta}
            </span>
          ) : null}
        </div>
        <p className="mt-5 text-3xl font-semibold tracking-normal text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
