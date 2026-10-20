import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import { listConversations } from "@/lib/db/collections/safety-io";
import FeaturePage from "@/components/feature/FeaturePage";
import { FBanner } from "@/components/feature/primitives";

export const metadata: Metadata = { title: "Inbox · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/me/inbox");
  const conversations = await listConversations(me.id);

  return (
    <FeaturePage
      eyebrow="Private messages"
      title="Inbox"
      subtitle="Direct conversations with other players."
    >
      {me.isMinor && me.consentStatus !== "parental-granted" && (
        <FBanner $tone="info" style={{ marginBottom: 24 }}>
          Messaging is paused on your account until a parent completes consent.{" "}
          <Link href="/me/consent" style={{ color: "var(--gold-light,#f0c040)" }}>Request consent</Link>.
        </FBanner>
      )}
      {conversations.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No conversations yet.</p>
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
                  padding: "14px 16px", background: "var(--bg2,#0d0b08)",
                  border: "1px solid var(--border,#2a2218)", borderRadius: 8,
                  color: "var(--text,#f5f0e8)", textDecoration: "none",
                }}>
                  <span>
                    <strong style={{ fontFamily: "'Cinzel',serif",
                                      color: "var(--gold-light,#f0c040)" }}>{otherName}</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: 12, marginLeft: 8 }}>
                      @{otherUser}
                    </span>
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {new Date(c.lastMessageAt).toLocaleString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </FeaturePage>
  );
}
