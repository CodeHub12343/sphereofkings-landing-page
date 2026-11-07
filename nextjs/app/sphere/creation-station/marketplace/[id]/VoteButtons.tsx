"use client";

import { useState } from "react";

export default function VoteButtons({ id, initial }: { id: string; initial: number }) {
  const [votes, setVotes] = useState(initial);
  const [busy, setBusy] = useState(false);

  const vote = async (delta: number) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/creation-station/designs/${id}/vote`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      if (res.ok) setVotes((v) => v + delta);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button onClick={() => vote(1)} disabled={busy}
              style={{ background: "transparent", color: "var(--gold-light,#f0c040)",
                       border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                       padding: "6px 12px", cursor: "pointer", fontSize: 14 }}>
        ♥ Upvote
      </button>
      <span style={{ color: "var(--text,#f5f0e8)", fontSize: 14 }}>{votes}</span>
      <button onClick={() => vote(-1)} disabled={busy}
              style={{ background: "transparent", color: "var(--text-muted,#a89880)",
                       border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                       padding: "6px 12px", cursor: "pointer", fontSize: 14 }}>
        Down
      </button>
    </div>
  );
}
