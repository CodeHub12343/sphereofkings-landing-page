import { cookies } from "next/headers";
import {
  SPONSOR_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/token";
import {
  findSponsorshipByRef,
  StoredSponsorship,
} from "@/lib/db/collections/sponsorships";

// Resolve the sponsor-session cookie into the sponsor's live row.
// Returns null when the cookie is absent, invalid, expired, or when
// the sponsorship is no longer in paid state (so a refund immediately
// locks the portal).
export async function getSponsorSession(): Promise<StoredSponsorship | null> {
  const jar = await cookies();
  const cookie = jar.get(SPONSOR_SESSION_COOKIE)?.value;
  const session = await readSessionToken(cookie, "sponsor").catch(() => null);
  if (!session) return null;
  const row = await findSponsorshipByRef(session.id).catch(() => null);
  if (!row) return null;
  if (row.state !== "paid") return null;
  return row;
}
