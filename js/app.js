/* ==========================================================================
   NEURAL-GRID // OVERWATCH — MAIN APPLICATION CONTROLLER
   ========================================================================== */

import { city3D } from './city3d.js';
import { telemetry, systemState, eventBus, infrastructureNodes } from './telemetry.js';
import { audioEngine } from './audio.js';
import { cliTerminal } from './cli.js';
import { profileSystem } from './profile.js';

class OverwatchApp {
  constructor() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
  }

  init() {
    // 1. Initialize Core Engines
    city3D.init('city-viewport');
    telemetry.init();
    cliTerminal.init('cli-input', 'cli-output');
    profileSystem.init();

    // 2. Start HUD Clock & FPS Counter
    this.startHUDClock();
    this.startFPSMonitor();
    this.startAudioVisualizer();

    // 3. Setup GSAP ScrollTrigger Camera Transitions
    this.setupScrollTriggers();

    // 4. Setup Event Handlers
    this.setupUIHandlers();

    // 5. Subscribe to Event Bus
    this.subscribeEvents();

    console.log("NEURAL-GRID // OVERWATCH initialized successfully.");
  }

  startHUDClock() {
    const clockEl = document.getElementById('hud-val-clock');
    const stardateEl = document.getElementById('hud-val-stardate');

    const updateClock = () => {
      const now = new Date();
      if (clockEl) clockEl.textContent = `UTC ${now.toISOString().substring(11, 19)}`;

      // Calculate Cyberpunk Stardate formula
      const year = now.getFullYear();
      const startOfYear = new Date(year, 0, 1);
      const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
      const stardate = (7700 + dayOfYear + (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400).toFixed(2);
      if (stardateEl) stardateEl.textContent = `STARDATE ${stardate}`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  startFPSMonitor() {
    const fpsEl = document.getElementById('hud-val-fps');

    const calcFPS = () => {
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFpsUpdate >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFpsUpdate = now;
        if (fpsEl) fpsEl.textContent = `FPS ${this.fps}`;
      }
      requestAnimationFrame(calcFPS);
    };
    requestAnimationFrame(calcFPS);
  }

  startAudioVisualizer() {
    const canvas = document.getElementById('audio-spectrum');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      requestAnimationFrame(draw);
      const data = audioEngine.getFrequencyData();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / 8;

      for (let i = 0; i < 8; i++) {
        const val = data[i] || (audioEngine.isMuted ? 2 : Math.random() * 15 + 4);
        const barHeight = (val / 255) * canvas.height;
        ctx.fillStyle = systemState.chaosMode ? '#ff003c' : 'rgba(0, 240, 255, 0.7)';
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      }
    };
    draw();
  }

  setupScrollTriggers() {
    // Check if GSAP & ScrollTrigger are available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const sections = [
        { id: '#hero-section', cam: 'hero' },
        { id: '#mesh-section', cam: 'mesh' },
        { id: '#sentinels-section', cam: 'sentinel' },
        { id: '#threats-section', cam: 'threat' },
        { id: '#telemetry-section', cam: 'telemetry' },
        { id: '#terminal-section', cam: 'hero' }
      ];

      sections.forEach(sec => {
        ScrollTrigger.create({
          trigger: sec.id,
          start: 'top 60%',
          end: 'bottom 60%',
          onEnter: () => {
            city3D.setCameraState(sec.cam);
            this.updateActiveNav(sec.id);
          },
          onEnterBack: () => {
            city3D.setCameraState(sec.cam);
            this.updateActiveNav(sec.id);
          }
        });
      });
    } else {
      // Fallback scroll listener
      window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + window.innerHeight / 2;
        const meshSec = document.getElementById('mesh-section');
        const threatSec = document.getElementById('threats-section');

        if (meshSec && scrollPos > meshSec.offsetTop && scrollPos < threatSec.offsetTop) {
          city3D.setCameraState('mesh');
        } else if (threatSec && scrollPos > threatSec.offsetTop) {
          city3D.setCameraState('threat');
        } else {
          city3D.setCameraState('hero');
        }
      });
    }
  }

  updateActiveNav(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  setupUIHandlers() {
    // 1. Audio Mute & Robo Voice Toggle Buttons
    const audioBtn = document.getElementById('hud-audio-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = audioEngine.toggleMute();
        audioBtn.innerHTML = isMuted ? '🔇 AUDIO MUTED' : '🔊 AUDIO ONLINE';
        audioEngine.playClick();
        audioEngine.speakVoice(isMuted ? "Audio muted" : "Audio online");
      });
    }

    const voiceBtn = document.getElementById('hud-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        const isVoiceOn = audioEngine.toggleVoice();
        voiceBtn.innerHTML = isVoiceOn ? '💀 SCARY VOICE: ON' : '💀 SCARY VOICE: OFF';
        voiceBtn.style.borderColor = isVoiceOn ? 'var(--amber-warn)' : 'var(--text-muted)';
        voiceBtn.style.color = isVoiceOn ? 'var(--amber-warn)' : 'var(--text-muted)';
        audioEngine.playClick();
        if (isVoiceOn) audioEngine.speakVoice("Scary cyber overlord voice enabled.");
      });
    }

    const profileNavBtn = document.getElementById('nav-btn-profile');
    if (profileNavBtn) {
      profileNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        audioEngine.playClick();
        profileSystem.trigger();
      });
    }

    // 2. Hero Action Buttons
    const enterBtn = document.getElementById('btn-enter-matrix');
    if (enterBtn) {
      enterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        audioEngine.playScan();
        audioEngine.speakVoice("Entering command matrix. Camera locked on infrastructure mesh.");
        city3D.setCameraState('mesh');
        const target = document.getElementById('mesh-section');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const chaosBtn = document.getElementById('btn-trigger-chaos');
    if (chaosBtn) {
      chaosBtn.addEventListener('click', () => {
        audioEngine.playClick();
        telemetry.triggerChaosSimulation();
      });
    }

    const threatChaosMain = document.getElementById('btn-threat-chaos-main');
    if (threatChaosMain) {
      threatChaosMain.addEventListener('click', () => {
        audioEngine.playClick();
        telemetry.triggerChaosSimulation();
      });
    }

    const secondaryChaosBtn = document.getElementById('btn-threat-chaos');
    if (secondaryChaosBtn) {
      secondaryChaosBtn.addEventListener('click', () => {
        audioEngine.playClick();
        telemetry.triggerChaosSimulation();
      });
    }

    // Threat Vector Scenario Handlers
    const btnOverload = document.getElementById('btn-scenario-overload');
    if (btnOverload) btnOverload.addEventListener('click', () => { audioEngine.playClick(); telemetry.triggerServerOverload(); });

    const btnIntrusion = document.getElementById('btn-scenario-intrusion');
    if (btnIntrusion) btnIntrusion.addEventListener('click', () => { audioEngine.playClick(); telemetry.triggerNetworkIntrusion(); });

    const btnDrift = document.getElementById('btn-scenario-drift');
    if (btnDrift) btnDrift.addEventListener('click', () => { audioEngine.playClick(); telemetry.triggerModelDrift(); });

    const btnCascade = document.getElementById('btn-scenario-cascade');
    if (btnCascade) btnCascade.addEventListener('click', () => { audioEngine.playClick(); telemetry.triggerCascadingFailure(); });

    const btnUnknown = document.getElementById('btn-scenario-unknown');
    if (btnUnknown) btnUnknown.addEventListener('click', () => { audioEngine.playClick(); telemetry.triggerUnknownAnomaly(); });

    const btnBlackout = document.getElementById('btn-trigger-blackout');
    if (btnBlackout) btnBlackout.addEventListener('click', () => { audioEngine.playClick(); telemetry.triggerBlackoutProtocol(); });

    const btnReset = document.getElementById('btn-system-reset');
    if (btnReset) btnReset.addEventListener('click', () => { audioEngine.playClick(); telemetry.resetSystemState(); });

    // 3. Node Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const role = btn.dataset.role;
        city3D.filterNodes(role);
        audioEngine.playHover();
        audioEngine.speakVoice(`Filtering cluster mesh by role: ${role}`);
      });
    });

    // 4. Node Inspector Drawer Handlers
    const closeInspector = document.getElementById('btn-close-inspector');
    if (closeInspector) {
      closeInspector.addEventListener('click', () => {
        const drawer = document.getElementById('node-inspector-drawer');
        if (drawer) drawer.classList.remove('active');
        audioEngine.playClick();
      });
    }

    // 5. Interactive AI Prompt Box & Chip Handler
    const promptInput = document.getElementById('ai-prompt-input');
    const promptBtn = document.getElementById('btn-submit-prompt');
    const responseBox = document.getElementById('ai-response-output');

    const handlePrompt = () => {
      if (!promptInput || !responseBox) return;
      const query = promptInput.value.trim();
      if (!query) return;

      audioEngine.playScan();
      telemetry.addInterAgentChat("AURA-1", `[PROMPT INBOUND] Processing query vector: "${query}"`);
      responseBox.innerHTML = `<span style="color:var(--cyan-main); font-family:var(--font-mono)">> [ANALYZING VECTOR] Agent AURA-1 evaluating query...</span>`;

      setTimeout(() => {
        let answer = "";
        let speechText = "";
        let isInvalid = false;
        let respondingAgent = "AURA-1";
        const q = query.toLowerCase();

        if (q.includes("anomaly") || q.includes("anomalies") || q.includes("fail") || q.includes("broken")) {
          respondingAgent = "NEXUS-9";
          answer = systemState.chaosMode
            ? `[CRITICAL ANOMALY] Saturation surge on node ${systemState.affectedNode ? systemState.affectedNode.id : 'NG-DB-014'}. NEXUS-9 Sentinel actively executing auto-remediation.`
            : "No active critical anomalies detected. Infrastructure operating at 99.997% uptime stability.";
          speechText = systemState.chaosMode ? "Critical anomaly detected. Sentinel Nexus Nine executing auto remediation." : "No active anomalies. System operating at 99.997% uptime.";
        } else if (q.includes("latency") || q.includes("slow") || q.includes("speed") || q.includes("ping")) {
          respondingAgent = "AURA-1";
          answer = `[METRIC] Average Mesh Latency: ${systemState.latency.toFixed(1)}ms. Edge Gateways routing optimal traffic across Tokyo, Frankfurt, US-East.`;
          speechText = `Average mesh latency is ${systemState.latency.toFixed(1)} milliseconds. Traffic optimal.`;
        } else if (q.includes("cipher") || q.includes("shield") || q.includes("security") || q.includes("intrusion")) {
          respondingAgent = "CIPHER";
          answer = `[SECURITY] Agent CIPHER Threat Shield ACTIVE. Confidence: ${systemState.agentConfidence.cipher.toFixed(1)}%. 0 unauthorized token leaks.`;
          speechText = `Agent Cipher Threat Shield active. Zero unauthorized token leaks detected.`;
        } else if (q.includes("predict") || q.includes("surge") || q.includes("traffic") || q.includes("kronos")) {
          respondingAgent = "KRONOS";
          answer = `[PREDICTION] Agent KRONOS confidence: ${systemState.agentConfidence.kronos.toFixed(1)}%. Projected 15% traffic surge in 45 minutes; capacity reserved.`;
          speechText = `Agent Kronos projects 15 percent traffic surge. Capacity pre-provisioned.`;
        } else if (q.includes("scan") || q.includes("status") || q.includes("health")) {
          respondingAgent = "AURA-1";
          answer = `[OVERWATCH STATUS] Status: ${systemState.status}. 20 Nodes linked, 4 Autonomous Agents active, 0 unhandled memory leaks.`;
          speechText = `Overwatch status is ${systemState.status}. 4 autonomous agents active.`;
        } else if (q.includes("threat") || q.includes("attack") || q.includes("vector")) {
          respondingAgent = "CIPHER";
          answer = `[THREAT MATRIX] Threat Level: ${systemState.threatLevel}% [${systemState.threatState}]. Active Vector: ${systemState.threatType || 'None'}.`;
          speechText = `Threat level is ${systemState.threatLevel} percent. Threat state is ${systemState.threatState}.`;
        } else if (q.includes("profile") || q.includes("abdulla") || q.includes("siyad") || q.includes("who is") || q.includes("operator")) {
          respondingAgent = "CIPHER";
          answer = "[PROFILE REVEAL] Initializing Biometric Identity Scan for ABDULLA SIYAD (Java Full Stack // Cybersecurity Specialist). Access Granted.";
          speechText = "Displaying 3D operator profile for Abdulla Siyad.";
          profileSystem.trigger();
        } else {
          isInvalid = true;
          respondingAgent = "CIPHER";
          answer = `<span style="color:var(--amber-warn)">> ⚠ UNRECOGNIZED QUERY VECTOR: '${query}'</span><br><span style="color:var(--text-muted); font-size:0.75rem;">Suggestions: Try clicking a prompt chip above or ask about "anomalies", "latency", "cipher", "scan", or "threats".</span>`;
          speechText = "Unrecognized query vector. Please select a suggested prompt chip or ask about latency, threats, or node status.";
        }

        responseBox.innerHTML = isInvalid ? answer : `> ${answer}`;
        const cleanMsg = answer.replace(/<[^>]*>?/gm, '');
        telemetry.addInterAgentChat(respondingAgent, cleanMsg);
        audioEngine.speakVoice(speechText);
        promptInput.value = '';
      }, 500);
    };

    if (promptBtn) promptBtn.addEventListener('click', handlePrompt);
    if (promptInput) {
      promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handlePrompt();
      });
    }

    // Suggested Prompt Chips Click Handler
    const promptChips = document.querySelectorAll('.ai-prompt-chip');
    promptChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.prompt;
        if (text && promptInput) {
          promptInput.value = text;
          audioEngine.playClick();
          handlePrompt();
        }
      });
    });

    // 6. Suggested Command Chips Click Handler
    const cmdChips = document.querySelectorAll('.cmd-chip');
    const terminalWindow = document.querySelector('.cli-terminal-window');
    cmdChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.dataset.cmd;
        if (cmd) {
          audioEngine.playClick();
          cliTerminal.execute(cmd);

          // Smoothly scroll to terminal window so user sees output immediately
          if (terminalWindow) {
            const yOffset = -65; // clearance for top HUD bar
            const y = terminalWindow.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }
      });
    });

    // 7. Mobile Navigation Drawer Handlers
    const mobileToggle = document.getElementById('hud-mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const mobileClose = document.getElementById('mobile-nav-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');
    const mobileProfileBtn = document.getElementById('mobile-btn-profile');

    const toggleDrawer = (open) => {
      if (!mobileDrawer) return;
      if (open) {
        mobileDrawer.classList.add('active');
        if (mobileToggle) mobileToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        audioEngine.playHover();
      } else {
        mobileDrawer.classList.remove('active');
        if (mobileToggle) mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
        audioEngine.playClick();
      }
    };

    if (mobileToggle) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileDrawer && mobileDrawer.classList.contains('active');
        toggleDrawer(!isOpen);
      });
    }

    if (mobileClose) {
      mobileClose.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDrawer(false);
      });
    }

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleDrawer(false);
      });
    });

    if (mobileProfileBtn) {
      mobileProfileBtn.addEventListener('click', () => {
        toggleDrawer(false);
        profileSystem.trigger();
      });
    }

    // Close when clicking outside the mobile drawer
    document.addEventListener('click', (e) => {
      if (mobileDrawer && mobileDrawer.classList.contains('active')) {
        if (!mobileDrawer.contains(e.target) && mobileToggle && !mobileToggle.contains(e.target)) {
          toggleDrawer(false);
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('active')) {
        toggleDrawer(false);
      }
    });



    // 9. Pipeline Stages Interactive Clicks
    const pipelineStages = document.querySelectorAll('.pipeline-stage-item');
    pipelineStages.forEach(stage => {
      stage.addEventListener('click', () => {
        pipelineStages.forEach(s => s.classList.remove('active'));
        stage.classList.add('active');
        audioEngine.playHover();
        const stageName = stage.dataset.stage || stage.textContent;
        audioEngine.speakVoice(`Pipeline stage: ${stageName}`);
      });
    });
  }

  subscribeEvents() {
    // When a node is selected in 3D city
    eventBus.on('NODE_SELECTED', (node) => {
      const drawer = document.getElementById('node-inspector-drawer');
      if (!drawer) return;

      drawer.classList.add('active');

      document.getElementById('inspector-title').textContent = node.name;
      document.getElementById('inspector-id').textContent = `NODE_ID: ${node.id}`;
      document.getElementById('inspector-role').textContent = `ROLE: ${node.role}`;
      document.getElementById('inspector-val-latency').textContent = `${node.latency} ms`;
      document.getElementById('inspector-val-error').textContent = `${node.errorRate}%`;
      document.getElementById('inspector-val-cpu').textContent = `${node.cpu}%`;
      document.getElementById('inspector-val-requests').textContent = `${(node.requests / 1000).toFixed(1)}K/s`;

      audioEngine.speakVoice(`Inspecting ${node.name}. Latency ${node.latency} milliseconds.`);
      telemetry.addInterAgentChat("AURA-1", `Locked target node ${node.id} (${node.name}). Latency ${node.latency}ms. Status: ${node.status}.`);

      const statusBadge = document.getElementById('inspector-status-badge');
      if (statusBadge) {
        statusBadge.textContent = node.status;
        statusBadge.className = `inspector-status ${node.status.toLowerCase()}`;
      }
    });
  }
}

// Bootstrap Application on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new OverwatchApp();
  app.init();
});
