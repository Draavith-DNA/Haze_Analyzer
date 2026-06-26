# Haze Analyzer - Mission Control Dashboard

A premium, clinical-grade environmental telemetry heads-up display (HUD) and neural analysis dashboard. Designed as a "Mission Control" center for high-precision atmospheric monitoring, particulate modeling, and optical computer vision scanning.

![Design Aesthetic](https://img.shields.io/badge/Design-Glassmorphism%20%7C%20Technical%20Minimalism-emerald)
![Tech Stack](https://img.shields.io/badge/Tech-Vite%20%7C%20React%20%7C%20TailwindCSS-blue)
![API Integrations](https://img.shields.io/badge/API-Google%20Maps%20%7C%20WAQI-yellow)

---

## Key Features

### 🖥️ Optical Telemetry & Camera Integration
- **Real-Time Viewfinder Feed**: Connects dynamically to secure camera hardware streams.
- **Particulate Heatmap Scanner**: Supports a side-by-side computer vision panel dividing captured raw environmental frames from analytical pixel canvases ready for neural masking.

### 🧠 Neural Network Inference Gauge
- **EPA AQI Dial Gauge**: High-contrast circular progress dials showing realtime smog metrics (142 - Poor AQI) with orange LED ambient backlights and trend-sparkline overlays.
- **Meteorological Bento**: Synchronized temperature and relative humidity telemetry.

### 🗺️ Network Topology Map (Google GIS Layer)
- **HUD Dark Theme**: Custom Google Maps vector styles designed to minimize visual fatigue with neon slate highlights.
- **WAQI Tile Layer Integration**: Embeds the World Air Quality Index live particulate concentration heatmap layers seamlessly as Google `ImageMapType` overlays.
- **Localized Station Pins**: Automatically polls WAQI bounds telemetry on camera pan/idle, rendering colored markers keyed to safety zones (Good, Moderate, Sensitive, Poor) with detail pop-ups.
- **Automated Geolocation PIN Solver**: Resolves 6-digit postal PIN codes via `api.postalpincode.in`, queries spatial coordinate indexes, and invokes smooth panning (`map.panTo`) with high-resolution zooms.

### 📊 System Health Overview
- **Bento Core Grid**: Realtime aggregates detailing active telemetry nodes, global uptime indexes (99.9%), and daily data volume throughputs.
- **Animated Sparklines**: Fluid performance charts detailing neural server latency (12.4ms) and network packet loss trends.
- **Kernel Debug Terminal**: A simulated live shell autoscrolling system logs, auth handshakes, and stream optimization pings every 4 seconds.

---

## 🎨 Design System Specs

Haze Analyzer utilizes the **"Deep Night"** professional palette paired with clinical, anticipated typography systems:

- **Colors**:
  - `Primary / Emerald-400` (`#5af0b3`): Operational, nominal nodes, active link states.
  - `Secondary / Amber-400` (`#ffc640`): Alert thresholds, moderate particulate levels.
  - `Background / Slate-950` (`#0b1326`): Deep slate foundation maximizing indicators contrast.
  - `Surfaces / Slate-800` (`#171f33`): Glassmorphism panels with transparent backdrops (`backdrop-filter: blur(12px)`) and fine `1px` borders (`#3c4a42/30`).
- **Typography**:
  - **Inter**: Structural layout copy, navigation links, and display headlines.
  - **JetBrains Mono**: Technical readouts, geographical indexes, timestamps, and terminal shell scripts.

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/Draavith-DNA/Haze_Analyzer.git
cd Haze_Analyzer
npm install
```

### 2. Environment Variables Configuration
To load live Google Maps GIS and WAQI station layers, create a `.env` file in the root directory:
```env
# Haze Analyzer Telemetry - API Hooks
VITE_GOOGLE_MAPS_KEY=YOUR_GOOGLE_MAPS_API_KEY
VITE_WAQI_TOKEN=YOUR_WAQI_API_TOKEN
```
*Note: If no API keys are provided, the system gracefully boots into an interactive Dynamic GIS Radar HUD Fallback.*

### 3. Launch Development Server
```bash
npm run dev
```

### 4. Build Production Bundle
```bash
npm run build
```
The optimized files will be output to the `dist/` directory, fully optimized and static-linked.
