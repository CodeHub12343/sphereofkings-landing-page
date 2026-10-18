// Inline-styled, table-based building blocks for transactional email.
// Every rule is set inline because Outlook, Gmail, Apple Mail and Yahoo
// strip or rewrite external and <style> rules — tables + inline is the
// one layout approach they all honor.
//
// These components render in two places:
//   1. The admin preview at /admin/emails (visual QA).
//   2. A future server send flow (e.g. Resend) — pass the rendered HTML
//      to the provider. Nothing in these files uses React hooks or the
//      browser, so they are safe to render on the server.

import { CSSProperties, ReactNode } from "react";

export const EMAIL_WIDTH = 600;

export const palette = {
  bg: "#0a0a0a",
  surface: "#0e0c09",
  surfaceAlt: "#1a1612",
  gold: "#c9a227",
  goldSoft: "#f0c040",
  goldWash: "#1b1507",
  ink: "#f5f0e8",
  muted: "#a89880",
  dim: "#5a4a38",
  royal: "#4c7ce0",
  crim: "#c62b44",
  success: "#4fb07d",
  warn: "#e0a94a",
  border: "#2e2618",
} as const;

const body: CSSProperties = {
  margin: 0,
  padding: 0,
  width: "100%",
  backgroundColor: palette.bg,
  fontFamily: "'Inter', Arial, Helvetica, sans-serif",
  color: palette.ink,
  WebkitTextSizeAdjust: "100%",
};

const outerTable: CSSProperties = {
  borderCollapse: "collapse",
  width: "100%",
  backgroundColor: palette.bg,
};

const container: CSSProperties = {
  width: EMAIL_WIDTH,
  maxWidth: "100%",
  margin: "0 auto",
  backgroundColor: palette.surface,
  border: `1px solid ${palette.border}`,
  borderRadius: 12,
  overflow: "hidden",
};

const headerCell: CSSProperties = {
  padding: "24px 28px",
  borderBottom: `1px solid ${palette.border}`,
  background:
    "linear-gradient(90deg, rgba(201,162,39,0.08), transparent 80%)",
};

const brand: CSSProperties = {
  margin: 0,
  fontFamily: "'Cinzel', Georgia, serif",
  fontSize: 20,
  fontWeight: 700,
  color: palette.ink,
  letterSpacing: "0.02em",
  textDecoration: "none",
};

const brandEm: CSSProperties = {
  color: palette.goldSoft,
  fontStyle: "italic",
};

const bodyCell: CSSProperties = {
  padding: "28px",
  color: palette.ink,
  fontSize: 15,
  lineHeight: 1.6,
};

const footerCell: CSSProperties = {
  padding: "20px 28px",
  borderTop: `1px solid ${palette.border}`,
  backgroundColor: "#070604",
  color: palette.dim,
  fontSize: 12,
  lineHeight: 1.55,
  textAlign: "center" as const,
};

const footerLink: CSSProperties = {
  color: palette.muted,
  textDecoration: "underline",
};

export function EmailShell({
  previewText,
  children,
  footerNote,
}: {
  previewText: string;
  children: ReactNode;
  footerNote?: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="color-scheme" content="dark light" />
        <meta name="supported-color-schemes" content="dark light" />
        <title>Sphere of Kings</title>
      </head>
      <body style={body}>
        <span
          style={{
            display: "none",
            overflow: "hidden",
            lineHeight: 1,
            opacity: 0,
            maxHeight: 0,
            maxWidth: 0,
            color: "transparent",
          }}
        >
          {previewText}
        </span>
        <table role="presentation" cellPadding={0} cellSpacing={0} style={outerTable}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: "24px 12px" }}>
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={container}
                >
                  <tbody>
                    <tr>
                      <td style={headerCell}>
                        <a href="https://sphereofkings.com" style={brand}>
                          Sphere of <span style={brandEm}>Kings</span>
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style={bodyCell}>{children}</td>
                    </tr>
                    <tr>
                      <td style={footerCell}>
                        {footerNote ?? (
                          <>
                            You are receiving this because you subscribed to
                            Sphere of Kings updates.
                          </>
                        )}
                        <br />
                        <a href="https://sphereofkings.com" style={footerLink}>
                          sphereofkings.com
                        </a>
                        &nbsp;·&nbsp;
                        <a
                          href="{{unsubscribe_url}}"
                          style={footerLink}
                        >
                          Unsubscribe
                        </a>
                        &nbsp;·&nbsp;
                        <a
                          href="mailto:hello@sphereofkings.com"
                          style={footerLink}
                        >
                          Contact
                        </a>
                        <div style={{ marginTop: 10, color: palette.dim }}>
                          © 2026 Sphere of Kings. All rights reserved.
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export const H1: CSSProperties = {
  fontFamily: "'Cinzel', Georgia, serif",
  fontSize: 26,
  lineHeight: 1.15,
  fontWeight: 700,
  color: palette.ink,
  margin: "0 0 14px",
};

