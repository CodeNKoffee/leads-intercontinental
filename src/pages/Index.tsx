import { useState, useCallback } from "react";
import { CommandSidebar } from "@/components/CommandSidebar";
import { LeadTable, type Lead } from "@/components/LeadTable";
import { LogStream, type LogEntry } from "@/components/LogStream";
import { StatsBar } from "@/components/StatsBar";

const MOCK_LEADS: Record<string, Lead[]> = {
  healthcare: [
    { id: "h1", name: "Evercare Hospital Lekki", city: "Lagos", sector: "Healthcare", website: "https://evercaregroup.com", email: "info@evercaregroup.com", revenueLeak: 42500, status: "pending" },
    { id: "h2", name: "Nyaho Medical Centre", city: "Accra", sector: "Healthcare", website: "https://nyahomedical.com", email: "contact@nyahomedical.com", revenueLeak: 31200, status: "pending" },
    { id: "h3", name: "Shalina Diagnostics", city: "Lagos", sector: "Healthcare", website: "https://shalina.com", email: "info@shalina.com", revenueLeak: 55800, status: "pending" },
    { id: "h4", name: "King Trust Medical", city: "Lagos", sector: "Healthcare", website: "#", email: "kingtrustmedical@gmail.com", revenueLeak: 18400, status: "pending" },
  ],
  fintech: [
    { id: "f1", name: "Moniepoint Agent Network", city: "Lagos", sector: "Fintech", website: "https://moniepoint.com", email: "partners@moniepoint.com", revenueLeak: 87300, status: "pending" },
    { id: "f2", name: "OPay Agent Kiosks", city: "Lagos", sector: "Fintech", website: "https://opay.com", email: "business@opay.com", revenueLeak: 64100, status: "pending" },
    { id: "f3", name: "M-Pesa Support Centers", city: "Nairobi", sector: "Fintech", website: "https://safaricom.co.ke", email: "mpesa@safaricom.co.ke", revenueLeak: 73500, status: "pending" },
  ],
  wellness: [
    { id: "w1", name: "Serenity Spa Westlands", city: "Nairobi", sector: "Wellness", website: "https://serenityspa.co.ke", email: "hello@serenityspa.co.ke", revenueLeak: 22100, status: "pending" },
    { id: "w2", name: "Zanzibar Luxury Salon", city: "Lagos", sector: "Wellness", website: "#", email: "booking@zanzibarsalon.ng", revenueLeak: 15600, status: "pending" },
  ],
  hubs: [
    { id: "b1", name: "Nairobi Garage", city: "Nairobi", sector: "Business Hub", website: "https://nairobigarage.com", email: "partnerships@nairobigarage.com", revenueLeak: 28700, status: "pending" },
    { id: "b2", name: "Co-Creation Hub", city: "Lagos", sector: "Business Hub", website: "https://cchubnigeria.com", email: "hello@cchubnigeria.com", revenueLeak: 34200, status: "pending" },
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
      { delay: 4800, msg: `Extraction complete. Ready for deployment.`, type: "success" as const },
    ];

    steps.forEach(({ delay, msg, type }) => {
      setTimeout(() => addLog(msg, type), delay);
    });

    // Stagger lead appearance
    sectorLeads.forEach((lead, i) => {
      setTimeout(() => {
        setLeads((prev) => [...prev, lead]);
      }, 2200 + i * 300);
    });

    setTimeout(() => setIsExtracting(false), 5000);
  }, [sector, isExtracting, addLog]);

  const handleDeploy = useCallback((id: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "queued" as const } : l))
    );
    const lead = leads.find((l) => l.id === id);
    if (lead) {
      addLog(`Queuing audit for ${lead.name} (${lead.email})...`, "info");
      setTimeout(() => {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: "deployed" as const } : l))
        );
        addLog(`✓ Audit deployed to ${lead.email}`, "success");
      }, 1500);
    }
  }, [leads, addLog]);

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
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
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
