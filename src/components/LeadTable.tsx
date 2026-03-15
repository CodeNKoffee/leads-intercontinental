import { motion } from "framer-motion";
import { ExternalLink, Send, MoreHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface Lead {
  id: string;
  name: string;
  city: string;
  sector: string;
  website: string;
  email: string;
  revenueLeak: number;
  status: "pending" | "deployed" | "replied" | "queued";
  timezone?: string;
  isEnriched?: boolean;
  confidence?: number;
}

interface LeadTableProps {
  leads: Lead[];
  onDeploy: (id: string) => void;
  onViewDraft: (lead: Lead) => void;
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

export function LeadTable({ leads, onDeploy, onViewDraft }: LeadTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_1fr_100px] gap-4 px-4 py-3 bg-surface-elevated text-xs font-semibold text-muted-foreground uppercase tracking-widest border-b border-border">
        <span>Business Name</span>
        <span className="text-center">Location</span>
        <span className="text-center">Timezone</span>
        <span className="text-center">Sector</span>
        <span className="text-center">Revenue Leak</span>
        <span className="text-center">Status</span>
        <span className="text-right pr-2">Actions</span>
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
            className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_1fr_100px] gap-4 px-4 py-3 items-center hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-medium text-sm text-foreground truncate">{lead.name}</span>
              {lead.isEnriched && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                    </TooltipTrigger>
                    <TooltipContent>AI Enriched ({lead.confidence}%)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {lead.website && lead.website !== "#" && (
                <a 
                  href={lead.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-infra shrink-0"
                >
                  <ExternalLink className="h-3 w-3 inline-block align-middle mb-0.5" />
                </a>
              )}
            </div>
            <span className="text-sm text-muted-foreground text-center truncate">{lead.city}</span>
            <span className="text-xs text-muted-foreground truncate text-center font-mono">
              {lead.timezone || "N/A"}
            </span>
            <span className="text-sm text-muted-foreground capitalize text-center">{lead.sector}</span>
            <span className="font-mono text-sm text-primary font-medium text-center">
              ${lead.revenueLeak.toLocaleString()}/mo
            </span>
            <div className="flex justify-center">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statusStyles[lead.status]}`}>
                {statusLabels[lead.status]}
              </Badge>
            </div>
            <div className="flex justify-end gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost_muted" size="icon" className="h-8 w-8" onClick={() => onViewDraft(lead)}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Audit Draft</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {lead.status === "pending" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost_muted" size="icon" className="h-8 w-8 text-primary" onClick={() => onDeploy(lead.id)}>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Prepare Audit & Mark Sent</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {lead.status === "queued" && (
                <div className="h-8 w-8 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-infra animate-pulse" />
                </div>
              )}

              {(lead.status === "deployed" || lead.status === "replied") && (
                <div className="h-8 w-8 flex items-center justify-center">
                  <Send className="h-3 w-3 text-success/50" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
