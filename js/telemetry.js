/* ==========================================================================
   NEURAL-GRID // OVERWATCH — CENTRAL THREAT DIRECTOR & STATE ENGINE
   ========================================================================== */

import { audioEngine } from './audio.js';

// Event Bus Architecture
class EventBus {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const eventBus = new EventBus();

// Central Normalized System State
export const systemState = {
  threatLevel: 12,           // 0 to 100 normalized
  threatState: "NOMINAL",    // NOMINAL, ELEVATED, WARNING, CRITICAL, LOCKDOWN
  threatType: null,          // SERVER_OVERLOAD, NETWORK_INTRUSION, MODEL_DRIFT, CASCADING_FAILURE, UNKNOWN_ANOMALY
  status: "NOMINAL",
  latency: 23.4,
  targetLatency: 23.4,
  throughput: 8.42,
  errorRate: 0.04,
  targetErrorRate: 0.04,
  cpu: 41,
  targetCpu: 41,
  memory: 67,
  threats: 3,
  activeAgents: 4,
  affectedNodes: [],
  blackoutMode: false,
  lockdownMode: false,
  chaosMode: false,
  healing: false,
  affectedNode: null,
  activeNodeId: null,
  
  // AI Agent Confidence & Decision Pipeline
  agentConfidence: {
    aura: 99.8,
    nexus: 98.4,
    kronos: 97.9,
    cipher: 99.2
  },
  decisionPipelineStage: "DETECTION" // DETECTION -> CLASSIFICATION -> PREDICTION -> DECISION -> ACTION -> VERIFICATION
};

// 20 Detailed Infrastructure Nodes
export const infrastructureNodes = [
  { id: "NG-GW-001", name: "Edge Gateway Alpha", role: "GATEWAY", status: "NOMINAL", latency: 8.2, errorRate: 0.01, cpu: 32, memory: 45, requests: 24500 },
  { id: "NG-GW-002", name: "Edge Gateway Beta", role: "GATEWAY", status: "NOMINAL", latency: 9.1, errorRate: 0.02, cpu: 38, memory: 52, requests: 21200 },
  { id: "NG-AU-010", name: "Auth Mesh Sentinel", role: "AUTH", status: "NOMINAL", latency: 14.5, errorRate: 0.03, cpu: 44, memory: 61, requests: 18900 },
  { id: "NG-AU-011", name: "OAuth Token Relay", role: "AUTH", status: "NOMINAL", latency: 12.8, errorRate: 0.01, cpu: 29, memory: 48, requests: 14200 },
  { id: "NG-DB-014", name: "Database Core 01", role: "DATABASE", status: "NOMINAL", latency: 18.4, errorRate: 0.04, cpu: 41, memory: 67, requests: 12400 },
  { id: "NG-DB-015", name: "Postgres Shard 02", role: "DATABASE", status: "NOMINAL", latency: 21.0, errorRate: 0.05, cpu: 55, memory: 74, requests: 9800 },
  { id: "NG-DB-016", name: "Timescale Metrics DB", role: "DATABASE", status: "NOMINAL", latency: 19.2, errorRate: 0.02, cpu: 48, memory: 70, requests: 31000 },
  { id: "NG-AI-101", name: "Tensor Inference Core", role: "AI_CORE", status: "NOMINAL", latency: 45.6, errorRate: 0.08, cpu: 78, memory: 84, requests: 5400 },
  { id: "NG-AI-102", name: "Neural Vision Node", role: "AI_CORE", status: "NOMINAL", latency: 52.1, errorRate: 0.06, cpu: 71, memory: 79, requests: 4200 },
  { id: "NG-AI-103", name: "LLM Agent Dispatcher", role: "AI_CORE", status: "NOMINAL", latency: 38.9, errorRate: 0.04, cpu: 65, memory: 73, requests: 6800 },
  { id: "NG-ED-201", name: "CDN Edge Tokyo", role: "EDGE", status: "NOMINAL", latency: 11.2, errorRate: 0.01, cpu: 22, memory: 39, requests: 45000 },
  { id: "NG-ED-202", name: "CDN Edge Frankfurt", role: "EDGE", status: "NOMINAL", latency: 15.4, errorRate: 0.02, cpu: 28, memory: 42, requests: 38000 },
  { id: "NG-ED-203", name: "CDN Edge US-East", role: "EDGE", status: "NOMINAL", latency: 9.8, errorRate: 0.01, cpu: 31, memory: 46, requests: 52000 },
  { id: "NG-CH-301", name: "Redis L1 Cache", role: "CACHE", status: "NOMINAL", latency: 2.1, errorRate: 0.00, cpu: 18, memory: 82, requests: 92000 },
  { id: "NG-CH-302", name: "Memcached Mesh", role: "CACHE", status: "NOMINAL", latency: 1.9, errorRate: 0.00, cpu: 14, memory: 76, requests: 84000 },
  { id: "NG-QU-401", name: "Kafka Stream Nexus", role: "QUEUE", status: "NOMINAL", latency: 6.4, errorRate: 0.01, cpu: 42, memory: 58, requests: 64000 },
  { id: "NG-QU-402", name: "RabbitMQ Ingestion", role: "QUEUE", status: "NOMINAL", latency: 7.1, errorRate: 0.02, cpu: 37, memory: 53, requests: 48000 },
  { id: "NG-QU-403", name: "Vector Index Pipeline", role: "QUEUE", status: "NOMINAL", latency: 12.5, errorRate: 0.03, cpu: 59, memory: 69, requests: 19500 },
  { id: "NG-SV-501", name: "Billing Microservice", role: "AUTH", status: "NOMINAL", latency: 24.0, errorRate: 0.02, cpu: 33, memory: 50, requests: 8200 },
  { id: "NG-SV-502", name: "Telemetry Aggregator", role: "GATEWAY", status: "NOMINAL", latency: 16.1, errorRate: 0.01, cpu: 46, memory: 64, requests: 37000 }
];

// Telemetry & Threat Director Engine
export class TelemetryEngine {
  constructor() {
    this.chartData = {
      latency: Array(25).fill(23.4),
      errorRate: Array(25).fill(0.04)
    };
    this.logs = [];
    this.incidentRecord = [];
    this.activeScenarioTimeouts = [];
    this.isInitialized = false;
  }

