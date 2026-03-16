import axios from "axios";

/**
 * SOVEREIGN ENRICHMENT ENGINE
 * Handles advanced lead intelligence and contact extraction.
 */

export interface EnrichmentResult {
  website: string;
  email: string;
  confidence: number;
  source?: string;
}

/**
 * Tactical Delay (Jitter)
 * Protects API credits and mimics human scanning patterns.
 */
export const tacticalDelay = (ms: number = 800) => {
  const jitter = Math.random() * 500;
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
};

/**
 * Extracts a clean domain from a business name
 */
export function extractDomain(name: string): string {
  const clean = name.toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(w => w.length > 2)
    .join('');
  return clean ? `${clean}.com` : "";
}

/**
 * Real Google Search Integration using Serper.dev via Axios
 */
export async function deepSearchMetadata(query: string, apiKey?: string): Promise<EnrichmentResult | null> {
  if (!apiKey) return null;

  try {
    const data = JSON.stringify({
      q: query,
      num: 5
    });

    const config = {
      method: "post",
      url: "https://google.serper.dev/search",
      headers: { 
        "X-API-KEY": apiKey, 
        "Content-Type": "application/json"
      },
      data: data
    };

    const response = await axios.request(config);
    const searchData = response.data;

    console.log(`[SERPER DEBUG] Query: "${query}"`);
    console.log(`[SERPER DEBUG] Result Count: ${searchData.organic?.length || 0}`);

    const firstResult = searchData.organic?.[0];
    if (!firstResult) return null;

    const emailMatch = firstResult.snippet?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    return {
      website: firstResult.link || "",
      email: emailMatch ? emailMatch[0] : "",
      confidence: 90,
      source: "google_serper"
    };
  } catch (error) {
    console.error("Serper Intelligence Search Failed:", error);
    return null;
  }
}

/**
 * Strategic Expansion Point: LinkedIn Data Extraction
 * Stub for future integration with LinkedIn proxy APIs
 */
export async function linkedinEnrichment(name: string, website: string): Promise<Partial<EnrichmentResult> | null> {
  // Placeholder for LinkedIn lookup logic
  // return { website: website, source: "linkedin" };
  return null;
}

/**
 * Strategic Expansion Point: Hunter.io Verification
 * Stub for future integration with email verification services
 */
export async function hunterVerification(email: string): Promise<boolean> {
  // Placeholder for Hunter.io verification logic
  return true;
}

/**
 * Advanced Search & Scrape Engine
 * Phase 1: DuckDuckGo/Serper Resolve
 * Phase 2: Pattern Matching
 */
export async function enrichLeadData(name: string, location: string, apiKey?: string): Promise<EnrichmentResult> {
  // Add tactical jitter before request to protect API limits
  await tacticalDelay(400);

  const query = `${name} ${location} official website contact email`;
  
  // Try Deep Search if API key is present
  const deepData = await deepSearchMetadata(query, apiKey);
  
  if (deepData) {
    // Stage 3: Expansion - Could verify email here if verified source is available
    return deepData;
  }

  // Fallback to heuristic logic if no API key or search fails
  const domain = extractDomain(name);
  return {
    website: `https://${domain}`,
    email: `contact@${domain}`,
    confidence: 35,
    source: "heuristic"
  };
}
