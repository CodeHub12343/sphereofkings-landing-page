import Link from "next/link";
import FeaturePage from "@/components/feature/FeaturePage";
import { ALL_TIERS } from "@/lib/creator-kingdom/tiers";
import { REWARD_CATALOG } from "@/lib/db/collections/creator-credits";
import { ensureCreatorIndexes, listLeaderboard } from "@/lib/db/collections/creators";

export const metadata = {
  title: "Creator Kingdom · Sphere of Kings",
  description:
    "Earn free Sphere of Kings games by promoting them. Apply, complete content assignments scaled to your audience, and redeem Creator Credits for products.",
};
export const dynamic = "force-dynamic";

export default async function InfluencersHome() {
  await ensureCreatorIndexes();
  const top = await listLeaderboard(5);
  return (
    <FeaturePage
      eyebrow="Creator Kingdom"
      title="Earn Sphere of Kings by creating"
      subtitle="Join the influencer program. Complete content assignments scaled to your audience, earn Creator Credits, and redeem them for real Sphere of Kings products shipped to your door."
    >
      <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", marginBottom: 32 }}>
        {[
          ["1. Apply", "Register, connect your socials, accept the Creator Agreement."],
          ["2. Create", "Make original videos and publish across approved platforms."],
          ["3. Verify", "Submit your post links — our team verifies against the assignment."],
          ["4. Redeem", "Earn 500 Creator Credits per completed assignment. Spend them in the rewards store."],
        ].map(([title, body]) => (
          <div key={title} style={{
            background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
            borderRadius: 10, padding: 16,
          }}>
            <strong style={{ color: "var(--gold-light,#f0c040)", display: "block", marginBottom: 6 }}>{title}</strong>
            <span style={{ color: "var(--text-muted,#a89880)", fontSize: 13 }}>{body}</span>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "var(--gold-light,#f0c040)", fontSize: 18 }}>Follower tiers</h2>
        <p style={{ color: "var(--text-muted,#a89880)", fontSize: 13 }}>
          Bigger audiences do less work for the same 500-credit reward. Requirements are frozen at acceptance so fluctuations don’t change the deal.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", color: "var(--text,#f5f0e8)" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted,#a89880)" }}>
                <th style={{ padding: "6px 8px" }}>Followers from</th>
                <th>Original videos</th>
                <th>Total posts</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {ALL_TIERS.map((t) => (
                <tr key={t.followerTierMin} style={{ borderTop: "1px solid var(--border,#2a2218)" }}>
                  <td style={{ padding: "6px 8px" }}>{t.followerTierMin.toLocaleString()}+</td>
                  <td>{t.originalVideosRequired}</td>
                  <td>{t.totalPostsRequired}</td>
                  <td>{t.creditsOnCompletion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "var(--gold-light,#f0c040)", fontSize: 18 }}>Rewards store</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid",
                     gap: 10, gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
          {REWARD_CATALOG.map((r) => (
            <li key={r.sku} style={{
              background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
              borderRadius: 10, padding: 12,
            }}>
              <strong style={{ color: "var(--gold-light,#f0c040)", display: "block" }}>{r.label}</strong>
              <div style={{ color: "var(--text-muted,#a89880)", fontSize: 12, marginTop: 4 }}>
                {r.credits} credits · {r.inventory} in stock
              </div>
            </li>
          ))}
        </ul>
      </section>

      {top.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: "var(--gold-light,#f0c040)", fontSize: 18 }}>Top creators</h2>
          <ol style={{ color: "var(--text,#f5f0e8)", fontSize: 14 }}>
            {top.map((c) => (
              <li key={c.id}>
                {c.playerUsername} — {c.lifetimePostsApproved} posts, {c.lifetimeProductsEarned} products ({c.tier})
              </li>
            ))}
          </ol>
        </section>
      )}

      <section style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/influencers/apply" style={{
          background: "var(--gold,#c9a227)", color: "#000", padding: "12px 20px",
          borderRadius: 6, fontWeight: 600, textDecoration: "none",
        }}>Apply to join</Link>
        <Link href="/influencers/dashboard" style={{
          background: "transparent", color: "var(--text,#f5f0e8)",
          border: "1px solid var(--border,#2a2218)", padding: "12px 20px",
          borderRadius: 6, textDecoration: "none",
        }}>Creator dashboard</Link>
      </section>
    </FeaturePage>
  );
}
