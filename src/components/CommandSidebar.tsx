import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Target, Activity, Settings, ChevronDown, FileDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Country, City } from "country-state-city";
import { SovereignSelect } from "./SovereignSelect";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const sectors = [
  { id: "healthcare", label: "Healthcare", cities: [] },
  { id: "fintech", label: "Fintech Agents", cities: [] },
  { id: "wellness", label: "Wellness/Beauty", cities: [] },
  { id: "hubs", label: "Business Hubs", cities: [] },
  { id: "fnb", label: "F&B / Restaurants", cities: [] },
  { id: "retail", label: "Retail", cities: [] },
  { id: "salons", label: "Beauty Salons & Barbers", cities: [] },
  { id: "airports", label: "Airports", cities: [] },
];

interface CommandSidebarProps {
  activeSector: string;
  onSectorChange: (sector: string) => void;
  countryIsoCode: string;
  onCountryChange: (isoCode: string, name: string) => void;
  cityName: string;
  onCityChange: (cityName: string) => void;
  onExecute: () => void;
  isExtracting: boolean;
  leadCount: number;
  onExportAll: () => void;
  minLimit: number;
  onMinLimitChange: (limit: number) => void;
  enhancedSearch: boolean;
  onEnhancedSearchChange: (enabled: boolean) => void;
  onClearAll: () => void;
  serperApiKey: string;
  onSerperApiKeyChange: (key: string) => void;
}

export function CommandSidebar({ 
  activeSector, 
  onSectorChange, 
  countryIsoCode, 
  onCountryChange, 
  cityName, 
  onCityChange, 
  onExecute, 
  isExtracting, 
  leadCount, 
  onExportAll, 
  minLimit, 
  onMinLimitChange,
  enhancedSearch,
  onEnhancedSearchChange,
  onClearAll,
  serperApiKey,
  onSerperApiKeyChange
}: CommandSidebarProps) {
  const [sectorOpen, setSectorOpen] = useState(true);
  const [countries] = useState(() => Country.getAllCountries());
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    if (countryIsoCode) {
      setCities(City.getCitiesOfCountry(countryIsoCode) || []);
    } else {
      setCities([]);
    }
  }, [countryIsoCode]);

  return (
    <aside className="w-[260px] h-screen sticky top-0 bg-card border-r border-border flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-lg font-black tracking-tight text-primary">TAWABIRY</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase font-semibold opacity-70">SOVEREIGN COMMAND</p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scroll-smooth">
        {/* Sector Selector */}
        <div className="space-y-4">
          <button
            onClick={() => setSectorOpen(!sectorOpen)}
            className="flex items-center justify-between w-full text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]"
          >
            Target Sectors
            <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${sectorOpen ? "rotate-0" : "-rotate-90"}`} />
          </button>

          {sectorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              {sectors.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSectorChange(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
                    activeSector === s.id
                      ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Target className={`h-3.5 w-3.5 ${activeSector === s.id ? "text-primary" : ""}`} />
                  {s.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Stats Section */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Deployment Stats</p>
          <div className="space-y-3">
            <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Active Leads In-Memory</p>
              <p className="text-xl font-bold text-foreground font-mono">{leadCount}</p>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isExtracting ? "bg-primary animate-pulse" : "bg-success"}`} />
                <span className="text-xs font-medium text-foreground">{isExtracting ? "ENIGMA ACTIVE" : "ENGINE READY"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Settings (Advanced Config) */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Intelligence Config</p>
          <div className="flex items-center justify-between gap-4 bg-primary/5 p-3 rounded-lg border border-primary/10">
            <div className="space-y-0.5">
              <Label htmlFor="enhanced-search" className="text-xs font-bold text-foreground cursor-pointer">Enhanced Search</Label>
              <p className="text-[9px] text-muted-foreground leading-tight">Deep metadata & email scrapers</p>
            </div>
            <Switch
              id="enhanced-search"
              checked={enhancedSearch}
              onCheckedChange={onEnhancedSearchChange}
              disabled={isExtracting}
            />
          </div>
          {enhancedSearch && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 space-y-2 pt-4 border-t border-primary/10"
            >
              <Label className="text-[9px] text-primary/70 uppercase font-bold">Serper.dev Intelligence Key</Label>
              <input
                type="password"
                value={serperApiKey}
                onChange={(e) => onSerperApiKeyChange(e.target.value)}
                placeholder="Enter API Key"
                className="w-full bg-black/20 text-foreground text-[10px] rounded px-2 py-1.5 border border-primary/20 focus:border-primary/50 outline-none transition-all font-mono"
              />
              <p className="text-[8px] text-muted-foreground italic">Required for live Google Search scraping</p>
            </motion.div>
          )}
        </div>

        {/* Strategic Target Parameters */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Strategic Parameters</p>
          
          <div className="space-y-4">
            <SovereignSelect
              label="Geography (Country)"
              value={countryIsoCode}
              onValueChange={(code) => {
                const name = countries.find(c => c.isoCode === code)?.name || "";
                onCountryChange(code, name);
                onCityChange("");
              }}
              options={countries.map(c => ({ value: c.isoCode, label: `${c.flag || ""} ${c.name}` }))}
              placeholder="Select Country"
              disabled={isExtracting || activeSector === "airports"}
            />

            {activeSector !== "airports" && countryIsoCode && (
              <SovereignSelect
                label="Tactical Hub (City)"
                value={cityName}
                onValueChange={onCityChange}
                options={cities.map(c => ({ value: c.name, label: c.name }))}
                placeholder="All Cities"
                disabled={isExtracting}
              />
            )}

            <div className="space-y-2">
              <label className="text-[10px] text-muted-foreground uppercase font-semibold">Min Target Yield</label>
              <input
                type="number"
                min={1}
                value={minLimit}
                onChange={(e) => onMinLimitChange(parseInt(e.target.value) || 1)}
                disabled={isExtracting}
                className="w-full bg-secondary/50 text-foreground text-sm rounded-md px-3 py-2 outline-none border border-border focus:border-primary/30 transition-all font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm z-10 space-y-2">
        <Button
          variant="sovereign"
          className="w-full h-11 relative group overflow-hidden"
          onClick={onExecute}
          disabled={isExtracting}
        >
          <Activity className={`h-4 w-4 mr-2 ${isExtracting ? "animate-spin" : ""}`} />
          {isExtracting ? "EXTRACTING..." : "EXECUTE MISSION"}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
        <Button
          variant="tactical"
          className="w-full h-11"
          onClick={onExportAll}
          disabled={leadCount === 0}
        >
          <FileDown className="h-4 w-4 mr-2" />
          EXTRACT TO CSV
        </Button>
        <Button
          variant="ghost_muted"
          className="w-full h-9 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 uppercase font-bold tracking-widest"
          onClick={onClearAll}
          disabled={leadCount === 0 || isExtracting}
        >
          <Trash2 className="h-3 w-3 mr-2" />
          Purge Lead Database
        </Button>
      </div>
    </aside>
  );
}
