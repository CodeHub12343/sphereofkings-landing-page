"use client";

// Playable 3D sphere board.
//
// Geometry: the playable band covers latitudes ±LAT_SPAN/2. The board
// texture, the piece positions, the tap → square mapping and the
// highlight patches all derive from the same two functions
// (boardToSphere / cellFromPoint), so what you see is what you tap.
//
// Input: a tap only counts if the pointer barely moved (R3F's
// `event.delta`), so dragging to rotate never selects or moves a piece.
// Taps on the band are converted straight to a column/row, so the whole
// square is the target, not a small disc in its middle.
//
// Three.js + @react-three/fiber are already direct deps; this file is
// code-split behind BoardViewToggle's dynamic import.

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type SpherePiece = {
  col: number;                       // 1..cols
  row: number;                       // 1..rows
  color: "red" | "black" | "white";
  kind?: "king" | "queen" | "rook" | "bishop" | "knight" | "pawn" | "checker";
};

export type SphereCell = { col: number; row: number };

export type LegalDest = SphereCell & { capture?: boolean };

export type SphereBoardViewProps = {
  cols: number;
  rows: number;
  pieces: SpherePiece[];
  selected?: SphereCell | null;
  legalDests?: LegalDest[];
  onCellClick?: (cell: SphereCell) => void;
  // View from the side whose home rows are the HIGH row numbers (black),
  // so the viewer's own pieces sit at the bottom, nearest them.
  flipped?: boolean;
  darkSquare?: string;
  lightSquare?: string;
  seam?: string;
};

const RADIUS = 1;
const LAT_SPAN_DEG = 120;
// A pointer that travels more than this many px between down and up was
// a rotate gesture, not a tap.
const TAP_SLOP_PX = 8;
const DEG = Math.PI / 180;

// Both games: a square is dark when col + row is odd.
const isDarkCell = (col: number, row: number) => (col + row) % 2 === 1;

/* ------------------------ Position math ---------------------------- */
// Convention: lon/lat in degrees; x = cosφ·cosλ, y = sinφ, z = cosφ·sinλ.
// three's SphereGeometry uses phi = 180° − lon and theta = 90° − lat.

function cellSize(cols: number, rows: number) {
  return { w: 360 / cols, h: LAT_SPAN_DEG / rows };
}

function boardToSphere(col: number, row: number, cols: number, rows: number, radius: number) {
  const { w, h } = cellSize(cols, rows);
  const lon = ((col - 0.5) * w - 180) * DEG;
  const lat = (-LAT_SPAN_DEG / 2 + (row - 0.5) * h) * DEG;
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.sin(lon),
  );
}

/** Inverse of boardToSphere for a point in board-local space. */
function cellFromPoint(p: THREE.Vector3, cols: number, rows: number): SphereCell | null {
  const len = p.length();
  if (len === 0) return null;
  const lat = Math.asin(THREE.MathUtils.clamp(p.y / len, -1, 1)) / DEG;
  const lon = Math.atan2(p.z, p.x) / DEG; // -180..180
  const { w, h } = cellSize(cols, rows);
  const row = Math.floor((lat + LAT_SPAN_DEG / 2) / h) + 1;
  if (row < 1 || row > rows) return null;
  const col = Math.min(cols, Math.max(1, Math.floor((lon + 180) / w) + 1));
  return { col, row };
}

/** phi/theta ranges (radians) that exactly cover one square. */
function cellPatchArgs(col: number, row: number, cols: number, rows: number, inset = 0) {
  const { w, h } = cellSize(cols, rows);
  const lonHi = col * w - 180;
  const latHi = -LAT_SPAN_DEG / 2 + row * h;
  return {
    phiStart: (180 - lonHi + inset * w) * DEG,
    phiLength: w * (1 - 2 * inset) * DEG,
    thetaStart: (90 - latHi + inset * h) * DEG,
    thetaLength: h * (1 - 2 * inset) * DEG,
  };
}

/* ------------------- Board texture (band only) --------------------- */

