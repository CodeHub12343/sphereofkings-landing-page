"use client";

// Playable 3D sphere board. Pieces and squares are tappable; selected
// piece lifts off the surface with a gold ring; legal destinations are
// highlighted as gold or red rings on the sphere. Drag-anywhere-empty
// rotates; single taps are passed through to the game click handler.
//
// Three.js + @react-three/fiber are already direct deps so no new
// bundle cost beyond the dynamic-import boundary from BoardViewToggle.

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

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
  darkSquare?: string;
  lightSquare?: string;
  seam?: string;
};

/* ------------------- Board texture (checker + seam) --------------- */

function useBoardTexture(
  cols: number,
  rows: number,
  darkSquare: string,
  lightSquare: string,
  seam: string,
) {
  return useMemo(() => {
    const sq = 64;
    const canvas = document.createElement("canvas");
    canvas.width = cols * sq;
    canvas.height = rows * sq;
    const ctx = canvas.getContext("2d")!;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dark = (c + r) % 2 !== 0;
        ctx.fillStyle = dark ? darkSquare : lightSquare;
        ctx.fillRect(c * sq, r * sq, sq, sq);
      }
    }
    // Gold frame band along the top and bottom edges — matches the
    // physical product's gold trim around the playable area.
    ctx.fillStyle = seam;
    ctx.fillRect(0, 0, canvas.width, 4);
    ctx.fillRect(0, canvas.height - 4, canvas.width, 4);
    // Thin gold meridian at the horizontal wrap seam.
    ctx.fillRect(0, 0, 2, canvas.height);
    ctx.fillRect(canvas.width - 2, 0, 2, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }, [cols, rows, darkSquare, lightSquare, seam]);
}

/* ------------------------ Position math ---------------------------- */

const LAT_SPAN_DEG = 110;

function boardToSphere(
  col: number,
  row: number,
  cols: number,
  rows: number,
  radius: number,
): THREE.Vector3 {
  const lonDeg = (col - 0.5) * (360 / cols) - 180;
  const latDeg = -LAT_SPAN_DEG / 2 + ((row - 0.5) / rows) * LAT_SPAN_DEG;
  const lon = (lonDeg * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.sin(lon),
  );
}

/* --------------------------- Pieces -------------------------------- */

