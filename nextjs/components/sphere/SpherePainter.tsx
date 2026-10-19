"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { DESIGN_COLS, DESIGN_ROWS } from "@/lib/sphere-grid";

export interface SpherePainterProps {
  grid: string[][];
  onGridChange: (grid: string[][]) => void;
  title: string;
  onTitleChange: (t: string) => void;
  designId?: string;
  onSaved?: (designId: string) => void;
}

const PALETTE = [
  "#c9a227", "#f0c040", "#c62b44", "#4c7ce0", "#4fb07d", "#9b7cff",
  "#f5efd8", "#1a1510", "#2b2210", "#8a1420", "#b8901e", "",
];

export default function SpherePainter({
  grid, onGridChange, title, onTitleChange, designId, onSaved,
}: SpherePainterProps) {
  const [brush, setBrush] = useState<string>(PALETTE[0]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sq = canvas.width / DESIGN_COLS;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    for (let r = 0; r < DESIGN_ROWS; r++) {
      for (let c = 0; c < DESIGN_COLS; c++) {
        const colour = grid[r][c] || ((c + r) % 2 === 0 ? "#f3e1a7" : "#2b2210");
        ctx.fillStyle = colour;
        ctx.fillRect(c * sq, (DESIGN_ROWS - 1 - r) * sq, sq, sq);
      }
    }
    ctx.strokeStyle = "#f0c040";
    ctx.setLineDash([4, 4]); ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, canvas.height);
    ctx.moveTo(canvas.width, 0); ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke(); ctx.setLineDash([]);
  }, [grid]);

  const paintAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sq = rect.width / DESIGN_COLS;
    const col = Math.floor((clientX - rect.left) / sq);
    const rowFromTop = Math.floor((clientY - rect.top) / sq);
    const row = DESIGN_ROWS - 1 - rowFromTop;
    if (col < 0 || col >= DESIGN_COLS || row < 0 || row >= DESIGN_ROWS) return;
    if (grid[row][col] === brush) return;
    const next = grid.map((r) => r.slice());
    next[row][col] = brush;
    onGridChange(next);
  }, [brush, grid, onGridChange]);

  const save = useCallback(async () => {
    setSaving(true); setError(null); setSavedMsg(null);
    try {
      const preview = canvasRef.current?.toDataURL("image/png");
      const payload = { title, grid, previewDataUrl: preview };
      const url = designId ? `/api/sphere-designs/${designId}` : "/api/sphere-designs";
      const method = designId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed."); return; }
      setSavedMsg("Saved.");
      onSaved?.(data.design.id);
    } catch {
      setError("Network error.");
    } finally { setSaving(false); }
  }, [title, grid, designId, onSaved]);

  const clearAll = () => {
    if (!confirm("Clear the whole design?")) return;
    onGridChange(Array.from({ length: DESIGN_ROWS }, () => Array<string>(DESIGN_COLS).fill("")));
  };

  return (
    <Wrap>
      <TopRow>
        <TitleInput value={title} onChange={(e) => onTitleChange(e.target.value)} maxLength={80} />
        <Buttons>
          <Secondary onClick={clearAll}>Clear</Secondary>
          <Primary onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Primary>
        </Buttons>
      </TopRow>

      <Palette>
        {PALETTE.map((c, i) => (
          <Swatch key={i} $color={c} $active={brush === c} onClick={() => setBrush(c)}
                  aria-label={c || "Clear brush"}>
            {!c && <span style={{ fontSize: 11 }}>×</span>}
          </Swatch>
        ))}
      </Palette>

      <CanvasWrap>
        <canvas ref={canvasRef} width={14 * 40} height={8 * 40}
                onMouseDown={(e) => { dragging.current = true; paintAt(e.clientX, e.clientY); }}
                onMouseUp={() => { dragging.current = false; }}
                onMouseLeave={() => { dragging.current = false; }}
                onMouseMove={(e) => { if (dragging.current) paintAt(e.clientX, e.clientY); }}
                onTouchStart={(e) => { const t = e.touches[0]; paintAt(t.clientX, t.clientY); }}
                onTouchMove={(e) => { const t = e.touches[0]; paintAt(t.clientX, t.clientY); }}
                style={{ touchAction: "none" }} />
      </CanvasWrap>

      {error && <Err>{error}</Err>}
      {savedMsg && <Ok>{savedMsg}</Ok>}
      <Hint>Columns wrap at the seam — pixels on column 14 sit next to column 1 on the physical sphere.</Hint>
    </Wrap>
  );
}

const Wrap = styled.div`display:flex;flex-direction:column;gap:12px;`;
const TopRow = styled.div`display:flex;gap:10px;align-items:center;flex-wrap:wrap;`;
const TitleInput = styled.input`
  flex:1;min-width:200px;
  background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
  border:1px solid var(--border,#2a2218);border-radius:6px;padding:8px 10px;font-size:15px;
`;
const Buttons = styled.div`display:flex;gap:8px;`;
const Primary = styled.button`
  background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:8px 14px;font-size:14px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);} &:disabled{opacity:.6;}
`;
const Secondary = styled.button`
  background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
  border:1px solid var(--border,#2a2218);border-radius:6px;padding:8px 14px;font-size:14px;cursor:pointer;
`;
const Palette = styled.div`display:flex;flex-wrap:wrap;gap:6px;`;
const Swatch = styled.button<{ $color: string; $active: boolean }>`
  width:28px;height:28px;border-radius:6px;cursor:pointer;
  background:${(p)=>p.$color || "transparent"};
  border:2px solid ${(p)=>p.$active?"var(--gold-light,#f0c040)":"var(--border,#2a2218)"};
  color:var(--text-muted,#a89880);
  display:flex;align-items:center;justify-content:center;
`;
const CanvasWrap = styled.div`
  background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);border-radius:8px;
  padding:8px;overflow:auto;
  canvas{display:block;max-width:100%;height:auto;image-rendering:pixelated;cursor:crosshair;}
`;
const Err = styled.div`color:var(--status-urgent,#ff6b7a);font-size:13px;`;
const Ok = styled.div`color:var(--status-online,#4fb07d);font-size:13px;`;
const Hint = styled.p`color:var(--text-muted,#a89880);font-size:12px;margin:0;`;
