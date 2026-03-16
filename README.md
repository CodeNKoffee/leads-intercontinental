# Leads Intercontinental - Global Intelligence Engine

<p align="center">
  <img src="public/leads-intercontinental.png" alt="Leads Intercontinental Logo" width="200"/>
</p>

Leads Intercontinental is a high-performance, sovereign lead generation and intelligence deployment system. It identifies High-Value Targets (HVTs) across diverse sectors using a multi-stage discovery and enrichment pipeline.

## 🛡️ Strategic Capabilities

- **Hybrid Discovery** - Combines OpenStreetMap spatial data with real-time Google Search scraping.
- **Enigma Enrichment Engine** - Powered by Serper.dev to extract verified websites and contact emails.
- **Friction Auditing** - Calculates "Revenue Leak" indices based on niche-specific friction multipliers.
- **Tactical Dispatch** - Generates "Architecture of Ease" audit drafts for immediate review and dispatch.
- **Sovereign Storage** - Uses Dexie.js (IndexedDB) for secure, private, and persistent local data.

## 🖥️ Getting Started

### Native Desktop App (Recommended)

1. **Download**: Obtain the latest release from the `dist-electron/` directory.
2. **Install**: Run the generated `.dmg` (Mac) or `.zip` file.
3. **Configure**: Launch the app and enter your Serper.dev API key in the configuration sidebar.

### Building from Source

#### Prerequisites
- Node.js (v18+)
- Bun (recommended) or NPM

#### Installation
```bash
# Clone the repository
git clone https://github.com/CodeNKoffee/leads-intercontinental.git
cd leads-intercontinental

# Install dependencies
bun install
```

#### Running the Engine
```bash
# Development (Browser)
bun dev

# Native Shell (Desktop)
bun run electron:dev

# Production Build (Packaged App)
bun run electron:build
```

## 🛠️ Tech Stack

- **Frontend** - React, Vite, TypeScript
- **Styling** - Tailwind CSS, Framer Motion, Shadcn/UI
- **Database** - Dexie.js (IndexedDB)
- **Intelligence** - Axios, Serper.dev API, Nominatim (OSM)
- **Desktop Shell** - Electron, Electron Builder

## 📂 Project Structure

```
leads-intercontinental/
├── electron/              # Electron main & preload scripts
├── src/
│   ├── components/        # Modular UI (LocationEngine, LeadTable, etc.)
│   ├── lib/               # Intelligence logic (scraper.ts, db.ts)
│   ├── pages/             # Main application views
│   └── hooks/             # Reactive state logic
├── public/                # Static assets & icons
└── assets/                # Production build artifacts
```

## 📜 License

MIT License - see the [LICENSE](LICENSE) file for details.

---
*Time is the only commodity that cannot be exported. We protect it.*
