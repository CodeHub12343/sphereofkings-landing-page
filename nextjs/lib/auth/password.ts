// Password hashing and verification. Uses Node's `crypto.scrypt` — zero
// extra dependencies and specifically designed for passwords. Not safe
// to call from Edge middleware; only server actions / server
// components (Node runtime) touch this file.
//
// Encoded format:
//   scrypt$<N>$<r>$<p>$<saltBase64>$<keyBase64>
//
// Rotating any of N/r/p produces a different prefix, so you can bump
// parameters later without migrating existing hashes — verifyPassword
// reads the parameters off each stored hash.

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options?: { N?: number; r?: number; p?: number; maxmem?: number },
) => Promise<Buffer>;

// Reasonable defaults for an interactive signin on 2024-era hardware.
// Takes ~70-120ms per verify, which keeps brute-force expensive without
// making every sign-in feel sluggish.
const DEFAULT_N = 16384;
const DEFAULT_R = 8;
const DEFAULT_P = 1;
const KEY_LEN = 64;
// Default `maxmem` is 32 MB which is tight for N=16384,r=8. Bump it to
// avoid "memory limit exceeded" at these parameters.
const MAX_MEM = 64 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("password is required");
  }
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEY_LEN, {
    N: DEFAULT_N,
    r: DEFAULT_R,
    p: DEFAULT_P,
    maxmem: MAX_MEM,
  });
  return `scrypt$${DEFAULT_N}$${DEFAULT_R}$${DEFAULT_P}$${salt.toString(
    "base64",
  )}$${key.toString("base64")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  if (!password || !stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const N = Number.parseInt(parts[1], 10);
  const r = Number.parseInt(parts[2], 10);
  const p = Number.parseInt(parts[3], 10);
  if (![N, r, p].every((n) => Number.isFinite(n) && n > 0)) return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[4], "base64");
    expected = Buffer.from(parts[5], "base64");
  } catch {
    return false;
  }
  if (expected.length === 0) return false;
  const actual = await scryptAsync(password, salt, expected.length, {
    N,
    r,
    p,
    maxmem: MAX_MEM,
  });
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
