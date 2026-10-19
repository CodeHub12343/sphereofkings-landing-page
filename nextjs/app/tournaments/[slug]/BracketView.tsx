import Link from "next/link";
import type { Bracket } from "@/lib/tournaments/bracket";

export default function BracketView({ bracket }: { bracket: Bracket }) {
  return (
    <div style={{
      display: "flex", gap: 20, overflowX: "auto", padding: "16px 0",
    }}>
      {bracket.rounds.map((round, ri) => (
        <div key={ri} style={{ display: "flex", flexDirection: "column",
                                gap: Math.pow(2, ri) * 12, minWidth: 220 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted,#a89880)",
                        textTransform: "uppercase", letterSpacing: ".1em" }}>
            {ri === bracket.rounds.length - 1 ? "Final" :
             ri === bracket.rounds.length - 2 ? "Semi-final" :
             ri === bracket.rounds.length - 3 ? "Quarter-final" :
             `Round ${ri + 1}`}
          </div>
          {round.map((node) => (
            <div key={node.idxInRound} style={{
              background: "var(--bg2,#0d0b08)",
              border: "1px solid var(--border,#2a2218)",
              borderRadius: 6,
              padding: 8,
              fontSize: 13,
            }}>
              <SlotRow slot={node.a} winner={node.winner === "a"} />
              <div style={{ height: 1, background: "var(--border,#2a2218)", margin: "6px 0" }} />
              <SlotRow slot={node.b} winner={node.winner === "b"} />
              {node.matchId && !node.winner && (
                <Link href={`/match/${node.matchId}`} style={{
                  fontSize: 11, color: "var(--gold,#c9a227)", textDecoration: "none",
                  display: "block", marginTop: 4, textAlign: "right",
                }}>Open match →</Link>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SlotRow({ slot, winner }: { slot: { seed: number; playerId: string | null; username: string; displayName: string } | null; winner: boolean }) {
  if (!slot) return <div style={{ color: "var(--text-muted,#a89880)" }}>—</div>;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      color: winner ? "var(--gold-light,#f0c040)" : "var(--text,#f5f0e8)",
      fontWeight: winner ? 700 : 400,
    }}>
      <span style={{ display: "flex", gap: 6 }}>
        <span style={{ color: "var(--text-muted,#a89880)", fontSize: 11 }}>#{slot.seed}</span>
        {slot.username ? (
          <Link href={`/u/${slot.username}`} style={{ color: "inherit", textDecoration: "none" }}>
            {slot.displayName}
          </Link>
        ) : slot.displayName}
      </span>
      {winner && <span style={{ fontSize: 11 }}>✓</span>}
    </div>
  );
}
