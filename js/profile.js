/* ==========================================================================
   NEURAL-GRID // OVERWATCH — ABDULLA SIYAD ADVANCED 3D NEURAL PROFILE
   ========================================================================== */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { telemetry } from './telemetry.js';
import { audioEngine } from './audio.js';

export class ProfileRevealSystem {
  constructor() {
    this.backdrop = null;
    this.closeBtn = null;
    this.canvas = null;
    this.scanOverlay = null;
    this.timerBar = null;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.portraitMesh = null;
    this.faceCropMesh = null;
    this.faceWireframeMesh = null;
    this.laserScanLine = null;
    this.neuralParticles = null;
    this.neuralLines = null;
    this.lightPoint = null;
    this.portraitGroup = null;
    this.bgGridPlane = null;

    this.isOpen = false;
    this.isRevealed = false;
    this.animationFrameId = null;

    // Cursor 3D Interaction Variables (Enhanced 3D Tilt & Parallax)
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.currentRotationX = 0;
    this.currentRotationY = 0;

    this.targetParallaxX = 0;
    this.targetParallaxY = 0;
    this.currentParallaxX = 0;
    this.currentParallaxY = 0;

    this.autoCloseTimer = null;
    this.scanTimer = null;
    this.binaryCanvas = null;
    this.binaryTexture = null;
    this.zoomProgress = 0; // 0 = Full suit original portrait, 1 = Close-up cropped face
  }

