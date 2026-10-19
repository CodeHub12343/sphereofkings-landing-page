"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { DESIGN_COLS, DESIGN_ROWS } from "@/lib/sphere-grid";

// Builds a CanvasTexture from the painted grid and maps it onto a
// sphere. The 14×8 cylinder unfolds onto the sphere's equatorial band
// so column-wrap preserves the seam geometry.

function buildTexture(grid: string[][]): THREE.CanvasTexture {
  const cell = 48;
  const w = DESIGN_COLS * cell;
  const h = DESIGN_ROWS * cell;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  for (let r = 0; r < DESIGN_ROWS; r++) {
    for (let c = 0; c < DESIGN_COLS; c++) {
      ctx.fillStyle = grid[r][c] || ((c + r) % 2 === 0 ? "#f3e1a7" : "#2b2210");
      ctx.fillRect(c * cell, (DESIGN_ROWS - 1 - r) * cell, cell, cell);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function SpinningSphere({ grid, autoSpin }: { grid: string[][]; autoSpin: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => buildTexture(grid), [grid]);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((_, delta) => {
    if (autoSpin && meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 32]} />
      <meshStandardMaterial map={texture} metalness={0.2} roughness={0.6} />
    </mesh>
  );
}

export default function Sphere3D({ grid, autoSpin = true }: { grid: string[][]; autoSpin?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 2.6], fov: 45 }}
            style={{ width: "100%", height: 420, background: "var(--bg2, #0d0b08)",
                     borderRadius: 10, border: "1px solid var(--border, #2a2218)" }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} />
      <SpinningSphere grid={grid} autoSpin={autoSpin} />
      <OrbitControls enablePan={false} minDistance={1.8} maxDistance={5} />
    </Canvas>
  );
}
