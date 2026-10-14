/**
 * LivingHeart.js - The Centerpiece 3D Crystal Heart for POOKIE PROTOCOL
 * 
 * Features:
 * - Two symmetrical anatomical-crystal halves with inner septum walls
 * - Inner luminous crystal nucleus
 * - Dual-beat cardiac cycle ("lub-dub")
 * - Dynamic vertex displacement & bioluminescent veins
 * - Interactive hover curiosity tilt and pulse
 * - Click shockwave burst + 3-click Secret Easter Egg detector
 * - Interactive energy ring (Scene 3)
 * - Symmetrical parting transformation for Scene 5 Finale
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { createHalfHeartGeometry } from '../geometry/HeartGeometry.js';
import { HeartShader } from '../shaders/HeartShader.js';
import { soundEngine } from '../audio/SoundEngine.js';

export class LivingHeart {
  constructor(scene, camera, onEasterEggTriggered) {
    this.scene = scene;
    this.camera = camera;
    this.onEasterEggTriggered = onEasterEggTriggered;

    this.group = new THREE.Group();
    this.leftHalfGroup = new THREE.Group();
    this.rightHalfGroup = new THREE.Group();

    this.clickCount = 0;
    this.lastClickTime = 0;
    this.isHovered = false;
    this.isOpen = false;
    this.pulseWaveProgress = 0;

    // Cardiac cycle timing
    this.cardiacPeriod = 1.15; // seconds per cycle (~52 bpm resting peaceful rate)
    this.cycleTimer = 0;

    this.initMeshes();
    this.initEnergyRing();
    this.initInnerNucleus();
    this.initCollider();

    this.scene.add(this.group);
  }

  initMeshes() {
    // Generate left and right half geometries
    this.geomLeft = createHalfHeartGeometry('left', 64, 32);
    this.geomRight = createHalfHalfGeometrySafe('right', 64, 32);

    // Create shader materials (cloned for both halves so they share uniforms)
    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(HeartShader.uniforms),
      vertexShader: HeartShader.vertexShader,
      fragmentShader: HeartShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    this.meshLeft = new THREE.Mesh(this.geomLeft, this.material);
    this.meshRight = new THREE.Mesh(this.geomRight, this.material);

    this.meshLeft.castShadow = true;
    this.meshLeft.receiveShadow = true;
    this.meshRight.castShadow = true;
    this.meshRight.receiveShadow = true;

    this.leftHalfGroup.add(this.meshLeft);
    this.rightHalfGroup.add(this.meshRight);

    this.group.add(this.leftHalfGroup);
    this.group.add(this.rightHalfGroup);

    // Initial position
    this.group.position.set(0, 0, 0);
  }

  initInnerNucleus() {
    // Inner luminous crystal core that becomes dazzlingly visible when heart opens
    const coreGeom = new THREE.IcosahedronGeometry(0.7, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff173d,
      emissive: 0xff173d,
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: false,
    });

    this.innerCore = new THREE.Mesh(coreGeom, coreMat);
    this.innerCore.scale.set(0.65, 0.8, 0.65);
    this.innerCore.position.set(0, -0.1, 0);

    // Wireframe cage around inner core for crystal facets
    const wireGeom = new THREE.IcosahedronGeometry(0.78, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xd5a27c,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    this.innerCoreWire = new THREE.Mesh(wireGeom, wireMat);
    this.innerCore.add(this.innerCoreWire);

    // Point light inside heart that pulses outward
    this.internalLight = new THREE.PointLight(0xff173d, 3.5, 12, 1.2);
    this.internalLight.position.set(0, 0, 0);
    this.group.add(this.internalLight);
    this.group.add(this.innerCore);
  }

  initEnergyRing() {
    // Scene 3 Interactive Energy Ring
    this.ringGroup = new THREE.Group();
    const ringGeom = new THREE.TorusGeometry(2.35, 0.035, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff173d,
      transparent: true,
      opacity: 0.0, // Faded in during Scene 3
    });
    this.energyRingMesh = new THREE.Mesh(ringGeom, ringMat);
    this.energyRingMesh.rotation.x = Math.PI * 0.42;

    // Glowing orbiting sparks on ring
    const sparkCount = 18;
    const sparkGeom = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2;
      sparkPos[i * 3] = Math.cos(angle) * 2.35;
      sparkPos[i * 3 + 1] = Math.sin(angle) * 2.35;
      sparkPos[i * 3 + 2] = 0;
    }
    sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    this.ringSparks = new THREE.Points(
      sparkGeom,
      new THREE.PointsMaterial({
        color: 0xd5a27c,
        size: 0.16,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
      })
    );
    this.energyRingMesh.add(this.ringSparks);

    this.ringGroup.add(this.energyRingMesh);
    this.ringGroup.visible = false;
    this.group.add(this.ringGroup);
  }

  initCollider() {
    // Invisible bounding sphere collider for raycasting on mobile and desktop
    const colGeom = new THREE.SphereGeometry(2.2, 16, 16);
    const colMat = new THREE.MeshBasicMaterial({ visible: false });
    this.collider = new THREE.Mesh(colGeom, colMat);
    this.collider.userData = { isHeartCollider: true };
    this.group.add(this.collider);
  }

  setHover(hovered) {
    if (this.isHovered === hovered) return;
    this.isHovered = hovered;
    gsap.to(this.material.uniforms.uHover, {
      value: hovered ? 1.0 : 0.0,
      duration: 0.45,
      ease: 'power2.out',
    });
  }

  /**
   * Click / Tap interaction on the heart
   */
  handleClick(bloomTweenCallback) {
    const now = performance.now();

    // 1. Secret Easter Egg Detection (3 rapid clicks within 2.2s)
    if (now - this.lastClickTime < 800) {
      this.clickCount++;
    } else {
      this.clickCount = 1;
    }
    this.lastClickTime = now;

    if (this.clickCount >= 3) {
      this.clickCount = 0;
      soundEngine.playSecretChime();
      if (this.onEasterEggTriggered) {
        this.onEasterEggTriggered();
      }
    }

    // 2. Play Audio & Cardiac Surge
    soundEngine.playHeartbeat(1.6);
    if (bloomTweenCallback) bloomTweenCallback(1.8);

    // 3. Shockwave ripple through custom shader
    this.material.uniforms.uClickPulse.value = 1.0;
    gsap.to(this.material.uniforms.uClickPulse, {
      value: 0.0,
      duration: 1.1,
      ease: 'power2.out',
    });

    // 4. Physical contraction & dynamic rebound
    gsap.killTweensOf(this.group.scale);
    gsap.timeline()
      .to(this.group.scale, {
        x: 1.25,
        y: 1.28,
        z: 1.25,
        duration: 0.12,
        ease: 'power3.out',
      })
      .to(this.group.scale, {
        x: 0.95,
        y: 0.94,
        z: 0.95,
        duration: 0.18,
        ease: 'power2.inOut',
      })
      .to(this.group.scale, {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 0.45,
        ease: 'elastic.out(1, 0.4)',
      });
  }

  showEnergyRing(visible = true) {
    this.ringGroup.visible = visible;
    if (visible) {
      gsap.to(this.energyRingMesh.material, { opacity: 0.85, duration: 1.2 });
      gsap.to(this.ringSparks.material, { opacity: 1.0, duration: 1.2 });
    } else {
      gsap.to(this.energyRingMesh.material, { opacity: 0.0, duration: 0.8 });
      gsap.to(this.ringSparks.material, { opacity: 0.0, duration: 0.8 });
    }
  }

  /**
   * Symmetrical parting transformation for Scene 5 (Finale)
   */
  openHeart(isOpen = true) {
    this.isOpen = isOpen;
    const targetX = isOpen ? 1.75 : 0.0;
    const targetRotY = isOpen ? 0.35 : 0.0;
    const targetRotZ = isOpen ? -0.22 : 0.0;

    gsap.to(this.leftHalfGroup.position, {
      x: -targetX,
      duration: 2.8,
      ease: 'power3.inOut',
    });
    gsap.to(this.leftHalfGroup.rotation, {
      y: -targetRotY,
      z: -targetRotZ,
      duration: 2.8,
      ease: 'power3.inOut',
    });

    gsap.to(this.rightHalfGroup.position, {
      x: targetX,
      duration: 2.8,
      ease: 'power3.inOut',
    });
    gsap.to(this.rightHalfGroup.rotation, {
      y: targetRotY,
      z: targetRotZ,
      duration: 2.8,
      ease: 'power3.inOut',
    });

    // Intensify inner core
    gsap.to(this.innerCore.scale, {
      x: isOpen ? 1.4 : 0.65,
      y: isOpen ? 1.7 : 0.8,
      z: isOpen ? 1.4 : 0.65,
      duration: 2.5,
      ease: 'power2.out',
    });
    gsap.to(this.internalLight, {
      intensity: isOpen ? 8.5 : 3.5,
      duration: 2.5,
    });
  }

  update(time, delta) {
    this.material.uniforms.uTime.value = time;

    // Organic "lub-dub" cardiac cycle calculation
    this.cycleTimer = (this.cycleTimer + delta) % this.cardiacPeriod;
    const t = this.cycleTimer / this.cardiacPeriod;

    // Dual Gaussian cardiac impulse
    // Lub: peak around t = 0.08
    const lub = Math.exp(-Math.pow((t - 0.08) / 0.045, 2));
    // Dub: peak around t = 0.22
    const dub = Math.exp(-Math.pow((t - 0.22) / 0.045, 2)) * 0.72;
    const cardiacImpulse = lub + dub;

    this.material.uniforms.uBeat.value = cardiacImpulse;

    // Gentle levitation float
    if (!this.isOpen) {
      this.group.position.y = Math.sin(time * 1.4) * 0.12;
      this.group.rotation.y = Math.sin(time * 0.35) * 0.22;
      this.group.rotation.z = Math.cos(time * 0.45) * 0.06;
    }

    // Inner core rotation
    if (this.innerCore) {
      this.innerCore.rotation.y += delta * 0.8;
      this.innerCore.rotation.x += delta * 0.4;
      this.internalLight.intensity = 3.5 + cardiacImpulse * 3.0;
    }

    // Energy ring rotation
    if (this.ringGroup.visible) {
      this.energyRingMesh.rotation.z += delta * 0.6;
    }
  }

  dispose() {
    this.geomLeft.dispose();
    this.geomRight.dispose();
    this.material.dispose();
  }
}

function createHalfHalfGeometrySafe(side, t, phi) {
  return createHalfHeartGeometry(side, t, phi);
}
