"use client";

import styled from "styled-components";
import { StoredSponsorship } from "@/lib/db/collections/sponsorships";
import Link from "next/link";
import { SponsorshipWaitlistEntry } from "@/lib/db/collections/sponsorship-waitlist";
import {
  SponsorshipTier,
  SponsorshipTierId,
} from "@/lib/sponsorship";
import { AvailabilityByTier } from "@/app/sponsorship/actions";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  padding: 18px;

  h3 {
    margin: 0 0 6px;
    font-family: "Cinzel", serif;
    color: #c9a227;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  p {
    margin: 0;
    color: #a89880;
    font-family: "Inter", sans-serif;
    font-size: 0.88rem;
  }
`;

const Big = styled.div`
  color: #f5f0e8;
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 4px 0;
`;

const Section = styled.section`
  margin-top: 32px;

  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1.1rem;
    margin: 0 0 12px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  overflow: hidden;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #1a1510;
  }
  th {
    background: #0a0806;
    color: #c9a227;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  td {
    color: #d9cfbe;
    vertical-align: top;
  }
  tr:last-child td {
    border-bottom: 0;
  }
`;

const StatePill = styled.span<{ $state: StoredSponsorship["state"] }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: ${(p) =>
    p.$state === "paid"
      ? "rgba(79,176,125,0.14)"
      : p.$state === "pending"
      ? "rgba(224,169,74,0.14)"
      : p.$state === "failed"
      ? "rgba(255,107,122,0.14)"
      : "rgba(168,152,128,0.14)"};
  color: ${(p) =>
    p.$state === "paid"
      ? "#4fb07d"
      : p.$state === "pending"
      ? "#e0a94a"
      : p.$state === "failed"
      ? "#ff6b7a"
      : "#a89880"};
`;

const Empty = styled.p`
  margin: 0;
  padding: 20px;
  text-align: center;
  color: #5a4a38;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  background: #0a0806;
  border: 1px dashed #1a1510;
  border-radius: 10px;
`;

type Props = {
  sponsors: StoredSponsorship[];
  waitlist: SponsorshipWaitlistEntry[];
  availability: AvailabilityByTier;
  tiers: SponsorshipTier[];
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtUsd(minor: number): string {
  return `$${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function SponsorshipsAdmin({
  sponsors,
  waitlist,
  availability,
  tiers,
}: Props) {
  const paidRevenueMinor = sponsors
    .filter((s) => s.state === "paid")
    .reduce((n, s) => n + s.priceMinor, 0);

  const byTier = (id: SponsorshipTierId) =>
    sponsors.filter((s) => s.tier === id);

  return (
    <>
      <Grid>
        {tiers.map((t) => {
          const a = availability[t.id];
          return (
            <Stat key={t.id}>
              <h3>{t.name}</h3>
              <Big>
                {a.occupied} / {a.total}
              </Big>
              <p>
                {a.remaining > 0
                  ? `${a.remaining} slot${a.remaining === 1 ? "" : "s"} remaining · ${t.priceDisplay} each`
                  : `Sold out at ${t.priceDisplay} each`}
              </p>
            </Stat>
          );
        })}
      </Grid>
      <Stat>
        <h3>Paid Revenue</h3>
        <Big>{fmtUsd(paidRevenueMinor)}</Big>
        <p>
          {sponsors.filter((s) => s.state === "paid").length} confirmed sponsor
          {sponsors.filter((s) => s.state === "paid").length === 1 ? "" : "s"}
        </p>
      </Stat>

      <Section>
        <h2>Sponsorship Orders</h2>
        {sponsors.length === 0 ? (
          <Empty>No reservations yet.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Tier</th>
                <th>Business</th>
                <th>Contact</th>
                <th>Amount</th>
                <th>State</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.ref}>
                  <td style={{ fontFamily: "SF Mono, monospace" }}>
                    <Link
                      href={`/admin/sponsorships/${s.ref}`}
                      style={{ color: "#c9a227" }}
                    >
                      {s.ref}
                    </Link>
                  </td>
                  <td>{s.tier === "gold" ? "Gold Premier" : "Silver"}</td>
                  <td>
                    <strong style={{ color: "#f5f0e8" }}>
                      {s.businessName}
                    </strong>
                    {s.businessWebsite ? (
                      <>
                        <br />
                        <a
                          href={
                            s.businessWebsite.startsWith("http")
                              ? s.businessWebsite
                              : `https://${s.businessWebsite}`
                          }
                          style={{ color: "#c9a227" }}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.businessWebsite}
                        </a>
                      </>
                    ) : null}
                  </td>
                  <td>
                    {s.contactName}
                    <br />
                    <a
                      href={`mailto:${s.contactEmail}`}
                      style={{ color: "#a89880" }}
                    >
                      {s.contactEmail}
                    </a>
                    {s.contactPhone ? (
                      <>
                        <br />
                        <span style={{ color: "#a89880" }}>
                          {s.contactPhone}
                        </span>
                      </>
                    ) : null}
                  </td>
                  <td style={{ fontFamily: "SF Mono, monospace" }}>
                    {fmtUsd(s.priceMinor)}
                  </td>
                  <td>
                    <StatePill $state={s.state}>{s.state}</StatePill>
                  </td>
                  <td style={{ color: "#a89880" }}>{fmtDate(s.createdISO)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      <Section>
        <h2>Waitlist ({waitlist.length})</h2>
        {waitlist.length === 0 ? (
          <Empty>No waitlist signups yet.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Business</th>
                <th>Contact</th>
                <th>Notes</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.map((w) => (
                <tr key={`${w.tier}-${w.contactEmail}`}>
                  <td>{w.tier === "gold" ? "Gold Premier" : "Silver"}</td>
                  <td>
                    <strong style={{ color: "#f5f0e8" }}>
                      {w.businessName}
                    </strong>
                  </td>
                  <td>
                    {w.contactName}
                    <br />
                    <a
                      href={`mailto:${w.contactEmail}`}
                      style={{ color: "#a89880" }}
                    >
                      {w.contactEmail}
                    </a>
                  </td>
                  <td style={{ maxWidth: 320, whiteSpace: "pre-wrap" }}>
                    {w.notes ?? ""}
                  </td>
                  <td style={{ color: "#a89880" }}>{fmtDate(w.createdISO)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      <p
        style={{
          marginTop: 28,
          color: "#5a4a38",
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.78rem",
          lineHeight: 1.55,
        }}
      >
        Pending rows occupy a slot during the Stripe payment window. If a
        buyer abandons at the pay step, mark the row failed in Mongo (or
        delete it) to free the slot. Set <code>SPONSORSHIP_NOTIFY_EMAIL</code>{" "}
        in env to receive heads-up emails on every reservation, paid
        sponsorship, and waitlist signup.
      </p>
    </>
  );
}
