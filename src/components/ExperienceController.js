/**
 * ExperienceController.js - Master Three.js Engine for POOKIE PROTOCOL
 * Orchestrates rendering, post-processing bloom, camera choreography,
 * lighting, raycasting, and smooth scene state transitions.
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { LivingHeart } from './LivingHeart.js';
import { ParticleUniverse } from './ParticleUniverse.js';
import { MemoryOrbs } from './MemoryOrbs.js';
import { VirtualHugEffect } from './VirtualHugEffect.js';
import { CinematicShader } from '../shaders/CinematicPass.js';
import { soundEngine } from '../audio/SoundEngine.js';

export class ExperienceController {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;

    this.currentScene = 1; // 1: Void, 2: Living Heart, 3: First Interaction, 4: Orbs, 5: Hug, 6: Finale
    this.isDisposed = false;
    this.clock = new THREE.Clock();

    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLighting();
    this.initPostProcessing();
    this.initControls();
    this.initEntities();
    this.initEvents();

    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#030305');
    // Atmospheric cosmic fog
    this.scene.fog = new THREE.FogExp2('#030305', 0.024);
  }

  initCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    // Start far in the void
    this.camera.position.set(0, 0, 42);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
  }

  initLighting() {
    // 1. Ambient darkness with crimson undertone
    this.ambientLight = new THREE.AmbientLight(0x180308, 1.2);
    this.scene.add(this.ambientLight);

    // 2. Key directional light (Electric Crimson highlight)
    this.keyLight = new THREE.DirectionalLight(0xff173d, 2.8);
    this.keyLight.position.set(5, 7, 6);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);

    // 3. Rim directional light (Rose Gold edge gloss)
    this.rimLight = new THREE.DirectionalLight(0xd5a27c, 2.2);
    this.rimLight.position.set(-6, -3, -5);
    this.scene.add(this.rimLight);

    // 4. Soft overhead light
    this.topLight = new THREE.PointLight(0xffffff, 0.8, 20);
    this.topLight.position.set(0, 8, 2);
    this.scene.add(this.topLight);
  }

  initPostProcessing() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.composer = new EffectComposer(this.renderer);
    
    // 1. Scene Render Pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // 2. Selective Unreal Bloom Pass
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.9,  // strength
      0.65, // radius
      0.22  // threshold
    );
    this.composer.addPass(this.bloomPass);

    // 3. Cinematic Film Grain, Vignette & Chromatic Aberration
    this.cinematicPass = new ShaderPass(CinematicShader);
    this.composer.addPass(this.cinematicPass);

    // 4. Output Tone Mapping Pass
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = false; // Prevent user getting disoriented
    this.controls.enablePan = false;
    this.controls.minPolarAngle = Math.PI * 0.28;
    this.controls.maxPolarAngle = Math.PI * 0.72;
    this.controls.minAzimuthAngle = -Math.PI * 0.45;
    this.controls.maxAzimuthAngle = Math.PI * 0.45;
    this.controls.enabled = false; // Enabled after Scene 1
  }

  initEntities() {
    // 1. Living Crystal Heart
    this.heart = new LivingHeart(
      this.scene,
      this.camera,
      () => {
        if (this.options.onEasterEgg) this.options.onEasterEgg();
      }
    );

    // 2. Particle Universe & Rose Petals
    this.particles = new ParticleUniverse(this.scene);

    // 3. Floating Memory Orbs
    this.memoryOrbs = new MemoryOrbs(
      this.scene,
      (orbData) => {
        if (this.options.onOrbSelected) this.options.onOrbSelected(orbData);
      }
    );

    // 4. Virtual Hug Effect
    this.virtualHug = new VirtualHugEffect(this.scene);
  }

  initEvents() {
    this.handleResize = this.handleResize.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    this.renderer.domElement.addEventListener('click', this.handleClick);
    this.renderer.domElement.addEventListener('touchstart', this.handleTouchStart, { passive: true });
  }

  handleResize() {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);

    if (this.particles && this.particles.particleMaterial) {
      this.particles.particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    }
  }

  handlePointerMove(e) {
    if (this.isDisposed) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Send pointer coordinates to particles
    if (this.particles) {
      this.particles.setPointer(this.mouse);
    }

    // Raycast check for hover reactions
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let isHeartHovered = false;
    let hoveredOrbTarget = null;

    for (let hit of intersects) {
      if (hit.object.userData && hit.object.userData.isHeartCollider) {
        isHeartHovered = true;
      }
      if (hit.object.userData && hit.object.userData.isOrbHitTarget) {
        hoveredOrbTarget = hit.object;
      }
    }

    if (this.heart) {
      this.heart.setHover(isHeartHovered);
    }
    if (this.memoryOrbs) {
      this.memoryOrbs.handlePointerHover(hoveredOrbTarget);
    }
  }

  handleClick(e) {
    if (this.isDisposed) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (let hit of intersects) {
      // 1. Click on Memory Orb
      if (hit.object.userData && hit.object.userData.isOrbHitTarget) {
        this.memoryOrbs.selectOrb(hit.object);
        return;
      }

      // 2. Click on Living Heart
      if (hit.object.userData && hit.object.userData.isHeartCollider) {
        this.triggerHeartInteraction();
        return;
      }
    }
  }

  handleTouchStart(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.handlePointerMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }

  triggerHeartInteraction() {
    this.heart.handleClick((intensity) => this.pulseBloom(intensity));
    if (this.particles) {
      this.particles.triggerBurst();
    }

    if (this.currentScene === 3 && this.options.onScene3Touch) {
      this.options.onScene3Touch();
    }
  }

  pulseBloom(peakIntensity = 2.2, duration = 0.9) {
    if (!this.bloomPass) return;
    gsap.killTweensOf(this.bloomPass);
    gsap.timeline()
      .to(this.bloomPass, {
        strength: peakIntensity,
        duration: 0.15,
        ease: 'power2.out',
      })
      .to(this.bloomPass, {
        strength: 0.9,
        duration: duration,
        ease: 'power2.inOut',
      });
  }

  /**
   * Orchestrates the 6 scene camera & entity choreographies
   */
  setScene(sceneNum) {
    this.currentScene = sceneNum;

    // Reset controls target
    if (this.controls) {
      this.controls.target.set(0, 0, 0);
    }

    switch (sceneNum) {
      case 1: // The Void: camera approaches from deep space
        this.controls.enabled = false;
        gsap.to(this.camera.position, {
          x: 0,
          y: 0,
          z: 16.5,
          duration: 4.5,
          ease: 'power2.inOut',
        });
        this.heart.showEnergyRing(false);
        this.memoryOrbs.showOrbs(false);
        this.virtualHug.setActive(false);
        this.heart.openHeart(false);
        break;

      case 2: // The Living Heart: cinematic orbit settle
        this.controls.enabled = true;
        gsap.to(this.camera.position, {
          x: 0,
          y: 1.1,
          z: 9.2,
          duration: 2.2,
          ease: 'power3.inOut',
        });
        this.heart.showEnergyRing(false);
        this.memoryOrbs.showOrbs(false);
        this.virtualHug.setActive(false);
        this.heart.openHeart(false);
        break;

      case 3: // The First Interaction: energy ring activates, camera push-in
        this.controls.enabled = true;
        gsap.to(this.camera.position, {
          x: 0,
          y: 0.4,
          z: 7.8,
          duration: 1.8,
          ease: 'power2.out',
        });
        this.heart.showEnergyRing(true);
        this.memoryOrbs.showOrbs(false);
        this.virtualHug.setActive(false);
        break;

      case 4: // Constellation of Little Moments: 5 memory orbs appear
        this.controls.enabled = true;
        this.heart.showEnergyRing(false);
        this.virtualHug.setActive(false);
        gsap.to(this.camera.position, {
          x: 0,
          y: 0.5,
          z: 12.0,
          duration: 2.2,
          ease: 'power3.inOut',
        });
        this.memoryOrbs.showOrbs(true);
        break;

      case 5: // The Virtual Hug: intimate camera, embrace streams wrap heart
        this.controls.enabled = true;
        this.memoryOrbs.showOrbs(false);
        this.heart.showEnergyRing(false);
        this.heart.openHeart(false);
        this.virtualHug.setActive(true);
        gsap.to(this.camera.position, {
          x: 0,
          y: -0.2,
          z: 6.4,
          duration: 2.4,
          ease: 'power3.inOut',
        });
        break;

      case 6: // The Heart Opens (Finale): heart halves split, celestial rose blooms
        this.controls.enabled = true;
        this.memoryOrbs.showOrbs(false);
        this.virtualHug.setActive(false);
        this.heart.showEnergyRing(false);
        this.heart.openHeart(true);
        soundEngine.playFinaleCrescendo();

        // Particles morph into 3D Celestial Rose in the sky
        if (this.particles) {
          this.particles.morphToRose(1.0, 4.0);
        }

        // Camera pulls back to panoramic master shot looking slightly up
        gsap.to(this.camera.position, {
          x: 0,
          y: 2.2,
          z: 14.8,
          duration: 3.5,
          ease: 'power3.inOut',
        });
        this.pulseBloom(2.8, 2.5);
        break;

      default:
        break;
    }
  }

  triggerVirtualHug() {
    if (this.virtualHug) {
      this.virtualHug.triggerHug(
        (intensity) => this.pulseBloom(intensity),
        () => {
          if (this.particles) this.particles.triggerBurst();
        }
      );
    }
    // Cardiac surge
    if (this.heart) {
      this.heart.handleClick();
    }
  }

  deselectOrb() {
    if (this.memoryOrbs) {
      this.memoryOrbs.deselectOrb();
    }
  }

  animate() {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Update entities
    if (this.heart) this.heart.update(time, delta);
    if (this.particles) this.particles.update(time, delta);
    if (this.memoryOrbs) this.memoryOrbs.update(time, delta);
    if (this.virtualHug) this.virtualHug.update(time, delta);

    if (this.controls && this.controls.enabled) {
      this.controls.update();
    }

    if (this.cinematicPass) {
      this.cinematicPass.uniforms.uTime.value = time;
    }

    // Render post-processing passes
    this.composer.render();
  }

  dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animationFrameId);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('pointermove', this.handlePointerMove);
    this.renderer.domElement.removeEventListener('click', this.handleClick);
    this.renderer.domElement.removeEventListener('touchstart', this.handleTouchStart);

    if (this.heart) this.heart.dispose();
    if (this.particles) this.particles.dispose();
    if (this.memoryOrbs) this.memoryOrbs.dispose();
    if (this.virtualHug) this.virtualHug.dispose();

    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
