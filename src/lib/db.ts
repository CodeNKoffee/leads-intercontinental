import Dexie, { type Table } from "dexie";

export interface LeadRecord {
  id?: number;
  externalId: string;
  name: string;
  city: string;
  sector: string;
  website: string;
  email: string;
  revenueLeak: number;
  status: "pending" | "deployed" | "replied" | "queued";
  sectorKey: string;
  createdAt: Date;
}

class SovereignDB extends Dexie {
  leads!: Table<LeadRecord, number>;

  constructor() {
    super("SovereignCommandCenter");
    this.version(1).stores({
      leads: "++id, externalId, sectorKey, status, email, name",
    });
  }
}

export const db = new SovereignDB();

// Helper: get leads by sector
export async function getLeadsBySector(sectorKey: string) {
  return db.leads.where("sectorKey").equals(sectorKey).toArray();
}

// Helper: upsert lead (avoid duplicates by externalId)
export async function upsertLead(lead: Omit<LeadRecord, "id" | "createdAt">) {
  const existing = await db.leads.where("externalId").equals(lead.externalId).first();
  if (existing) {
    await db.leads.update(existing.id!, lead);
    return existing.id!;
  }
  return db.leads.add({ ...lead, createdAt: new Date() });
}

// Helper: update lead status
export async function updateLeadStatus(externalId: string, status: LeadRecord["status"]) {
  const lead = await db.leads.where("externalId").equals(externalId).first();
  if (lead) {
    await db.leads.update(lead.id!, { status });
  }
}

// Helper: get all leads
export async function getAllLeads() {
  return db.leads.toArray();
}

// Helper: clear sector
export async function clearSector(sectorKey: string) {
  return db.leads.where("sectorKey").equals(sectorKey).delete();
}
