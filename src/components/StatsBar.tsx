import { TrendingUp, Users, DollarSign, Send } from "lucide-react";

interface StatsBarProps {
  totalLeads: number;
  totalLeak: number;
  deployed: number;
  frictionIndex: number;
  intelligenceScore: number;
  isExtracting: boolean;
}

const stats = (p: StatsBarProps) => [
  { label: "Total HVTs", value: p.totalLeads.toString(), icon: Users, accent: false },
  { label: "Revenue Leak Pool", value: `$${p.totalLeak.toLocaleString()}`, icon: DollarSign, accent: true },
  { label: "Audits Deployed", value: p.deployed.toString(), icon: Send, accent: false },
  { label: "Intelligence Score", value: `${Math.round(p.intelligenceScore)}%`, icon: TrendingUp, accent: false },
];

export function StatsBar(props: StatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats(props).map((s) => (
        <div key={s.label} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</span>
            <div className="flex items-center gap-2">
              {s.label === "Intelligence Score" && props.isExtracting && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
              <s.icon className={`h-4 w-4 ${s.accent ? "text-primary" : "text-muted-foreground"}`} />
            </div>
          </div>
          <p className={`text-xl font-bold font-mono ${s.accent ? "text-primary" : "text-foreground"}`}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
