# Leads Intercontinental | Global Intelligence Engine

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

    ```sh
    bun dev
    # or
    npm run dev
    ```

## 🖥️ Desktop Native App (Sovereign Command Center)

The engine can be run as a native desktop application for a more immersive command center experience.

### Development Environment
Running in Electron while maintaining live-reload:
1. Ensure the Vite server is running (`bun dev`).
2. In a separate terminal, launch the native shell:
   ```sh
   bun run electron:dev
   ```

### Production Build
To package the engine as a standalone `.dmg` or `.app`:
```sh
bun run electron:build
```
*The packaged application will be generated in the `dist-electron/` directory.*

### Application Icons
The build system expects an icon at `assets/icon.icns`. If you have a custom design:
1. Generate an ICNS (Mac) or ICO (Windows) file.
2. Place it in the `assets/` folder.
3. Re-run the `electron:build` command.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI, Framer Motion
- **Database**: Dexie.js (IndexedDB)
- **Intelligence**: Axios, Serper.dev API, Nominatim (OSM)

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Time is the only commodity that cannot be exported. We protect it.*