function PieceOnSphere({
  piece,
  cols,
  rows,
  radius,
  selected,
  onClick,
}: {
  piece: SpherePiece;
  cols: number;
  rows: number;
  radius: number;
  selected: boolean;
  onClick?: () => void;
}) {
  const basePos = boardToSphere(piece.col, piece.row, cols, rows, radius + 0.012);
  // Lift the selected piece off the sphere so it reads as "picked up".
  const liftFactor = selected ? 0.07 : 0;
  const pos = basePos.clone().addScaledVector(basePos.clone().normalize(), liftFactor);
  const normal = pos.clone().normalize();
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [normal.x, normal.y, normal.z]);

  const color =
    piece.color === "red"
      ? "#d8324c"
      : piece.color === "white"
        ? "#f0e6c6"
        : "#1a1510";

  const isChess = piece.kind && piece.kind !== "checker";
  const r = isChess ? 0.038 : 0.048;

  // Chess piece height varies by kind so king/queen tower above pawns.
  const chessHeight: Record<string, number> = {
    king: 0.14, queen: 0.13, rook: 0.10, bishop: 0.11, knight: 0.10, pawn: 0.075,
  };
  const height = isChess
    ? chessHeight[piece.kind ?? "pawn"] ?? 0.1
    : 0.035;

  const metal = piece.color === "white" ? 0.3 : 0.5;

  return (
    <group
      position={pos.toArray()}
      quaternion={quat.toArray()}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Gold base disc — the magnetic foot on the physical piece */}
      <mesh position={[0, 0.006, 0]} castShadow>
        <cylinderGeometry args={[r * 1.15, r * 1.2, 0.012, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.2} />
      </mesh>

      {isChess ? (
        /* Chess: segmented silhouette — thick base, narrow neck,
           kind-specific crown. Lathing an SVG profile would be prettier
           but this reads surprisingly well at the current camera distance. */
        <group position={[0, 0.013, 0]}>
          {/* Base / foot */}
          <mesh castShadow>
            <cylinderGeometry args={[r * 0.95, r, 0.018, 24]} />
            <meshStandardMaterial color={color} metalness={metal} roughness={0.35} />
          </mesh>
          {/* Neck */}
          <mesh position={[0, 0.015 + (height - 0.06) / 2, 0]} castShadow>
            <cylinderGeometry args={[r * 0.5, r * 0.75, height - 0.055, 24]} />
            <meshStandardMaterial color={color} metalness={metal} roughness={0.35} />
          </mesh>
          {/* Top / crown — kind-specific */}
          <mesh position={[0, height - 0.012, 0]} castShadow>
            {piece.kind === "king" && (
              <coneGeometry args={[r * 0.65, 0.03, 4]} />
            )}
            {piece.kind === "queen" && (
              <sphereGeometry args={[r * 0.55, 20, 14]} />
            )}
            {piece.kind === "rook" && (
              <boxGeometry args={[r * 1.15, 0.028, r * 1.15]} />
            )}
            {piece.kind === "bishop" && (
              <coneGeometry args={[r * 0.55, 0.04, 20]} />
            )}
            {piece.kind === "knight" && (
              <boxGeometry args={[r * 0.6, 0.028, r * 1.0]} />
            )}
            {piece.kind === "pawn" && (
              <sphereGeometry args={[r * 0.6, 16, 12]} />
            )}
            <meshStandardMaterial color={color} metalness={metal} roughness={0.35} />
          </mesh>
          {/* King gets a tiny gold cross on top */}
          {piece.kind === "king" && (
            <group position={[0, height + 0.004, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.008, 0.028, 0.008]} />
                <meshStandardMaterial color="#f0c040" metalness={0.95} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.004, 0]} castShadow>
                <boxGeometry args={[0.02, 0.008, 0.008]} />
                <meshStandardMaterial color="#f0c040" metalness={0.95} roughness={0.2} />
              </mesh>
            </group>
          )}
        </group>
      ) : (
        /* Checker puck — beveled disc with top chamfer. */
        <>
          <mesh position={[0, height / 2 + 0.014, 0]} castShadow>
            <cylinderGeometry args={[r * 0.96, r, height, 32]} />
            <meshStandardMaterial color={color} metalness={metal} roughness={0.3} />
          </mesh>
          {/* Top chamfer ring for a bevel highlight */}
          <mesh position={[0, height + 0.014, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r * 0.92, 0.005, 8, 32]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Kinged checker gets a tiny gold crown pip */}
          {piece.kind === "checker" && selected === false && null}
        </>
      )}

      {/* Selection highlight — gold torus around the base */}
      {selected && (
        <mesh position={[0, 0.014, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * 1.4, r * 0.1, 12, 48]} />
          <meshStandardMaterial
            color="#f0c040"
            metalness={0.95}
            roughness={0.15}
            emissive="#f0c040"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

/* -------------------- Legal-destination rings ---------------------- */

function LegalRing({
  cell,
  cols,
  rows,
  radius,
  capture,
  onClick,
}: {
  cell: SphereCell;
  cols: number;
  rows: number;
  radius: number;
  capture: boolean;
  onClick?: () => void;
}) {
  const pos = boardToSphere(cell.col, cell.row, cols, rows, radius + 0.013);
  const normal = pos.clone().normalize();
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [normal.x, normal.y, normal.z]);
  const colour = capture ? "#ff5b7a" : "#f0c040";
  // Small pulse animation to draw the eye.
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const s = 0.9 + 0.2 * Math.sin(t * 3.2);
      meshRef.current.scale.set(s, 1, s);
    }
  });
  return (
    <group
      position={pos.toArray()}
      quaternion={quat.toArray()}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Visible ring */}
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <torusGeometry args={[0.045, 0.008, 10, 32]} />
        <meshStandardMaterial
          color={colour}
          metalness={0.8}
          roughness={0.2}
          emissive={colour}
          emissiveIntensity={0.9}
        />
      </mesh>
      {/* Invisible generous hit target */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.04, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* --------------- Transparent per-cell tap target ------------------- */

function CellHitTargets({
  cols,
  rows,
  radius,
  onCellClick,
}: {
  cols: number;
  rows: number;
  radius: number;
  onCellClick?: (cell: SphereCell) => void;
}) {
  const cells = useMemo(() => {
    const out: SphereCell[] = [];
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) out.push({ col: c, row: r });
    }
    return out;
  }, [cols, rows]);

  return (
    <group>
      {cells.map((cell) => {
        const pos = boardToSphere(cell.col, cell.row, cols, rows, radius + 0.005);
        const normal = pos.clone().normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          normal,
        );
        return (
          <mesh
            key={`hit-${cell.col}-${cell.row}`}
            position={pos.toArray()}
            quaternion={quat.toArray()}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              onCellClick?.(cell);
            }}
          >
            <cylinderGeometry args={[0.055, 0.055, 0.03, 12]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

/* --------------------- Scene (manual rotation) --------------------- */

function Scene({
  cols,
  rows,
  pieces,
  selected,
  legalDests,
  onCellClick,
  darkSquare,
  lightSquare,
  seam,
  autoRotate,
}: Required<Omit<SphereBoardViewProps, "selected" | "legalDests" | "onCellClick">> & {
  selected: SphereCell | null;
  legalDests: LegalDest[];
  onCellClick?: (cell: SphereCell) => void;
  autoRotate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const tex = useBoardTexture(cols, rows, darkSquare, lightSquare, seam);
  const radius = 1;

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const legalDestKey = (cell: SphereCell) => `${cell.col},${cell.row}`;
  const legalMap = useMemo(() => {
    const m = new Map<string, LegalDest>();
    for (const d of legalDests) m.set(legalDestKey(d), d);
    return m;
  }, [legalDests]);

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 96, 64]} />
        <meshStandardMaterial map={tex} metalness={0.15} roughness={0.5} />
      </mesh>
      {/* Gold equator band — matches the physical product's frame rail */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.005, radius * 0.018, 16, 128]} />
        <meshStandardMaterial
          color="#f0c040"
          metalness={0.95}
          roughness={0.18}
          emissive="#8a6f1a"
          emissiveIntensity={0.3}
        />
      </mesh>
      <CellHitTargets cols={cols} rows={rows} radius={radius} onCellClick={onCellClick} />
      {pieces.map((p, i) => (
        <PieceOnSphere
          key={`${p.col}-${p.row}-${i}`}
          piece={p}
          cols={cols}
          rows={rows}
          radius={radius}
          selected={Boolean(selected && selected.col === p.col && selected.row === p.row)}
          onClick={() => onCellClick?.({ col: p.col, row: p.row })}
        />
      ))}
      {legalDests.map((d, i) => (
        <LegalRing
          key={`lr-${d.col}-${d.row}-${i}`}
          cell={d}
          cols={cols}
          rows={rows}
          radius={radius}
          capture={Boolean(d.capture)}
          onClick={() => onCellClick?.({ col: d.col, row: d.row })}
        />
      ))}
    </group>
  );
}

