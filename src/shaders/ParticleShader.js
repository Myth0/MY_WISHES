/**
 * Custom GLSL Particle Shaders for POOKIE PROTOCOL
 * Optimized GPU particle rendering with:
 * - Morphing between orbital field, embrace streams, and celestial rose formation
 * - Per-particle twinkling and pulsation
 * - Smooth Gaussian disc alpha falloff
 * - Pointer interaction repulsion/attraction
 */

import * as THREE from 'three';

export const ParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uMorphProgress: { value: 0 }, // 0: Ambient Orbit, 1: Celestial Rose / Constellation
    uPointer: { value: new THREE.Vector3(0, 0, 0) },
    uPointerStrength: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uSize: { value: 38.0 },
    uColor1: { value: new THREE.Color('#FF173D') }, // Electric Crimson
    uColor2: { value: new THREE.Color('#D5A27C') }, // Rose Gold
    uColor3: { value: new THREE.Color('#FF4D6D') }, // Bright Cherry
    uBurstTime: { value: 0 },
  },

  vertexShader: `
    uniform float uTime;
    uniform float uMorphProgress;
    uniform vec3 uPointer;
    uniform float uPointerStrength;
    uniform float uPixelRatio;
    uniform float uSize;
    uniform float uBurstTime;

    attribute vec3 aTargetPosition;
    attribute float aPhase;
    attribute float aScale;
    attribute vec3 aColor;

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // 1. Interpolate between base orbital position and target constellation/rose position
      vec3 pos = mix(position, aTargetPosition, uMorphProgress);

      // 2. Slow organic celestial drift
      float speed = 0.4 + aPhase * 0.3;
      pos.x += sin(uTime * speed + aPhase * 6.28) * 0.35;
      pos.y += cos(uTime * (speed * 0.8) + aPhase * 3.14) * 0.3;
      pos.z += sin(uTime * (speed * 0.5) + aPhase * 4.5) * 0.35;

      // 3. Pointer interaction (gentle magnetic attractor/repulsion)
      if (uPointerStrength > 0.01) {
        vec3 toPointer = pos - uPointer;
        float dist = length(toPointer);
        if (dist < 4.0) {
          float force = (1.0 - dist / 4.0) * uPointerStrength * 0.8;
          pos += normalize(toPointer) * force;
        }
      }

      // 4. Burst dispersion if burst active
      if (uBurstTime > 0.0) {
        vec3 burstDir = normalize(pos);
        pos += burstDir * (uBurstTime * 4.5) * (1.0 + aPhase * 0.8);
      }

      vec4 mvPosition = viewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // 5. Perspective size attenuation
      float twinkle = sin(uTime * 3.0 + aPhase * 12.56) * 0.35 + 0.65;
      gl_PointSize = (uSize * aScale * twinkle * uPixelRatio) / -mvPosition.z;
      gl_PointSize = clamp(gl_PointSize, 1.5, 90.0);

      vColor = aColor;
      vAlpha = clamp(twinkle * 0.9, 0.2, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 uColor1;
    uniform vec3 uColor2;

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Create smooth radial circle disc with soft ethereal glow
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);

      if (dist > 0.5) {
        discard;
      }

      // Soft Gaussian glow falloff
      float strength = exp(-dist * dist * 14.0);
      float innerCore = exp(-dist * dist * 50.0);

      vec3 finalColor = mix(vColor, vec3(1.0, 0.95, 0.9), innerCore * 0.7);

      gl_FragColor = vec4(finalColor, strength * vAlpha);
    }
  `
};
