import Link from "next/link";
import { markUnsubscribed, findByToken } from "@/lib/store/subscribers-store";

export const metadata = {
  title: "Unsubscribe — Sphere of Kings",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const existing = await findByToken("unsubscribe", token);
  const record = existing ? await markUnsubscribed(token) : undefined;

  if (!record) {
    return (
      <Panel
        tone="warn"
        heading="This unsubscribe link is unknown."
        body="You may have copied it incorrectly or already unsubscribed from another device. If you keep getting Sphere of Kings email, write to hello@sphereofkings.com and we will remove the address by hand."
      />
    );
  }

  return (
    <Panel
      tone="ok"
      heading="You're unsubscribed."
      body={`We removed ${record.email} from the launch list. You will not hear from us again unless you choose to re-subscribe from the home page.`}
    />
  );
}

function Panel({
  tone,
  heading,
  body,
}: {
  tone: "ok" | "warn";
  heading: string;
  body: string;
}) {
  const border = tone === "ok" ? "#4fb07d" : "#e0a94a";
  const eye = tone === "ok" ? "#4fb07d" : "#e0a94a";
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
          border: `1px solid ${border}`,
          borderRadius: 14,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: eye,
            fontWeight: 700,
          }}
        >
          Launch list
        </div>
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 28,
            fontWeight: 800,
            margin: 0,
          }}
        >
          {heading}
        </h1>
        <p style={{ color: "#a89880", margin: 0, lineHeight: 1.6, fontSize: 15 }}>{body}</p>
        <Link
          href="/"
          style={{
            textAlign: "center",
            color: "#f0c040",
            fontSize: 13,
            textDecoration: "none",
            marginTop: 4,
          }}
        >
          ← Back to the home page
        </Link>
      </section>
    </main>
  );
}
