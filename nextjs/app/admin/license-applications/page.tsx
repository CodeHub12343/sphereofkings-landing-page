import {
  ensureLicensingIndexes, listApplications, SUBMISSION_FEE_CENTS,
} from "@/lib/db/collections/licensing";
import { flag } from "@/lib/feature-flags";
import LicenseReviewControls from "./LicenseReviewControls";

export const dynamic = "force-dynamic";
export const metadata = { title: "License applications · Admin" };

export default async function AdminLicenseApplicationsPage() {
  await ensureLicensingIndexes().catch(() => {});
  const all = await listApplications();
  const open = all.filter((a) => a.status === "submitted" || a.status === "under-review");
  const paid = all.filter((a) => a.status === "approved-fee-pending" || a.status === "approved-docs-pending" || a.status === "licensed");
  const rejected = all.filter((a) => a.status === "rejected" || a.status === "revoked");
  const feeStr = (SUBMISSION_FEE_CENTS / 100).toLocaleString("en-US",
    { style: "currency", currency: "USD", minimumFractionDigits: 0 });

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <p style={{ color: "var(--gold,#c9a227)", fontSize: 12, letterSpacing: ".12em",
                  textTransform: "uppercase", margin: "0 0 6px" }}>Admin</p>
      <h1 style={{ margin: "0 0 10px", color: "var(--text,#f5f0e8)", fontSize: 24 }}>
        Designer licensing — applications
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
        Review applicant designs. On approval, {feeStr} Stripe charge fires and the
        license + NDA click-sign window opens.
      </p>

      {!flag("licensingMarketplace") && (
        <div style={{ marginBottom: 20, padding: 12,
             background: "rgba(224,169,74,.06)",
             border: "1px solid var(--status-waiting,#e0a94a)",
             borderRadius: 8, fontSize: 13, color: "var(--text,#f5f0e8)" }}>
          <strong>Public applications are DARK.</strong> Set
          <code> FEATURE_LICENSING_MARKETPLACE=1</code> in Vercel after counsel approves
          the NDA + license templates to open <code>/license/apply</code>.
          Admin review here works regardless.
        </div>
      )}

      <Section title={`Pending review (${open.length})`} apps={open} />
      <Section title={`Approved / Licensed (${paid.length})`} apps={paid} readOnly />
      <Section title={`Rejected (${rejected.length})`} apps={rejected} readOnly />
    </main>
  );
}

function Section({ title, apps, readOnly }: {
  title: string;
  apps: Awaited<ReturnType<typeof listApplications>>;
  readOnly?: boolean;
}) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>{title}</h2>
      {apps.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Nothing here.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {apps.map((a) => (
            <li key={a.id} style={{ padding: 14,
                 background: "var(--bg2,#0d0b08)",
                 border: "1px solid var(--border,#2a2218)",
                 borderRadius: 8, color: "var(--text,#f5f0e8)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ color: "var(--gold-light,#f0c040)" }}>{a.title}</strong>
                  <span style={{ color: "var(--text-muted)", fontSize: 12, marginLeft: 8 }}>
                    status: {a.status}
                  </span>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
                By <strong>{a.playerDisplayName}</strong> · {a.playerEmail} ·
                proposed ${(a.proposedPriceCents / 100).toFixed(2)}
              </div>
              <p style={{ margin: "10px 0", color: "var(--text,#f5f0e8)", fontSize: 14 }}>{a.description}</p>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
                <strong>IP:</strong> {a.ipDisclosure}
              </p>
              {a.photoUrls.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {a.photoUrls.map((u, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={i} src={u} alt="" style={{ width: 90, height: 90, objectFit: "cover",
                         borderRadius: 4, border: "1px solid var(--border,#2a2218)" }} />
                  ))}
                </div>
              )}
              {a.commissionRate && a.unitsSold > 0 && (
                <div style={{ marginTop: 10, color: "var(--gold-light,#f0c040)", fontSize: 13 }}>
                  Earnings: {a.unitsSold} units · {Math.round(a.commissionRate * 100)}% commission ·
                  payout owed ${(a.payoutOwedCents / 100).toFixed(2)}
                </div>
              )}
              {!readOnly && <LicenseReviewControls applicationId={a.id} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