function useBoardTexture(cols: number, rows: number, dark: string, light: string, seam: string) {
  return useMemo(() => {
    const sq = 96;
    const canvas = document.createElement("canvas");
    canvas.width = cols * sq;
    canvas.height = rows * sq;
    const ctx = canvas.getContext("2d")!;
    // Canvas column i shows board col (cols − i); canvas row j shows
    // board row (rows − j). See the convention note above.
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const col = cols - i;
        const row = rows - j;
        ctx.fillStyle = isDarkCell(col, row) ? dark : light;
        ctx.fillRect(i * sq, j * sq, sq, sq);
      }
    }
    // Faint grid lines so squares read on the dark side too.
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * sq, 0); ctx.lineTo(i * sq, canvas.height); ctx.stroke(); }
    for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(0, j * sq); ctx.lineTo(canvas.width, j * sq); ctx.stroke(); }
    // Gold seam meridian between col 14 and col 1 (the canvas edges).
    ctx.fillStyle = seam;
    ctx.fillRect(0, 0, 4, canvas.height);
    ctx.fillRect(canvas.width - 4, 0, 4, canvas.height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }, [cols, rows, dark, light, seam]);
}

/* --------------------------- Pieces -------------------------------- */

const noRaycast = () => null;

function PieceOnSphere({
  piece, cols, rows, selected, onTap,
}: {
  piece: SpherePiece;
  cols: number;
  rows: number;
  selected: boolean;
  onTap: () => void;
}) {
  const { h } = cellSize(cols, rows);
  // Size pieces from the square's height (the tighter dimension).
  const cell = 2 * Math.sin((h * DEG) / 2) * RADIUS;
  const isChess = !!piece.kind && piece.kind !== "checker";
  const r = cell * (isChess ? 0.3 : 0.38);

  const basePos = useMemo(
    () => boardToSphere(piece.col, piece.row, cols, rows, RADIUS),
    [piece.col, piece.row, cols, rows],
  );
  const normal = useMemo(() => basePos.clone().normalize(), [basePos]);
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal),
    [normal],
  );

  // Lift when selected; small pop when a piece lands on a new square.
  const groupRef = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  useFrame(({ clock, invalidate }) => {
    const g = groupRef.current;
    if (!g) return;
    if (born.current === null) born.current = clock.elapsedTime;
    const age = clock.elapsedTime - born.current;
    const pop = age < 0.22 ? 0.75 + 0.25 * Math.sin((age / 0.22) * (Math.PI / 2)) : 1;
    g.scale.setScalar(pop);
    const lift = selected ? cell * 0.35 : 0;
    const target = basePos.clone().addScaledVector(normal, lift);
    g.position.lerp(target, 0.25);
    // On-demand rendering: keep drawing only while this piece animates.
    if (age < 0.22 || g.position.distanceToSquared(target) > 1e-7) invalidate();
  });

  const color = piece.color === "red" ? "#d8324c" : piece.color === "white" ? "#f0e6c6" : "#1f1a14";
  const metal = piece.color === "white" ? 0.25 : 0.45;
  const chessHeight: Record<string, number> = {
    king: 2.3, queen: 2.15, rook: 1.6, bishop: 1.8, knight: 1.6, pawn: 1.25,
  };
  const height = isChess ? r * (chessHeight[piece.kind ?? "pawn"] ?? 1.6) : r * 0.42;

  const tap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > TAP_SLOP_PX) return;
    onTap();
  };

  return (
    <group ref={groupRef} position={basePos.toArray()} quaternion={quat} onClick={tap}>
      {/* Gold foot — the magnetic base on the physical piece */}
      <mesh position={[0, r * 0.06, 0]}>
        <cylinderGeometry args={[r * 1.08, r * 1.12, r * 0.12, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
      </mesh>
      {isChess ? (
        <group position={[0, r * 0.12, 0]}>
          <mesh position={[0, r * 0.12, 0]}>
            <cylinderGeometry args={[r * 0.85, r * 0.95, r * 0.24, 24]} />
            <meshStandardMaterial color={color} metalness={metal} roughness={0.35} />
          </mesh>
          <mesh position={[0, r * 0.24 + (height - r * 0.6) / 2, 0]}>
            <cylinderGeometry args={[r * 0.42, r * 0.7, height - r * 0.6, 24]} />
            <meshStandardMaterial color={color} metalness={metal} roughness={0.35} />
          </mesh>
          <mesh position={[0, height - r * 0.2, 0]}>
            {piece.kind === "king" && <coneGeometry args={[r * 0.6, r * 0.5, 4]} />}
            {piece.kind === "queen" && <sphereGeometry args={[r * 0.5, 20, 14]} />}
            {piece.kind === "rook" && <boxGeometry args={[r * 1.0, r * 0.45, r * 1.0]} />}
            {piece.kind === "bishop" && <coneGeometry args={[r * 0.45, r * 0.7, 20]} />}
            {piece.kind === "knight" && <boxGeometry args={[r * 0.5, r * 0.5, r * 0.95]} />}
            {piece.kind === "pawn" && <sphereGeometry args={[r * 0.5, 16, 12]} />}
            <meshStandardMaterial color={color} metalness={metal} roughness={0.35} />
          </mesh>
          {piece.kind === "king" && (
            <group position={[0, height + r * 0.15, 0]}>
              <mesh><boxGeometry args={[r * 0.12, r * 0.45, r * 0.12]} /><meshStandardMaterial color="#f0c040" metalness={0.9} roughness={0.2} /></mesh>
              <mesh position={[0, r * 0.06, 0]}><boxGeometry args={[r * 0.35, r * 0.12, r * 0.12]} /><meshStandardMaterial color="#f0c040" metalness={0.9} roughness={0.2} /></mesh>
            </group>
          )}
        </group>
      ) : (
        <>
          <mesh position={[0, r * 0.12 + height / 2, 0]}>
            <cylinderGeometry args={[r * 0.95, r, height, 32]} />
            <meshStandardMaterial color={color} metalness={metal} roughness={0.3} />
          </mesh>
          <mesh position={[0, r * 0.12 + height, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
            <torusGeometry args={[r * 0.72, r * 0.06, 8, 32]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
          </mesh>
        </>
      )}
      {/* Generous invisible hit volume so thin chess pieces are easy to tap */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[r * 1.15, r * 1.15, height + r * 0.3, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------ Curved square highlight patch ------------------ */

function CellPatch({
  cell, cols, rows, color, opacity, inset = 0.04, lift = 0.003,
}: {
  cell: SphereCell;
  cols: number;
  rows: number;
  color: string;
  opacity: number;
  inset?: number;
  lift?: number;
}) {
  const a = cellPatchArgs(cell.col, cell.row, cols, rows, inset);
  return (
    <mesh raycast={noRaycast} renderOrder={2}>
      <sphereGeometry args={[RADIUS + lift, 12, 6, a.phiStart, a.phiLength, a.thetaStart, a.thetaLength]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Dot in the middle of a legal empty square (mirrors the flat board). */
function LegalDot({ cell, cols, rows, capture }: { cell: SphereCell; cols: number; rows: number; capture: boolean }) {
  const pos = useMemo(() => boardToSphere(cell.col, cell.row, cols, rows, RADIUS + 0.004), [cell.col, cell.row, cols, rows]);
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize()),
    [pos],
  );
  const { h } = cellSize(cols, rows);
  const cell2 = 2 * Math.sin((h * DEG) / 2) * RADIUS;
  const ref = useRef<THREE.Mesh>(null);
  // Gentle pulse; legal markers only exist while a piece is selected,
  // so this is the only steady redraw and it stops on deselect.
  useFrame(({ clock, invalidate }) => {
    if (ref.current) ref.current.scale.setScalar(0.92 + 0.08 * Math.sin(clock.elapsedTime * 4));
    invalidate();
  });
  return (
    <group position={pos.toArray()} quaternion={quat}>
      {capture ? (
        <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
          <torusGeometry args={[cell2 * 0.42, cell2 * 0.05, 10, 40]} />
          <meshBasicMaterial color="#ff5b7a" />
        </mesh>
      ) : (
        <mesh ref={ref} raycast={noRaycast}>
          <cylinderGeometry args={[cell2 * 0.16, cell2 * 0.16, 0.004, 24]} />
          <meshBasicMaterial color="#f0c040" />
        </mesh>
      )}
    </group>
  );
}

/* ------------------------------ Scene ------------------------------ */

function Scene({
  cols, rows, pieces, selected, legalDests, onCellClick, flipped, darkSquare, lightSquare, seam,
}: {
  cols: number;
  rows: number;
  pieces: SpherePiece[];
  selected: SphereCell | null;
  legalDests: LegalDest[];
  onCellClick?: (cell: SphereCell) => void;
  flipped: boolean;
  darkSquare: string;
  lightSquare: string;
  seam: string;
}) {
  const boardRef = useRef<THREE.Group>(null);
  const tex = useBoardTexture(cols, rows, darkSquare, lightSquare, seam);
  const [hover, setHover] = useState<SphereCell | null>(null);
  const halfSpan = (LAT_SPAN_DEG / 2) * DEG;
  const thetaStart = Math.PI / 2 - halfSpan;

  const toCell = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    const g = boardRef.current;
    if (!g) return null;
    return cellFromPoint(g.worldToLocal(e.point.clone()), cols, rows);
  };

  const occupied = useMemo(() => new Set(pieces.map((p) => `${p.col},${p.row}`)), [pieces]);

  return (
    // Flipping = viewing from the other pole side: rotate 180° about the
    // view axis so the viewer's home rows are at the bottom.
    <group ref={boardRef} rotation={[0, 0, flipped ? Math.PI : 0]}>
      {/* Playable band — the only surface that maps taps to squares */}
      <mesh
       
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta > TAP_SLOP_PX) return;
          const c = toCell(e);
          if (c) onCellClick?.(c);
        }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const c = toCell(e);
          setHover((prev) => (prev?.col === c?.col && prev?.row === c?.row ? prev : c));
        }}
        onPointerOut={() => setHover(null)}
      >
        <sphereGeometry args={[RADIUS, 128, 48, 0, Math.PI * 2, thetaStart, halfSpan * 2]} />
        <meshStandardMaterial map={tex} metalness={0.1} roughness={0.55} />
      </mesh>

      {/* Polar caps (not playable) */}
      <mesh raycast={noRaycast}>
        <sphereGeometry args={[RADIUS * 0.999, 64, 16, 0, Math.PI * 2, 0, thetaStart]} />
        <meshStandardMaterial color="#14100b" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh raycast={noRaycast}>
        <sphereGeometry args={[RADIUS * 0.999, 64, 16, 0, Math.PI * 2, Math.PI / 2 + halfSpan, thetaStart]} />
        <meshStandardMaterial color="#14100b" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Gold rails at the band edges — the physical product's frame */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * Math.sin(halfSpan) * RADIUS, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
          <torusGeometry args={[Math.cos(halfSpan) * RADIUS, 0.012, 12, 128]} />
          <meshStandardMaterial color="#f0c040" metalness={0.9} roughness={0.2} emissive="#8a6f1a" emissiveIntensity={0.25} />
        </mesh>
      ))}

      {hover && !(selected && hover.col === selected.col && hover.row === selected.row) && (
        <CellPatch cell={hover} cols={cols} rows={rows} color="#ffffff" opacity={0.14} />
      )}
      {selected && <CellPatch cell={selected} cols={cols} rows={rows} color="#f0c040" opacity={0.5} />}
      {legalDests.map((d) => (
        <CellPatch
          key={`lp-${d.col}-${d.row}`}
          cell={d}
          cols={cols}
          rows={rows}
          color={d.capture ? "#ff5b7a" : "#f0c040"}
          opacity={0.22}
        />
      ))}
      {legalDests.map((d) => (
        <LegalDot
          key={`ld-${d.col}-${d.row}`}
          cell={d}
          cols={cols}
          rows={rows}
          capture={!!d.capture || occupied.has(`${d.col},${d.row}`)}
        />
      ))}

      {pieces.map((p) => (
        <PieceOnSphere
          key={`${p.col}-${p.row}`}
          piece={p}
          cols={cols}
          rows={rows}
          selected={!!selected && selected.col === p.col && selected.row === p.row}
          onTap={() => {
            // A tap on a piece standing on a legal destination is a move
            // onto that square — same handler as tapping the square.
            onCellClick?.({ col: p.col, row: p.row });
          }}
        />
      ))}
    </group>
  );
}

/* --------------------------- Camera rig ---------------------------- */

// Home view: slightly below the equator, looking at the viewer's own
// rows. Distance is derived from the canvas shape so the whole sphere
// fits — on a tall phone screen the width is the tight dimension.
const HOME_DIR = new THREE.Vector3(0, -0.55, 2.9).normalize();
const FOV = 40;

function homeDistance(aspect: number): number {
  const t = Math.tan((FOV / 2) * DEG);
  const fitHeight = 1.12 / t;
  const fitWidth = 1.04 / (t * aspect);
  return Math.max(fitHeight, fitWidth);
}

function CameraRig({ recenterTick }: { recenterTick: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const animating = useRef(false);
  const dist = homeDistance(size.width / Math.max(1, size.height));
  const home = useMemo(() => HOME_DIR.clone().multiplyScalar(dist), [dist]);

  // Snap to the home view on first layout and whenever the canvas is
  // resized (rotation, window resize) — never mid-gesture otherwise.
  useEffect(() => {
    camera.position.copy(home);
    camera.lookAt(0, 0, 0);
    controls.current?.update();
  }, [camera, home]);

  const { invalidate } = useThree();
  useEffect(() => {
    if (recenterTick > 0) {
      animating.current = true;
      invalidate();
    }
  }, [recenterTick, invalidate]);

  useFrame(() => {
    if (!animating.current) return;
    camera.position.lerp(home, 0.12);
    controls.current?.target.lerp(new THREE.Vector3(0, 0, 0), 0.12);
    controls.current?.update();
    if (camera.position.distanceTo(home) < 0.01) animating.current = false;
    else invalidate();
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableZoom
      enableDamping
      dampingFactor={0.12}
      rotateSpeed={0.8}
      zoomSpeed={0.8}
      minDistance={1.7}
      maxDistance={dist * 1.25}
      // Keep the band in view: no flipping over the poles.
      minPolarAngle={Math.PI * 0.18}
      maxPolarAngle={Math.PI * 0.82}
      onStart={() => { animating.current = false; }}
    />
  );
}

/* -------------------------- Public API ----------------------------- */

export default function SphereBoardView(props: SphereBoardViewProps) {
  const {
    selected = null,
    legalDests = [],
    onCellClick,
    flipped = false,
    darkSquare = "#1b1611",
    lightSquare = "#efe7d4",
    seam = "#f0c040",
  } = props;
  const [recenterTick, setRecenterTick] = useState(0);

  return (
    <div
      className="sok-board-area sok-sphere"
      style={{
        position: "relative",
        width: "100%",
        // Fill the screen height on phones (game screen), capped on desktop.
        height: "clamp(320px, calc(100dvh - 300px), 640px)",
        background:
          "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(240, 192, 64, 0.10), transparent 70%), linear-gradient(180deg, #15110c 0%, #0a0806 100%)",
        borderRadius: 16,
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <Canvas

        camera={{ position: HOME_DIR.clone().multiplyScalar(3).toArray(), fov: FOV }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        // Draw only when something changes (drag, zoom, tap, animation)
        // — a static board costs no GPU time or battery.
        frameloop="demand"
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[1.5, 1.5, 3]}
          intensity={1.4}
         
        />
        <directionalLight position={[-2, -1, -2]} intensity={0.35} />
        <Scene
          cols={props.cols}
          rows={props.rows}
          pieces={props.pieces}
          selected={selected}
          legalDests={legalDests}
          onCellClick={onCellClick}
          flipped={flipped}
          darkSquare={darkSquare}
          lightSquare={lightSquare}
          seam={seam}
        />
        <CameraRig recenterTick={recenterTick} />
      </Canvas>
      <button
        type="button"
        onClick={() => setRecenterTick((n) => n + 1)}
        aria-label="Re-centre the board on your side"
        style={{
          position: "absolute",
          right: 10,
          bottom: 10,
          padding: "8px 12px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(10, 8, 6, 0.7)",
          color: "#e8dfcc",
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          backdropFilter: "blur(6px)",
        }}
      >
        Re-centre
      </button>
    </div>
  );
}
