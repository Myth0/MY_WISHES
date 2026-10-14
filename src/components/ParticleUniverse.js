/**
 * ParticleUniverse.js - High-performance GPU Particle System & Falling 3D Rose Petals
 * Handles:
 * - Orbital space dust
 * - Constellation arcs and attractor streams
 * - Finale 3D Celestial Rose formation
 * - Physical fluttering 3D rose petals with instanced rendering
 * - Outward explosive particle bursts
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { ParticleShader } from '../shaders/ParticleShader.js';
import { generateCelestialRosePoints, createRosePetalGeometry } from '../geometry/HeartGeometry.js';

export class ParticleUniverse {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // Device-adaptive particle count
    const isMobile = window.innerWidth < 768;
    this.particleCount = isMobile ? 2400 : 4200;
    this.petalCount = isMobile ? 32 : 55;

    this.initParticles();
    this.initRosePetals();

    this.scene.add(this.group);
  }

  initParticles() {
    const count = this.particleCount;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const targetPositions = generateCelestialRosePoints(count);
    const phases = new Float32Array(count);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const color1 = new THREE.Color('#FF173D'); // Electric crimson
    const color2 = new THREE.Color('#D5A27C'); // Rose gold
    const color3 = new THREE.Color('#FF3355'); // Cherry

    for (let i = 0; i < count; i++) {
      // 1. Initial orbital shell around heart
      const radius = 2.5 + Math.random() * 14.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.8;
      positions[i * 3 + 2] = radius * Math.cos(phi);

      phases[i] = Math.random();
      scales[i] = 0.5 + Math.random() * 0.9;

      // Random color assignment between crimson and rose gold
      const pColor = Math.random() < 0.45 ? color1 : (Math.random() < 0.8 ? color3 : color2);
      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetPositions, 3));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(ParticleShader.uniforms),
      vertexShader: ParticleShader.vertexShader,
      fragmentShader: ParticleShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geometry, this.particleMaterial);
    this.group.add(this.points);
  }

  initRosePetals() {
    const count = this.petalCount;
    const geom = createRosePetalGeometry();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x9e001f,
      emissive: 0x3a000a,
      roughness: 0.45,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });

    this.petalInstancedMesh = new THREE.InstancedMesh(geom, mat, count);
    this.petalInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Individual petal physics data
    this.petalData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = (Math.random() - 0.5) * 22;
      const z = (Math.random() - 0.5) * 16;

      const rotX = Math.random() * Math.PI * 2;
      const rotY = Math.random() * Math.PI * 2;
      const rotZ = Math.random() * Math.PI * 2;

      const speedY = 0.4 + Math.random() * 0.7;
      const rotSpeedX = (Math.random() - 0.5) * 1.5;
      const rotSpeedY = (Math.random() - 0.5) * 1.8;
      const rotSpeedZ = (Math.random() - 0.5) * 1.5;
      const swayPhase = Math.random() * Math.PI * 2;

      this.petalData.push({
        x, y, z,
        rotX, rotY, rotZ,
        speedY,
        rotSpeedX, rotSpeedY, rotSpeedZ,
        swayPhase,
        scale: 0.7 + Math.random() * 0.6
      });

      dummy.position.set(x, y, z);
      dummy.rotation.set(rotX, rotY, rotZ);
      dummy.scale.setScalar(0.7);
      dummy.updateMatrix();
      this.petalInstancedMesh.setMatrixAt(i, dummy.matrix);
    }

    this.petalInstancedMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.petalInstancedMesh);
    this.dummy = dummy;
  }

  setPointer(ndcVector) {
    if (!this.particleMaterial) return;
    this.particleMaterial.uniforms.uPointer.value.set(
      ndcVector.x * 6.0,
      ndcVector.y * 5.0,
      0
    );
    this.particleMaterial.uniforms.uPointerStrength.value = 1.0;
  }

  clearPointer() {
    if (!this.particleMaterial) return;
    this.particleMaterial.uniforms.uPointerStrength.value = 0.0;
  }

  /**
   * Radial particle shockwave on click / hug / interaction
   */
  triggerBurst() {
    this.particleMaterial.uniforms.uBurstTime.value = 1.0;
    gsap.to(this.particleMaterial.uniforms.uBurstTime, {
      value: 0.0,
      duration: 1.4,
      ease: 'power2.out',
    });
  }

  /**
   * Transitions particle layout toward the Celestial Rose in Scene 5 Finale
   */
  morphToRose(progress = 1.0, duration = 3.5) {
    gsap.to(this.particleMaterial.uniforms.uMorphProgress, {
      value: progress,
      duration: duration,
      ease: 'power2.inOut',
    });
  }

  update(time, delta) {
    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uTime.value = time;
    }

    // Slow rotation of outer particle field
    this.group.rotation.y = time * 0.025;

    // Update fluttering rose petals
    if (this.petalInstancedMesh) {
      for (let i = 0; i < this.petalCount; i++) {
        const p = this.petalData[i];

        // Fall downward
        p.y -= p.speedY * delta;

        // Gentle sinusoidal sway
        p.x += Math.sin(time * 1.5 + p.swayPhase) * delta * 0.6;
        p.z += Math.cos(time * 1.2 + p.swayPhase) * delta * 0.4;

        // Tumbling rotation
        p.rotX += p.rotSpeedX * delta;
        p.rotY += p.rotSpeedY * delta;
        p.rotZ += p.rotSpeedZ * delta;

        // Wrap around at bottom boundary
        if (p.y < -11.0) {
          p.y = 12.0;
          p.x = (Math.random() - 0.5) * 18;
          p.z = (Math.random() - 0.5) * 16;
        }

        this.dummy.position.set(p.x, p.y, p.z);
        this.dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
        this.dummy.scale.setScalar(p.scale);
        this.dummy.updateMatrix();

        this.petalInstancedMesh.setMatrixAt(i, this.dummy.matrix);
      }
      this.petalInstancedMesh.instanceMatrix.needsUpdate = true;
    }
  }

  dispose() {
    this.points.geometry.dispose();
    this.particleMaterial.dispose();
    this.petalInstancedMesh.geometry.dispose();
  }
}
