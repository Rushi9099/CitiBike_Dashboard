# Citi Bike Demand & Station-Imbalance Decision Support System

> Master's Research Project — **Group 15** — Saint Louis University, John Cook School of Business (JAP, 2026)

An interactive decision-support web app + Power BI dashboard that analyzes ~1 million Citi Bike trips from **May 2025** to help service planners, operations managers, and rebalancing teams make data-driven decisions about peak-hour demand, station imbalance, and member utilization.

---

## Live links

| Resource | Link |
|---|---|
| **Solution App (React)** | _deploy URL goes here — Vercel/Netlify_ |
| **Power BI Dashboard (.pbix)** | [Google Drive](https://drive.google.com/file/d/1sstMB7H-AJH3yhLMCLPFNX9jL8o-PNX1/view?usp=sharing) |
| **Portfolio Site** | _GitHub Pages URL goes here_ |

> **How to open the Power BI file:** download the `.pbix` from Google Drive, then open with [Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494) (free). A view-only web link will be added once published to Power BI Service.

---

## Problem & solution in one paragraph

Citi Bike experiences significant **station imbalance** — some stations run out of bikes during morning commutes while others overflow by evening, forcing costly manual rebalancing. Demand is also sharply concentrated in **rush hours (7–9 AM, 5–7 PM)**, straining the system. Our DSS quantifies three KPIs — **Peak Hour Demand Ratio (PHDR)**, **Member Utilization Rate (MUR)**, and **Station Imbalance Index (SII)** — and provides an interactive simulator that shows how operational changes (peak-hour smoothing, member conversion, rebalancing frequency) would improve these metrics.

---

## Key findings from May 2025 data

- **994,641 trips** analyzed across **2,140 stations**
- **81.08%** member share (vs 18.92% casual)
- Electric bikes dominate at **~70%** of all trips
- **PHDR = 28.4%** — over a quarter of daily trips happen in rush hours
- **Top imbalanced station:** *West St & Chambers St* loses 3,164 bikes/month (3,228 starts vs 64 ends)
- **Avg trip duration:** members 11.3 min, casual riders 19.2 min

---

## The three-part dashboard

### 1. Data 1 — Original Problem Dashboard (Power BI, 6 analytical pages)
`Home` · `Demand Analysis` · `Station Performance` · `Rider Patterns` · `Station Imbalance` · `Data Flow & System Logic`

### 2. Solution App (React — this repo)
A functional web app mirroring the PBI pages, plus an interactive **Comparison** page with three sliders that recompute KPIs in real time.

### 3. Comparison Dashboard (Power BI + React)
Simulated "before vs after" KPI impact for three operational levers:
- **Peak Hour Smoothing %** (0–30%) → reduces PHDR
- **Member Conversion %** (0–20%) → increases MUR
- **Rebalancing Improvement %** (0–50%) → reduces Avg Station Imbalance

---

## Tech stack

| Layer | Tool |
|---|---|
| Data prep & cleaning | Power Query (M) |
| Data model + measures | Power BI (DAX) |
| Reporting dashboard | Power BI Desktop |
| Solution app | React 19 + Vite 8 + Recharts 3 |
| Typography | DM Sans + JetBrains Mono |
| Hosting (dashboard) | Power BI Service / Google Drive |
| Hosting (app) | Vercel / GitHub Pages |

---

## Running the Solution App locally

**Prerequisites:** Node.js 18+ and npm.

```bash
git clone https://github.com/Rushi9099/CitiBike_Dashboard.git
cd CitiBike_Dashboard
npm install
npm run dev
```

Then open http://localhost:5173/

### Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Project structure

```
citibike-dashboard-final/
├── index.html                 Vite entry point
├── package.json               Dependencies and scripts
├── vite.config.js             Vite + React plugin config
├── eslint.config.js           Flat ESLint config
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── dataflow.png           Data Flow diagram used on DataFlow page
└── src/
    ├── main.jsx               React root / StrictMode bootstrap
    ├── App.jsx                All 7 pages + routing + shared components
    ├── App.css                Dark-theme styling
    ├── index.css              Global resets
    └── data.json              Pre-aggregated dashboard data (single source of truth)
```

All page components (`Home`, `Demand`, `Stations`, `Riders`, `Imbalance`, `DataFlow`, `Comparison`) live in `src/App.jsx`.

---

## Data source & design

- **Source:** Citi Bike public trip history — [ride.citibikenyc.com/system-data](https://ride.citibikenyc.com/system-data)
- **Period:** May 2025 (with a few edge days from April 29 – May 14)
- **Scale:** 1,000,000 raw rows → 994,641 post-cleaning
- **Cleaning steps (Power Query):** remove nulls, filter invalid trip durations, coerce types, derive `hour`, `day`, `date`, `trip_duration_min`, trim text columns

### Entity summary

| Table | Purpose |
|---|---|
| `Trips` | Fact table — one row per ride |
| `Stations` | Dimension — station name + coordinates |
| `StartStationSummary` | Aggregated departures per station |
| `EndStationSummary` | Aggregated arrivals per station |
| `DateTable` | Date dimension for time intelligence |
| `Peak Hour Smoothing %` / `Member Conversion %` / `Rebalancing Improvement %` | Parameter tables that drive the Comparison simulator |

---

## KPIs (DAX logic, summarized)

| KPI | Definition |
|---|---|
| **PHDR** — Peak Hour Demand Ratio | Share of daily trips occurring during 7–9 AM and 5–7 PM |
| **MUR** — Member Utilization Rate | `Member Trips / Total Trips` |
| **SII** — Station Imbalance Index | `Starts − Ends` per station. Positive = losing bikes. Negative = gaining bikes. |

---

## Target users

| User | Primary page |
|---|---|
| Service Planners | Demand — plan bike allocation for peak windows |
| Operations Managers | Imbalance — schedule rebalancing trucks to pressure stations |
| Leadership | Home + Comparison — system health and strategic planning |
| Rebalancing Teams | Stations + Imbalance — prioritize stations needing immediate attention |

---

## Team — Group 15

_Team member names go here — please update before submission_

- Member 1 — Role
- Member 2 — Role
- Member 3 — Role
- Member 4 — Role
- Member 5 — Role

---

## Course & attribution

Built for the **Master's Research Project** course at Saint Louis University (Spring 2026 / JAP cohort).
Trip data © Lyft / Citi Bike, used under the [Citi Bike Data License Agreement](https://ride.citibikenyc.com/data-sharing-policy).

---

## License

Coursework prototype. Not licensed for commercial use.
