/**
 * SOVEREIGN ENRICHMENT ENGINE
 * Handles advanced lead intelligence and contact extraction.
 */

export interface EnrichmentResult {
  website: string;
  email: string;
  confidence: number;
}

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

import axios from "axios";

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

    const firstResult = searchData.organic?.[0];
    if (!firstResult) return null;

    const emailMatch = firstResult.snippet?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    return {
      website: firstResult.link || "",
      email: emailMatch ? emailMatch[0] : "",
      confidence: 90,
    };
  } catch (error) {
    console.error("Serper Intelligence Search Failed:", error);
    return null;
  }
}

/**
 * Advanced Search & Scrape Engine
 * Phase 1: DuckDuckGo/Serper Resolve
 * Phase 2: Pattern Matching
 */
export async function enrichLeadData(name: string, location: string, apiKey?: string): Promise<EnrichmentResult> {
  const query = `${name} ${location} official website contact email`;
  
  // Try Deep Search if API key is present
  const deepData = await deepSearchMetadata(query, apiKey);
  
  if (deepData) {
    return deepData;
  }

  // Fallback to heuristic logic if no API key or search fails
  const domain = extractDomain(name);
  return {
    website: `https://${domain}`,
    email: `contact@${domain}`,
    confidence: 35,
  };
}