  init() {
    this.backdrop = document.getElementById('profile-overlay-backdrop');
    this.closeBtn = document.getElementById('btn-close-profile');
    this.canvas = document.getElementById('profile-3d-canvas');
    this.scanOverlay = document.getElementById('profile-scan-overlay');
    this.timerBar = document.getElementById('profile-timer-bar');

    if (!this.backdrop || !this.canvas) return;

    // Event listeners
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Close when clicking directly on backdrop outside card
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // 3D Mousemove Parallax tracking over backdrop / card window
    this.backdrop.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.backdrop.addEventListener('mouseleave', () => this.handleMouseLeave());

    // Touch support for mobile
    this.backdrop.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.handleMouseMove(e.touches[0]);
      }
    }, { passive: true });

    // Handle responsive window resize / orientation changes
    window.addEventListener('resize', () => this.onResize());

    // Pre-initialize 3D Scene and Video immediately so video is 100% buffered and ready
    this.preloadVideoAndScene();
  }

  onResize() {
    if (!this.renderer || !this.camera || !this.canvas || !this.canvas.parentElement) return;
    const width = this.canvas.parentElement.clientWidth || 380;
    const height = this.canvas.parentElement.clientHeight || 480;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  preloadVideoAndScene() {
    // 1. Get or create preloaded video element
    let video = document.getElementById('profile-preloaded-video');
    if (!video) {
      video = document.createElement('video');
      video.id = 'profile-preloaded-video';
      video.src = 'assets/WhatsApp%20Video%202026-09-08%20at%2011.43.38%20PM.mp4';
      video.style.position = 'fixed';
      video.style.top = '-9999px';
      video.style.left = '-9999px';
      video.style.width = '1px';
      video.style.height = '1px';
      video.style.opacity = '0';
      video.style.pointerEvents = 'none';
      document.body.appendChild(video);
    }

    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    // Kick off autoplay immediately in background
    video.play().catch(err => {
      console.log('Video background autoplay pending user gesture:', err);
    });

    this.videoElement = video;

    // 2. Setup 3D WebGL scene eagerly so shaders and geometry are compiled in advance
    this.setup3DScene();
  }

  handleMouseMove(e) {
    if (!this.isOpen) return;
    const rect = this.backdrop.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const normX = Math.min(1, Math.max(-1, x / (rect.width / 2)));
    const normY = Math.min(1, Math.max(-1, y / (rect.height / 2)));

    // Increased 3D rotation angles for responsive cursor movement: Y = ±25°, X = ±20°
    this.targetRotationY = normX * 0.45;
    this.targetRotationX = -normY * 0.35;

    // Pronounced Multi-layer depth parallax offsets
    this.targetParallaxX = normX * 8;
    this.targetParallaxY = -normY * 8;

    // Move virtual 3D point light source with cursor
    if (this.lightPoint) {
      this.lightPoint.position.x = normX * 22;
      this.lightPoint.position.y = -normY * 22;
    }
  }

  handleMouseLeave() {
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.targetParallaxX = 0;
    this.targetParallaxY = 0;
  }

  setup3DScene() {
    if (this.renderer) return;

    const width = this.canvas.parentElement.clientWidth || 380;
    const height = this.canvas.parentElement.clientHeight || 480;

    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 24); // Positioned directly for instant high-visibility portrait

    // 3. Dynamic Specular Light Source
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    this.lightPoint = new THREE.PointLight(0x00f0ff, 6.0, 100);
    this.lightPoint.position.set(0, 0, 20);
    this.scene.add(this.lightPoint);

    // 4. Main 3D Portrait Group
    this.portraitGroup = new THREE.Group();
    this.scene.add(this.portraitGroup);

    // 5. Background Holographic Wireframe Grid
    const bgGeo = new THREE.PlaneGeometry(60, 60, 30, 30);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.08 });
    this.bgGridPlane = new THREE.Mesh(bgGeo, bgMat);
    this.bgGridPlane.position.z = -12;
    this.scene.add(this.bgGridPlane);

    // 6. Neural Particle System & Ambient Grid
    this.createNeuralParticleSystem();

    // Shared 3D Plane Geometry for Portrait
    const pGeo = new THREE.PlaneGeometry(16, 20);

    // 8. Load Preloaded Video Texture
    if (!this.videoElement) {
      this.videoElement = document.getElementById('profile-preloaded-video');
    }

    const videoTexture = new THREE.VideoTexture(this.videoElement);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    const pMat = new THREE.MeshBasicMaterial({
      map: videoTexture,
      transparent: false,
      side: THREE.DoubleSide
    });

    this.portraitMesh = new THREE.Mesh(pGeo, pMat);
    this.portraitMesh.position.z = 2.0;
    this.portraitGroup.add(this.portraitMesh);

    // Advanced 3D Scanning Effect Overlay
    this.createAdvancedScanningEffect();

    // Warm-up initial render
    this.renderer.render(this.scene, this.camera);
  }



  createAdvancedScanningEffect() {
    // 1. Biometric Facial Scanning Laser Beam
    const scanBeamGeo = new THREE.PlaneGeometry(16.0, 0.3);
    const scanBeamMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.laserScanLine = new THREE.Mesh(scanBeamGeo, scanBeamMat);
    this.laserScanLine.position.set(0.0, 0.0, 2.1);
    this.portraitGroup.add(this.laserScanLine);

    // 2. High-Tech Overlay Grid
    const gridGeo = new THREE.PlaneGeometry(16.0, 20.0, 16, 20);
    const gridEdges = new THREE.EdgesGeometry(gridGeo);
    const gridMat = new THREE.LineBasicMaterial({ 
      color: 0x00f0ff, 
      transparent: true, 
      opacity: 0.0, 
      blending: THREE.AdditiveBlending 
    });
    this.faceWireframeMesh = new THREE.LineSegments(gridEdges, gridMat);
    this.faceWireframeMesh.position.set(0.0, 0.0, 2.05);
    this.portraitGroup.add(this.faceWireframeMesh);
  }

  createNeuralParticleSystem() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Particles kept in background outside main portrait area
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 15;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.65,
      transparent: true,
      opacity: 0.5
    });

    this.neuralParticles = new THREE.Points(geometry, pMat);
    this.portraitGroup.add(this.neuralParticles);
  }

  trigger() {
    if (this.isOpen) return;
    this.isOpen = true;

    this.setup3DScene();

    // Ensure accurate sizing on opening
    if (this.renderer && this.camera && this.canvas && this.canvas.parentElement) {
      const width = this.canvas.parentElement.clientWidth || 380;
      const height = this.canvas.parentElement.clientHeight || 480;
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    // Camera at optimal viewing distance for instant visibility
    if (this.camera) {
      this.camera.position.z = 26;
    }

    if (this.portraitMesh && this.portraitMesh.material) {
      this.portraitMesh.material.opacity = 1.0;
      if (this.portraitMesh.material.map) {
        this.portraitMesh.material.map.repeat.set(1.0, 1.0);
        this.portraitMesh.material.map.offset.set(0.0, 0.0);
        this.portraitMesh.material.map.needsUpdate = true;
      }
    }
    if (this.faceCropMesh && this.faceCropMesh.material) {
      this.faceCropMesh.material.opacity = 0.0;
    }
    if (this.faceWireframeMesh && this.faceWireframeMesh.material) {
      this.faceWireframeMesh.material.opacity = 0.2;
    }
    if (this.laserScanLine && this.laserScanLine.material) {
      this.laserScanLine.material.opacity = 0.85;
    }

    // Play video immediately if paused (without resetting currentTime to avoid seek freeze)
    if (this.videoElement) {
      if (this.videoElement.paused) {
        this.videoElement.play().catch(e => console.warn(e));
      }
    }

    if (this.scanOverlay) {
      this.scanOverlay.style.opacity = '1';
      this.scanOverlay.style.pointerEvents = 'auto';
    }

    if (this.timerBar) {
      this.timerBar.style.transition = 'none';
      this.timerBar.style.width = '100%';
    }

    // Show Overlay Backdrop immediately
    this.backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Recalculate 3D viewport canvas dimensions for current screen
    requestAnimationFrame(() => {
      this.onResize();
    });

    // Full Robo Voice Profile Explanation Speech
    const profileSpeech = "Identity verified. Access Granted. Operator Abdulla Siyad. Java Full Stack Developer, Cybersecurity Specialist, and Ethical Hacker. Core protocols: Spring Boot, React, REST APIs, MySQL, and Network Security. Build. Defend. Dominate.";

    audioEngine.playScan();
    telemetry.addInterAgentChat("CIPHER", "BIOMETRIC HEADSHOT REVEAL: ABDULLA SIYAD (Full Image & Robo Voice Active).");

    // Start 3D Render Loop
    this.startRenderLoop();

    // Gentle camera focal stabilization into card
    const animState = { progress: 0 };
    if (typeof gsap !== 'undefined') {
      gsap.to(animState, {
        progress: 1.0,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          const p = animState.progress;
          if (this.camera) {
            this.camera.position.z = 26 - (26 - 24) * p;
          }
        }
      });
    }

    // Security scan countdown sequence (~1000ms) then speak & hold popup open for full 28 seconds
    this.scanTimer = setTimeout(() => {
      if (this.scanOverlay) {
        this.scanOverlay.style.opacity = '0';
        this.scanOverlay.style.pointerEvents = 'none';
      }
      this.isRevealed = true;

      // Robo voice explains full profile
      audioEngine.speakVoice(profileSpeech);

      // Start 28-Second Presentation Timer
      this.startPresentationTimer(28);
    }, 1000);
  }

  startPresentationTimer(durationSec = 28) {
    if (this.timerBar) {
      requestAnimationFrame(() => {
        this.timerBar.style.transition = `width ${durationSec}s linear`;
        this.timerBar.style.width = '0%';
      });
    }

    // Auto-close after full 28 seconds presentation period
    this.autoCloseTimer = setTimeout(() => {
      if (this.isOpen) {
        telemetry.addInterAgentChat("AURA-1", "28-Second profile session complete. Restoring Overwatch system control.");
        this.close();
      }
    }, durationSec * 1000);
  }

  close() {
    if (!this.isOpen) return;

    if (this.scanTimer) clearTimeout(this.scanTimer);
    if (this.autoCloseTimer) clearTimeout(this.autoCloseTimer);

    // Cancel active voice speech on close
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
    this.isOpen = false;
    this.isRevealed = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    audioEngine.playClick();
  }

  startRenderLoop() {
    const animate = () => {
      if (!this.isOpen) return;
      this.animationFrameId = requestAnimationFrame(animate);

      // Smooth LERP cursor damping
      this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.08;
      this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08;

      this.currentParallaxX += (this.targetParallaxX - this.currentParallaxX) * 0.08;
      this.currentParallaxY += (this.targetParallaxY - this.currentParallaxY) * 0.08;

      if (this.portraitGroup) {
        this.portraitGroup.rotation.x = this.currentRotationX;
        this.portraitGroup.rotation.y = this.currentRotationY;

        this.portraitGroup.position.x = this.currentParallaxX * 0.3;
        this.portraitGroup.position.y = this.currentParallaxY * 0.3;
      }

      if (this.bgGridPlane) {
        this.bgGridPlane.position.x = -this.currentParallaxX * 0.2;
        this.bgGridPlane.position.y = -this.currentParallaxY * 0.2;
      }

      if (this.laserScanLine) {
        // Vertical laser scanning beam sweeping up and down across face
        this.laserScanLine.position.y = Math.sin(performance.now() * 0.0025) * 9.5;
      }


      if (this.neuralParticles) {
        this.neuralParticles.rotation.y += 0.003;
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
  }
}

export const profileSystem = new ProfileRevealSystem();
