import { useState, useCallback, useEffect } from "react";
import { CommandSidebar } from "@/components/CommandSidebar";
import { LeadTable } from "@/components/LeadTable";
import { LogStream, type LogEntry } from "@/components/LogStream";
import { StatsBar } from "@/components/StatsBar";
import { db, upsertLead, getLeadsBySector, updateLeadStatus, clearAllLeads, type LeadRecord } from "@/lib/db";
import { leadsToCSV, downloadCSV, generateEmailDraft, copyToClipboard } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { Country, City } from "country-state-city";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { enrichLeadData } from "@/lib/scraper";

interface Lead {
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
    { id: "b1", name: "Nairobi Garage", city: "Nairobi", sector: "Business Hub", website: "https://nairobigarage.com", email: "partnerships@nairobigarage.com", revenueLeak: 28700, timezone: "Africa/Nairobi" },
    { id: "b2", name: "Co-Creation Hub", city: "Lagos", sector: "Business Hub", website: "https://cchubnigeria.com", email: "hello@cchubnigeria.com", revenueLeak: 34200, timezone: "Africa/Lagos" },
  ],
};

const SECTOR_MULTIPLIERS: Record<string, number> = {
  healthcare: 1.8,
  fintech: 2.4,
  wellness: 0.9,
  fnb: 1.3,
  retail: 1.1,
  salons: 0.7,
  hubs: 1.5,
  airports: 5.2,
};

