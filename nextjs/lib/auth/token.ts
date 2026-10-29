// Signed stateless session tokens. Shape:
//
//   <base64url(JSON payload)>.<base64url(HMAC-SHA256 signature)>
//
// Payload: { kind: "admin" | "affiliate", id: string, role?: string, exp: number }
//
// Pure Web Crypto, no Node-only APIs — runs in Next.js middleware
// (Edge) *and* server actions / components (Node) without a split
// implementation.

export const ADMIN_SESSION_COOKIE = "sok_admin_session";
export const AFF_SESSION_COOKIE = "sok_aff_session";
export const PLAYER_SESSION_COOKIE = "sok_player_session";
export const SPONSOR_SESSION_COOKIE = "sok_sponsor_session";
export const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
export const PLAYER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days — a player session lives longer than an admin one.
export const SPONSOR_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days — sponsors come back weeks later to check reports.

export type SessionKind = "admin" | "affiliate" | "player" | "sponsor";

export type SessionPayload = {
  kind: SessionKind;
  id: string;
  role?: string;
  // Expiry — seconds since epoch.
  exp: number;
  // Issued-at — seconds since epoch. Useful for forcing stale tokens
  // after a password change: compare against a stored `tokensValidFrom`.
  iat: number;
};

function sessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "SESSION_SECRET is not set or is too short (need ≥ 32 chars). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  return s;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  // Pad to a multiple of 4.
  const pad = s.length % 4;
  const padded = s + (pad ? "=".repeat(4 - pad) : "");
  const bin = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(message: string): Promise<string> {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return toBase64Url(new Uint8Array(sig));
}

async function verify(message: string, signatureB64Url: string): Promise<boolean> {
  const key = await hmacKey();
  const sig = fromBase64Url(signatureB64Url);
  return crypto.subtle.verify(
    "HMAC",
    key,
    sig,
    new TextEncoder().encode(message),
  );
}

export async function createSessionToken(
  payload: Omit<SessionPayload, "iat" | "exp"> & { ttlSeconds?: number },
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const ttl = payload.ttlSeconds ?? DEFAULT_SESSION_TTL_SECONDS;
  const body: SessionPayload = {
    kind: payload.kind,
    id: payload.id,
    role: payload.role,
    iat: now,
    exp: now + ttl,
  };
  const message = toBase64Url(new TextEncoder().encode(JSON.stringify(body)));
  const signature = await sign(message);
  return `${message}.${signature}`;
}

export async function readSessionToken(
  token: string | undefined,
  expectedKind?: SessionKind,
): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot === -1) return null;
  const message = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  let ok = false;
  try {
    ok = await verify(message, signature);
  } catch {
    return null;
  }
  if (!ok) return null;
  let body: SessionPayload;
  try {
    const json = new TextDecoder().decode(fromBase64Url(message));
    body = JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
  if (!body || typeof body.id !== "string" || typeof body.exp !== "number") {
    return null;
  }
  if (Math.floor(Date.now() / 1000) >= body.exp) return null;
  if (expectedKind && body.kind !== expectedKind) return null;
  return body;
}