/* -------------------------- Public API ----------------------------- */

export default function SphereBoardView(props: SphereBoardViewProps) {
  const {
    selected = null,
    legalDests = [],
    onCellClick,
    darkSquare = "#171310",
    lightSquare = "#f1ecde",
    seam = "#f0c040",
  } = props;

  const [autoRotate, setAutoRotate] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 3",
        maxHeight: 560,
        background:
          "radial-gradient(ellipse 70% 55% at 50% 55%, rgba(240, 192, 64, 0.1), transparent 70%), linear-gradient(180deg, #15110c 0%, #0a0806 100%)",
        borderRadius: 12,
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0.6, 2.8], fov: 42 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[2.5, 3, 2]}
          intensity={1.3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-2, -1, -1]} intensity={0.4} />
        <Scene
          cols={props.cols}
          rows={props.rows}
          pieces={props.pieces}
          selected={selected}
          legalDests={legalDests}
          onCellClick={onCellClick}
          darkSquare={darkSquare}
          lightSquare={lightSquare}
          seam={seam}
          autoRotate={autoRotate}
        />
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={2}
          maxDistance={5}
          autoRotate={false}
          rotateSpeed={0.9}
        />
      </Canvas>
      <AutoRotateBtn
        type="button"
        aria-pressed={autoRotate}
        onClick={() => setAutoRotate((v) => !v)}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: "6px 10px",
          borderRadius: 8,
          border: `1px solid ${autoRotate ? "#f0c040" : "#2e2618"}`,
          background: autoRotate ? "rgba(240, 192, 64, 0.15)" : "rgba(10, 8, 6, 0.75)",
          color: autoRotate ? "#f0c040" : "#a89880",
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          backdropFilter: "blur(4px)",
        }}
      >
        {autoRotate ? "⏸  Auto-rotate" : "▶  Auto-rotate"}
      </AutoRotateBtn>
    </div>
  );
}

const AutoRotateBtn = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} />
);
