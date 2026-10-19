"use client";

import { useState } from "react";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import SpherePainter from "@/components/sphere/SpherePainter";
import { DESIGN_COLS, DESIGN_ROWS } from "@/lib/sphere-grid";

const Sphere3D = nextDynamic(() => import("@/components/sphere/Sphere3D"), { ssr: false });

function emptyGrid(): string[][] {
  return Array.from({ length: DESIGN_ROWS }, () => Array<string>(DESIGN_COLS).fill(""));
}

export default function PaintStudio({
  initialGrid, initialTitle, designId,
}: {
  initialGrid?: string[][]; initialTitle?: string; designId?: string;
}) {
  const [grid, setGrid] = useState<string[][]>(() => initialGrid ?? emptyGrid());
  const [title, setTitle] = useState<string>(initialTitle ?? "Untitled");
  const [savedId, setSavedId] = useState<string | null>(designId ?? null);

  return (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))" }}>
      <section>
        <SpherePainter
          grid={grid}
          onGridChange={setGrid}
          title={title}
          onTitleChange={setTitle}
          designId={savedId ?? undefined}
          onSaved={setSavedId}
        />
      </section>
      <section>
        <h2 style={{ color: "var(--gold-light,#f0c040)", fontSize: 15, margin: "0 0 10px" }}>3D preview</h2>
        <Sphere3D grid={grid} />
        {savedId && (
          <p style={{ color: "var(--text-muted,#a89880)", marginTop: 10, fontSize: 14 }}>
            Saved. <Link href={`/sphere/order/${savedId}`} style={{ color: "var(--gold-light,#f0c040)" }}>
              Order a custom physical sphere →
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
