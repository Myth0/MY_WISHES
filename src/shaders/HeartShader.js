/**
 * Custom GLSL Shader for POOKIE PROTOCOL's Living Crystal Heart
 * Features:
 * - Organic systolic/diastolic vertex deformation along normals
 * - Traveling shockwave ripples on clicks and interaction
 * - Volumetric internal energy veins using dynamic coordinate interference
 * - Luxury glass Fresnel rim glow with Rose Gold accents
 * - Translucent deep crimson and electric cherry depth scattering
 */

import * as THREE from 'three';

export const HeartShader = {
  uniforms: {
    uTime: { value: 0 },
    uBeat: { value: 0 },
    uHover: { value: 0 },
    uClickPulse: { value: 0 },
    uGlowIntensity: { value: 1.0 },
    uColorDeep: { value: new THREE.Color('#3A000A') },
    uColorMid: { value: new THREE.Color('#9E001F') },
    uColorBright: { value: new THREE.Color('#FF173D') },
    uColorGold: { value: new THREE.Color('#E8B896') },
    uLightPos1: { value: new THREE.Vector3(5, 8, 7) },
    uLightPos2: { value: new THREE.Vector3(-6, -4, -5) },
  },

  vertexShader: `
    uniform float uTime;
    uniform float uBeat;
    uniform float uClickPulse;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying float vPulseEffect;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;

      // 1. Organic heartbeat displacement along surface normal
      // Ventricle apex moves with rhythmic dual-pulse
      float beatDisp = uBeat * 0.11;
      
      // Secondary rhythmic muscular wave
      float wave = sin(uTime * 3.0 + pos.y * 2.5) * 0.015;

      // 2. Click shockwave ripple propagating outward
      float dist = length(pos);
      float ripple = sin(dist * 6.0 - uClickPulse * 18.0) * exp(-uClickPulse * 3.0);
      ripple = clamp(ripple, -0.05, 0.08) * (uClickPulse > 0.01 ? 1.0 : 0.0);
      vPulseEffect = ripple;

      pos += normal * (beatDisp + wave + ripple);

      vPosition = pos;
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      vec4 mvPosition = viewMatrix * worldPosition;
      vViewPosition = -mvPosition.xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform float uBeat;
    uniform float uHover;
    uniform float uClickPulse;
    uniform float uGlowIntensity;
    uniform vec3 uColorDeep;
    uniform vec3 uColorMid;
    uniform vec3 uColorBright;
    uniform vec3 uColorGold;
    uniform vec3 uLightPos1;
    uniform vec3 uLightPos2;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying float vPulseEffect;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPosition);

      // 1. Fresnel Rim Glancing Calculation
      float NdotV = max(0.0, dot(N, V));
      float fresnel = pow(1.0 - NdotV, 3.2);
      float deepFresnel = pow(1.0 - NdotV, 1.5);

      // 2. Procedural Bioluminescent Energy Veins
      // Coordinates interference creates organic branching crystalline veins
      vec3 p = vPosition * 4.0;
      float veinPattern = sin(p.x * 3.5 + sin(p.y * 4.0 + uTime * 2.0)) *
                          cos(p.z * 3.5 + cos(p.x * 2.0 - uTime * 1.5));
      float veins = smoothstep(0.45, 0.95, veinPattern);
      
      // Secondary micro-fibril veins
      float microVeins = smoothstep(0.6, 0.9, sin(p.y * 12.0 + p.z * 10.0 + uTime * 3.0));

      // 3. Lighting calculation (Key light + Rim back light)
      vec3 L1 = normalize(uLightPos1 - vWorldPosition);
      vec3 L2 = normalize(uLightPos2 - vWorldPosition);

      float diff1 = max(0.0, dot(N, L1));
      float diff2 = max(0.0, dot(N, L2)) * 0.6;

      // Specular reflections for crystal facets
      vec3 H1 = normalize(L1 + V);
      float spec1 = pow(max(0.0, dot(N, H1)), 48.0);
      vec3 H2 = normalize(L2 + V);
      float spec2 = pow(max(0.0, dot(N, H2)), 32.0);

      // 4. Color Grading and Energy Composition
      // Base dark luxury cherry body
      vec3 color = mix(uColorDeep, uColorMid, deepFresnel * 0.8 + diff1 * 0.4);

      // Internal light pulsing in tandem with the heart cycle
      float internalPulse = (uBeat * 0.85 + 0.35) * uGlowIntensity;
      vec3 pulseColor = mix(uColorBright, uColorGold, 0.2);
      color += pulseColor * (veins * 0.75 + microVeins * 0.35) * internalPulse;

      // Hover response: subtle rose-gold warmth infusion
      color += uColorGold * (uHover * 0.3 * fresnel);

      // Click shockwave flash
      if (uClickPulse > 0.01) {
        color += uColorBright * abs(vPulseEffect) * 6.0;
      }

      // Specular crystal glints
      color += vec3(1.0, 0.9, 0.95) * (spec1 * 0.9 + spec2 * 0.5);

      // Rose-gold rim edge
      color += uColorGold * (fresnel * 1.2 * uGlowIntensity);

      // Subtle transmission depth glow
      float depthGlow = (1.0 - smoothstep(0.0, 3.5, length(vPosition))) * internalPulse * 0.5;
      color += uColorBright * depthGlow;

      gl_FragColor = vec4(color, 0.94);
    }
  `
};
