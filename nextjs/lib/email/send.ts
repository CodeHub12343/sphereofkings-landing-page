// Thin wrapper around the Resend REST API. We keep the dependency to a
// single `fetch` call so there's no SDK to pin.
//
// Set RESEND_API_KEY (and optionally EMAIL_FROM) in env to enable
// sending. Without the key the function is a no-op that returns
// { ok: false, reason: "not-configured" } so the caller can decide
// whether to show a "not sent" state to the operator.
//
// `server-only` keeps this module out of any client bundle Next might
// otherwise trace it into, and the dynamic import of react-dom/server
// avoids the React-19 top-level import guard that fires in Server
// Component graphs.

import "server-only";
import type { ReactElement } from "react";

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

export type SendInput = {
  to: string;
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

const DEFAULT_FROM = "Sphere of Kings <hello@sphereofkings.com>";

export async function sendEmail(input: SendInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "RESEND_API_KEY not configured" };
  }
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  // Render the React email to static HTML. Our templates are
  // table-based with inline styles already, so this round-trips
  // identically to how Gmail / Outlook / Apple Mail will render it.
  // Dynamic import prevents the React 19 build-time guard on
  // `react-dom/server` from firing on any traced client chain.
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(input.react);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html,
        reply_to: input.replyTo,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, reason: `resend ${res.status}: ${body.slice(0, 200)}` };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: json.id ?? "" };
  } catch (err) {
    return { ok: false, reason: (err as Error)?.message ?? "fetch failed" };
  }
}
