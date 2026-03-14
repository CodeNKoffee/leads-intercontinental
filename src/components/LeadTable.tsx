import { motion } from "framer-motion";
import { ExternalLink, Send, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Lead {
  id: string;
  name: string;
  city: string;
  sector: string;
  website: string;
  email: string;
  revenueLeak: number;
  status: "pending" | "deployed" | "replied" | "queued";
}

interface LeadTableProps {
  leads: Lead[];
  onDeploy: (id: string) => void;
}

const statusStyles: Record<Lead["status"], string> = {
  pending: "bg-secondary text-muted-foreground",
  queued: "bg-infra/10 text-infra border-infra/20",
  deployed: "bg-primary/10 text-primary border-primary/20",
  replied: "bg-success/10 text-success border-success/20",
};

const statusLabels: Record<Lead["status"], string> = {
  pending: "Pending",
  queued: "Queued",
  deployed: "Deployed",
  replied: "Replied",
};

export function LeadTable({ leads, onDeploy }: LeadTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_80px] gap-4 px-4 py-3 bg-surface-elevated text-xs font-semibold text-muted-foreground uppercase tracking-widest border-b border-border">
        <span>Business Name</span>
        <span>Location</span>
        <span>Sector</span>
        <span>Revenue Leak</span>
        <span>Status</span>
        <span></span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {leads.length === 0 && (
          <div className="px-4 py-12 text-center text-muted-foreground text-sm">
            No leads extracted yet. Select a sector and execute extraction.
          </div>
        )}
        {leads.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_80px] gap-4 px-4 py-3 items-center hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground">{lead.name}</span>
              {lead.website && (
                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-infra">
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{lead.city}</span>
            <span className="text-sm text-muted-foreground capitalize">{lead.sector}</span>
            <span className="font-mono text-sm text-primary font-medium">
              ${lead.revenueLeak.toLocaleString()}/mo
            </span>
            <Badge variant="outline" className={`text-xs ${statusStyles[lead.status]}`}>
              {statusLabels[lead.status]}
            </Badge>
            <div className="flex justify-end">
              {lead.status === "pending" ? (
                <Button variant="ghost_muted" size="sm" onClick={() => onDeploy(lead.id)}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button variant="ghost_muted" size="sm">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
