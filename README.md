# Leads Intercontinental | The Enigma Intelligence Engine

Leads Intercontinental is a high-performance, sovereign lead generation and intelligence deployment system. It is designed to identify High-Value Targets (HVTs) across diverse sectors (Healthcare, Fintech, Wellness) using a multi-stage discovery and enrichment pipeline.

## 🛡️ Strategic Capabilities

- **Hybrid Discovery**: Combines OpenStreetMap spatial data with real-time Google Search scraping.
- **Enigma Enrichment Engine**: Powered by Serper.dev and Axios to extract verified websites and contact emails directly from search signals.
- **Friction Auditing**: Automatically calculates "Revenue Leak" indices based on niche-specific friction multipliers.
- **Tactical Dispatch**: Generates 1-page "Architecture of Ease" audit drafts for immediate review and manual dispatch.
- **Sovereign Local-First Storage**: Uses Dexie.js (IndexedDB) for secure, private, and persistent local data management.

## 🚀 Deployment Guide

### Prerequisites
- Node.js (v18+)
- Bun (recommended) or NPM

### Setup
1. **Clone the repository**:
   ```sh
   git clone https://github.com/CodeNKoffee/leads-intercontinental.git
   cd leads-intercontinental
   ```

2. **Install Dependencies**:
   ```sh
   bun install
   # or
   npm install
   ```

3. **Configure Intelligence**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SERPER_API_KEY=your_serper_api_key_here
   ```
   *Get a free API key at [serper.dev](https://serper.dev).*

4. **Initialize Engine**:
   ```sh
   bun dev
   # or
   npm run dev
   ```

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI, Framer Motion
- **Database**: Dexie.js (IndexedDB)
- **Intelligence**: Axios, Serper.dev API, Nominatim (OSM)

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Time is the only commodity that cannot be exported. We protect it.*
