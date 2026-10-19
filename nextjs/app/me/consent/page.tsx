import { redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import ConsentRequestForm from "./ConsentRequestForm";

export const dynamic = "force-dynamic";

export default async function MyConsentPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/me/consent");
  if (!me.isMinor) {
    return (
      <main style={{ padding: "100px 20px", maxWidth: 540, margin: "0 auto" }}>
        <h1 style={{ color: "var(--text,#f5f0e8)" }}>No consent required</h1>
        <p style={{ color: "var(--text-muted,#a89880)" }}>Your account is already an adult account.</p>
      </main>
    );
  }
  if (me.consentStatus === "parental-granted") {
    return (
      <main style={{ padding: "100px 20px", maxWidth: 540, margin: "0 auto" }}>
        <h1 style={{ color: "var(--text,#f5f0e8)" }}>Consent granted</h1>
        <p style={{ color: "var(--text-muted,#a89880)" }}>You have full access to messaging and challenges.</p>
      </main>
    );
  }
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 540, margin: "0 auto" }}>
      <h1 style={{ color: "var(--text,#f5f0e8)", margin: 0 }}>Parental consent</h1>
      <p style={{ color: "var(--text-muted,#a89880)", marginTop: 6 }}>
        Enter a parent or guardian's email. We'll send them a one-time link to
        complete the $0.50 (refunded) verification charge.
      </p>
      <ConsentRequestForm />
    </main>
  );
}
