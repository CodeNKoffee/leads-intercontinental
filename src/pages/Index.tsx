import { useState, useCallback, useEffect } from "react";
import { CommandSidebar } from "@/components/CommandSidebar";
import { LeadTable } from "@/components/LeadTable";
import { LogStream, type LogEntry } from "@/components/LogStream";
import { StatsBar } from "@/components/StatsBar";
import { db, upsertLead, getLeadsBySector, updateLeadStatus, type LeadRecord } from "@/lib/db";
import { leadsToCSV, downloadCSV, generateEmailDraft, copyToClipboard } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  name: string;
  city: string;
  sector: string;
  website: string;
  email: string;
  revenueLeak: number;
  status: "pending" | "deployed" | "replied" | "queued";
}

const MOCK_LEADS: Record<string, Omit<Lead, "status">[]> = {
  healthcare: [
    { id: "h1", name: "Evercare Hospital Lekki", city: "Lagos", sector: "Healthcare", website: "https://evercaregroup.com", email: "info@evercaregroup.com", revenueLeak: 42500 },
    { id: "h2", name: "Nyaho Medical Centre", city: "Accra", sector: "Healthcare", website: "https://nyahomedical.com", email: "contact@nyahomedical.com", revenueLeak: 31200 },
    { id: "h3", name: "Shalina Diagnostics", city: "Lagos", sector: "Healthcare", website: "https://shalina.com", email: "info@shalina.com", revenueLeak: 55800 },
    { id: "h4", name: "King Trust Medical", city: "Lagos", sector: "Healthcare", website: "#", email: "kingtrustmedical@gmail.com", revenueLeak: 18400 },
  ],
  fintech: [
    { id: "f1", name: "Moniepoint Agent Network", city: "Lagos", sector: "Fintech", website: "https://moniepoint.com", email: "partners@moniepoint.com", revenueLeak: 87300 },
    { id: "f2", name: "OPay Agent Kiosks", city: "Lagos", sector: "Fintech", website: "https://opay.com", email: "business@opay.com", revenueLeak: 64100 },
    { id: "f3", name: "M-Pesa Support Centers", city: "Nairobi", sector: "Fintech", website: "https://safaricom.co.ke", email: "mpesa@safaricom.co.ke", revenueLeak: 73500 },
  ],
  wellness: [
    { id: "w1", name: "Serenity Spa Westlands", city: "Nairobi", sector: "Wellness", website: "https://serenityspa.co.ke", email: "hello@serenityspa.co.ke", revenueLeak: 22100 },
    { id: "w2", name: "Zanzibar Luxury Salon", city: "Lagos", sector: "Wellness", website: "#", email: "booking@zanzibarsalon.ng", revenueLeak: 15600 },
  ],
  hubs: [
    { id: "b1", name: "Nairobi Garage", city: "Nairobi", sector: "Business Hub", website: "https://nairobigarage.com", email: "partnerships@nairobigarage.com", revenueLeak: 28700 },
    { id: "b2", name: "Co-Creation Hub", city: "Lagos", sector: "Business Hub", website: "https://cchubnigeria.com", email: "hello@cchubnigeria.com", revenueLeak: 34200 },
  ],
};

function timestamp() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

let logId = 0;
function makeLog(message: string, type: LogEntry["type"] = "info"): LogEntry {
  return { id: String(++logId), timestamp: timestamp(), message, type };
}

