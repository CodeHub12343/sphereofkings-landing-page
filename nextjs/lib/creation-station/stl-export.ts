// Template-based STL generation.
//
// Phase-1 produces real, valid binary STL files for the sphere board and
// double-stack checker pieces using analytic primitives (UV sphere, discs,
// stacked cylinders). The painted grid is baked into the per-face attribute
// byte-count position of binary STL as a 15-bit RGB tint — a widely used
// convention that slicers like PrusaSlicer honor for display coloring.
//
// This is deliberately a *geometry* stub: the real Sphere of Kings mechanical
// CAD (lid interlock, magnet seats, storage compartments, piece connectors)
// lives in the Python CAD service described in the implementation roadmap.
// When that service is online, this module's `exportBoard`/`exportCheckers`
// calls delegate to it and return the service's STL bytes; the signature
// does not change.

import { DESIGN_COLS, DESIGN_ROWS } from "@/lib/sphere-grid";

const LAT_SEGMENTS = 32;
const LON_SEGMENTS = 48;
const SPHERE_RADIUS_MM = 70;

interface Tri {
  n: [number, number, number];
  v1: [number, number, number];
  v2: [number, number, number];
  v3: [number, number, number];
  rgb: [number, number, number];
}

function hexToRgb(hex: string): [number, number, number] {
  const s = hex?.replace("#", "") ?? "";
  if (s.length !== 6) return [128, 128, 128];
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
}

function normalize(v: [number, number, number]): [number, number, number] {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function sampleGrid(grid: string[][], u: number, v: number): [number, number, number] {
  // u in [0,1] around equator, v in [0,1] bottom→top.
  const col = Math.min(DESIGN_COLS - 1, Math.floor(u * DESIGN_COLS));
  const row = Math.min(DESIGN_ROWS - 1, Math.floor(v * DESIGN_ROWS));
  const hex = grid[row]?.[col] || "#808080";
  return hexToRgb(hex);
}

function buildSphereTris(grid: string[][]): Tri[] {
  const tris: Tri[] = [];
  const R = SPHERE_RADIUS_MM;
  for (let i = 0; i < LAT_SEGMENTS; i++) {
    const v0 = i / LAT_SEGMENTS;
    const v1 = (i + 1) / LAT_SEGMENTS;
    const phi0 = v0 * Math.PI;
    const phi1 = v1 * Math.PI;
    for (let j = 0; j < LON_SEGMENTS; j++) {
      const u0 = j / LON_SEGMENTS;
      const u1 = (j + 1) / LON_SEGMENTS;
      const th0 = u0 * Math.PI * 2;
      const th1 = u1 * Math.PI * 2;
      const p = (phi: number, th: number): [number, number, number] => ([
        R * Math.sin(phi) * Math.cos(th),
        R * Math.cos(phi),
        R * Math.sin(phi) * Math.sin(th),
      ]);
      const a = p(phi0, th0), b = p(phi1, th0), c = p(phi1, th1), d = p(phi0, th1);
      const rgb = sampleGrid(grid, (u0 + u1) / 2, 1 - (v0 + v1) / 2);
      tris.push({ n: normalize(a), v1: a, v2: b, v3: c, rgb });
      tris.push({ n: normalize(a), v1: a, v2: c, v3: d, rgb });
    }
  }
  return tris;
}

function buildDiscTris(radius: number, thickness: number, yOffset: number, color: string): Tri[] {
  const segments = 48;
  const rgb = hexToRgb(color);
  const tris: Tri[] = [];
  const top = yOffset + thickness / 2;
  const bot = yOffset - thickness / 2;
  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * Math.PI * 2;
    const t1 = ((i + 1) / segments) * Math.PI * 2;
    const x0 = Math.cos(t0) * radius, z0 = Math.sin(t0) * radius;
    const x1 = Math.cos(t1) * radius, z1 = Math.sin(t1) * radius;
    // Side
    tris.push({ n: normalize([x0, 0, z0]), v1: [x0, bot, z0], v2: [x1, bot, z1], v3: [x1, top, z1], rgb });
    tris.push({ n: normalize([x0, 0, z0]), v1: [x0, bot, z0], v2: [x1, top, z1], v3: [x0, top, z0], rgb });
    // Top cap
    tris.push({ n: [0, 1, 0], v1: [0, top, 0], v2: [x0, top, z0], v3: [x1, top, z1], rgb });
    // Bottom cap
    tris.push({ n: [0, -1, 0], v1: [0, bot, 0], v2: [x1, bot, z1], v3: [x0, bot, z0], rgb });
  }
  return tris;
}

function encodeBinarySTL(tris: Tri[], header = "Sphere of Kings"): Uint8Array {
  const headerBytes = new Uint8Array(80);
  const text = new TextEncoder().encode(header);
  headerBytes.set(text.slice(0, 80));

  const triBytes = new ArrayBuffer(50 * tris.length);
  const view = new DataView(triBytes);
  let off = 0;
  for (const t of tris) {
    view.setFloat32(off, t.n[0], true); off += 4;
    view.setFloat32(off, t.n[1], true); off += 4;
    view.setFloat32(off, t.n[2], true); off += 4;
    for (const v of [t.v1, t.v2, t.v3]) {
      view.setFloat32(off, v[0], true); off += 4;
      view.setFloat32(off, v[1], true); off += 4;
      view.setFloat32(off, v[2], true); off += 4;
    }
    // 15-bit RGB in the attribute byte count (PrusaSlicer convention).
    const r5 = (t.rgb[0] >> 3) & 0x1f;
    const g5 = (t.rgb[1] >> 3) & 0x1f;
    const b5 = (t.rgb[2] >> 3) & 0x1f;
    const attr = (1 << 15) | (r5 << 10) | (g5 << 5) | b5;
    view.setUint16(off, attr, true); off += 2;
  }

  const countBytes = new ArrayBuffer(4);
  new DataView(countBytes).setUint32(0, tris.length, true);

  const total = new Uint8Array(80 + 4 + triBytes.byteLength);
  total.set(headerBytes, 0);
  total.set(new Uint8Array(countBytes), 80);
  total.set(new Uint8Array(triBytes), 84);
  return total;
}

export function exportSphereBoardSTL(grid: string[][]): Uint8Array {
  return encodeBinarySTL(buildSphereTris(grid), "SOK sphere board");
}

export function exportCheckerSetSTL(topColor: string, bottomColor: string, crown: boolean, crownColor: string): Uint8Array {
  const tris: Tri[] = [
    ...buildDiscTris(18, 6, 3, bottomColor),
    ...buildDiscTris(18, 6, 10, topColor),
  ];
  if (crown) tris.push(...buildDiscTris(8, 5, 16, crownColor));
  return encodeBinarySTL(tris, "SOK double-stack checker");
}

export interface ExportBundle {
  files: { name: string; bytes: Uint8Array }[];
}

export function exportBundle(grid: string[][], config: {
  checker: { topColor: string; bottomColor: string; crown: boolean; crownColor: string };
}): ExportBundle {
  return {
    files: [
      { name: "sphere-board.stl", bytes: exportSphereBoardSTL(grid) },
      { name: "double-stack-checker.stl", bytes: exportCheckerSetSTL(
        config.checker.topColor, config.checker.bottomColor,
        config.checker.crown, config.checker.crownColor,
      ) },
    ],
  };
}
