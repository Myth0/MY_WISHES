/**
 * Cinematic Post-Processing Shader for POOKIE PROTOCOL
 * Adds subtle vignette, film grain, and subtle chromatic aberration
 */

export const CinematicShader = {
  uniforms: {
    tDiffuse: { value: null },
    uVignetteDarkness: { value: 1.25 },
    uVignetteOffset: { value: 0.85 },
    uGrainIntensity: { value: 0.028 },
    uTime: { value: 0 },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uVignetteDarkness;
    uniform float uVignetteOffset;
    uniform float uGrainIntensity;
    uniform float uTime;
    varying vec2 vUv;

    // Pseudo-random noise for film grain
    float rand(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      // Subtle chromatic aberration at perimeter
      vec2 distFromCenter = vUv - vec2(0.5);
      float dist = length(distFromCenter);
      vec2 chromaticOffset = distFromCenter * 0.0035 * dist;

      float r = texture2D(tDiffuse, vUv + chromaticOffset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - chromaticOffset).b;
      vec3 color = vec3(r, g, b);

      // Vignette
      float vignette = smoothstep(uVignetteOffset, uVignetteOffset - 0.45, dist);
      color *= mix(1.0 - uVignetteDarkness, 1.0, vignette);

      // Subtle warm film grain
      float noise = (rand(vUv + fract(uTime)) - 0.5) * uGrainIntensity;
      color += noise;

      gl_FragColor = vec4(color, 1.0);
    }
  `
};