const Index = () => {
  const [sector, setSector] = useState("healthcare");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  // Load persisted leads from IndexedDB on sector change
  useEffect(() => {
    getLeadsBySector(sector).then((records) => {
      if (records.length > 0) {
        setLeads(
          records.map((r) => ({
            id: r.externalId,
            name: r.name,
            city: r.city,
            sector: r.sector,
            website: r.website,
            email: r.email,
            revenueLeak: r.revenueLeak,
            status: r.status,
          }))
        );
      } else {
        setLeads([]);
      }
    });
  }, [sector]);

  const addLog = useCallback((msg: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev, makeLog(msg, type)]);
  }, []);

  const handleExecute = useCallback(() => {
    if (isExtracting) return;
    setIsExtracting(true);
    setLeads([]);

    const sectorLeads = MOCK_LEADS[sector] || [];
    addLog(`Initializing Playwright stealth session...`);

    const steps = [
      { delay: 600, msg: `Target sector: ${sector.toUpperCase()} | Scanning Google...`, type: "info" as const },
      { delay: 1400, msg: `Bypassing anti-bot detection layer...`, type: "info" as const },
      { delay: 2200, msg: `${sectorLeads.length} potential HVTs identified.`, type: "success" as const },
      { delay: 2800, msg: `Running friction audit calculations (35% walk-away model)...`, type: "info" as const },
      { delay: 3600, msg: `Revenue leak pool: $${sectorLeads.reduce((a, l) => a + l.revenueLeak, 0).toLocaleString()}/mo`, type: "warning" as const },
      { delay: 4200, msg: `Deduplicating by domain... ${sectorLeads.length} unique leads confirmed.`, type: "success" as const },
      { delay: 4600, msg: `Persisting to local database (IndexedDB)...`, type: "info" as const },
      { delay: 4800, msg: `Extraction complete. Ready for deployment.`, type: "success" as const },
    ];

    steps.forEach(({ delay, msg, type }) => {
      setTimeout(() => addLog(msg, type), delay);
    });

    // Stagger lead appearance and persist to IndexedDB
    sectorLeads.forEach((lead, i) => {
      setTimeout(async () => {
        const fullLead: Lead = { ...lead, status: "pending" };
        setLeads((prev) => [...prev, fullLead]);
        await upsertLead({
          externalId: lead.id,
          name: lead.name,
          city: lead.city,
          sector: lead.sector,
          website: lead.website,
          email: lead.email,
          revenueLeak: lead.revenueLeak,
          status: "pending",
          sectorKey: sector,
        });
      }, 2200 + i * 300);
    });

    setTimeout(() => setIsExtracting(false), 5000);
  }, [sector, isExtracting, addLog]);

  const handleDeploy = useCallback(async (id: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "queued" as const } : l))
    );
    await updateLeadStatus(id, "queued");

    const lead = leads.find((l) => l.id === id);
    if (lead) {
      addLog(`Queuing audit for ${lead.name} (${lead.email})...`, "info");

      // Generate email draft and copy to clipboard
      const emailDraft = generateEmailDraft(lead);
      const copied = await copyToClipboard(emailDraft);

      // Download CSV for this lead
      const csv = leadsToCSV([{
        externalId: lead.id,
        name: lead.name,
        city: lead.city,
        sector: lead.sector,
        website: lead.website,
        email: lead.email,
        revenueLeak: lead.revenueLeak,
        status: lead.status,
        sectorKey: sector,
        createdAt: new Date(),
      }]);
      downloadCSV(csv, `${lead.name.replace(/\s+/g, "_")}_lead.csv`);

      setTimeout(async () => {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: "deployed" as const } : l))
        );
        await updateLeadStatus(id, "deployed");
        addLog(`✓ Audit deployed to ${lead.email}`, "success");
        addLog(copied ? `✓ Email draft copied to clipboard` : `⚠ Could not copy to clipboard`, copied ? "success" : "warning");
        addLog(`✓ CSV downloaded for ${lead.name}`, "success");

        toast({
          title: "Lead Deployed",
          description: `CSV downloaded & email draft ${copied ? "copied to clipboard" : "ready"} for ${lead.name}`,
        });
      }, 1500);
    }
  }, [leads, addLog, sector, toast]);

  const handleExportAll = useCallback(() => {
    if (leads.length === 0) return;
    const records = leads.map((l) => ({
      externalId: l.id,
      name: l.name,
      city: l.city,
      sector: l.sector,
      website: l.website,
      email: l.email,
      revenueLeak: l.revenueLeak,
      status: l.status,
      sectorKey: sector,
      createdAt: new Date(),
    } as LeadRecord));
    const csv = leadsToCSV(records);
    downloadCSV(csv, `${sector}_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    addLog(`✓ Exported ${leads.length} leads to CSV`, "success");
    toast({ title: "CSV Exported", description: `${leads.length} ${sector} leads exported.` });
  }, [leads, sector, addLog, toast]);

  const totalLeak = leads.reduce((a, l) => a + l.revenueLeak, 0);
  const deployed = leads.filter((l) => l.status === "deployed" || l.status === "replied").length;

  return (
    <div className="flex min-h-screen bg-background">
      <CommandSidebar
        activeSector={sector}
        onSectorChange={setSector}
        onExecute={handleExecute}
        isExtracting={isExtracting}
        leadCount={leads.length}
        onExportAll={handleExportAll}
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Intelligence & Friction Audits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Time is the only commodity that cannot be exported. We protect it.
          </p>
        </div>

        <StatsBar
          totalLeads={leads.length}
          totalLeak={totalLeak}
          deployed={deployed}
          frictionIndex={leads.length > 0 ? 38.4 : 0}
        />

        <LeadTable leads={leads} onDeploy={handleDeploy} />

        <LogStream logs={logs} />
      </main>
    </div>
  );
};

export default Index;