  init() {
    this.isInitialized = true;
    this.startLoop();
    this.addLog("INFO", "AURA-1", "Central Threat Director operational. 20 Nodes linked.");
    this.addLog("INFO", "SYSTEM", "Autonomous Sentinel Grid armed.");
  }

  startLoop() {
    setInterval(() => {
      this.updateStateValues();
      this.updateCharts();
      this.updateUI();
    }, 500);

    // Periodic random background event logs
    setInterval(() => {
      if (!systemState.chaosMode && !systemState.blackoutMode) {
        const msgs = [
          "Network telemetry mesh verified nominal.",
          "AURA-1 completed routine cluster scan.",
          "KRONOS recalculated capacity allocation.",
          "CIPHER verified encrypted token relays."
        ];
        const agents = ["AURA-1", "KRONOS", "CIPHER", "NEXUS-9"];
        const agent = agents[Math.floor(Math.random() * agents.length)];
        this.addLog("INFO", agent, msgs[Math.floor(Math.random() * msgs.length)]);
      }
    }, 5000);

    // Continuous Real-Time Live Inter-Agent Dialogue Stream (Nominal + Emergency modes)
    let chatStep = 0;
    let emergencyStep = 0;
    const continuousDialogue = [
      { sender: "AURA-1", msg: "Routine telemetry sweep complete across 20 cluster nodes. Latency 23.4ms." },
      { sender: "CIPHER", msg: "Zero token forgery or unauthorized packet floods detected in edge mesh." },
      { sender: "KRONOS", msg: "Dynamic traffic prediction engine standing by. Capacity 99.9% optimal." },
      { sender: "NEXUS-9", msg: "Auto-healing containment lasers standing by on standby frequency." },
      { sender: "AURA-1", msg: "Heartbeat response verified on NG-DB-014 (Database Core 01)." },
      { sender: "CIPHER", msg: "Rotating encryption salts for OAuth token relay NG-AU-011." },
      { sender: "KRONOS", msg: "Pre-allocating 12% extra memory buffer for Redis cache mesh." },
      { sender: "NEXUS-9", msg: "Sentinel drone 02 telemetry nominal. Battery level 99.4%." }
    ];

    const emergencyDialogue = [
      { sender: "AURA-1", msg: "CRITICAL: High telemetry variance detected across edge clusters!" },
      { sender: "CIPHER", msg: "DEFENSE: Intercepting hostile packet signatures. Shielding API relays." },
      { sender: "NEXUS-9", msg: "AUTO-HEAL: Re-aligning container pod mesh to isolate corrupted nodes." },
      { sender: "KRONOS", msg: "PREDICTION: Shifting emergency compute capacity to secondary region." }
    ];

    setInterval(() => {
      if (systemState.chaosMode || systemState.lockdownMode) {
        const item = emergencyDialogue[emergencyStep % emergencyDialogue.length];
        this.addInterAgentChat(item.sender, item.msg);
        emergencyStep++;
      } else if (!systemState.blackoutMode) {
        const item = continuousDialogue[chatStep % continuousDialogue.length];
        this.addInterAgentChat(item.sender, item.msg);
        chatStep++;
      }
    }, 3000);
  }

