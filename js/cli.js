/* ==========================================================================
   NEURAL-GRID // OVERWATCH — INTERACTIVE COMMAND-LINE TERMINAL & SUDO MATRIX
   ========================================================================== */

import { systemState, telemetry, infrastructureNodes, eventBus } from './telemetry.js';
import { audioEngine } from './audio.js';
import { city3D } from './city3d.js';
import { profileSystem } from './profile.js';

export class CLIProcessor {
  constructor() {
    this.history = [];
    this.historyIndex = -1;
    this.commands = [
      'help', 'whoami', 'status', 'scan', 'metrics', 'nodes', 'inspect', 'filter', 
      'chaos', 'heal', 'deploy', 'agents', 'threats', 'audio', 'voice', 
      'blackout', 'lockdown', 'reset', 'scenario', 'matrix', 'top', 'ping', 
      'neofetch', 'sysinfo', 'sudo', 'clear', 'exit'
    ];
    this.input = null;
    this.outputContainer = null;
    this.terminalWindow = null;
    this.promptLabel = null;
    this.isRoot = false;
    this.matrixInterval = null;
  }

  init(inputId, outputId, windowId = 'terminal-window') {
    this.input = document.getElementById(inputId);
    this.outputContainer = document.getElementById(outputId);
    this.terminalWindow = document.getElementById(windowId) || (this.input ? this.input.closest('.cli-terminal-window') : null);
    this.promptLabel = document.querySelector('.cli-prompt-label');

    if (!this.input || !this.outputContainer) return;

    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));

    if (this.terminalWindow) {
      this.terminalWindow.addEventListener('click', (e) => {
        if (e.target !== this.input) {
          this.input.focus();
        }
      });
    }
  }

  updatePromptLabel() {
    if (this.promptLabel) {
      if (this.isRoot) {
        this.promptLabel.textContent = 'root@overwatch:~#';
        this.promptLabel.style.color = 'var(--red-alert)';
        this.promptLabel.style.textShadow = '0 0 8px var(--red-alert)';
      } else {
        this.promptLabel.textContent = 'neural@overwatch:~$';
        this.promptLabel.style.color = 'var(--cyan-main)';
        this.promptLabel.style.textShadow = 'none';
      }
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      const cmd = this.input.value.trim();
      this.input.value = '';
      if (cmd) {
        this.history.push(cmd);
        this.historyIndex = this.history.length;
        this.execute(cmd);
        audioEngine.playClick();
      }
    } else if (e.key === 'ArrowUp') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.input.value = '';
      }
      e.preventDefault();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = this.input.value.trim();
      if (val) {
        const match = this.commands.find(c => c.startsWith(val.toLowerCase()));
        if (match) this.input.value = match;
      }
    }
  }

  execute(rawCmd) {
    const promptText = this.isRoot ? 'root@overwatch:~#' : 'neural@overwatch:~$';
    const promptClass = this.isRoot ? 'prompt-line root-prompt' : 'prompt-line';
    this.appendLine(`${promptText} ${rawCmd}`, promptClass);

    const parts = rawCmd.trim().split(/\s+/);
    const mainCmd = parts[0].toLowerCase();

    if (mainCmd === 'sudo') {
      const subCmd = parts[1] ? parts[1].toLowerCase() : null;
      const subArg = parts[2] ? parts[2].toUpperCase() : null;

      if (!subCmd) {
        this.appendLine("usage: sudo [command | su | matrix | override | purge | blackout | lockdown]");
        return;
      }

      audioEngine.playScan();
      this.appendLine("[SUDO] Authenticating OMEGA-LEVEL Root Clearance...", "warn-text");

      setTimeout(() => {
        if (subCmd === 'su' || subCmd === 'root' || subCmd === 'access') {
          this.isRoot = true;
          this.updatePromptLabel();
          this.appendLine("ACCESS GRANTED: Root shell initialized. OMEGA clearance active.", "crit-text");
        } else if (subCmd === 'matrix') {
          this.runMatrixRain();
        } else if (subCmd === 'override') {
          this.appendLine("[SUDO OVERRIDE] Safety locks disengaged. Resetting system matrix...", "crit-text");
          telemetry.resetSystemState();
          this.appendLine("SUCCESS: All system parameters force-stabilized to OPTIMAL.");
        } else if (subCmd === 'purge') {
          this.appendLine("[SUDO PURGE] Flushing telemetry buffers & clearing cache mesh...", "warn-text");
          this.appendLine("CACHE PURGED: 1.42 GB memory reclaimed across 20 cluster nodes.");
        } else {
          this.executeSubCommand(subCmd, subArg, true);
        }
      }, 300);

      return;
    }

    if (mainCmd === 'exit' && this.isRoot) {
      this.isRoot = false;
      this.updatePromptLabel();
      this.appendLine("Logged out from root. Returned to neural user session.");
      return;
    }

    this.executeSubCommand(mainCmd, parts[1] ? parts[1].toUpperCase() : null, this.isRoot);
  }

  executeSubCommand(cmd, arg, isElevated = false) {
    switch (cmd) {
      case 'help':
        this.appendLine(`
SUPPORTED COMMANDS:
-------------------
  whoami           - Display developer profile & cybersecurity protocols
  status           - View global autonomous system state
  scan             - Execute instant infrastructure diagnostic scan
  metrics          - Display live real-time telemetry metrics
  nodes            - List all 20 active infrastructure cluster nodes
  inspect <id>     - Open node inspector (e.g. 'inspect NG-DB-014')
  filter <role>    - Filter 3D city buildings (GATEWAY, DATABASE, AI_CORE, EDGE, ALL)
  chaos / simulate - Trigger Chaos Engine emergency failure simulation
  scenario <1-5>   - Trigger threat scenario (1:Overload, 2:Intrusion, 3:Drift, 4:Cascade, 5:Unknown)
  blackout         - Initiate Blackout Protocol (deactivates city lights)
  lockdown         - Force LOCKDOWN emergency state (threatLevel 99%)
  reset            - Safe system state reset to NOMINAL
  heal             - Dispatch AI sentinel remediation protocol
  deploy           - Deploy autonomous microservice pod or sentinel
  agents           - List all active AI Sentinel units
  threats          - Display system threat matrix
  matrix           - Stream green/cyan digital code rain stream
  top / htop       - View live interactive process manager
  ping <id>        - Ping an infrastructure node
  neofetch         - Display Cyberpunk Overwatch ASCII System Info
  audio <on|off>   - Toggle Web Audio API synthesizer
  voice <on|off>   - Toggle SpeechSynthesis AI voice announcements
  sudo <cmd>       - Execute command with OMEGA level root privileges
  clear            - Clear terminal output buffer
`);
        break;

      case 'whoami':
      case 'who':
      case 'siyad':
      case 'abdulla':
      case 'profile':
        this.appendLine(`
==========================================================================
                 # ABDULLA SIYAD
   JAVA FULL STACK DEVELOPER // CYBERSECURITY // ETHICAL HACKING
==========================================================================
> IDENTITY VERIFIED. ACCESS GRANTED.

ABDULLA SIYAD — Secure Software Architect. Full Stack Engineer. Cybersecurity Specialist.

MISSION PROFILE
  • Build scalable, high-performance applications.
  • Engineer secure backend systems and APIs.
  • Detect vulnerabilities before attackers do.
  • Harden infrastructure against real-world threats.
  • Secure every layer. Trust nothing by default.

CORE PROTOCOLS
  [JAVA] • [SPRING BOOT] • [REACT] • [REST APIs] • [MYSQL]
  [CYBERSECURITY] • [ETHICAL HACKING] • [NETWORK SECURITY]

STATUS : ACTIVE
MODE   : SECURITY-FIRST ENGINEERING

> BUILD. DEFEND. DOMINATE.
==========================================================================
`, "cyan-text");
        audioEngine.speakVoice("Identity verified: Abdulla Siyad. Secure Software Architect and Cybersecurity Specialist. Access granted.");
        telemetry.addInterAgentChat("CIPHER", "Identity verified: ABDULLA SIYAD. Security-First Engineering protocol ACTIVE.");
        profileSystem.trigger();
        break;

      case 'blackout':
        this.appendLine("INITIATING BLACKOUT PROTOCOL...");
        telemetry.triggerBlackoutProtocol();
        break;

      case 'lockdown':
        this.appendLine("FORCING LOCKDOWN STATE (THREAT LEVEL 99%)...");
        telemetry.setThreatLevel(99, "LOCKDOWN", "MANUAL_LOCKDOWN");
        break;

      case 'reset':
        this.appendLine("EXECUTING SAFE SYSTEM RESET TO NOMINAL...");
        telemetry.resetSystemState();
        break;

      case 'scenario':
        if (arg === '1' || arg === 'OVERLOAD') telemetry.triggerServerOverload();
        else if (arg === '2' || arg === 'INTRUSION') telemetry.triggerNetworkIntrusion();
        else if (arg === '3' || arg === 'DRIFT') telemetry.triggerModelDrift();
        else if (arg === '4' || arg === 'CASCADE') telemetry.triggerCascadingFailure();
        else if (arg === '5' || arg === 'UNKNOWN') telemetry.triggerUnknownAnomaly();
        else this.appendLine("Usage: scenario <1:Overload | 2:Intrusion | 3:Drift | 4:Cascade | 5:Unknown>");
        break;

      case 'voice':
        const vState = audioEngine.toggleVoice();
        this.appendLine(`SpeechSynthesis AI Voice: ${vState ? 'ENABLED' : 'DISABLED'}`);
        break;

      case 'matrix':
        this.runMatrixRain();
        break;

      case 'neofetch':
      case 'sysinfo':
        this.appendLine(`
   ███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗     
   ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║     
   ██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║     
   ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║     
   ██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗
   ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
 ----------------------------------------------------
  OS          : NEURAL-GRID OVERWATCH OS v4.19 (DARK THREAT CORE)
  KERNEL      : Linux 6.12.0-cybernet-amd64
  HOST        : Megastructure Cluster Mesh #042
  UPTIME      : 14 days, 6 hours, 42 mins
  THREAT LEVEL: ${systemState.threatLevel}% [${systemState.threatState}]
  NODES       : 20 Active / 128 Mesh Total
  SENTINELS   : 4 Autonomous AI Sentinels (AURA, NEXUS, KRONOS, CIPHER)
  RENDER ENGINE: Three.js WebGL 2.0 (ACES Filmic ToneMapping)
  AUDIO SYNTH : 7-Layer Web Audio API + SpeechSynth Voice
  SHELL       : ${this.isRoot ? 'zsh 5.9 (ROOT OMEGA)' : 'bash 5.2.15 (neural)'}
`);
        break;

      case 'top':
      case 'htop':
        this.appendLine(`
OVERWATCH PROCESS MANAGER (top):
--------------------------------
  PID   USER      PR  NI  VIRT   RES    CPU%  MEM%  COMMAND
  101   root      20   0  12.4G  4.2G   28.4  12.1  threejs-render-loop
  102   neural    20   0   8.1G  2.1G   14.2   6.4  aura-1-sentinel
  103   neural    20   0   6.8G  1.8G    8.5   5.2  nexus-9-autohealer
  104   neural    20   0   5.2G  1.4G    4.1   3.8  kronos-scaler
  105   cipher    20   0   4.9G  1.2G    2.8   3.1  cipher-threat-shield
  106   telemetry 20   0   2.1G  600M    1.9   1.5  threat-director-bus
`);
        break;

      case 'ping':
        if (!arg) {
          this.appendLine("Usage: ping <NODE_ID> (e.g. 'ping NG-DB-014' or 'ping NG-GW-001')");
          break;
        }
        const pingNode = infrastructureNodes.find(n => n.id.toUpperCase() === arg || n.id.replace('NG-', '').toUpperCase() === arg);
        if (pingNode) {
          this.appendLine(`PING ${pingNode.id} (${pingNode.name}) 56(84) bytes of data.`);
          let pCount = 0;
          const pInt = setInterval(() => {
            if (pCount < 4) {
              const rtt = (pingNode.latency + (Math.random() * 2 - 1)).toFixed(2);
              this.appendLine(`64 bytes from ${pingNode.id}: icmp_seq=${pCount + 1} ttl=64 time=${rtt} ms`);
              pCount++;
            } else {
              clearInterval(pInt);
              this.appendLine(`--- ${pingNode.id} ping statistics ---`);
              this.appendLine(`4 packets transmitted, 4 received, 0% packet loss, time 3004ms`);
            }
          }, 350);
        } else {
          this.appendLine(`ping: unknown host '${arg}'. Type 'nodes' for valid host IDs.`);
        }
        break;

      case 'status':
        this.appendLine(`
SYSTEM STATUS SUMMARY ${isElevated ? '[OMEGA ROOT ACCESS]' : ''}
---------------------------------------------
THREAT LEVEL     : ${systemState.threatLevel}% [${systemState.threatState}]
OVERWATCH STATUS : ${systemState.status}
THREAT VECTOR    : ${systemState.threatType || 'NONE'}
TOTAL NODES      : 20 Linked (128 Cluster Mesh)
ACTIVE AGENTS    : 04 Autonomous Sentinels
SYSTEM LATENCY   : ${systemState.latency.toFixed(1)} ms
THROUGHPUT       : ${systemState.throughput.toFixed(2)} GB/s
ERROR RATE       : ${systemState.errorRate.toFixed(2)}%
CPU SATURATION   : ${Math.round(systemState.cpu)}%
AFFECTED NODE    : ${systemState.affectedNode ? systemState.affectedNode.id : 'NONE'}
BLACKOUT MODE    : ${systemState.blackoutMode ? 'ACTIVE' : 'INACTIVE'}
`);
        break;

      case 'scan':
        this.appendLine("Initiating deep infrastructure telemetry scan...");
        let scanned = 0;
        const scanInterval = setInterval(() => {
          if (scanned < 5) {
            const node = infrastructureNodes[scanned * 4];
            this.appendLine(`[SCAN] ${node.id} (${node.name.padEnd(20)}) -> LATENCY: ${node.latency}ms | ROLE: ${node.role} | OK`);
            scanned++;
          } else {
            clearInterval(scanInterval);
            this.appendLine("SCAN COMPLETE: 0 critical vulnerabilities detected. Mesh nominal.");
          }
        }, 250);
        break;

      case 'metrics':
        this.appendLine(`
REAL-TIME METRIC STREAM:
------------------------
Latency Avg  : ${systemState.latency.toFixed(1)} ms
Throughput   : ${systemState.throughput.toFixed(2)} GB/s
Error Rate   : ${systemState.errorRate.toFixed(2)} %
Memory Sat   : ${systemState.memory} %
Redis Cache  : Hit Ratio 99.4%
Kafka Ingest : 64.2K msgs/sec
`);
        break;

      case 'nodes':
        this.appendLine("LINKED INFRASTRUCTURE NODES (20 Total):");
        this.appendLine("----------------------------------------");
        infrastructureNodes.forEach(n => {
          this.appendLine(`- ${n.id} | ${n.name.padEnd(22)} | ROLE: ${n.role.padEnd(8)} | LATENCY: ${n.latency}ms`);
        });
        break;

      case 'inspect':
        if (!arg) {
          this.appendLine("Usage: inspect <NODE_ID> (e.g. 'inspect NG-DB-014' or 'inspect NG-GW-001')");
          break;
        }
        const targetNode = infrastructureNodes.find(n => n.id.toUpperCase() === arg || n.id.replace('NG-', '').toUpperCase() === arg);
        if (targetNode) {
          systemState.activeNodeId = targetNode.id;
          eventBus.emit('NODE_SELECTED', targetNode);
          this.appendLine(`SUCCESS: Opened Node Inspector for ${targetNode.id} (${targetNode.name}).`);
          const drawer = document.getElementById('node-inspector-drawer');
          if (drawer) drawer.scrollIntoView({ behavior: 'smooth' });
        } else {
          this.appendLine(`ERROR: Node '${arg}' not found. Type 'nodes' to view valid IDs.`);
        }
        break;

      case 'filter':
        const roleArg = arg || 'ALL';
        const validRoles = ['ALL', 'GATEWAY', 'DATABASE', 'AI_CORE', 'EDGE', 'AUTH', 'CACHE', 'QUEUE'];
        if (validRoles.includes(roleArg)) {
          city3D.filterNodes(roleArg);
          this.appendLine(`SUCCESS: 3D City buildings filtered by role '${roleArg}'.`);
          const filterBtn = document.querySelector(`.filter-btn[data-role="${roleArg}"]`);
          if (filterBtn) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            filterBtn.classList.add('active');
          }
        } else {
          this.appendLine(`Invalid role '${roleArg}'. Valid roles: ${validRoles.join(', ')}`);
        }
        break;

      case 'chaos':
      case 'simulate':
        if (systemState.chaosMode) {
          this.appendLine("Chaos simulation is already active! Sentinel auto-remediation in progress...");
        } else {
          this.appendLine("⚠ INJECTING SYNTHETIC CHAOS SURGE INTO INFRASTRUCTURE MESH...");
          telemetry.triggerChaosSimulation();
        }
        break;

      case 'heal':
        if (systemState.chaosMode || systemState.affectedNode) {
          this.appendLine("DISPATCHING NEXUS-9 AUTO-HEALER TO AFFECTED SITE...");
          telemetry.addLog("AI", "CLI", "Manual trigger for AI Sentinel auto-remediation");
        } else {
          this.appendLine("No active anomalies detected. All nodes operational.");
        }
        break;

      case 'deploy':
        this.appendLine("Deploying Autonomous Sentinel Pod [SENTINEL-04-ALPHA]...");
        setTimeout(() => {
          this.appendLine("SUCCESS: SENTINEL-04-ALPHA attached to Overwatch Mesh.");
        }, 600);
        break;

      case 'agents':
        this.appendLine(`
AUTONOMOUS SENTINEL FLEET:
--------------------------
1. AURA-1   : Observability Guard    | STATUS: ACTIVE (99.8% Conf)
2. NEXUS-9  : Autonomous Auto-Healer | STATUS: READY  (98.4% Conf)
3. KRONOS   : Predictive Scaler      | STATUS: ACTIVE (97.9% Conf)
4. CIPHER   : Threat Shield          | STATUS: GUARD  (99.2% Conf)
`);
        break;

      case 'threats':
        this.appendLine(`
THREAT MATRIX ANALYSIS:
-----------------------
Threat Level         : ${systemState.threatLevel}% [${systemState.threatState}]
Active Threat Vector : ${systemState.threatType || 'None Detected'}
Affected Nodes       : ${systemState.affectedNodes.map(n=>n.id).join(', ') || 'None'}
Mitigation Status    : Autonomous AI Guard Active
`);
        break;

      case 'audio':
        const isMuted = audioEngine.toggleMute();
        const btn = document.getElementById('hud-audio-btn');
        if (btn) btn.innerHTML = isMuted ? '🔇 AUDIO MUTED' : '🔊 AUDIO ONLINE';
        this.appendLine(`Audio engine set to: ${isMuted ? 'MUTED' : 'ONLINE'}`);
        break;

      case 'clear':
        if (this.outputContainer) this.outputContainer.innerHTML = '';
        if (this.matrixInterval) {
          clearInterval(this.matrixInterval);
          this.matrixInterval = null;
        }
        break;

      default:
        this.appendLine(`Command not recognized: '${cmd}'. Type 'help' for available commands.`);
        break;
    }
  }

  runMatrixRain() {
    this.appendLine("INITIALIZING DIGITAL MATRIX CODE STREAM...", "matrix-line");
    audioEngine.playScan();

    if (this.matrixInterval) clearInterval(this.matrixInterval);

    const chars = "0101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890@#$%&*<>[]{}";
    let linesCount = 0;
    const lineLen = Math.max(52, Math.min(84, Math.floor(((this.terminalWindow ? this.terminalWindow.clientWidth : 700) - 60) / 9.5)));

    this.matrixInterval = setInterval(() => {
      if (linesCount < 20) {
        let str = "";
        for (let i = 0; i < lineLen; i++) {
          str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.appendLine(str, "matrix-line");
        linesCount++;
      } else {
        clearInterval(this.matrixInterval);
        this.matrixInterval = null;
        this.appendLine("MATRIX DECRYPTION COMPLETE // SYSTEM NEURAL MESH VERIFIED.", "matrix-line");
      }
    }, 65);
  }

  appendLine(text, cssClass = '') {
    if (!this.outputContainer) return;
    const line = document.createElement('div');
    line.className = `cli-line ${cssClass}`;
    line.textContent = text;
    this.outputContainer.appendChild(line);

    // Smooth & Instant Auto-Scroll for both container & scrollable .cli-body wrapper
    const bodyEl = this.outputContainer.closest('.cli-body') || this.outputContainer;
    bodyEl.scrollTop = bodyEl.scrollHeight;
    requestAnimationFrame(() => {
      bodyEl.scrollTop = bodyEl.scrollHeight;
    });
  }
}

export const cliTerminal = new CLIProcessor();