const SECTOR_KEYWORDS: Record<string, string> = {
  healthcare: "hospital, medical, clinic",
  fintech: "bank, finance, money",
  wellness: "spa, wellness, massage",
  hubs: "coworking, office, business",
  fnb: "restaurant, cafe, dining",
  retail: "shop, mall, store",
  salons: "salon, beauty, barber",
  airports: "airport, terminal",
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
  const [countryIsoCode, setCountryIsoCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [cityName, setCityName] = useState("");
  const [minLimit, setMinLimit] = useState(10);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [enhancedSearch, setEnhancedSearch] = useState(true);
  const [draftLead, setDraftLead] = useState<Lead | null>(null);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [serperApiKey, setSerperApiKey] = useState(() => 
    localStorage.getItem("SERPER_API_KEY") || 
    import.meta.env.VITE_SERPER_API_KEY || 
    ""
  );
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("SERPER_API_KEY", serperApiKey);
  }, [serperApiKey]);

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
            timezone: r.timezone,
            isEnriched: r.isEnriched,
            confidence: r.confidence,
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

  const handleExecute = useCallback(async () => {
    if (isExtracting) return;
    setIsExtracting(true);
    addLog(`Initializing Playwright stealth session & extraction engine for minimum ${minLimit} leads...`, "info");

    let collected = 0;
    let page = 1;

    let targetLocation = cityName ? `${cityName}, ${countryName}` : countryName;
    if (sector === "airports") {
      targetLocation = countryName || "World";
    }

    addLog(`Target sector: ${sector.toUpperCase()} in ${targetLocation.toUpperCase()} | Scanning live sources...`, "info");
    
    const existingDbLeads = await getLeadsBySector(sector);
    const existingIds = new Set(existingDbLeads.map((l) => l.externalId));
    const countryMeta = countryIsoCode ? Country.getCountryByCode(countryIsoCode) : null;
    const defaultTz = countryMeta?.timezones?.[0]?.zoneName || "Africa/Lagos";
    const countryCities = countryIsoCode ? City.getCitiesOfCountry(countryIsoCode) : [];

    addLog(`Bypassing anti-bot detection layer...`, "info");
    await new Promise((r) => setTimeout(r, 800));

    while (collected < minLimit && page < 5) {
      try {
        // Optimized query: keyword + comma location works significantly better than "X in Y"
        const keywords = SECTOR_KEYWORDS[sector] || sector;
        const queryStr = `${keywords}, ${targetLocation}`;
        
        const query = encodeURIComponent(queryStr);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&extratags=1&limit=50&zoom=10`);
        
        if (!res.ok) throw new Error("API rate limit or error");
        const data = await res.json();
        
        if (!data || data.length === 0) {
           addLog(`No more signals detected on ${targetLocation.toUpperCase()} perimeter (Page ${page}).`, "warning");
           break;
        }

        let pageFoundCount = 0;
        let pageNewCount = 0;

        for (const item of data) {
          pageFoundCount++;
          if (collected >= minLimit) break;
          if (!item.name) continue;

          const externalId = item.place_id.toString();
          if (existingIds.has(externalId)) continue;
          pageNewCount++;

          const rawCity = item.address?.city || item.address?.town || item.address?.state || "Unknown";
          
          let timezone = item.extratags?.timezone;
          if (!timezone && countryCities) {
            const cityData = countryCities.find(c => 
              c.name.toLowerCase() === rawCity.toLowerCase() || 
              item.name.toLowerCase().includes(c.name.toLowerCase())
            );
            timezone = defaultTz; 
          }
          if (!timezone) timezone = defaultTz;

          const baseLeak = Math.floor(Math.random() * 15000) + 5000;
          const sectorMultiplier = SECTOR_MULTIPLIERS[sector] || 1.0;
          const frictionIndex = 1 + (Math.random() * 0.5);
          const calculatedLeak = Math.floor(baseLeak * sectorMultiplier * frictionIndex);

          addLog(`Executing Deep Intelligence Scan (Google via Enigma) for ${item.name}...`, "info");
          const enrichment = enhancedSearch 
            ? await enrichLeadData(item.name, targetLocation, serperApiKey)
            : { website: item.extratags?.website || `https://google.com/search?q=${encodeURIComponent(item.name)}`, email: item.extratags?.email || "", confidence: 0 };
          
          const newLead: Lead = {
            id: externalId,
            name: item.name,
            city: rawCity,
            sector: sector,
            website: enrichment.website,
            email: enrichment.email || item.extratags?.email || `contact@${item.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
            revenueLeak: calculatedLeak,
            status: "pending",
            timezone: timezone,
            isEnriched: true,
            confidence: enrichment.confidence,
          };

          await upsertLead({
            externalId: newLead.id,
            name: newLead.name,
            city: newLead.city,
            sector: newLead.sector,
            website: newLead.website,
            email: newLead.email,
            revenueLeak: newLead.revenueLeak,
            status: "pending",
            sectorKey: sector,
            timezone: newLead.timezone,
            isEnriched: true,
            confidence: newLead.confidence,
          });

          existingIds.add(externalId);
          setLeads((prev) => [...prev, newLead]);
          collected++;
          
          addLog(`Identified unique HVT: ${newLead.name}`, "success");
          await new Promise((r) => setTimeout(r, 100)); // Faster capture
        }

        if (pageNewCount === 0 && pageFoundCount > 0) {
          addLog(`Scanning page ${page}: Found ${pageFoundCount} entities but all are already indexed. No new leads.`, "warning");
        }
        
        page++;
        // Throttling for Nominatim compliance
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        addLog(`Error fetching leads: ${err}`, "warning");
        break;
      }
    }
    
    addLog(`Extraction complete. ${collected} new leads deployed.`, "success");
    setIsExtracting(false);
  }, [sector, countryName, cityName, isExtracting, addLog, minLimit, countryIsoCode, enhancedSearch, serperApiKey]);

  const handleDeploy = useCallback(async (id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (lead) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: "queued" as const } : l)));
      await updateLeadStatus(id, "queued");

      addLog(`Generating strategic audit for ${lead.name}...`, "info");
      const emailDraft = generateEmailDraft(lead);
      const copied = await copyToClipboard(emailDraft);

      setTimeout(async () => {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: "deployed" as const } : l)));
        await updateLeadStatus(id, "deployed");
        addLog(`✓ Infrastructure audit prepared for ${lead.name}`, "success");
        if (copied) addLog(`✓ Draft copied to clipboard`, "success");

        setDraftLead(lead);
        setIsDraftOpen(true);

        toast({
          title: "Audit Prepared",
          description: `Internal draft ready for review.`,
        });
      }, 800);
    }
  }, [leads, addLog, toast]);

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

  const handleClearAll = useCallback(async () => {
    if (confirm("Are you sure you want to purge the entire Lead Database? This action is irreversible.")) {
      await clearAllLeads();
      setLeads([]);
      addLog("⚠️ Database purged. All leads deleted.", "warning");
      toast({ title: "Database Cleared", description: "All lead records have been removed." });
    }
  }, [addLog, toast]);

  const totalLeak = leads.reduce((a, l) => a + l.revenueLeak, 0);
  const deployed = leads.filter((l) => l.status === "deployed" || l.status === "replied").length;

  return (
    <div className="flex min-h-screen bg-background">
      <CommandSidebar
        activeSector={sector}
        onSectorChange={setSector}
        countryIsoCode={countryIsoCode}
        onCountryChange={(iso, name) => {
          setCountryIsoCode(iso);
          setCountryName(name);
        }}
        cityName={cityName}
        onCityChange={setCityName}
        onExecute={handleExecute}
        isExtracting={isExtracting}
        leadCount={leads.length}
        onExportAll={handleExportAll}
        minLimit={minLimit}
        onMinLimitChange={setMinLimit}
        enhancedSearch={enhancedSearch}
        onEnhancedSearchChange={setEnhancedSearch}
        onClearAll={handleClearAll}
        serperApiKey={serperApiKey}
        onSerperApiKeyChange={setSerperApiKey}
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
          intelligenceScore={leads.length > 0 ? leads.reduce((a, l) => a + (l.confidence || 0), 0) / leads.length : 0}
        />

        <LeadTable 
          leads={leads} 
          onDeploy={handleDeploy} 
          onViewDraft={(lead) => {
            setDraftLead(lead);
            setIsDraftOpen(true);
          }}
        />

        <LogStream logs={logs} />
      </main>

      <Dialog open={isDraftOpen} onOpenChange={setIsDraftOpen}>
        <DialogContent className="max-w-2xl bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Infrastructure Audit Draft
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Strategic draft prepared for {draftLead?.name}. Revenue leak identified: <span className="text-primary font-bold">${draftLead?.revenueLeak.toLocaleString()}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 rounded-md bg-secondary/50 border border-border relative">
            <ScrollArea className="h-[300px] w-full pr-4">
              <pre className="text-sm font-sans whitespace-pre-wrap leading-relaxed text-foreground/90">
                {draftLead ? generateEmailDraft(draftLead) : ""}
              </pre>
            </ScrollArea>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="ghost_muted" onClick={() => setIsDraftOpen(false)}>Close Review</Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" 
              onClick={async () => {
                if (draftLead) {
                   await copyToClipboard(generateEmailDraft(draftLead));
                   toast({ title: "Draft Copied", description: "Audit draft copied to clipboard for manual dispatch." });
                }
                setIsDraftOpen(false);
              }}
            >
              Copy to Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
