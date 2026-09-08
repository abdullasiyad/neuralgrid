# NEURAL-GRID // OVERWATCH

> **AUTONOMOUS SYSTEM OVERWATCH** — Futuristic 3D Cyberpunk Observability Command Center

NEURAL-GRID // OVERWATCH is an interactive, enterprise-grade 3D observability platform built inside a cyberpunk command center. Featuring a living WebGL metropolis (built with Three.js), autonomous AI Sentinels, real-time simulated system telemetry, threat chaos engine, GSAP cinematic camera fly-throughs, synthesized Web Audio sound effects, multi-pane analytics, and an interactive CLI terminal.

---

## 🚀 Key Features

* **3D Living Cyberpunk City Engine**: Procedurally generated Three.js WebGL metropolis featuring 60+ skyscrapers with emissive window grids, animated high-speed data highways, autonomous patrolling sentinel drones, wireframe ground grid, and atmospheric dust particles.
* **Interactive 3D Building Inspector**: Raycaster targeting allows clicking any building to inspect live microservice cluster metrics (latency, error rate, CPU load, request throughput) in a slide-in side drawer.
* **Infrastructure Node Filtering**: Interactive filter buttons (`ALL`, `GATEWAYS`, `DATABASES`, `AI CORE`, `EDGE`) dynamically highlight matching infrastructure towers while dimming irrelevant nodes.
* **Threat Matrix Chaos Simulator**: Trigger a synthetic infrastructure overload with a single click: watch the city enter red alert, threat level elevate to `CRITICAL`, alarms sound, emergency shockwaves pulse, and AI Agent `NEXUS-9` deploy a laser containment beam to auto-heal the corrupted node.
* **Autonomous AI Sentinel Fleet**: 4 specialized AI Agents (`AURA-1`, `NEXUS-9`, `KRONOS`, `CIPHER`) with an interactive natural language prompt runner for interrogating system state.
* **Multi-Pane Sci-Fi Telemetry Dashboard**: Real-time canvas line charts (Latency & Error Rate), service trace waterfall visualizer, 20-node latency heatmap matrix, and a live streaming event log.
* **Synthesized Web Audio Engine**: Zero external audio samples — procedurally synthesized ambient sub-bass hum, hover tick sounds, click confirmations, radar scan sweeps, emergency siren oscillations, and healing chimes with live HUD audio visualizer.
* **Interactive Command-Line Terminal**: Fully functional in-browser terminal supporting autocomplete (`Tab`), history navigation (`Up/Down` arrows), and diagnostic commands (`status`, `scan`, `metrics`, `heal`, `deploy`, `agents`, `threats`).
* **Sci-Fi Glassmorphic HUD Cockpit**: Persistent top/bottom HUD with corner reticle brackets, live UTC clock, Cyberpunk Stardate, FPS counter, and threat level indicator.
* **Enterprise Pricing Calculator**: Tiered plans (`SECTOR GUARD`, `COMMAND MATRIX`, `OMEGA ENTERPRISE`) with an interactive node capacity slider.

---

## 🛠️ Technology Stack

* **Structure & UI**: HTML5, Semantic Markup, Responsive CSS3, Cyberpunk Design System
* **3D Graphics & WebGL**: Three.js (v0.160.0)
* **Animation & Motion**: GSAP (v3.12.5) + GSAP ScrollTrigger
* **Audio Synthesis**: Native Web Audio API (Synthesized Oscillators & Analyser)
* **Data Visualization**: HTML5 2D Canvas & Dynamic CSS Grids

---

## 📂 Project Architecture

```
cyberpunk/
├── index.html          # Main HTML structure, sci-fi HUD, 3D viewport container, modals
├── package.json        # Project metadata and package script definitions
├── README.md           # Enterprise documentation and user guide
│
├── css/
│   └── styles.css      # Cyberpunk design system (glassmorphism, clip-paths, scanlines, animations)
│
└── js/
    ├── app.js          # Core app controller, scroll trigger sync, HUD clock, UI handlers
    ├── city3d.js       # Three.js living 3D city engine (buildings, data routes, raycaster, camera states)
    ├── audio.js        # Web Audio API sound synthesizer & analyser
    ├── telemetry.js    # Central state engine, event bus, real-time charts, chaos simulator
    └── cli.js          # Interactive command-line terminal processor
```

---

## ⌨️ CLI Terminal Commands

Open the in-page CLI Terminal at the bottom of the page or type the following commands:

* `help` - List all available CLI commands
* `status` - Display global infrastructure system health and metrics
* `scan` - Run a simulated deep security and latency scan across all nodes
* `metrics` - View live streaming throughput and error rate telemetry
* `heal` - Force dispatch of AI Sentinel `NEXUS-9` to resolve active anomalies
* `deploy` - Simulate deploying an additional microservice or sentinel pod
* `agents` - Display status and confidence scores of all 4 AI agents
* `threats` - Show current threat matrix vector analysis
* `clear` - Clear the terminal output history

---

## ⚡ Performance & WebGL Optimizations

* Capped device pixel ratio at `Math.min(window.devicePixelRatio, 1.75)` for ultra-smooth 60 FPS performance on high-DPI displays.
* Efficient raycasting on low-polygon box geometries.
* WebGL hardware acceleration fallback handling gracefully degrades to flat telemetry dashboard mode if WebGL is unsupported.
* `@media (prefers-reduced-motion: reduce)` support disables non-essential particle movement and camera interpolation.

---

## ℹ️ Disclaimer

*NEURAL-GRID // OVERWATCH is a frontend interactive simulation project. Telemetry streams, threat matrices, and AI Agent execution logs are simulated systems designed to showcase advanced WebGL, audio synthesis, and interactive UI engineering.*
# neuralgrid
