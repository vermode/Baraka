import type { LucideIcon } from "lucide-react";

interface StatBoxProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
}

/** One of the small summary cards at the top of the admin dashboard. */
export function StatBox({ icon: Icon, label, value }: StatBoxProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-extrabold">
          {typeof value === "number" ? value.toLocaleString("en-US") : value}
        </div>
      </div>
    </div>
  );
}
