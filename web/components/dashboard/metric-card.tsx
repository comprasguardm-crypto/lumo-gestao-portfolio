import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
  tone?: "default" | "positive" | "warning" | "ai";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-slate-100 text-lumo-ink",
    positive: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    ai: "bg-violet-50 text-lumo-ai",
  };

  return (
    <Card className="transition-shadow hover:shadow-popover">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-lumo-slate">{label}</p>
          <p className="font-display text-2xl font-semibold text-lumo-ink">{value}</p>
          {helper && <p className="text-xs text-lumo-slate">{helper}</p>}
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]", toneClasses[tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </CardContent>
    </Card>
  );
}
