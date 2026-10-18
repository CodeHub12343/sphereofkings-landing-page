import Link from "next/link";
import { markConsented, findByToken } from "@/lib/store/subscribers-store";
import { unsubscribePath } from "@/lib/subscriber-tokens";

export const metadata = {
  title: "Confirm subscription — Sphere of Kings",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const existing = await findByToken("confirm", token);
  // We only flip to consented if the record is still pending — the
  // store function is idempotent either way.
  const record = existing ? await markConsented(token) : undefined;

  if (!record) {
    return (
      <Shell
        tone="warn"
        heading="This confirmation link is unknown."
        body="It may have been copied incorrectly, used from a different account, or the subscriber record no longer exists. Join the launch list again from the home page."
        primary={{ href: "/#signup", label: "Join the launch list" }}
      />
    );
  }

  const unsubUrl = unsubscribePath(record.unsubscribeToken);

  if (existing && existing.status === "consented") {
    // Already consented — show a friendly "you're already in" state.
    return (
      <Shell
        tone="ok"
        heading="You're already on the list."
        body={`Thanks ${record.firstName ?? ""} — ${record.email} is confirmed and will hear from us at launch. No further action needed.`}
        primary={{ href: "/", label: "Back to the home page" }}
        unsubscribeHref={unsubUrl}
      />
    );
  }

  return (
    <Shell
      tone="ok"
      heading="Welcome to the Kingdom."
      body={`We confirmed ${record.email}. You will hear from us when the Christmas Early Bird shop opens and when the Kickstarter campaign launches on November 19, 2026.`}
      primary={{ href: "/shop", label: "Explore the collection" }}
      unsubscribeHref={unsubUrl}
    />
  );
}

function Shell({
  tone,
  heading,
  body,
  primary,
  unsubscribeHref,
}: {
  tone: "ok" | "warn";
  heading: string;
  body: string;
  primary: { href: string; label: string };
  unsubscribeHref?: string;
}) {
  const colorBorder = tone === "ok" ? "#4fb07d" : "#e0a94a";
  const colorBg =
    tone === "ok"
      ? "rgba(79,176,125,0.08)"
      : "rgba(224,169,74,0.08)";
  const colorEye = tone === "ok" ? "#4fb07d" : "#e0a94a";
  return (
    <main
      style={{
        background: "#0a0a0a",
        color: "#f5f0e8",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: 520,
          width: "100%",
          background: "#0e0c09",
          border: `1px solid ${colorBorder}`,
          borderRadius: 14,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: colorBg,
            border: `1px solid ${colorBorder}`,
            display: "grid",
            placeItems: "center",
            color: colorEye,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            {tone === "ok" ? (
              <path
                d="M4 13l5 5 13-13"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <>
                <circle cx="13" cy="13" r="11" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M13 8v6m0 2v.5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </div>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: colorEye,
            fontWeight: 700,
          }}
        >
          Subscription · {tone === "ok" ? "Confirmed" : "Needs attention"}
        </div>
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 28,
            fontWeight: 800,
            margin: 0,
            color: "#f5f0e8",
          }}
        >
          {heading}
        </h1>
        <p style={{ color: "#a89880", margin: 0, lineHeight: 1.6, fontSize: 15 }}>{body}</p>
        <Link
          href={primary.href}
          style={{
            display: "inline-block",
            marginTop: 8,
            textAlign: "center",
            background:
              "linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%)",
            color: "#0a0a0a",
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "14px 22px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          {primary.label}
        </Link>
        {unsubscribeHref && (
          <Link
            href={unsubscribeHref}
            style={{
              textAlign: "center",
              color: "#5a4a38",
              fontSize: 12,
              textDecoration: "underline",
            }}
          >
            Unsubscribe
          </Link>
        )}
      </section>
    </main>
  );
}