  setThreatLevel(level, stateName = null, threatType = null) {
    systemState.threatLevel = Math.min(100, Math.max(0, level));

    if (!stateName) {
      if (systemState.threatLevel < 25) stateName = "NOMINAL";
      else if (systemState.threatLevel < 50) stateName = "ELEVATED";
      else if (systemState.threatLevel < 75) stateName = "WARNING";
      else if (systemState.threatLevel < 90) stateName = "CRITICAL";
      else stateName = "LOCKDOWN";
    }

    systemState.threatState = stateName;
    systemState.status = stateName;
    if (threatType) systemState.threatType = threatType;

    // Propagate to Audio Director
    audioEngine.updateThreatAudioLayers(systemState.threatLevel);

    // Lock Down Trigger
    if (systemState.threatLevel >= 90) {
      systemState.lockdownMode = true;
    } else {
      systemState.lockdownMode = false;
    }

    eventBus.emit('THREAT_LEVEL_CHANGED', systemState);
  }

  updateStateValues() {
    if (!systemState.chaosMode && !systemState.blackoutMode) {
      systemState.targetLatency = 20 + Math.random() * 6;
      systemState.targetErrorRate = 0.02 + Math.random() * 0.03;
      systemState.targetCpu = 38 + Math.random() * 8;
      this.setThreatLevel(12 + Math.random() * 5, "NOMINAL");
    }

    // Lerp values smooth transition
    systemState.latency += (systemState.targetLatency - systemState.latency) * 0.15;
    systemState.errorRate += (systemState.targetErrorRate - systemState.errorRate) * 0.15;
    systemState.cpu += (systemState.targetCpu - systemState.cpu) * 0.15;
  }

  updateCharts() {
    this.chartData.latency.shift();
    this.chartData.latency.push(systemState.latency);

    this.chartData.errorRate.shift();
    this.chartData.errorRate.push(systemState.errorRate);

    this.drawChart('chart-latency', this.chartData.latency, systemState.threatLevel > 75 ? '#ff003c' : '#00f0ff');
    this.drawChart('chart-error', this.chartData.errorRate, systemState.threatLevel > 50 ? '#ff003c' : '#ffb700');
  }

  drawChart(canvasId, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth || 200;
    const h = canvas.height = canvas.parentElement.clientHeight || 100;

    ctx.clearRect(0, 0, w, h);

    // Gridlines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 20; y < h; y += 20) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    const max = Math.max(...data, 10);
    const min = Math.min(...data, 0);
    const step = w / (data.length - 1);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, 'transparent');

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = i * step;
      const y = h - ((val - min) / (max - min || 1)) * (h - 15) - 5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = i * step;
      const y = h - ((val - min) / (max - min || 1)) * (h - 15) - 5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  addLog(type, source, text) {
    const time = new Date().toISOString().substring(11, 19);
    const logObj = { time, type, source, text };
    this.logs.unshift(logObj);
    if (this.logs.length > 50) this.logs.pop();

    const container = document.getElementById('event-stream-list');
    if (container) {
      const line = document.createElement('div');
      line.className = `log-line ${type}`;
      line.innerHTML = `<span style="color:#526c82">[${time}]</span> <strong>${type.padEnd(4)}</strong> <span style="color:var(--cyan-main)">${source.padEnd(8)}</span> ${text}`;
      container.insertBefore(line, container.firstChild);
      if (container.children.length > 30) {
        container.removeChild(container.lastChild);
      }
    }
  }

