"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { startNewRoundAction, sealRoundAction, drawRoundAction } from "./actions";

export default function SweepstakesControls({ pending, enabled }: { pending: number; enabled: boolean }) {
  const [prize, setPrize] = useState("Royal Checkers – Two-Color Board & Checkers Set");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const call = async (fn: () => Promise<{ ok?: boolean; error?: string; message?: string }>) => {
    setBusy(true); setMsg(null);
    try {
      const r = await fn();
      setMsg(r.error ?? r.message ?? "Done.");
      startTransition(() => router.refresh());
    } finally { setBusy(false); }
  };

  return (
    <section style={{
      padding: 16, background: "var(--bg2,#0d0b08)",
      border: "1px solid var(--border,#2a2218)", borderRadius: 10,
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <Row>
        <label style={{ flex: 1, color: "var(--text-muted)", fontSize: 13 }}>
          Prize for next round:
          <input value={prize} onChange={(e) => setPrize(e.target.value)}
            style={{ width: "100%", marginTop: 4,
                     background: "var(--bg3,#111009)", color: "var(--text,#f5f0e8)",
                     border: "1px solid var(--border,#2a2218)", borderRadius: 5,
                     padding: "6px 8px", fontSize: 13 }} />
        </label>
      </Row>
      <Row>
        <Btn onClick={() => call(() => startNewRoundAction(prize))} disabled={busy}>
          Start new round (threshold 100 · 50 qualifiers)
        </Btn>
        <Btn onClick={() => call(() => sealRoundAction())} disabled={busy || pending < 100}>
          Seal & qualify (need ≥ 100 verified)
        </Btn>
        <Btn onClick={() => call(() => drawRoundAction())} disabled={busy}>
          Draw winner
        </Btn>
      </Row>
      {msg && <Note>{msg}</Note>}
      {!enabled && (
        <Note style={{ color: "var(--status-waiting,#e0a94a)" }}>
          Public entry is DARK. Admin tools above still work for testing.
        </Note>
      )}
    </section>
  );
}

const Row = styled.div`display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;`;
const Btn = styled.button`
  font-family:'Cinzel',serif;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;
  background:var(--bg3,#111009);color:var(--text,#f5f0e8);
  border:1px solid var(--gold,#c9a227);border-radius:5px;padding:9px 14px;cursor:pointer;
  &:hover:not(:disabled){background:rgba(201,162,39,.08);color:var(--gold-light,#f0c040);}
  &:disabled{opacity:.4;cursor:not-allowed;}
`;
const Note = styled.div`font-size:13px;color:var(--text-muted);`;
