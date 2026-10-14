/**
 * Procedural 3D Heart Geometry & Petal Generators for POOKIE PROTOCOL
 * Generates smooth, mathematically refined anatomical-crystal heart meshes,
 * interior septum caps for opening split, and fluttering 3D rose petals.
 */

import * as THREE from 'three';

/**
 * Evaluates the 2D parametric heart profile
 * @param {number} t - Angle in [0, 2*PI]
 * @returns {{x: number, y: number}}
 */
function heartProfile2D(t) {
  // Classical high-aesthetic parametric heart curve
  const sinT = Math.sin(t);
  const x = 16 * Math.pow(sinT, 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x, y };
}

/**
 * Creates half of the 3D heart (left or right) with an inner sagittal septum wall
 * so that when the heart splits open in Scene 5, both halves look solid and crystalline!
 * @param {'left'|'right'} side
 * @param {number} segmentsT
 * @param {number} segmentsPhi
 */
export function createHalfHeartGeometry(side = 'left', segmentsT = 64, segmentsPhi = 32) {
  const positions = [];
  const uvs = [];
  const indices = [];

  const scale = 0.12; // Normalizes heart size to approx 3.8 units height
  const yOffset = -0.15; // Centers center-of-mass

  // Side factor: left is x <= 0, right is x >= 0
  const isLeft = side === 'left';
  // Profile range:
  // t: 0 is top cleft, PI is bottom apex, 2*PI is back to top cleft
  // For left side: t from PI to 2*PI (x <= 0)
  // For right side: t from 0 to PI (x >= 0)
  const tMin = isLeft ? Math.PI : 0;
  const tMax = isLeft ? 2 * Math.PI : Math.PI;

  const grid = [];

  // 1. Generate Outer Curved Shell
  for (let i = 0; i <= segmentsT; i++) {
    const row = [];
    const u = i / segmentsT;
    const t = tMin + u * (tMax - tMin);
    const { x: profX, y: profY } = heartProfile2D(t);

    for (let j = 0; j <= segmentsPhi; j++) {
      const v = j / segmentsPhi;
      // phi sweeps from -PI/2 (back) through 0 to PI/2 (front)
      const phi = -Math.PI / 2 + v * Math.PI;

      // Base radius and organic thickness modulation
      const thickness = (0.52 - 0.12 * (profY / 17)) * Math.abs(profX);
      
      const px = profX * Math.cos(phi) * scale;
      const py = (profY * scale) + yOffset;
      const pz = Math.sin(phi) * thickness * scale;

      positions.push(px, py, pz);
      uvs.push(u, v);
      row.push((positions.length / 3) - 1);
    }
    grid.push(row);
  }

  // Create outer shell faces
  for (let i = 0; i < segmentsT; i++) {
    for (let j = 0; j < segmentsPhi; j++) {
      const a = grid[i][j];
      const b = grid[i + 1][j];
      const c = grid[i + 1][j + 1];
      const d = grid[i][j + 1];

      if (isLeft) {
        indices.push(a, c, b);
        indices.push(a, d, c);
      } else {
        indices.push(a, b, c);
        indices.push(a, c, d);
      }
    }
  }

  // 2. Generate Inner Septum Wall (The flat cut at x = 0)
  // Connecting the boundary points (phi = -PI/2 and phi = PI/2) along x = 0
  const septumVerts = [];

  // Front spine (phi = PI/2 -> j = segmentsPhi)
  for (let i = 0; i <= segmentsT; i++) {
    const idx = grid[i][segmentsPhi];
    septumVerts.push({
      x: 0,
      y: positions[idx * 3 + 1],
      z: positions[idx * 3 + 2],
      origIdx: idx
    });
  }

  // Back spine (phi = -PI/2 -> j = 0)
  for (let i = segmentsT; i >= 0; i--) {
    const idx = grid[i][0];
    septumVerts.push({
      x: 0,
      y: positions[idx * 3 + 1],
      z: positions[idx * 3 + 2],
      origIdx: idx
    });
  }

  // Triangulate the flat septum with a central spine fan
  const centerIdx = positions.length / 3;
  positions.push(0, yOffset, 0);
  uvs.push(0.5, 0.5);

  const numBoundary = septumVerts.length;
  for (let k = 0; k < numBoundary; k++) {
    const nextK = (k + 1) % numBoundary;
    const v1 = septumVerts[k].origIdx;
    const v2 = septumVerts[nextK].origIdx;

    if (isLeft) {
      indices.push(centerIdx, v1, v2);
    } else {
      indices.push(centerIdx, v2, v1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Creates unified full heart geometry for closed state
 */
export function createFullHeartGeometry(segmentsT = 72, segmentsPhi = 48) {
  const positions = [];
  const uvs = [];
  const indices = [];

  const scale = 0.12;
  const yOffset = -0.15;
  const grid = [];

  for (let i = 0; i <= segmentsT; i++) {
    const row = [];
    const u = i / segmentsT;
    const t = u * 2 * Math.PI;
    const { x: profX, y: profY } = heartProfile2D(t);

    for (let j = 0; j <= segmentsPhi; j++) {
      const v = j / segmentsPhi;
      const phi = v * 2 * Math.PI;

      const thickness = (0.52 - 0.12 * (profY / 17)) * Math.abs(profX);
      const px = profX * Math.cos(phi / 2) * scale;
      const py = (profY * scale) + yOffset;
      const pz = Math.sin(phi / 2) * thickness * scale;

      positions.push(px, py, pz);
      uvs.push(u, v);
      row.push((positions.length / 3) - 1);
    }
    grid.push(row);
  }

  for (let i = 0; i < segmentsT; i++) {
    for (let j = 0; j < segmentsPhi; j++) {
      const a = grid[i][j];
      const b = grid[i + 1][j];
      const c = grid[i + 1][j + 1];
      const d = grid[i][j + 1];

      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Creates a delicate curved 3D rose petal mesh
 */
export function createRosePetalGeometry() {
  const geom = new THREE.PlaneGeometry(0.35, 0.45, 6, 6);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Curl edges like a real rose petal
    const curl = (x * x * 1.5) - (y * 0.4);
    pos.setZ(i, curl);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * Generates positions for the Celestial Rose particle formation in Scene 5 Finale
 * Uses 3D logarithmic rose petal phyllotaxis
 * @param {number} count
 */
export function generateCelestialRosePoints(count = 2500) {
  const points = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const t = i / count;
    // Layered rose spiral
    const theta = i * 2.39996; // Golden angle
    const r = Math.pow(t, 0.55) * 3.8;
    
    // Petal elevation and curvature
    const petalLayer = Math.sin(theta * 3.5) * 0.45;
    const y = (Math.pow(1 - t, 0.7) * 2.2) + petalLayer - 0.5;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    points[i * 3] = x;
    points[i * 3 + 1] = y + 1.2; // elevated above heart
    points[i * 3 + 2] = z;
  }

  return points;
}
