import type { LucideIcon } from "lucide-react";
import { Card } from "./card";

const ICON_BG: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-400",
  teal: "bg-teal-500/10 text-teal-400",
  emerald: "bg-emerald-500/10 text-emerald-400",
  amber: "bg-amber-500/10 text-amber-400",
  red: "bg-red-500/10 text-red-400",
  violet: "bg-violet-500/10 text-violet-400",
  slate: "bg-slate-500/10 text-slate-400",
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  color = "blue",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  color?: keyof typeof ICON_BG;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${ICON_BG[color]}`}>
          <Icon className="h-4.5 w-4.5" strokeWidth={2} size={18} />
        </span>
      </div>
    </Card>
  );
}