export const H2: CSSProperties = {
  fontFamily: "'Cinzel', Georgia, serif",
  fontSize: 18,
  lineHeight: 1.25,
  fontWeight: 700,
  color: palette.ink,
  margin: "24px 0 10px",
};

export const Lead: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: palette.ink,
  margin: "0 0 14px",
};

export const Muted: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.55,
  color: palette.muted,
  margin: "0 0 10px",
};

export const Fine: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: palette.dim,
  margin: "16px 0 0",
};

export function EyebrowBar({
  tone = "gold",
  children,
}: {
  tone?: "gold" | "royal" | "crim";
  children: ReactNode;
}) {
  const color =
    tone === "royal"
      ? palette.royal
      : tone === "crim"
      ? palette.crim
      : palette.goldSoft;
  return (
    <div
      style={{
        fontFamily: "'Cinzel', Georgia, serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

export function Button({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  // Bulletproof-ish button: an <a> styled as a button inside a role="presentation"
  // table. VML would be nicer for Outlook but adds markup — gold on dark is
  // readable in Outlook's fallback.
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "16px 0" }}>
      <tbody>
        <tr>
          <td
            align="center"
            style={{
              backgroundColor: palette.gold,
              borderRadius: 6,
              padding: "0",
            }}
          >
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "13px 26px",
                fontFamily: "'Cinzel', Georgia, serif",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: palette.bg,
                textDecoration: "none",
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function Panel({
  tone = "gold",
  children,
}: {
  tone?: "gold" | "royal" | "warn" | "neutral";
  children: ReactNode;
}) {
  const border =
    tone === "gold"
      ? palette.gold
      : tone === "royal"
      ? palette.royal
      : tone === "warn"
      ? palette.warn
      : palette.border;
  const bg =
    tone === "gold"
      ? "rgba(201,162,39,0.08)"
      : tone === "royal"
      ? "rgba(76,124,224,0.08)"
      : tone === "warn"
      ? "rgba(224,169,74,0.08)"
      : palette.surfaceAlt;
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{
        width: "100%",
        margin: "14px 0",
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 10,
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: "16px 18px" }}>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function Divider() {
  return (
    <div
      style={{
        height: 1,
        backgroundColor: palette.border,
        margin: "20px 0",
      }}
      aria-hidden="true"
    />
  );
}

// A simple two-column key/value row used for order summaries.
export function KV({
  k,
  v,
  mono = false,
  tone = "default",
}: {
  k: ReactNode;
  v: ReactNode;
  mono?: boolean;
  tone?: "default" | "muted" | "pos" | "neg";
}) {
  const color =
    tone === "muted"
      ? palette.muted
      : tone === "pos"
      ? palette.success
      : tone === "neg"
      ? palette.crim
      : palette.ink;
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{ width: "100%", margin: "4px 0" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              fontSize: 13,
              color: palette.muted,
              padding: "4px 0",
            }}
          >
            {k}
          </td>
          <td
            align="right"
            style={{
              fontSize: 13,
              color,
              fontFamily: mono
                ? "'SF Mono', 'Menlo', 'Consolas', monospace"
                : "'Inter', Arial, Helvetica, sans-serif",
              fontWeight: 600,
              padding: "4px 0",
            }}
          >
            {v}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
