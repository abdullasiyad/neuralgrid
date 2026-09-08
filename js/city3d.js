/* ==========================================================================
   NEURAL-GRID // OVERWATCH — THREE.JS 3D LIVING CITY & ORBITAL SATELLITE
   ========================================================================== */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { infrastructureNodes, systemState, eventBus } from './telemetry.js';
import { audioEngine } from './audio.js';

export class City3DEngine {
  constructor() {
    this.container = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.buildings = [];
    this.dataPackets = [];
    this.hostilePackets = [];
    this.drones = [];
    this.satellite = null;
    this.satelliteLaser = null;
    this.surveillanceCameras = [];
    this.dataLeakParticles = [];

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredBuilding = null;
    this.selectedBuilding = null;
    this.repairLaser = null;
    this.shockwaveRing = null;

    this.cameraShakeIntensity = 0;
    this.isInitialized = false;

    // Predefined Camera View Positions for GSAP Transitions
    this.cameraStates = {
      hero: { pos: { x: 0, y: 70, z: 120 }, target: { x: 0, y: 15, z: 0 } },
      mesh: { pos: { x: 35, y: 30, z: 45 }, target: { x: 0, y: 10, z: 0 } },
      sentinel: { pos: { x: -40, y: 45, z: 30 }, target: { x: -10, y: 20, z: -10 } },
      threat: { pos: { x: 0, y: 110, z: 70 }, target: { x: 0, y: 0, z: 0 } },
      telemetry: { pos: { x: 50, y: 55, z: 80 }, target: { x: 0, y: 10, z: 0 } },
      orbital: { pos: { x: 0, y: 160, z: 40 }, target: { x: 0, y: 0, z: 0 } }
    };
    this.currentCamTarget = new THREE.Vector3(0, 15, 0);
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    try {
      // 1. Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.container.appendChild(this.renderer.domElement);

      // 2. Scene & Fog
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x030508);
      this.scene.fog = new THREE.FogExp2(0x030508, 0.0075);

      // 3. Camera
      this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
      const initPos = this.cameraStates.hero.pos;
      this.camera.position.set(initPos.x, initPos.y, initPos.z);
      this.camera.lookAt(this.currentCamTarget);

      // 4. Lighting
      this.setupLighting();

      // 5. Environment & Grid
      this.setupEnvironment();

      // 6. Generate City Buildings
      this.generateCity();

      // 7. Data Highways
      this.setupDataHighways();

      // 8. Sentinel Drones & Orbital Satellite
      this.setupSentinelDrones();
      this.setupOrbitalSatellite();
      this.setupSurveillanceCameras();

      // 9. Laser & Anomaly FX
      this.setupAnomalyEffects();

      // 10. Listeners
      window.addEventListener('resize', () => this.onResize());
      window.addEventListener('pointermove', (e) => this.onPointerMove(e));
      window.addEventListener('click', (e) => this.onPointerClick(e));

      // Subscribe to central events
      this.subscribeEvents();

      // 11. Start Loop
      this.isInitialized = true;
      this.animate();
    } catch (e) {
      console.error("WebGL Initialization failed:", e);
      const fallback = document.getElementById('webgl-fallback');
      if (fallback) fallback.classList.add('active');
    }
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x0a192f, 1.8);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    this.dirLight.position.set(80, 150, 50);
    this.scene.add(this.dirLight);

    this.alertLight = new THREE.PointLight(0xff003c, 0, 300);
    this.alertLight.position.set(0, 50, 0);
    this.scene.add(this.alertLight);
  }

  setupEnvironment() {
    // Cyber Wireframe Grid Floor
    const grid = new THREE.GridHelper(300, 60, 0x00f0ff, 0x0c1e30);
    grid.position.y = -0.5;
    this.scene.add(grid);

    // Ambient Floating Dust Particles
    const partGeo = new THREE.BufferGeometry();
    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 250;
      positions[i + 1] = Math.random() * 100;
      positions[i + 2] = (Math.random() - 0.5) * 250;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({
      size: 1.2,
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    this.particles = new THREE.Points(partGeo, partMat);
    this.scene.add(this.particles);

    // Digital Data Leak Particle Group
    const leakGeo = new THREE.BufferGeometry();
    const lCount = 150;
    const lPos = new Float32Array(lCount * 3);
    for (let i = 0; i < lCount * 3; i += 3) {
      lPos[i] = 0; lPos[i+1] = -500; lPos[i+2] = 0;
    }
    leakGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    const leakMat = new THREE.PointsMaterial({
      size: 2.0,
      color: 0xff003c,
      transparent: true,
      opacity: 0
    });
    this.leakParticlesMesh = new THREE.Points(leakGeo, leakMat);
    this.scene.add(this.leakParticlesMesh);
  }

  generateCity() {
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    const totalNodes = infrastructureNodes.length;

    let bIndex = 0;
    for (let x = -70; x <= 70; x += 22) {
      for (let z = -70; z <= 70; z += 22) {
        if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;

        const height = Math.floor(Math.random() * 35) + 12;
        const width = Math.random() * 6 + 7;
        const depth = Math.random() * 6 + 7;
        const nodeData = bIndex < totalNodes ? infrastructureNodes[bIndex] : null;

        const baseColor = nodeData ? 0x091424 : 0x060c16;
        const emissiveColor = nodeData ? 0x00f0ff : 0x0a2d48;

        const mat = new THREE.MeshStandardMaterial({
          color: baseColor,
          emissive: emissiveColor,
          emissiveIntensity: nodeData ? 0.4 : 0.15,
          roughness: 0.3,
          metalness: 0.8
        });

        const building = new THREE.Mesh(buildingGeo, mat);
        building.scale.set(width, height, depth);
        building.position.set(x + (Math.random() * 4 - 2), height / 2, z + (Math.random() * 4 - 2));

        const edges = new THREE.EdgesGeometry(buildingGeo);
        const lineMat = new THREE.LineBasicMaterial({
          color: nodeData ? 0x00f0ff : 0x143b5c,
          transparent: true,
          opacity: 0.5
        });
        const wireframe = new THREE.LineSegments(edges, lineMat);
        building.add(wireframe);

        if (height > 25) {
          const antennaGeo = new THREE.CylinderGeometry(0.2, 0.2, 6);
          const antennaMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
          const antenna = new THREE.Mesh(antennaGeo, antennaMat);
          antenna.position.set(0, height / 2 + 3, 0);
          building.add(antenna);
        }

        building.userData = {
          node: nodeData,
          baseEmissive: emissiveColor,
          baseHeight: height,
          scaleX: width,
          scaleZ: depth,
          wireframeMat: lineMat,
          meshMat: mat
        };

        this.scene.add(building);
        this.buildings.push(building);
        bIndex++;
      }
    }
  }

  setupDataHighways() {
    const nodeBuildings = this.buildings.filter(b => b.userData.node);
    if (nodeBuildings.length < 4) return;

    for (let i = 0; i < 6; i++) {
      const b1 = nodeBuildings[i % nodeBuildings.length];
      const b2 = nodeBuildings[(i + 3) % nodeBuildings.length];

      const p1 = b1.position.clone(); p1.y = b1.userData.baseHeight;
      const p2 = b2.position.clone(); p2.y = b2.userData.baseHeight;

      const curve = new THREE.QuadraticBezierCurve3(
        p1,
        new THREE.Vector3((p1.x + p2.x) / 2, Math.max(p1.y, p2.y) + 15, (p1.z + p2.z) / 2),
        p2
      );

      const points = curve.getPoints(30);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.25 });
      const line = new THREE.Line(lineGeo, lineMat);
      this.scene.add(line);

      // Normal Cyan Data Packet
      const packetGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const packetMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      this.scene.add(packet);
      this.dataPackets.push({ mesh: packet, curve, progress: Math.random() });

      // Hostile Red Packet (Hidden initially)
      const hPacketMat = new THREE.MeshBasicMaterial({ color: 0xff003c });
      const hPacket = new THREE.Mesh(packetGeo, hPacketMat);
      hPacket.visible = false;
      this.scene.add(hPacket);
      this.hostilePackets.push({ mesh: hPacket, curve, progress: Math.random() });
    }
  }

  setupSentinelDrones() {
    const droneGeo = new THREE.ConeGeometry(1.2, 3, 4);
    droneGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < 3; i++) {
      const droneMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
      const drone = new THREE.Mesh(droneGeo, droneMat);

      const lightGeo = new THREE.ConeGeometry(4, 25, 8, 1, true);
      lightGeo.rotateX(-Math.PI / 2);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const cone = new THREE.Mesh(lightGeo, lightMat);
      cone.position.set(0, -12.5, 0);
      drone.add(cone);

      drone.position.set((i - 1) * 35, 45, (i - 1) * 20);
      drone.userData = { angle: i * (Math.PI * 2 / 3), radius: 40 + i * 10, speed: 0.008, originalY: 45 };

      this.scene.add(drone);
      this.drones.push(drone);
    }
  }

  setupOrbitalSatellite() {
    // Procedural Orbital Surveillance Satellite High Above Metropolis
    const satGroup = new THREE.Group();
    satGroup.position.set(0, 140, 0);

    const bodyGeo = new THREE.CylinderGeometry(2, 2, 6, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0b1726, metalness: 0.9, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    satGroup.add(body);

    // Solar Wings
    const wingGeo = new THREE.BoxGeometry(16, 0.2, 3);
    const wingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0, 0);
    satGroup.add(wings);

    // Satellite Laser Emitter Beam
    const satLaserGeo = new THREE.CylinderGeometry(0.3, 3.5, 140, 16, 1, true);
    satLaserGeo.rotateX(Math.PI / 2);
    const satLaserMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.satelliteLaser = new THREE.Mesh(satLaserGeo, satLaserMat);
    this.satelliteLaser.position.set(0, -70, 0);
    satGroup.add(this.satelliteLaser);

    this.satellite = satGroup;
    this.scene.add(this.satellite);
  }

  setupSurveillanceCameras() {
    // Floating Surveillance Camera Markers
    const camGeo = new THREE.SphereGeometry(1.0, 8, 8);
    const camMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });

    const coords = [
      { id: "CAM-001", x: -35, y: 38, z: 25 },
      { id: "CAM-014", x: 25, y: 42, z: -30 },
      { id: "CAM-042", x: -20, y: 35, z: -45 },
      { id: "CAM-087", x: 45, y: 48, z: 15 }
    ];

    coords.forEach(c => {
      const camMesh = new THREE.Mesh(camGeo, camMat);
      camMesh.position.set(c.x, c.y, c.z);
      camMesh.userData = { id: c.id };
      this.scene.add(camMesh);
      this.surveillanceCameras.push(camMesh);
    });
  }

  setupAnomalyEffects() {
    const laserGeo = new THREE.CylinderGeometry(0.5, 2.5, 1, 16, 1, true);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.repairLaser = new THREE.Mesh(laserGeo, laserMat);
    this.scene.add(this.repairLaser);

    const ringGeo = new THREE.RingGeometry(1, 2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff003c, transparent: true, opacity: 0, side: THREE.DoubleSide });
    this.shockwaveRing = new THREE.Mesh(ringGeo, ringMat);
    this.scene.add(this.shockwaveRing);
  }

  triggerCameraShake(intensity = 1.5) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.cameraShakeIntensity = intensity;
  }

  onPointerMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.buildings);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData.node && this.hoveredBuilding !== hit) {
        if (this.hoveredBuilding && this.hoveredBuilding !== this.selectedBuilding) {
          this.resetBuildingHighlight(this.hoveredBuilding);
        }
        this.hoveredBuilding = hit;
        this.highlightBuilding(hit, 0x00f0ff);
        document.body.style.cursor = 'pointer';
        audioEngine.playHover();
      }
    } else {
      if (this.hoveredBuilding && this.hoveredBuilding !== this.selectedBuilding) {
        this.resetBuildingHighlight(this.hoveredBuilding);
        this.hoveredBuilding = null;
      }
      document.body.style.cursor = 'default';
    }
  }

  onPointerClick(e) {
    if (e.target.closest('.hud-top-bar') || e.target.closest('.content-wrapper') && !e.target.closest('#mesh-section')) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.buildings);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData.node) {
        this.selectBuilding(hit);
        audioEngine.playClick();
      }
    }
  }

  selectBuilding(building) {
    if (this.selectedBuilding) {
      this.resetBuildingHighlight(this.selectedBuilding);
    }
    this.selectedBuilding = building;
    this.highlightBuilding(building, 0x33f3ff, 1.0);

    const node = building.userData.node;
    systemState.activeNodeId = node.id;
    eventBus.emit('NODE_SELECTED', node);
  }

  highlightBuilding(building, colorHex, intensity = 0.8) {
    building.userData.meshMat.emissive.setHex(colorHex);
    building.userData.meshMat.emissiveIntensity = intensity;
    building.userData.wireframeMat.opacity = 1.0;
  }

  resetBuildingHighlight(building) {
    if (building.userData.node && building.userData.node.status === 'CRITICAL') {
      building.userData.meshMat.emissive.setHex(0xff003c);
      building.userData.meshMat.emissiveIntensity = 0.9;
    } else {
      building.userData.meshMat.emissive.setHex(building.userData.baseEmissive);
      building.userData.meshMat.emissiveIntensity = 0.4;
      building.userData.wireframeMat.opacity = 0.5;
    }
  }

  filterNodes(role) {
    this.buildings.forEach(building => {
      const node = building.userData.node;
      if (!node) return;

      if (role === 'ALL' || node.role === role) {
        building.userData.meshMat.opacity = 1.0;
        building.userData.meshMat.transparent = false;
        building.userData.meshMat.emissiveIntensity = 0.6;
        building.userData.wireframeMat.opacity = 0.8;
      } else {
        building.userData.meshMat.transparent = true;
        building.userData.meshMat.opacity = 0.2;
        building.userData.meshMat.emissiveIntensity = 0.05;
        building.userData.wireframeMat.opacity = 0.1;
      }
    });
  }

  setCameraState(key, duration = 1.5) {
    const targetState = this.cameraStates[key] || this.cameraStates.hero;
    if (typeof gsap !== 'undefined') {
      gsap.to(this.camera.position, {
        x: targetState.pos.x,
        y: targetState.pos.y,
        z: targetState.pos.z,
        duration: duration,
        ease: "power2.inOut"
      });
      gsap.to(this.currentCamTarget, {
        x: targetState.target.x,
        y: targetState.target.y,
        z: targetState.target.z,
        duration: duration,
        ease: "power2.inOut",
        onUpdate: () => this.camera.lookAt(this.currentCamTarget)
      });
    } else {
      this.camera.position.set(targetState.pos.x, targetState.pos.y, targetState.pos.z);
      this.currentCamTarget.set(targetState.target.x, targetState.target.y, targetState.target.z);
      this.camera.lookAt(this.currentCamTarget);
    }
  }

  subscribeEvents() {
    eventBus.on('CHAOS_STARTED', (affectedNode) => {
      const building = this.buildings.find(b => b.userData.node && b.userData.node.id === affectedNode.id);
      if (building) {
        building.userData.meshMat.emissive.setHex(0xff003c);
        building.userData.meshMat.emissiveIntensity = 1.2;
        building.userData.wireframeMat.color.setHex(0xff003c);
        building.userData.wireframeMat.opacity = 1.0;

        this.shockwaveRing.position.copy(building.position);
        this.shockwaveRing.position.y = 0.2;
        this.shockwaveRing.scale.set(1, 1, 1);
        this.shockwaveRing.material.opacity = 1.0;

        // Deploy Sentinel Drone
        this.deploySentinelHunt(building);
      }

      this.alertLight.intensity = 4.0;
      this.triggerCameraShake(1.8);
      audioEngine.playAlarm();
    });

    eventBus.on('INTRUSION_STARTED', (affectedNode) => {
      // Activate Hostile Red Packets
      this.hostilePackets.forEach(hp => hp.mesh.visible = true);
      const building = this.buildings.find(b => b.userData.node && b.userData.node.id === affectedNode.id);
      if (building) {
        building.userData.meshMat.emissive.setHex(0xff003c);
        this.deploySentinelHunt(building);
      }
      this.triggerCameraShake(1.5);
    });

    eventBus.on('CASCADE_STARTED', (nodes) => {
      nodes.forEach((n, idx) => {
        setTimeout(() => {
          const b = this.buildings.find(b => b.userData.node && b.userData.node.id === n.id);
          if (b) {
            b.userData.meshMat.emissive.setHex(0xff003c);
            b.userData.meshMat.emissiveIntensity = 1.2;
            audioEngine.playThreatDetected();
            this.triggerCameraShake(1.0);
          }
        }, idx * 1800);
      });
    });

    eventBus.on('BLACKOUT_STARTED', () => {
      this.buildings.forEach(b => {
        b.userData.meshMat.emissiveIntensity = 0.05;
      });
      if (this.ambientLight) this.ambientLight.intensity = 0.2;
      if (this.dirLight) this.dirLight.intensity = 0.4;
    });

    eventBus.on('SYSTEM_NOMINAL', () => {
      this.buildings.forEach(b => {
        this.resetBuildingHighlight(b);
      });
      this.hostilePackets.forEach(hp => hp.mesh.visible = false);
      if (this.ambientLight) this.ambientLight.intensity = 1.8;
      if (this.dirLight) this.dirLight.intensity = 2.5;
      this.repairLaser.material.opacity = 0;
      this.alertLight.intensity = 0;
    });
  }

  deploySentinelHunt(building) {
    const drone = this.drones[1];
    if (building && drone && typeof gsap !== 'undefined') {
      audioEngine.playSentinelDeployment();
      gsap.to(drone.position, {
        x: building.position.x,
        y: building.userData.baseHeight + 20,
        z: building.position.z,
        duration: 2.0,
        ease: "power2.out",
        onComplete: () => {
          audioEngine.playTargetLock();
          const height = 20;
          this.repairLaser.scale.set(building.userData.scaleX || 6, height, building.userData.scaleZ || 6);
          this.repairLaser.position.set(building.position.x, building.userData.baseHeight + height / 2, building.position.z);
          this.repairLaser.material.opacity = 0.85;
          audioEngine.playHealing();
        }
      });
    }
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // 1. Data Packets Motion
    this.dataPackets.forEach(dp => {
      dp.progress += 0.008;
      if (dp.progress > 1) dp.progress = 0;
      dp.mesh.position.copy(dp.curve.getPoint(dp.progress));
    });

    // 2. Hostile Red Packets Motion
    this.hostilePackets.forEach(hp => {
      if (hp.mesh.visible) {
        hp.progress += 0.012;
        if (hp.progress > 1) hp.progress = 0;
        hp.mesh.position.copy(hp.curve.getPoint(hp.progress));
      }
    });

    // 3. Sentinel Drones Patrol
    this.drones.forEach((drone, idx) => {
      if (!systemState.chaosMode || idx !== 1) {
        drone.userData.angle += drone.userData.speed;
        drone.position.x = Math.cos(drone.userData.angle) * drone.userData.radius;
        drone.position.z = Math.sin(drone.userData.angle) * drone.userData.radius;
        drone.position.y = drone.userData.originalY + Math.sin(time * 2 + idx) * 2;
      }
    });

    // 4. Orbital Satellite Rotation
    if (this.satellite) {
      this.satellite.rotation.y = time * 0.05;
    }

    // 5. Camera Shake Damping
    if (this.cameraShakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity *= 0.9;
      if (this.cameraShakeIntensity < 0.01) this.cameraShakeIntensity = 0;
    }

    // 6. Shockwave Ring expansion
    if (systemState.chaosMode && this.shockwaveRing.material.opacity > 0) {
      this.shockwaveRing.scale.addScalar(0.4);
      this.shockwaveRing.material.opacity -= 0.015;
      if (this.shockwaveRing.material.opacity <= 0 && systemState.chaosMode) {
        this.shockwaveRing.scale.set(1, 1, 1);
        this.shockwaveRing.material.opacity = 1.0;
      }
    }

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  }
}

export const city3D = new City3DEngine();
