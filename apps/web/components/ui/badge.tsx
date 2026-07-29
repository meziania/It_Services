import type { ReactNode } from "react";

export type BadgeColor =
  | "slate"
  | "blue"
  | "teal"
  | "emerald"
  | "amber"
  | "red"
  | "violet"
  | "cyan"
  | "pink"
  | "indigo";

const COLOR_CLASSES: Record<BadgeColor, string> = {
  slate: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export function Badge({
  children,
  color = "slate",
  className = "",
}: {
  children: ReactNode;
  color?: BadgeColor;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${COLOR_CLASSES[color]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Dot({ color = "slate" }: { color?: BadgeColor }) {
  const dotClasses: Record<BadgeColor, string> = {
    slate: "bg-slate-400",
    blue: "bg-blue-500",
    teal: "bg-teal-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    violet: "bg-violet-500",
    cyan: "bg-cyan-500",
    pink: "bg-pink-500",
    indigo: "bg-indigo-500",
  };
  return <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[color]}`} />;
}
