import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Target, Activity, Settings, ChevronDown, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const sectors = [
  { id: "healthcare", label: "Healthcare", cities: ["Lagos", "Nairobi", "Accra"] },
  { id: "fintech", label: "Fintech Agents", cities: ["Lagos", "Nairobi"] },
  { id: "wellness", label: "Wellness/Beauty", cities: ["Lagos", "Nairobi"] },
  { id: "hubs", label: "Business Hubs", cities: ["Lagos", "Nairobi", "Accra"] },
];

interface CommandSidebarProps {
  activeSector: string;
  onSectorChange: (sector: string) => void;
  onExecute: () => void;
  isExtracting: boolean;
  leadCount: number;
  onExportAll: () => void;
}

export function CommandSidebar({ activeSector, onSectorChange, onExecute, isExtracting, leadCount, onExportAll }: CommandSidebarProps) {
  const [sectorOpen, setSectorOpen] = useState(true);

  return (
    <aside className="w-[260px] min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-lg font-black tracking-tight text-primary">TAWABIRY</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 tracking-wide">SOVEREIGN COMMAND CENTER</p>
      </div>

      {/* Sector Selector */}
      <div className="p-4 flex-1">
        <button
          onClick={() => setSectorOpen(!sectorOpen)}
          className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3"
        >
          Target Sectors
          <ChevronDown className={`h-3 w-3 transition-transform ${sectorOpen ? "rotate-0" : "-rotate-90"}`} />
        </button>

        {sectorOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-1"
          >
            {sectors.map((s) => (
              <button
                key={s.id}
                onClick={() => onSectorChange(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-all flex items-center gap-2 ${
                  activeSector === s.id
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Target className="h-3.5 w-3.5" />
                {s.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Stats */}
        <div className="mt-8 space-y-4">
          <div className="px-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Active Leads</p>
            <p className="text-2xl font-bold text-foreground font-mono">{leadCount}</p>
          </div>
          <div className="px-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Storage</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm text-foreground">IndexedDB (Local)</span>
            </div>
          </div>
          <div className="px-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isExtracting ? "bg-primary animate-sovereign-pulse" : "bg-success"}`} />
              <span className="text-sm text-foreground">{isExtracting ? "Extracting..." : "Ready"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="sovereign"
          className="w-full"
          onClick={onExecute}
          disabled={isExtracting}
        >
          <Activity className="h-4 w-4" />
          {isExtracting ? "EXTRACTING..." : "EXECUTE EXTRACTION"}
        </Button>
        <Button
          variant="tactical"
          className="w-full"
          onClick={onExportAll}
          disabled={leadCount === 0}
        >
          <FileDown className="h-4 w-4" />
          EXPORT ALL CSV
        </Button>
        <Button variant="ghost_muted" className="w-full justify-start" size="sm">
          <Settings className="h-3.5 w-3.5" />
          Configuration
        </Button>
      </div>
    </aside>
  );
}
