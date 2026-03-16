import type { LeadRecord } from "./db";

export function leadsToCSV(leads: LeadRecord[]): string {
  const headers = ["Business Name", "City", "Sector", "Website", "Email", "Revenue Leak ($/mo)", "Status"];
  const rows = leads.map((l) => [
    `"${l.name}"`,
    l.city,
    l.sector,
    l.website,
    l.email,
    l.revenueLeak.toString(),
    l.status,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateEmailDraft(lead: { name: string; city: string; sector: string; email: string; revenueLeak: number }): string {
  return `Subject: The Revenue Leak at ${lead.name}: A Tawabiry Infrastructure Audit

To: ${lead.email}

${lead.name},

In ${lead.city}, time isn't just a clock—it's a relationship.

We ran a diagnostic friction audit on ${lead.sector.toLowerCase()} operations in your area and identified that businesses like ${lead.name} are losing an estimated $${lead.revenueLeak.toLocaleString()}/mo due to queue friction and walk-away events during peak surges.

We've prepared a 1-page "Architecture of Ease" report specific to your operation—no obligation, no pitch deck.

The only question: is the leak worth plugging?

—
Hatem Soliman
Tawabiry | Sovereign Infrastructure
hatem.soliman@tawabiry.com`;
}

export function generateBatchDrafts(leads: { name: string; city: string; sector: string; email: string; revenueLeak: number }[]): string {
  return leads.map((l) => {
    return `========================================\nDRAFT FOR: ${l.name}\n========================================\n${generateEmailDraft(l)}\n\n`;
  }).join("\n");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
