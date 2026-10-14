/**
 * MemoryOrbs.js - 5 Floating Luminous 3D Memory Orbs for POOKIE PROTOCOL
 * 
 * Features:
 * - Suspended at varied 3D depths around the crystal heart
 * - Multi-layered geometry: Faceted core, translucent glass shell, counter-rotating orbit rings
 * - Interactive hover reactions, gentle floating, and chime sounds
 * - Cinematic zoom-in and return transitions coordinated via GSAP
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { MEMORY_ORBS } from '../content/protocolData.js';
import { soundEngine } from '../audio/SoundEngine.js';

export class MemoryOrbs {
  constructor(scene, onOrbSelected) {
    this.scene = scene;
    this.onOrbSelected = onOrbSelected;
    this.group = new THREE.Group();

    this.orbs = [];
    this.activeOrb = null;
    this.hoveredOrb = null;
    this.isVisible = false;

    this.initOrbs();
    this.scene.add(this.group);
  }

  initOrbs() {
    MEMORY_ORBS.forEach((data, index) => {
      const orbGroup = new THREE.Group();
      orbGroup.position.set(...data.position);
      orbGroup.userData = {
        id: data.id,
        index: data.index,
        data: data,
        origPos: new THREE.Vector3(...data.position),
        origRot: new THREE.Euler(0, 0, 0),
        baseScale: 1.0,
      };

      // 1. Faceted Inner Crystal Core
      const coreGeom = new THREE.IcosahedronGeometry(0.38, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: data.glowColor,
        emissive: data.glowColor,
        emissiveIntensity: 2.5,
        roughness: 0.2,
        metalness: 0.8,
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      orbGroup.add(core);

      // 2. Translucent Glass Shell
      const shellGeom = new THREE.SphereGeometry(0.55, 32, 32);
      const shellMat = new THREE.MeshPhysicalMaterial({
        color: 0x110206,
        emissive: data.glowColor,
        emissiveIntensity: 0.4,
        roughness: 0.1,
        transmission: 0.85,
        thickness: 0.8,
        transparent: true,
        opacity: 0.75,
      });
      const shell = new THREE.Mesh(shellGeom, shellMat);
      orbGroup.add(shell);

      // 3. Orbital Ring
      const ringGeom = new THREE.TorusGeometry(0.78, 0.016, 8, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: data.glowColor,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI * 0.35 + index * 0.4;
      orbGroup.add(ring);

      // 4. Point light for ambient illumination
      const light = new THREE.PointLight(data.glowColor, 1.2, 5, 2.0);
      orbGroup.add(light);

      // 5. Invisible Hit Sphere for reliable pointer and touch raycasting
      const hitGeom = new THREE.SphereGeometry(0.9, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitSphere = new THREE.Mesh(hitGeom, hitMat);
      hitSphere.userData = { isOrbHitTarget: true, parentOrb: orbGroup };
      orbGroup.add(hitSphere);

      // Store references for animation
      orbGroup.userData.core = core;
      orbGroup.userData.shell = shell;
      orbGroup.userData.ring = ring;
      orbGroup.userData.light = light;

      // Start hidden, fade in when Constellation scene activates
      orbGroup.scale.set(0, 0, 0);
      this.group.add(orbGroup);
      this.orbs.push(orbGroup);
    });
  }

  showOrbs(show = true) {
    this.isVisible = show;
    this.orbs.forEach((orb, i) => {
      gsap.killTweensOf(orb.scale);
      if (show) {
        gsap.to(orb.scale, {
          x: 1.0,
          y: 1.0,
          z: 1.0,
          duration: 1.2,
          delay: i * 0.15,
          ease: 'back.out(1.5)',
        });
      } else {
        gsap.to(orb.scale, {
          x: 0.0,
          y: 0.0,
          z: 0.0,
          duration: 0.6,
          ease: 'power2.in',
        });
      }
    });
  }

  handlePointerHover(intersectedMesh) {
    if (!this.isVisible || this.activeOrb) return;

    const orb = intersectedMesh ? intersectedMesh.userData.parentOrb : null;

    if (orb !== this.hoveredOrb) {
      // Un-hover previous
      if (this.hoveredOrb) {
        gsap.to(this.hoveredOrb.scale, {
          x: 1.0,
          y: 1.0,
          z: 1.0,
          duration: 0.4,
          ease: 'power2.out',
        });
        gsap.to(this.hoveredOrb.userData.core.material, {
          emissiveIntensity: 2.5,
          duration: 0.3,
        });
      }

      this.hoveredOrb = orb;

      // Hover new
      if (this.hoveredOrb) {
        soundEngine.playChime(parseInt(this.hoveredOrb.userData.index, 10));
        gsap.to(this.hoveredOrb.scale, {
          x: 1.35,
          y: 1.35,
          z: 1.35,
          duration: 0.4,
          ease: 'back.out(1.8)',
        });
        gsap.to(this.hoveredOrb.userData.core.material, {
          emissiveIntensity: 4.5,
          duration: 0.3,
        });
      }
    }
  }

  selectOrb(intersectedMesh) {
    if (!intersectedMesh) return null;
    const orb = intersectedMesh.userData.parentOrb;
    if (!orb) return null;

    this.activeOrb = orb;
    soundEngine.playChime(parseInt(orb.userData.index, 10) + 2);

    // Cinematic zoom towards camera
    gsap.to(orb.position, {
      x: 0,
      y: 0,
      z: 5.2,
      duration: 1.4,
      ease: 'power3.inOut',
    });
    gsap.to(orb.scale, {
      x: 1.6,
      y: 1.6,
      z: 1.6,
      duration: 1.4,
      ease: 'power3.inOut',
    });

    if (this.onOrbSelected) {
      this.onOrbSelected(orb.userData.data);
    }
    return orb.userData.data;
  }

  deselectOrb() {
    if (!this.activeOrb) return;
    const orb = this.activeOrb;
    this.activeOrb = null;

    // Smoothly return to original resting 3D coordinates
    gsap.to(orb.position, {
      x: orb.userData.origPos.x,
      y: orb.userData.origPos.y,
      z: orb.userData.origPos.z,
      duration: 1.2,
      ease: 'power3.inOut',
    });
    gsap.to(orb.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 1.2,
      ease: 'power3.inOut',
    });
  }

  update(time, delta) {
    if (!this.isVisible) return;

    this.orbs.forEach((orb, i) => {
      // Rotation of core and ring
      orb.userData.core.rotation.y += delta * 1.2;
      orb.userData.core.rotation.x += delta * 0.7;
      orb.userData.ring.rotation.z += delta * (0.8 + (i % 2 === 0 ? 0.4 : -0.4));

      // Floating bobbing motion when not active
      if (orb !== this.activeOrb) {
        const floatY = Math.sin(time * 1.8 + i * 1.2) * 0.15;
        const floatX = Math.cos(time * 1.2 + i * 0.9) * 0.08;
        orb.position.y = orb.userData.origPos.y + floatY;
        orb.position.x = orb.userData.origPos.x + floatX;
      }
    });
  }

  dispose() {
    this.orbs.forEach((orb) => {
      orb.userData.core.geometry.dispose();
      orb.userData.shell.geometry.dispose();
      orb.userData.ring.geometry.dispose();
    });
  }
}