  addInterAgentChat(sender, message) {
    const chatList = document.getElementById('inter-agent-chat-list');
    if (!chatList) return;
    const time = new Date().toISOString().substring(11, 19);
    const div = document.createElement('div');
    div.className = `agent-chat-line ${sender.toLowerCase()}`;
    div.innerHTML = `<span class="time">[${time}]</span> <strong class="sender">${sender}:</strong> <span class="msg">${message}</span>`;
    chatList.appendChild(div);
    if (chatList.children.length > 40) chatList.removeChild(chatList.firstChild);
    requestAnimationFrame(() => {
      chatList.scrollTop = chatList.scrollHeight;
    });
  }

  updateUI() {
    // HUD Bottom items
    const elLatency = document.getElementById('hud-val-latency');
    const elThroughput = document.getElementById('hud-val-throughput');
    const elThreats = document.getElementById('hud-val-threats');

    if (elLatency) elLatency.textContent = `${systemState.latency.toFixed(1)}ms`;
    if (elThroughput) elThroughput.textContent = `${systemState.throughput.toFixed(2)} GB/s`;
    if (elThreats) elThreats.textContent = String(systemState.threats).padStart(2, '0');

    // Section metrics
    const valCpu = document.getElementById('hero-val-cpu');
    if (valCpu) valCpu.textContent = `${Math.round(systemState.cpu)}%`;

    // Threat Meter Fill Bar Update
    const fillBar = document.querySelector('.threat-meter-fill');
    if (fillBar) {
      fillBar.style.width = `${systemState.threatLevel}%`;
    }

    // AI Decision Pipeline stage update
    const pipeItems = document.querySelectorAll('.pipeline-stage-item');
    pipeItems.forEach(item => {
      if (item.dataset.stage === systemState.decisionPipelineStage) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // AI Confidence meters
    const confAura = document.getElementById('conf-val-aura');
    const confNexus = document.getElementById('conf-val-nexus');
    const confKronos = document.getElementById('conf-val-kronos');
    const confCipher = document.getElementById('conf-val-cipher');

    if (confAura) confAura.textContent = `${systemState.agentConfidence.aura.toFixed(1)}%`;
    if (confNexus) confNexus.textContent = `${systemState.agentConfidence.nexus.toFixed(1)}%`;
    if (confKronos) confKronos.textContent = `${systemState.agentConfidence.kronos.toFixed(1)}%`;
    if (confCipher) confCipher.textContent = `${systemState.agentConfidence.cipher.toFixed(1)}%`;

    // Trace waterfall updates
    const tBars = document.querySelectorAll('.trace-bar-fill');
    tBars.forEach(bar => {
      const base = parseInt(bar.dataset.base || 60);
      const varVal = Math.floor(Math.random() * 15 - 7);
      const finalVal = systemState.chaosMode ? Math.min(100, base + 35) : Math.max(10, base + varVal);
      bar.style.width = `${finalVal}%`;
      if (systemState.threatLevel > 70) bar.style.background = '#ff003c';
      else bar.style.background = 'var(--cyan-main)';
    });

    // Heatmap cell flashes
    const heatCells = document.querySelectorAll('.heatmap-cell');
    heatCells.forEach((cell, idx) => {
      if (systemState.threatLevel > 70) {
        if (idx % 3 === 0) cell.className = 'heatmap-cell hot';
        else cell.className = 'heatmap-cell warm';
      } else {
        cell.className = 'heatmap-cell';
      }
    });
  }

  clearScenarioTimeouts() {
    this.activeScenarioTimeouts.forEach(t => clearTimeout(t));
    this.activeScenarioTimeouts = [];
  }

  // THREAT SCENARIO 1: SERVER OVERLOAD
  triggerServerOverload() {
    this.clearScenarioTimeouts();
    systemState.healing = false;

    systemState.chaosMode = true;
    systemState.targetLatency = 195.4;
    systemState.targetErrorRate = 16.20;
    systemState.targetCpu = 98;
    systemState.threats = 14;
    systemState.decisionPipelineStage = "DETECTION";
    this.setThreatLevel(85, "CRITICAL", "SERVER_OVERLOAD");

    const targetNode = infrastructureNodes.find(n => n.id === "NG-DB-014") || infrastructureNodes[4];
    targetNode.status = "CRITICAL";
    targetNode.latency = 245.0;
    systemState.affectedNode = targetNode;
    systemState.affectedNodes = [targetNode];

    audioEngine.playThreatDetected();
    audioEngine.speakVoice("Warning. Server overload anomaly detected on Database Core 01.");

    document.body.classList.add('chaos-active');
    const badge = document.getElementById('hud-status-badge');
    if (badge) {
      badge.className = 'hud-status-badge critical';
      badge.querySelector('.txt').textContent = '● CRITICAL OVERLOAD';
    }

    eventBus.emit('CHAOS_STARTED', targetNode);
    this.addLog("CRIT", "OVERLOAD", `CPU SATURATION EXCEEDED ON ${targetNode.id}`);
    this.addInterAgentChat("AURA-1", `Critical anomaly on node ${targetNode.id}. Latency 245ms.`);

    this.runScenarioSequence(targetNode, [
      { t: 2000, stage: "CLASSIFICATION", chat: ["CIPHER", "Classified threat vector: Database Thread Saturation."] },
      { t: 4500, stage: "PREDICTION", chat: ["KRONOS", "Predicting cascading queue overflow in 15 seconds."] },
      { t: 7000, stage: "DECISION", chat: ["NEXUS-9", "Authorization granted. Deploying laser auto-healer beam."] },
      { t: 9500, stage: "ACTION", chat: ["NEXUS-9", "Auto-remediation protocol in progress..."] },
      { t: 13000, stage: "VERIFICATION", chat: ["AURA-1", "Metrics stabilizing. Target node recovered."] }
    ]);
  }

  // THREAT SCENARIO 2: NETWORK INTRUSION
  triggerNetworkIntrusion() {
    this.clearScenarioTimeouts();
    systemState.healing = false;

    systemState.chaosMode = true;
    systemState.targetLatency = 140.2;
    systemState.targetErrorRate = 12.4;
    systemState.targetCpu = 88;
    systemState.threats = 18;
    systemState.decisionPipelineStage = "DETECTION";
    this.setThreatLevel(92, "LOCKDOWN", "NETWORK_INTRUSION");

    const targetNode = infrastructureNodes.find(n => n.id === "NG-ED-201") || infrastructureNodes[10];
    targetNode.status = "CRITICAL";
    systemState.affectedNode = targetNode;
    systemState.affectedNodes = [targetNode];

    audioEngine.playThreatDetected();
    audioEngine.speakVoice("Alert. Unauthorized network intrusion vector intercepted.");

    document.body.classList.add('chaos-active');
    const badge = document.getElementById('hud-status-badge');
    if (badge) {
      badge.className = 'hud-status-badge critical';
      badge.querySelector('.txt').textContent = '● NETWORK INTRUSION';
    }

    eventBus.emit('INTRUSION_STARTED', targetNode);
    this.addLog("CRIT", "INTRUSION", `UNAUTHORIZED PACKET FLOOD DETECTED ON ${targetNode.id}`);
    this.addInterAgentChat("CIPHER", `Hostile red packets intercepted at Edge Gateway ${targetNode.id}.`);

    this.runScenarioSequence(targetNode, [
      { t: 2500, stage: "CLASSIFICATION", chat: ["CIPHER", "Isolating compromised edge socket channels."] },
      { t: 5000, stage: "DECISION", chat: ["AURA-1", "Rerouting encrypted token traffic to Frankfurt relay."] },
      { t: 8000, stage: "ACTION", chat: ["NEXUS-9", "Quarantining corrupted network interfaces."] },
      { t: 12000, stage: "VERIFICATION", chat: ["CIPHER", "Threat vector neutralised. Quarantine verified."] }
    ]);
  }

  // THREAT SCENARIO 3: AI MODEL DRIFT
  triggerModelDrift() {
    this.clearScenarioTimeouts();
    systemState.healing = false;

    systemState.chaosMode = true;
    systemState.agentConfidence.aura = 68.2;
    systemState.agentConfidence.kronos = 61.4;
    systemState.targetLatency = 110.5;
    systemState.targetErrorRate = 8.6;
    systemState.decisionPipelineStage = "DETECTION";
    this.setThreatLevel(65, "WARNING", "MODEL_DRIFT");

    const targetNode = infrastructureNodes.find(n => n.id === "NG-AI-101") || infrastructureNodes[7];
    targetNode.status = "DEGRADED";
    systemState.affectedNode = targetNode;
    systemState.affectedNodes = [targetNode];

    audioEngine.playThreatDetected();
    audioEngine.speakVoice("Warning. Neural inference model drift detected.");

    eventBus.emit('MODEL_DRIFT_STARTED', targetNode);
    this.addLog("WARN", "MODEL_DRIFT", `Inference confidence degraded on ${targetNode.id}`);
    this.addInterAgentChat("AURA-1", `Model confidence dropped below threshold (68.2%).`);

    this.runScenarioSequence(targetNode, [
      { t: 3000, stage: "CLASSIFICATION", chat: ["KRONOS", "Recalibrating tensor weight matrix parameters."] },
      { t: 6000, stage: "ACTION", chat: ["NEXUS-9", "Hot-swapping inference model fallback checkpoint."] },
      { t: 10000, stage: "VERIFICATION", chat: ["AURA-1", "Model accuracy restored to 99.8%."] }
    ]);
  }

  // THREAT SCENARIO 4: CASCADING FAILURE
  triggerCascadingFailure() {
    this.clearScenarioTimeouts();
    systemState.healing = false;

    systemState.chaosMode = true;
    systemState.targetLatency = 260.0;
    systemState.targetErrorRate = 22.5;
    systemState.targetCpu = 99;
    systemState.threats = 20;
    systemState.decisionPipelineStage = "DETECTION";
    this.setThreatLevel(98, "LOCKDOWN", "CASCADING_FAILURE");

    const n1 = infrastructureNodes[4]; // DB
    const n2 = infrastructureNodes[2]; // Auth
    const n3 = infrastructureNodes[0]; // Gateway
    systemState.affectedNodes = [n1, n2, n3];
    systemState.affectedNode = n1;

    audioEngine.playThreatDetected();
    audioEngine.speakVoice("Emergency. Cascading infrastructure failure in progress.");

    document.body.classList.add('chaos-active');
    const badge = document.getElementById('hud-status-badge');
    if (badge) {
      badge.className = 'hud-status-badge critical';
      badge.querySelector('.txt').textContent = '● CASCADING LOCKDOWN';
    }

    eventBus.emit('CASCADE_STARTED', systemState.affectedNodes);
    this.addLog("CRIT", "CASCADE", `CASCADING FAILURE: ${n1.id} -> ${n2.id} -> ${n3.id}`);
    this.addInterAgentChat("AURA-1", `Domino node collapse detected starting at ${n1.id}.`);

    this.runScenarioSequence(n1, [
      { t: 2000, stage: "CLASSIFICATION", chat: ["CIPHER", `Secondary failure spreading to ${n2.id}.`] },
      { t: 4500, stage: "PREDICTION", chat: ["KRONOS", `Tertiary failure approaching Edge Gateway ${n3.id}.`] },
      { t: 7500, stage: "DECISION", chat: ["NEXUS-9", "Engaging circuit breakers across cluster mesh."] },
      { t: 11000, stage: "ACTION", chat: ["NEXUS-9", "Restoring node consensus sequentially..."] },
      { t: 15000, stage: "VERIFICATION", chat: ["AURA-1", "Cascading failure stopped. All 3 nodes restored."] }
    ]);
  }

  // THREAT SCENARIO 5: UNKNOWN ANOMALY (EASTER EGG)
  triggerUnknownAnomaly() {
    this.clearScenarioTimeouts();
    systemState.healing = false;

    systemState.chaosMode = true;
    this.setThreatLevel(78, "WARNING", "UNKNOWN_ANOMALY");

    audioEngine.playScan();
    audioEngine.speakVoice("Passive observer entity detected in cluster orbit.");

    this.addLog("CRIT", "UNKNOWN", "UNCLASSIFIED ENTITY DETECTED AT COORDINATE [X:42, Z:-30]");
    this.addInterAgentChat("CIPHER", "Unclassified payload signature. Classification: UNKNOWN.");

    eventBus.emit('UNKNOWN_ANOMALY_STARTED');

    this.runScenarioSequence(null, [
      { t: 3000, stage: "PREDICTION", chat: ["AURA-1", "Orbital camera tracking target coordinate..."] },
      { t: 7000, stage: "ACTION", chat: ["CIPHER", "Target lost. Signature vanished from mesh."] }
    ]);
  }

  // BLACKOUT PROTOCOL
  triggerBlackoutProtocol() {
    if (systemState.blackoutMode) return;
    systemState.blackoutMode = true;
    this.setThreatLevel(99, "LOCKDOWN", "BLACKOUT");

    document.body.classList.add('blackout-active');
    audioEngine.playBlackout();
    audioEngine.speakVoice("Blackout protocol initiated. Core infrastructure autonomous.");

    this.addLog("CRIT", "BLACKOUT", "NON-ESSENTIAL CITY LIGHTING DEACTIVATED");
    this.addInterAgentChat("NEXUS-9", "Blackout Protocol active. Autonomous sentinel control engaged.");

    eventBus.emit('BLACKOUT_STARTED');

    const timeout = setTimeout(() => {
      this.resetSystemState();
      document.body.classList.remove('blackout-active');
      audioEngine.playSystemRestored();
      audioEngine.speakVoice("Blackout protocol complete. Systems nominal.");
      this.addLog("INFO", "BLACKOUT", "Blackout protocol cleared. Grid power restored.");
    }, 12000);
    this.activeScenarioTimeouts.push(timeout);
  }

  runScenarioSequence(targetNode, steps) {
    steps.forEach(step => {
      const t = setTimeout(() => {
        systemState.decisionPipelineStage = step.stage;
        if (step.chat) this.addInterAgentChat(step.chat[0], step.chat[1]);
      }, step.t);
      this.activeScenarioTimeouts.push(t);
    });

    const recoveryTime = steps[steps.length - 1].t + 3000;
    const finalTimeout = setTimeout(() => {
      this.resetSystemState();
    }, recoveryTime);
    this.activeScenarioTimeouts.push(finalTimeout);
  }

  triggerChaosSimulation() {
    this.triggerServerOverload();
  }

  resetSystemState() {
    this.clearScenarioTimeouts();

    systemState.chaosMode = false;
    systemState.healing = false;
    systemState.blackoutMode = false;
    systemState.lockdownMode = false;
    systemState.threatType = null;
    systemState.affectedNode = null;
    systemState.affectedNodes = [];
    systemState.targetLatency = 23.4;
    systemState.targetErrorRate = 0.04;
    systemState.targetCpu = 41;
    systemState.threats = 3;
    systemState.agentConfidence = { aura: 99.8, nexus: 98.4, kronos: 97.9, cipher: 99.2 };
    systemState.decisionPipelineStage = "VERIFICATION";

    this.setThreatLevel(12, "NOMINAL");

    infrastructureNodes.forEach(n => {
      n.status = "NOMINAL";
      n.latency = Math.floor(Math.random() * 15 + 8);
      n.errorRate = 0.02;
    });

    document.body.classList.remove('chaos-active');
    document.body.classList.remove('blackout-active');

    const badge = document.getElementById('hud-status-badge');
    if (badge) {
      badge.className = 'hud-status-badge';
      badge.querySelector('.txt').textContent = '● NOMINAL';
    }

    audioEngine.stopAlarm();
    audioEngine.playSystemRestored();
    this.addLog("INFO", "SYSTEM", "Overwatch system state fully restored to NOMINAL.");
    eventBus.emit('SYSTEM_NOMINAL');
  }
}

export const telemetry = new TelemetryEngine();
