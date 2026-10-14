/**
 * VirtualHugEffect.js - Cinematic 3D Visual Effects for Scene 4 (Virtual Hug)
 * Features:
 * - Two glowing curved light streams wrapping around the heart like an embrace
 * - Luminous heart-shaped energy shockwave ring expanding through the scene
 * - Swarm of rose-gold and crimson particles rushing toward the camera
 * - Audio and bloom synchronization
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { soundEngine } from '../audio/SoundEngine.js';

export class VirtualHugEffect {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.isActive = false;

    this.initEmbraceArms();
    this.initShockwaveRing();

    this.scene.add(this.group);
    this.group.visible = false;
  }

  initEmbraceArms() {
    // 1. Left embrace stream curve (swirling from behind around the heart)
    const curveLeft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.5, -2.0, -3.0),
      new THREE.Vector3(-3.2, 0.5, -1.0),
      new THREE.Vector3(-2.0, 1.8, 1.2),
      new THREE.Vector3(0.0, 1.2, 1.8),
      new THREE.Vector3(1.2, 0.2, 1.6),
    ]);

    // 2. Right embrace stream curve
    const curveRight = new THREE.CatmullRomCurve3([
      new THREE.Vector3(4.5, -2.0, -3.0),
      new THREE.Vector3(3.2, 0.5, -1.0),
      new THREE.Vector3(2.0, 1.8, 1.2),
      new THREE.Vector3(0.0, 1.2, 1.8),
      new THREE.Vector3(-1.2, 0.2, 1.6),
    ]);

    const tubeGeomLeft = new THREE.TubeGeometry(curveLeft, 64, 0.08, 8, false);
    const tubeGeomRight = new THREE.TubeGeometry(curveRight, 64, 0.08, 8, false);

    this.armMaterial = new THREE.MeshStandardMaterial({
      color: 0xff173d,
      emissive: 0xd5a27c,
      emissiveIntensity: 3.5,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.0,
    });

    this.armLeft = new THREE.Mesh(tubeGeomLeft, this.armMaterial);
    this.armRight = new THREE.Mesh(tubeGeomRight, this.armMaterial);

    this.group.add(this.armLeft);
    this.group.add(this.armRight);
  }

  initShockwaveRing() {
    // Expanding heart-shaped / toroidal energy wave
    const ringGeom = new THREE.TorusGeometry(1.0, 0.08, 16, 64);
    this.waveMaterial = new THREE.MeshBasicMaterial({
      color: 0xff173d,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });

    this.shockwave = new THREE.Mesh(ringGeom, this.waveMaterial);
    this.shockwave.rotation.x = Math.PI * 0.5;
    this.group.add(this.shockwave);
  }

  setActive(active = true) {
    this.isActive = active;
    this.group.visible = true;

    if (active) {
      gsap.to(this.armMaterial, {
        opacity: 0.85,
        duration: 1.8,
        ease: 'power2.out',
      });
    } else {
      gsap.to(this.armMaterial, {
        opacity: 0.0,
        duration: 0.8,
        onComplete: () => {
          this.group.visible = false;
        },
      });
    }
  }

  /**
   * Executes the Virtual Hug animation sequence
   */
  triggerHug(bloomCallback, particleBurstCallback) {
    soundEngine.playVirtualHug();

    if (bloomCallback) bloomCallback(2.4);
    if (particleBurstCallback) particleBurstCallback();

    // 1. Shockwave expansion
    this.shockwave.scale.set(0.5, 0.5, 0.5);
    this.waveMaterial.opacity = 1.0;
    this.waveMaterial.color.set('#FF173D');

    gsap.timeline()
      .to(this.shockwave.scale, {
        x: 16.0,
        y: 16.0,
        z: 16.0,
        duration: 2.2,
        ease: 'power2.out',
      })
      .to(this.waveMaterial, {
        opacity: 0.0,
        duration: 1.8,
        ease: 'power2.in',
      }, '<0.4');

    // 2. Embrace arms flash with rose gold brilliance
    gsap.timeline()
      .to(this.armMaterial, {
        emissiveIntensity: 7.0,
        duration: 0.25,
      })
      .to(this.armMaterial, {
        emissiveIntensity: 3.5,
        duration: 1.5,
        ease: 'power2.out',
      });
  }

  update(time) {
    if (!this.isActive) return;

    // Gentle breathing pulse of the embrace streams
    const pulse = Math.sin(time * 2.2) * 0.05 + 1.0;
    this.armLeft.scale.set(pulse, pulse, pulse);
    this.armRight.scale.set(pulse, pulse, pulse);
  }

  dispose() {
    this.armLeft.geometry.dispose();
    this.armRight.geometry.dispose();
    this.armMaterial.dispose();
    this.shockwave.geometry.dispose();
    this.waveMaterial.dispose();
  }
}
