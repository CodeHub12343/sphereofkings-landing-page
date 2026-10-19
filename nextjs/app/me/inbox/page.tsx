import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import { listConversations } from "@/lib/db/collections/safety-io";

export const metadata: Metadata = { title: "Inbox · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/me/inbox");
  const conversations = await listConversations(me.id);

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 20px", color: "var(--text,#f5f0e8)", fontSize: 26 }}>Inbox</h1>
      {me.isMinor && me.consentStatus !== "parental-granted" && (
        <div style={{
          padding: 14, marginBottom: 20,
          background: "rgba(76,124,224,.08)",
          border: "1px solid var(--minor-badge,#4c7ce0)",
          borderRadius: 8, color: "var(--text,#f5f0e8)", fontSize: 14,
        }}>
          Messaging is paused on your account until a parent completes consent.{" "}
          <Link href="/me/consent" style={{ color: "var(--gold-light,#f0c040)" }}>Request consent</Link>.
        </div>
      )}
      {conversations.length === 0 ? (
        <p style={{ color: "var(--text-muted,#a89880)" }}>No conversations yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {conversations.map((c) => {
            const otherIdx = c.participantIds.findIndex((p) => p !== me.id);
            const otherName = c.participantDisplayNames[otherIdx];
            const otherUser = c.participantUsernames[otherIdx];
            return (
              <li key={c.id}>
                <Link href={`/me/inbox/${c.id}`} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", background: "var(--bg2,#0d0b08)",
                  border: "1px solid var(--border,#2a2218)", borderRadius: 8,
                  color: "var(--text,#f5f0e8)", textDecoration: "none",
                }}>
                  <span>
                    <strong>{otherName}</strong>
                    <span style={{ color: "var(--text-muted,#a89880)", fontSize: 12, marginLeft: 8 }}>
                      @{otherUser}
                    </span>
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>
                    {new Date(c.lastMessageAt).toLocaleString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
